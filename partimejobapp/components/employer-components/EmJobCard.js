import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatSalary, formatDate, formatDateTime } from "../../helpers";

export default function JobCard({ job, onViewApplicants, onToggleStatus }) {
    const [expanded, setExpanded] = useState(false);
    const isOpen = job.status === "OPENING";
    const navigation = useNavigation()
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>
                        {job.title}{" "}
                        <Text style={styles.jobId}>#{job.id}</Text>
                    </Text>
                    <Text style={styles.companyName}>
                        🏢 {job.employer?.company_name}
                    </Text>
                </View>
                <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                    <Text style={[styles.badgeText, isOpen ? styles.badgeTextOpen : styles.badgeTextClosed]}>
                        {isOpen ? "Đang tuyển" : "Đã đóng"}
                    </Text>
                </View>
            </View>

            <View style={styles.metaRow}>
                <View style={styles.salaryChip}>
                    <Text style={styles.salaryText}>
                        💰 {formatSalary(job.salary_min)} – {formatSalary(job.salary_max)}
                    </Text>
                </View>
            </View>
            <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📍 {job.location}</Text>
                <Text style={styles.metaItem}>📅 Hết hạn {formatDate(job.available_date)}</Text>
            </View>
            <View style={styles.metaRow}>
                <Text style={styles.metaItem}>🕐 Đăng {formatDateTime(job.created_at)}</Text>
            </View>

            {expanded && (
                <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Mô tả:</Text>
                    <Text style={styles.detailText}>{job.description}</Text>
                    <Text style={styles.detailLabel}>Yêu cầu:</Text>
                    <Text style={styles.detailText}>{job.requirement}</Text>
                    <Text style={styles.detailLabel}>Phúc lợi:</Text>
                    <Text style={styles.detailText}>{job.benefits}</Text>
                </View>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.btnGhost}
                    onPress={() => setExpanded((v) => !v)}
                >
                    <Text style={styles.btnGhostText}>
                        {expanded ? "Ẩn bớt" : "Chi tiết"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.navigate("editjob", { job: job })}>
                    <Text style={styles.btnGhostText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btnGhost}
                    onPress={() => onViewApplicants(job)}
                >
                    <Text style={styles.btnGhostText}>Ứng viên</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btnGhost, !isOpen && styles.btnGhostSuccess]}
                    onPress={() => onToggleStatus(job)}
                >
                    <Text
                        style={[
                            styles.btnGhostText,
                            isOpen ? styles.btnGhostTextDanger : styles.btnGhostTextSuccess,
                        ]}
                    >
                        {isOpen ? "Đóng tin" : "Mở lại"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bg,
        borderWidth: 0.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 10,
    },
    jobTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: 3,
        flexShrink: 1,
    },
    jobId: {
        fontSize: 12,
        fontWeight: "400",
        color: COLORS.textTertiary,
    },
    companyName: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    badge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
    },
    badgeOpen: { backgroundColor: COLORS.openBg },
    badgeClosed: { backgroundColor: COLORS.closedBg },
    badgeText: { fontSize: 11, fontWeight: "500" },
    badgeTextOpen: { color: COLORS.openText },
    badgeTextClosed: { color: COLORS.closedText },

    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 6,
        alignItems: "center",
    },
    metaItem: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    salaryChip: {
        backgroundColor: COLORS.salaryBg,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    salaryText: {
        fontSize: 12,
        fontWeight: "500",
        color: COLORS.salaryText,
    },

    detailBox: {
        marginTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
        paddingTop: 10,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.text,
        marginTop: 6,
        marginBottom: 2,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },

    actionRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
    },
    btnGhost: {
        borderWidth: 0.5,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    btnGhostSuccess: {
        borderColor: COLORS.openBg,
        backgroundColor: COLORS.openBg,
    },
    btnGhostText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    btnGhostTextDanger: {
        color: COLORS.danger,
    },
    btnGhostTextSuccess: {
        color: COLORS.success,
    },
})