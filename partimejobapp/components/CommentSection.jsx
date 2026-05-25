import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Icon } from "react-native-paper";
import { useComments } from "../hooks/useComments";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}

function getInitials(name = "") {
    return name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#185FA5", "#4ECDC4", "#A78BFA", "#F97316", "#FF6B6B"];
function Avatar({ name, size = 36 }) {
    const colorIndex =
        name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
        AVATAR_COLORS.length;
    const bg = AVATAR_COLORS[colorIndex];
    return (
        <View
            style={[
                styles.avatar,
                { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
            ]}
        >
            <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
                {getInitials(name)}
            </Text>
        </View>
    );
}

// ─── Reply item ───────────────────────────────────────────────────────────────
function ReplyItem({ reply }) {
    return (
        <View style={styles.replyItem}>
            <Avatar name={reply.user.fullname} size={28} />
            <View style={styles.replyBubble}>
                <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{reply.user.fullname}</Text>
                    <Text style={styles.timeText}>{timeAgo(reply.created_at)}</Text>
                </View>
                <Text style={styles.commentContent}>{reply.content}</Text>
            </View>
        </View>
    );
}

// ─── Comment item ─────────────────────────────────────────────────────────────
function CommentItem({ comment, onReply, replies, onLoadReplies }) {
    const replyState = replies[comment.id];
    const repliesLoaded = Array.isArray(replyState?.data);
    const replyList = replyState?.data ?? [];
    const replyLoading = replyState?.loading ?? false;
    const hasMoreReplies = replyState?.hasMore ?? false;

    const handleToggleReplies = () => {
        if (!repliesLoaded) {
            onLoadReplies(comment.id);
        } else {
            // Đã load rồi → load more nếu còn
            if (hasMoreReplies) onLoadReplies(comment.id, replyState.nextUrl);
        }
    };

    return (
        <View style={styles.commentItem}>
            {/* Main comment */}
            <View style={styles.commentRow}>
                <Avatar name={comment.user.fullname} size={36} />
                <View style={styles.commentBody}>
                    <View style={styles.commentBubble}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.userName}>{comment.user.fullname}</Text>
                            <Text style={styles.timeText}>{timeAgo(comment.created_at)}</Text>
                        </View>
                        <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.commentActions}>
                        <Pressable
                            style={styles.actionBtn}
                            onPress={() => onReply(comment)}
                        >
                            <Icon source="reply-outline" size={14} color="#9CA3AF" />
                            <Text style={styles.actionText}>Trả lời</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Replies */}
            <View style={styles.repliesSection}>
                {/* Show/load replies button */}
                {comment.reply_count > 0 && !repliesLoaded && (
                    <Pressable style={styles.loadRepliesBtn} onPress={handleToggleReplies}>
                        {replyLoading ? (
                            <ActivityIndicator size={12} color="#185FA5" />
                        ) : (
                            <Icon source="chevron-down" size={14} color="#185FA5" />
                        )}
                        <Text style={styles.loadRepliesText}>
                            Xem {comment.reply_count} phản hồi
                        </Text>
                    </Pressable>
                )}

                {/* Reply list */}
                {repliesLoaded && replyList.map((r) => (
                    <ReplyItem key={r.id} reply={r} />
                ))}

                {/* Load more replies */}
                {repliesLoaded && hasMoreReplies && (
                    <Pressable style={styles.loadRepliesBtn} onPress={handleToggleReplies}>
                        {replyLoading ? (
                            <ActivityIndicator size={12} color="#185FA5" />
                        ) : (
                            <Icon source="chevron-down" size={14} color="#185FA5" />
                        )}
                        <Text style={styles.loadRepliesText}>Xem thêm phản hồi</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function CommentSection({ jobID, labelColor = "#185FA5" }) {
    const {
        comments,
        loading,
        posting,
        hasMore,
        replies,
        fetchComments,
        loadMoreComments,
        fetchReplies,
        postComment,
    } = useComments(jobID);
    const [text, setText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const inputRef = useRef(null);


    useEffect(() => {
        fetchComments();
    }, []);

    const handleSend = () => {
        if (!text.trim()) return;
        postComment(text.trim(), replyingTo?.id ?? null);
        setText("");
        setReplyingTo(null);
    };

    const handleReply = (comment) => {
        setReplyingTo({ id: comment.id, user: comment.user.fullname });
        inputRef.current?.focus();
    };

    const cancelReply = () => setReplyingTo(null);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Header */}
            <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionAccent, { backgroundColor: labelColor }]} />
                <Text style={styles.sectionTitle}>Bình luận</Text>
                <Text style={styles.commentCount}>
                    {comments.length} bình luận
                </Text>
            </View>

            {/* Comment list */}
            {loading && comments.length === 0 ? (
                <ActivityIndicator
                    color={labelColor}
                    style={{ paddingVertical: 24 }}
                />
            ) : comments.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Icon source="comment-outline" size={32} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                    <Text style={styles.emptySubText}>Hãy là người đầu tiên bình luận!</Text>
                </View>
            ) : (
                <>
                    {comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            replies={replies}
                            onReply={handleReply}
                            onLoadReplies={(id, url) => fetchReplies(id, url)}
                        />
                    ))}
                    {hasMore && (
                        <Pressable style={styles.loadMoreBtn} onPress={loadMoreComments}>
                            {loading ? (
                                <ActivityIndicator size={14} color={labelColor} />
                            ) : (
                                <Text style={[styles.loadMoreText, { color: labelColor }]}>
                                    Xem thêm bình luận
                                </Text>
                            )}
                        </Pressable>
                    )}
                </>
            )}

            {/* Input box */}
            <View style={styles.inputWrapper}>
                {/* Replying to banner */}
                {replyingTo && (
                    <View style={[styles.replyBanner, { borderLeftColor: labelColor }]}>
                        <Icon source="reply" size={14} color={labelColor} />
                        <Text style={[styles.replyBannerText, { color: labelColor }]}>
                            Đang trả lời{" "}
                            <Text style={styles.replyBannerName}>{replyingTo.user}</Text>
                        </Text>
                        <Pressable onPress={cancelReply} style={styles.cancelReply}>
                            <Icon source="close" size={14} color="#9CA3AF" />
                        </Pressable>
                    </View>
                )}

                <View style={styles.inputRow}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder={
                            replyingTo
                                ? `Trả lời ${replyingTo.user.fullname}...`
                                : "Viết bình luận..."
                        }
                        placeholderTextColor="#9CA3AF"
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        style={[
                            styles.sendBtn,
                            { backgroundColor: text.trim() ? labelColor : "#E5E7EB" },
                        ]}
                        onPress={handleSend}
                        disabled={posting || !text.trim()}
                    >
                        {posting ? (
                            <ActivityIndicator size={14} color="#fff" />
                        ) : (
                            <Icon
                                source="send"
                                size={16}
                                color={text.trim() ? "#fff" : "#9CA3AF"}
                            />
                        )}
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Section header
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginTop: 22, marginBottom: 14,
    },
    sectionAccent: { width: 4, height: 18, borderRadius: 2 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", flex: 1 },
    commentCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

    // Empty
    emptyBox: {
        alignItems: "center", paddingVertical: 28, gap: 6,
        backgroundColor: "#fff", borderRadius: 16, marginBottom: 12,
    },
    emptyText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
    emptySubText: { fontSize: 13, color: "#9CA3AF" },

    // Avatar
    avatar: { justifyContent: "center", alignItems: "center", flexShrink: 0 },
    avatarText: { color: "#fff", fontWeight: "800" },

    // Comment
    commentItem: { marginBottom: 16 },
    commentRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
    commentBody: { flex: 1 },
    commentBubble: {
        backgroundColor: "#fff", borderRadius: 16,
        borderTopLeftRadius: 4,
        padding: 12,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
    },
    commentHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 4,
    },
    userName: { fontSize: 13, fontWeight: "700", color: "#111827" },
    timeText: { fontSize: 11, color: "#9CA3AF" },
    commentContent: { fontSize: 14, color: "#374151", lineHeight: 20 },
    commentActions: { flexDirection: "row", marginTop: 6, paddingLeft: 4 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 2 },
    actionText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },


    // Replies
    repliesSection: { marginLeft: 46, marginTop: 6, gap: 8 },
    loadRepliesBtn: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 4,
    },
    loadRepliesText: { fontSize: 13, color: "#185FA5", fontWeight: "600" },
    replyItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    replyBubble: {
        flex: 1, backgroundColor: "#F9FAFB",
        borderRadius: 12, borderTopLeftRadius: 4,
        padding: 10,
    },

    // Load more comments
    loadMoreBtn: {
        alignItems: "center", paddingVertical: 12,
        marginBottom: 4,
    },
    loadMoreText: { fontSize: 14, fontWeight: "700" },

    // Input
    inputWrapper: {
        backgroundColor: "#fff", borderRadius: 18,
        borderWidth: 1, borderColor: "#E5E7EB",
        marginTop: 8, overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    },
    replyBanner: {
        flexDirection: "row", alignItems: "center", gap: 6,
        borderLeftWidth: 3, paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: "#F0F7FF",
    },
    replyBannerText: { flex: 1, fontSize: 12, fontWeight: "600" },
    replyBannerName: { fontWeight: "800" },
    cancelReply: { padding: 2 },
    inputRow: {
        flexDirection: "row", alignItems: "flex-end",
        paddingHorizontal: 12, paddingVertical: 10, gap: 10,
    },
    input: {
        flex: 1, fontSize: 14, color: "#111827",
        maxHeight: 100, paddingTop: 2,
    },
    sendBtn: {
        width: 34, height: 34, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
    },
});
