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
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-paper";
import { useJobs } from "../../hooks/useJobs";
import IndustryChip from "../../components/IndustryChip"
import { useIndustries } from "../../hooks/useIndustries";
import { CARD_COLORS } from "../../configs/Colors";
import JobCard from "../../components/JobCard"
// ─── Helpers ─────────────────────────────────────────────────────────────────

export default function SearchJob() {
    const [selectedIndustry, setSelectedIndustry] = useState({
        id: "all",
        name: "Tất cả",
    });

    const navigation = useNavigation()
    const [query, setQuery] = useState("");

    const { jobs, loading, refreshing, error, hasMore, loadMore, refresh } = useJobs({
        industry: selectedIndustry.name,
        query,
    });

    const { industries } = useIndustries()
    const mappedJobs = jobs.map(mapJob);

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
            <IndustryChip industries={industries} active={selectedIndustry} setActive={setSelectedIndustry} />

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
                renderItem={({ item }) =>
                    <JobCard
                        item={item}
                        onPress={() => navigation.navigate("JobDetail", { job: item })}
                    />}
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
});
