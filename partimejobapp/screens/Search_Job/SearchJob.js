import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    FlatList,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Icon } from "react-native-paper";
import { useJobs } from "../../hooks/useJobs";
import IndustryChip from "../../components/IndustryChip"
// ─── Helpers ─────────────────────────────────────────────────────────────────
const CARD_COLORS = [
    { color: "#FF6B6B", bgColor: "#FFF0F0" },
    { color: "#4ECDC4", bgColor: "#EEFAF9" },
    { color: "#A78BFA", bgColor: "#F5F0FF" },
    { color: "#F97316", bgColor: "#FFF4ED" },
    { color: "#185FA5", bgColor: "#EBF4FF" },
];


function mapJob(job, index) {
    const palette = CARD_COLORS[index % CARD_COLORS.length];
    const initials = job.title
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const salaryMin = parseInt(job.salary_min ?? 0);
    const salaryMax = parseInt(job.salary_max ?? 0);
    const salary =
        salaryMin && salaryMax
            ? `${(salaryMin / 1e6).toFixed(0)}–${(salaryMax / 1e6).toFixed(0)}tr/tháng`
            : "Thỏa thuận";

    return {
        ...job,
        ...palette,
        initials,
        salary,
        urgent: job.status === "OPENING",
    };
}

function JobCard({ item }) {
    const [saved, setSaved] = useState(false);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.jobCard,
                pressed && { opacity: 0.93, transform: [{ scale: 0.985 }] },
            ]}
        >
            <View style={[styles.colorStrip, { backgroundColor: item.color }]} />

            <View style={styles.cardInner}>
                {/* Top row */}
                <View style={styles.jobTop}>
                    <View style={[styles.logo, { backgroundColor: item.bgColor }]}>
                        <Text style={[styles.logoText, { color: item.color }]}>
                            {item.initials}
                        </Text>
                    </View>

                    <View style={styles.topRight}>
                        {item.urgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>🔥 Gấp</Text>
                            </View>
                        )}
                        <Pressable
                            onPress={() => setSaved((prev) => !prev)}
                            style={({ pressed }) => [
                                styles.saveBtn,
                                saved && styles.saveBtnActive,
                                pressed && { transform: [{ scale: 0.9 }] },
                            ]}
                        >
                            <Icon
                                source={saved ? "bookmark" : "bookmark-outline"}
                                size={18}
                                color={saved ? "#fff" : "#185FA5"}
                            />
                        </Pressable>
                    </View>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{item.location}</Text>

                <View style={styles.infoRow}>
                    <View style={[styles.tag, { backgroundColor: item.bgColor }]}>
                        <Icon source="map-marker-outline" size={13} color={item.color} />
                        <Text style={[styles.tagText, { color: item.color }]}>{item.location}</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: item.bgColor }]}>
                        <Icon source="clock-outline" size={13} color={item.color} />
                        <Text style={[styles.tagText, { color: item.color }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardBottom}>
                    <Text style={[styles.salary, { color: item.color }]}>{item.salary}</Text>
                    <Pressable style={[styles.applyBtn, { backgroundColor: item.color }]}>
                        <Text style={styles.applyText}>Ứng tuyển</Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}

