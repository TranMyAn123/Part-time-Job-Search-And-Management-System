import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, StatusBar,
} from 'react-native';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../configs/Firebase';
import { MyUserContext } from '../../configs/Contexts';
import Avatar from '../../components/Avatar';

function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digits' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export default function ConversationListScreen({ navigation }) {
    const [user] = useContext(MyUserContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const myId = String(user.id);
        const userChatsRef = ref(database, `user_chats/${myId}`);

        const unsubscribe = onValue(userChatsRef, async (snapshot) => {
            const chatIDs = snapshot.val();
            if (!chatIDs) {
                setConversations([]);
                setLoading(false);
                return;
            }

            const results = await Promise.all(
                Object.keys(chatIDs).map(async (chatID) => {
                    const infoSnap = await get(ref(database, `chats/${chatID}/info`));
                    return { chatID, info: infoSnap.val() };
                })
            );

            const list = results
                .filter((r) => r.info)
                .map(({ chatID, info }) => ({
                    chatID,
                    jobId: info.jobId,
                    jobTitle: info.jobTitle ?? '',
                    otherName: Object.entries(info.names ?? {})
                        .find(([id]) => id !== myId)?.[1] ?? '???',
                    lastMessage: info.lastMessage ?? '',
                    lastTimestamp: info.lastTimestamp ?? 0,
                    receiverId: Object.keys(info.participants ?? {})
                        .find((id) => id !== myId),
                }))
                .sort((a, b) => b.lastTimestamp - a.lastTimestamp);

            setConversations(list);
            setLoading(false);
        });

        return unsubscribe;
    }, [user.id]);

    const handleOpen = (conv) => {
        navigation.navigate('Chat', {
            jobId: conv.jobId,
            jobTitle: conv.jobTitle,
            receiverId: conv.receiverId,
            receiverName: conv.otherName,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#185FA5" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.chatID}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.convItem} onPress={() => handleOpen(item)}>
                            <Avatar name={item.otherName} />
                            <View style={{ flex: 1 }}>
                                <View style={styles.convTop}>
                                    <Text style={styles.convName} numberOfLines={1}>
                                        {item.otherName}
                                    </Text>
                                    <Text style={styles.convTime}>
                                        {formatTime(item.lastTimestamp)}
                                    </Text>
                                </View>
                                {item.jobTitle ? (
                                    <Text style={styles.convJob} numberOfLines={1}>
                                        💼 {item.jobTitle}
                                    </Text>
                                ) : null}
                                <Text style={styles.convLast} numberOfLines={1}>
                                    {item.lastMessage || 'Chưa có tin nhắn'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6',
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listContent: { flexGrow: 1 },
    convItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    separator: { height: 0.5, backgroundColor: '#F3F4F6', marginLeft: 76 },
    convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    convName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
    convTime: { fontSize: 11, color: '#999', marginLeft: 8 },
    convJob: { fontSize: 11, color: '#185FA5', marginTop: 1 },
    convLast: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 15, color: '#9CA3AF' },
});