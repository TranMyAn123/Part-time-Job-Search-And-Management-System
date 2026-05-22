import React, { useEffect, useState, useContext, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList,
    Pressable, StatusBar, ActivityIndicator, ScrollView,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_COLORS = [
    { color: "#FF6B6B", bgColor: "#FFF0F0" },
    { color: "#4ECDC4", bgColor: "#EEFAF9" },
    { color: "#A78BFA", bgColor: "#F5F0FF" },
    { color: "#F97316", bgColor: "#FFF4ED" },
    { color: "#185FA5", bgColor: "#EBF4FF" },
];

const STATUS_CONFIG = {
    REVIEWING: { label: "Chờ xét duyệt", color: "#F97316", bgColor: "#FFF4ED", icon: "clock-outline" },
    INTERVIEW: { label: "Hẹn phỏng vấn", color: "#185FA5", bgColor: "#EBF4FF", icon: "calendar-check-outline" },
    ACCEPTED: { label: "Trúng tuyển", color: "#16A34A", bgColor: "#DCFCE7", icon: "check-circle-outline" },
    REJECTED: { label: "Trượt", color: "#EF4444", bgColor: "#FEF2F2", icon: "close-circle-outline" },
    WITHDRAWN: { label: "Rút đơn", color: "#6B7280", bgColor: "#F3F4F6", icon: "undo-variant" },
    CANCELLED: { label: "Đã hủy", color: "#9CA3AF", bgColor: "#F9FAFB", icon: "cancel" },
};

const FILTERS = [
    { key: "ALL", label: "Tất cả" },
    { key: "REVIEWING", label: "Chờ duyệt" },
    { key: "INTERVIEW", label: "Phỏng vấn" },
    { key: "ACCEPTED", label: "Trúng tuyển" },
    { key: "REJECTED", label: "Trượt" },
    { key: "WITHDRAWN", label: "Rút đơn" },
    { key: "CANCELLED", label: "Đã hủy" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatSalary(min, max) {
    const a = parseFloat(min ?? 0);
    const b = parseFloat(max ?? 0);
    if (!a && !b) return "Thỏa thuận";
    if (a && b) return `${(a / 1e6).toFixed(0)}–${(b / 1e6).toFixed(0)}tr/tháng`;
    return "Thỏa thuận";
}

function formatDate(iso) {
    if (!iso) return "—";
    const parts = iso.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDeadline(dateStr) {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ─── Application Card ─────────────────────────────────────────────────────────
function ApplicationCard({ item, index }) {
    const nav = useNavigation();
    const { color, bgColor } = CARD_COLORS[index % CARD_COLORS.length];
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.REVIEWING;
    const job = item.job ?? {};
    const initials = getInitials(job.employer?.company_name || job.title || "?");
    const salary = formatSalary(job.salary_min, job.salary_max);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.95, transform: [{ scale: 0.985 }] },
            ]}
            onPress={() => nav.navigate("JobDetail", { job, jobId: job.id })}
        >
            <View style={[styles.colorStrip, { backgroundColor: color }]} />

            <View style={styles.cardInner}>
                {/* Top: logo + status */}
                <View style={styles.cardTop}>
                    <View style={[styles.logo, { backgroundColor: bgColor }]}>
                        <Text style={[styles.logoText, { color }]}>{initials}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bgColor }]}>
                        <Icon source={statusCfg.icon} size={12} color={statusCfg.color} />
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                </View>

                {/* Job title + company */}
                <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                <Text style={styles.company} numberOfLines={1}>
                    {job.employer?.company_name ?? "—"}
                </Text>

                {/* Tags: location + salary */}
                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: bgColor }]}>
                        <Icon source="map-marker-outline" size={12} color={color} />
                        <Text style={[styles.tagText, { color }]} numberOfLines={1}>
                            {job.location ?? "—"}
                        </Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: bgColor }]}>
                        <Icon source="currency-usd" size={12} color={color} />
                        <Text style={[styles.tagText, { color }]}>{salary}</Text>
                    </View>
                </View>

                {/* Footer: ngày ứng tuyển + hạn nộp */}
                <View style={styles.cardFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.footerItem}>
                            <Icon source="send-clock-outline" size={13} color="#9CA3AF" />
                            <Text style={styles.footerText}>
                                {formatDate(item.apply_date)}
                            </Text>
                        </View>
                        <View style={styles.footerDot} />
                        <View style={styles.footerItem}>
                            <Icon source="calendar-remove-outline" size={13} color="#9CA3AF" />
                            <Text style={styles.footerText}>
                                Hạn {formatDeadline(job.available_date)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.viewBtn}>
                        <Text style={[styles.viewBtnText, { color }]}>Chi tiết</Text>
                        <Icon source="chevron-right" size={14} color={color} />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filter }) {
    const nav = useNavigation();
    return (
        <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
                <Icon source="file-document-outline" size={44} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đơn ứng tuyển</Text>
            <Text style={styles.emptySub}>
                {filter === "ALL"
                    ? "Bạn chưa ứng tuyển vào công việc nào"
                    : `Không có đơn nào ở trạng thái "${STATUS_CONFIG[filter]?.label}"`}
            </Text>
            {filter === "ALL" && (
                <Pressable
                    style={styles.findJobBtn}
                    onPress={() => nav.navigate("SearchJob")}
                >
                    <Icon source="magnify" size={16} color="#fff" />
                    <Text style={styles.findJobText}>Tìm việc làm</Text>
                </Pressable>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MyApplication() {
    const nav = useNavigation();
    const [user] = useContext(MyUserContext);

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");

    const fetchApplications = useCallback(async (isRefresh = false) => {
        if (!user) return;
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const res = await authApis(user.access_token).get(endpoints["applications"]);
            setApplications(res.data.results ?? res.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filtered = activeFilter === "ALL"
        ? applications
        : applications.filter((a) => a.status === activeFilter);

    const countOf = (key) =>
        key === "ALL"
            ? applications.length
            : applications.filter((a) => a.status === key).length;

    // ── Header ────────────────────────────────────────────────────────────────
    const ListHeader = () => (
        <View>
            {/* Page header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSub}>Của tôi</Text>
                    <Text style={styles.headerTitle}>Đơn ứng tuyển</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{applications.length}</Text>
                </View>
            </View>

            {/* Summary: 3 trạng thái chính */}
            {applications.length > 0 && (
                <View style={styles.summaryRow}>
                    {["REVIEWING", "INTERVIEW", "ACCEPTED"].map((key) => {
                        const cfg = STATUS_CONFIG[key];
                        return (
                            <Pressable
                                key={key}
                                style={[styles.summaryItem, { backgroundColor: cfg.bgColor }]}
                                onPress={() => setActiveFilter(key)}
                            >
                                <Icon source={cfg.icon} size={18} color={cfg.color} />
                                <Text style={[styles.summaryCount, { color: cfg.color }]}>
                                    {countOf(key)}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: cfg.color }]}>
                                    {cfg.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
            >
                {FILTERS.map((f) => {
                    const isActive = activeFilter === f.key;
                    const count = countOf(f.key);
                    return (
                        <Pressable
                            key={f.key}
                            style={[styles.filterChip, isActive && styles.filterChipActive]}
                            onPress={() => setActiveFilter(f.key)}
                        >
                            <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                {f.label}
                            </Text>
                            {count > 0 && (
                                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                                    <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Result count */}
            <View style={styles.resultRow}>
                <Text style={styles.resultText}>{filtered.length} đơn</Text>
            </View>
        </View>
    );

    // Chưa đăng nhập
    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <Icon source="account-lock-outline" size={52} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
                <Pressable style={styles.findJobBtn} onPress={() => nav.navigate("Login")}>
                    <Text style={styles.findJobText}>Đăng nhập ngay</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#185FA5" size="large" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <ApplicationCard item={item} index={index} />
                    )}
                    ListHeaderComponent={<ListHeader />}
                    ListEmptyComponent={<EmptyState filter={activeFilter} />}
                    contentContainerStyle={styles.listContent}
                    onRefresh={() => fetchApplications(true)}
                    refreshing={refreshing}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    listContent: { paddingBottom: 100 },

    // Header
    header: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20, paddingTop: 24, marginBottom: 16,
    },
    headerSub: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    headerTitle: { fontSize: 26, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
    headerBadge: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: "#185FA5",
        justifyContent: "center", alignItems: "center",
    },
    headerBadgeText: { color: "#fff", fontWeight: "800", fontSize: 16 },

    // Summary
    summaryRow: {
        flexDirection: "row", gap: 10,
        paddingHorizontal: 16, marginBottom: 4,
    },
    summaryItem: {
        flex: 1, borderRadius: 16, padding: 12,
        alignItems: "center", gap: 4,
    },
    summaryCount: { fontSize: 20, fontWeight: "800" },
    summaryLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },

    // Filter chips
    filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterChip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, backgroundColor: "#fff",
        borderWidth: 1.5, borderColor: "#E5E7EB",
    },
    filterChipActive: { backgroundColor: "#185FA5", borderColor: "#185FA5" },
    filterChipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    filterChipTextActive: { color: "#fff" },
    filterCount: {
        backgroundColor: "#F3F4F6", borderRadius: 10,
        paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: "center",
    },
    filterCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
    filterCountText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
    filterCountTextActive: { color: "#fff" },

    // Result
    resultRow: { paddingHorizontal: 20, marginBottom: 8 },
    resultText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

    // Card
    card: {
        backgroundColor: "#fff", borderRadius: 20,
        marginHorizontal: 16, marginBottom: 14,
        flexDirection: "row", overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
    },
    colorStrip: { width: 5 },
    cardInner: { flex: 1, padding: 16 },
    cardTop: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
    },
    logo: {
        width: 46, height: 46, borderRadius: 13,
        justifyContent: "center", alignItems: "center",
    },
    logoText: { fontWeight: "800", fontSize: 17 },
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    statusText: { fontSize: 12, fontWeight: "700" },

    jobTitle: {
        fontSize: 15, fontWeight: "800", color: "#111827",
        lineHeight: 21, marginBottom: 3,
    },
    company: { fontSize: 13, color: "#6B7280", fontWeight: "500", marginBottom: 10 },

    tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 12 },
    tag: {
        flexDirection: "row", alignItems: "center", gap: 4,
        paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
    },
    tagText: { fontSize: 12, fontWeight: "600" },

    // Footer
    cardFooter: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1, borderTopColor: "#F9FAFB", paddingTop: 10,
    },
    footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    footerText: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
    footerDot: {
        width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#D1D5DB",
    },
    viewBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
    viewBtnText: { fontSize: 13, fontWeight: "700" },

    // Empty
    empty: {
        alignItems: "center", paddingVertical: 48,
        paddingHorizontal: 32, gap: 10,
    },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: "#F9FAFB",
        justifyContent: "center", alignItems: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
    emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 21 },
    findJobBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#185FA5",
        paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 14, marginTop: 8,
    },
    findJobText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
