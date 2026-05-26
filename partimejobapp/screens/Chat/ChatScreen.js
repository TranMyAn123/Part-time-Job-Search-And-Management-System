import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { database } from '../../configs/Firebase';
import { MyUserContext } from '../../configs/Contexts';

const getChatID = (jobID, senderID, receiverID) => `${jobID}_${[senderID, receiverID].sort().join('_')}`;
export default function ChatScreen({ route }) {
    const { jobID, receiverID, receiverName } = route.params;
    const [user] = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    const chatID = getChatID(jobID, String(user.id), receiverID);

    const messagesRef = ref(database, `chats/${chatID}/messages`);
    useEffect(() => {
        const msgRef = ref(database, `chats/${chatID}/messages`);
        const unsubscribe = onValue(msgRef, (snapshot) => {
            console.log('snapshot exists:', snapshot.exists());
            console.log('snapshot val:', snapshot.val());

            const data = snapshot.val();
            if (!data) {
                setMessages([]);
                return;
            }
            const list = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
            setMessages(list.sort((a, b) => a.timestamp - b.timestamp));
        });
        return unsubscribe;
    }, [chatID]);

    const sendMessage = async () => {
        if (!text.trim()) return;
        await push(messagesRef, {
            senderID: String(user.id),
            text: text.trim(),
            timestamp: Date.now(),
        });
        setText('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{receiverName}</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => {
                    const isMe = item.senderID === String(user.id);
                    return (
                        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                                {item.text}
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
                    multiline
                />
                <Pressable style={styles.sendBtn} onPress={sendMessage}>
                    <Text style={styles.sendText}>Gửi</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6FB' },
    header: {
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    messageList: { padding: 16, gap: 8 },
    bubble: {
        maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 4,
    },
    bubbleMe: { backgroundColor: '#185FA5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    bubbleThem: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 14, color: '#111827' },
    bubbleTextMe: { color: '#fff' },
    inputRow: {
        flexDirection: 'row', padding: 12, gap: 10,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    input: {
        flex: 1, backgroundColor: '#F4F6FB', borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: '#185FA5', borderRadius: 12,
        paddingHorizontal: 18, justifyContent: 'center',
    },
    sendText: { color: '#fff', fontWeight: '700' },
});