import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View, Text, TextInput, Pressable, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { database } from '../../configs/Firebase';
import { MyUserContext } from '../../configs/Contexts';
import { ref, onValue, get, set, push } from 'firebase/database';

const getChatID = (jobId, senderID, receiverID) =>
    `${jobId}_${[String(senderID), String(receiverID)].sort().join('_')}`;

export default function ChatScreen({ route, navigation }) {
    const { jobId, receiverId, receiverName } = route.params;
    const [user] = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const flatListRef = useRef(null);

    const chatID = getChatID(jobId, user.id, receiverId);
    const messagesRef = ref(database, `chats/${chatID}/messages`);

    useEffect(() => {
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setMessages([]);
                return;
            }
            const list = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
            setMessages(list.sort((a, b) => a.timestamp - b.timestamp));
        });
        return () => unsubscribe();
    }, [chatID]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const sendMessage = async () => {
        if (!text.trim()) return;

        try {
            const infoRef = ref(database, `chats/${chatID}/info`);
            const snapshot = await get(infoRef);
            if (!snapshot.exists()) {
                await set(infoRef, {
                    jobId,
                    jobTitle: route.params.jobTitle ?? '',
                    participants: {
                        [String(user.id)]: true,
                        [String(receiverId)]: true,
                    },
                    names: {
                        [String(user.id)]: user.username ?? user.first_name ?? 'Me',
                        [String(receiverId)]: receiverName ?? '???',
                    },
                    lastMessage: text.trim(),
                    lastTimestamp: Date.now(),
                });

                await set(ref(database, `user_chats/${String(user.id)}/${chatID}`), true);
                await set(ref(database, `user_chats/${String(receiverId)}/${chatID}`), true);
            } else {
                await set(infoRef, {
                    ...snapshot.val(),
                    lastMessage: text.trim(),
                    lastTimestamp: Date.now(),
                });
            }

            await push(ref(database, `chats/${chatID}/messages`), {
                senderID: String(user.id),
                text: text.trim(),
                timestamp: Date.now(),
            });

            setText('');
        } catch (e) {
            console.log('sendMessage error:', e.message);
        }
    };
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{receiverName || '???'}</Text>
                    <Text style={styles.headerSub}>Job #{jobId}</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                ListEmptyComponent={
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>Chưa có tin nhắn nào.{'\n'}Hãy bắt đầu cuộc trò chuyện!</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const isMe = item.senderID === String(user.id);
                    return (
                        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                                {item.text}
                            </Text>
                            <Text style={[styles.bubbleTime, isMe && { color: 'rgba(255,255,255,0.6)' }]}>
                                {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
            />

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Nhắn tin..."
                    placeholderTextColor="#bbb"
                    multiline
                    maxLength={500}
                />
                <Pressable
                    style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                    onPress={sendMessage}
                    disabled={!text.trim()}
                >
                    <Text style={styles.sendText}>Gửi</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6FB' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6',
        gap: 10,
    },
    backBtn: { padding: 4 },
    backIcon: { fontSize: 20, color: '#111827' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerSub: { fontSize: 12, color: '#999', marginTop: 1 },

    messageList: { padding: 16, gap: 8, flexGrow: 1 },

    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { fontSize: 14, color: '#bbb', textAlign: 'center', lineHeight: 22 },

    bubble: {
        maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 4,
    },
    bubbleMe: {
        backgroundColor: '#185FA5', alignSelf: 'flex-end', borderBottomRightRadius: 4,
    },
    bubbleThem: {
        backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
        borderWidth: 0.5, borderColor: '#e8e8e8',
    },
    bubbleText: { fontSize: 14, color: '#111827' },
    bubbleTextMe: { color: '#fff' },
    bubbleTime: { fontSize: 10, color: '#999', marginTop: 4 },

    inputRow: {
        flexDirection: 'row', padding: 12, gap: 10,
        backgroundColor: '#fff',
        borderTopWidth: 0.5, borderTopColor: '#F3F4F6',
    },
    input: {
        flex: 1, backgroundColor: '#F4F6FB', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 10,
        fontSize: 14, maxHeight: 100, color: '#111827',
    },
    sendBtn: {
        backgroundColor: '#185FA5', borderRadius: 12,
        paddingHorizontal: 18, justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: '#ccc' },
    sendText: { color: '#fff', fontWeight: '700' },
});