export default function SearchJob() {
    const [selectedIndustry, setSelectedIndustry] = useState("Tất cả");
    const [query, setQuery] = useState("");

    const { jobs, loading, refreshing, error, hasMore, loadMore, refresh } = useJobs({
        industry: selectedIndustry,
        query,
    });

    const mappedJobs = jobs.map(mapJob);

    const ListHeader = ({ job_length }) => (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào 👋</Text>
                    <Text style={styles.title}>Tìm việc làm</Text>
                    <Text style={styles.subTitle}>Khám phá công việc phù hợp với bạn</Text>
                </View>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>B</Text>
                </View>
            </View>

            {/* Search bar */}
            <View style={styles.searchWrapper}>
                <Icon source="magnify" size={22} color="#9CA3AF" />
                <TextInput
                    placeholder="Tìm công việc, công ty..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                />
                {query.length > 0 && (
                    <Pressable onPress={() => setQuery("")}>
                        <Icon source="close-circle" size={18} color="#9CA3AF" />
                    </Pressable>
                )}
                <View style={styles.divider} />
                <Pressable style={styles.filterBtn}>
                    <Icon source="tune" size={20} color="#fff" />
                </Pressable>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{job_length}</Text>
                    <Text style={styles.statLabel}>Việc làm</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>340+</Text>
                    <Text style={styles.statLabel}>Công ty</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>24/7</Text>
                    <Text style={styles.statLabel}>Hỗ trợ</Text>
                </View>
            </View>

            {/* Chips */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <Text style={styles.sectionCount}>{jobs.length} việc làm</Text>
            </View>
            <IndustryChip active={selectedIndustry} setActive={setSelectedIndustry} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Việc làm gợi ý</Text>
            </View>

            {/* Error */}
            {error && (
                <View style={styles.errorBox}>
                    <Icon source="alert-circle-outline" size={18} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
            <FlatList
                data={mappedJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <JobCard item={item} />}
                ListHeaderComponent={() => (
                    <ListHeader job_length={jobs.length} />
                )}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                onRefresh={refresh}
                refreshing={refreshing}
                ListFooterComponent={
                    loading && hasMore ? (
                        <ActivityIndicator color="#185FA5" style={{ paddingVertical: 20 }} />
                    ) : null
                }
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const chipStyles = StyleSheet.create({
    row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    chipActive: { backgroundColor: "#185FA5", borderColor: "#185FA5" },
    chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    chipTextActive: { color: "#fff" },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },
    listContent: { paddingBottom: 100 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 24,
        marginBottom: 20,
    },
    greeting: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    title: { fontSize: 26, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
    subTitle: { color: "#9CA3AF", marginTop: 4, fontSize: 13 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#185FA5", justifyContent: "center", alignItems: "center",
    },
    avatarText: { color: "#fff", fontWeight: "800", fontSize: 18 },

    searchWrapper: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 18,
        paddingHorizontal: 14, height: 56, marginHorizontal: 16,
        shadowColor: "#185FA5", shadowOpacity: 0.08, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    input: { flex: 1, marginLeft: 10, fontSize: 14, color: "#111827" },
    divider: { width: 1, height: 24, backgroundColor: "#E5E7EB", marginHorizontal: 10 },
    filterBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "#185FA5", justifyContent: "center", alignItems: "center",
    },

    statsRow: {
        flexDirection: "row", backgroundColor: "#fff",
        marginHorizontal: 16, marginTop: 16, borderRadius: 16, paddingVertical: 16,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    statItem: { flex: 1, alignItems: "center" },
    statNum: { fontSize: 18, fontWeight: "800", color: "#185FA5" },
    statLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2, fontWeight: "500" },
    statDivider: { width: 1, backgroundColor: "#F3F4F6" },

    sectionHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 20, marginTop: 20, marginBottom: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sectionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

    errorBox: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginHorizontal: 16, marginTop: 8,
        backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12,
    },
    errorText: { color: "#EF4444", fontSize: 13, flex: 1 },

    jobCard: {
        backgroundColor: "#fff", borderRadius: 20,
        marginHorizontal: 16, marginBottom: 14,
        flexDirection: "row", overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 3,
    },
    colorStrip: { width: 5 },
    cardInner: { flex: 1, padding: 16 },
    jobTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    logo: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
    logoText: { fontWeight: "800", fontSize: 18 },
    topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    urgentBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    urgentText: { fontSize: 11, fontWeight: "700", color: "#F97316" },
    saveBtn: {
        width: 34, height: 34, borderRadius: 10,
        borderWidth: 1.5, borderColor: "#E0ECFB",
        backgroundColor: "#F2F7FD", justifyContent: "center", alignItems: "center",
    },
    saveBtnActive: { backgroundColor: "#185FA5", borderColor: "#185FA5" },

    jobTitle: { marginTop: 12, fontSize: 16, fontWeight: "800", color: "#111827", letterSpacing: -0.2 },
    company: { marginTop: 3, color: "#6B7280", fontSize: 13, fontWeight: "500" },
    infoRow: { flexDirection: "row", marginTop: 12, gap: 8 },
    tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 4 },
    tagText: { fontSize: 12, fontWeight: "600" },

    cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
    salary: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
    applyBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
    applyText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
