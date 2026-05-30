import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-paper";
import { useJobs } from "../../hooks/useJobs";
import IndustryChip from "../../components/IndustryChip"
import { useIndustries } from "../../hooks/useIndustries";
import { CARD_COLORS } from "../../configs/Colors";
import JobCard from "../../components/JobCard"
import { styles } from "./Styles";

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

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                <Text style={styles.sectionCount}>{jobs.length} việc làm</Text>
            </View>
            <IndustryChip industries={industries} active={selectedIndustry} setActive={setSelectedIndustry} />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Việc làm gợi ý</Text>
            </View>

            {error && (
                <View style={styles.errorBox}>
                    <Icon source="alert-circle-outline" size={18} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        return (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
                {loading ? (
                    <ActivityIndicator size="small" color="#555" />
                ) : (
                    <Text style={styles.loadMoreText}>Tải thêm</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        if (loading && jobs.length === 0) {
            return (
                <View style={styles.emptyBox}>
                    <ActivityIndicator size="large" color="#555" />
                    <Text style={styles.emptyText}>Đang tải...</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>Không tìm thấy việc làm nào.</Text>
            </View>
        );
    };

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
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                onRefresh={refresh}
                refreshing={refreshing}
            />
        </View>
    );
}

