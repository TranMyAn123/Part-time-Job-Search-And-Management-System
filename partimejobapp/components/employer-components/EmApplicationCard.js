import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native";
import { authApis, endpoints } from "../../configs/Apis";
import Avatar from "../Avatar";
import { getFullName } from "../../helpers";
import { STATUS_CONFIG } from "../../configs/ApplicationStatus";
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EmApplicationCard({ item, onUpdateStatus, onChat, token }) {
    const { candidate, apply_date, cv_file, status } = item;

    const name = getFullName(candidate);

    const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.REVIEWING;
    const { label: statusLabel, color: statusColor, bgColor: statusBg } = statusCfg;

    const [expanded, setExpanded] = useState(false);
    const [evaluation, setEvaluation] = useState(item.evaluation ?? "");
    const [note, setNote] = useState(item.note ?? "");
    const [saving, setSaving] = useState(false);

    const handleOpenCV = () => {
        if (!cv_file) return;
        Linking.openURL(cv_file).catch(() =>
            Alert.alert("Lỗi", "Không thể mở file CV.")
        );
    };

    const handleSaveReview = async () => {
        setSaving(true);
        try {
            await authApis(token).patch(
                endpoints["update-application"](item.id),
                { evaluation, note }
            );
            Alert.alert("Đã lưu", "Đánh giá và ghi chú đã được cập nhật.");
        } catch (err) {
            Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể lưu đánh giá.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <Avatar uri={candidate.avatar} name={name} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.candidateName}>{name}</Text>
                    {candidate.phone_num ? (
                        <Text style={styles.phone}>📞 {candidate.phone_num}</Text>
                    ) : null}
                    <Text style={styles.applyDate}>🕐 {formatDate(apply_date)}</Text>
                </View>

                <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <View style={[styles.badge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                            {statusLabel}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
                        <Text style={styles.expandToggle}>
                            {expanded ? "Thu gọn ▲" : "Chi tiết ▼"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {expanded && (
                <View style={styles.expandBox}>
                    <Text style={styles.expandLabel}>Đánh giá ứng viên</Text>
                    <TextInput
                        style={[styles.expandInput, styles.expandInputMulti]}
                        placeholder="Nhập đánh giá..."
                        placeholderTextColor="#bbb"
                        value={evaluation}
                        onChangeText={setEvaluation}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <Text style={styles.expandLabel}>Ghi chú nội bộ</Text>
                    <TextInput
                        style={[styles.expandInput, styles.expandInputMulti]}
                        placeholder="Ghi chú thêm (chỉ employer thấy)..."
                        placeholderTextColor="#bbb"
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                        onPress={handleSaveReview}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={styles.saveBtnText}>💾 Lưu đánh giá</Text>
                        }
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.btn, !cv_file && styles.btnDisabled]}
                    onPress={handleOpenCV}
                    disabled={!cv_file}
                >
                    <Text style={styles.btnText}>📄 Xem CV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnChat]}
                    onPress={() => onChat(item)}
                >
                    <Text style={[styles.btnText, { color: "#185FA5" }]}>
                        💬 Nhắn tin
                    </Text>
                </TouchableOpacity>

                {status === "REVIEWING" && (
                    <>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: STATUS_CONFIG.INTERVIEW.bgColor, borderColor: STATUS_CONFIG.INTERVIEW.color }]}
                            onPress={() => onUpdateStatus(item, "INTERVIEW")}
                        >
                            <Text style={{ color: STATUS_CONFIG.INTERVIEW.color }}>
                                📅 Hẹn phỏng vấn
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: STATUS_CONFIG.ACCEPTED.bgColor, borderColor: STATUS_CONFIG.ACCEPTED.color }]}
                            onPress={() => onUpdateStatus(item, "ACCEPTED")}
                        >
                            <Text style={{ color: STATUS_CONFIG.ACCEPTED.color }}>
                                ✓ Trúng tuyển
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: STATUS_CONFIG.REJECTED.bgColor, borderColor: STATUS_CONFIG.REJECTED.color }]}
                            onPress={() => onUpdateStatus(item, "REJECTED")}
                        >
                            <Text style={{ color: STATUS_CONFIG.REJECTED.color }}>
                                ✕ Từ chối
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {status === "INTERVIEW" && (
                    <>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: STATUS_CONFIG.ACCEPTED.bgColor, borderColor: STATUS_CONFIG.ACCEPTED.color }]}
                            onPress={() => onUpdateStatus(item, "ACCEPTED")}
                        >
                            <Text style={{ color: STATUS_CONFIG.ACCEPTED.color }}>
                                ✓ Trúng tuyển
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: STATUS_CONFIG.REJECTED.bgColor, borderColor: STATUS_CONFIG.REJECTED.color }]}
                            onPress={() => onUpdateStatus(item, "REJECTED")}
                        >
                            <Text style={{ color: STATUS_CONFIG.REJECTED.color }}>
                                ✕ Từ chối
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    candidateName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 2 },
    phone: { fontSize: 12, color: "#666", marginBottom: 2 },
    applyDate: { fontSize: 12, color: "#999" },

    badge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: "flex-start",
    },
    badgeText: { fontSize: 11, fontWeight: "500" },

    expandToggle: { fontSize: 11, color: "#185FA5" },
    expandBox: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: "#f0f0f0",
        gap: 6,
    },
    expandLabel: { fontSize: 12, fontWeight: "600", color: "#555", marginTop: 4 },
    expandInput: {
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        color: "#1a1a1a",
        backgroundColor: "#fafafa",
    },
    expandInputMulti: { minHeight: 70, paddingTop: 8 },
    saveBtn: {
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: "center",
        marginTop: 4,
    },
    saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "500" },

    actionRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: "#f0f0f0",
        flexWrap: "wrap",
    },
    btn: {
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    btnDisabled: { opacity: 0.4 },
    btnChat: { backgroundColor: "#EBF4FF", borderColor: "#185FA5" },
    btnText: { fontSize: 12, color: "#555" },
});