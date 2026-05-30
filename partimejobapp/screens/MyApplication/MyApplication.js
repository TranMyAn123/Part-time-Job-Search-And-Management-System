import React, { useEffect, useState, useContext, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList,
    Pressable, StatusBar, ActivityIndicator, ScrollView,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import { STATUS_CONFIG, FILTERS } from "../../configs/ApplicationStatus";
import ApplicationCard from "../../components/ApplicationCard";
import { styles } from "./Styles";

function EmptyState({ filter }) {
    const navigation = useNavigation();
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
                    onPress={() => navigation.navigate("SearchJob")}
                >
                    <Icon source="magnify" size={16} color="#fff" />
                    <Text style={styles.findJobText}>Tìm việc làm</Text>
                </Pressable>
            )}
        </View>
    );
}

export default function MyApplication() {
    const navigation = useNavigation();
    const [user] = useContext(MyUserContext);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");



    const filtered = activeFilter === "ALL"
        ? applications
        : applications.filter((a) => a.status === activeFilter);

    const countOf = (key) =>
        key === "ALL"
            ? applications.length
            : applications.filter((a) => a.status === key).length;

    const ListHeader = () => (
        <View>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Đơn ứng tuyển</Text>
                    <Text style={styles.headerSub}>Của tôi</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{applications.length}</Text>
                </View>
            </View>

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

            <View style={styles.resultRow}>
                <Text style={styles.resultText}>{filtered.length} đơn</Text>
            </View>
        </View>
    );

    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <Icon source="account-lock-outline" size={52} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
                <Pressable style={styles.findJobBtn} onPress={() => navigation.navigate("Login")}>
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
                        <ApplicationCard application={item} index={index}
                            onPress={() => navigation.navigate("ApplicationDetail", { application: item })}
                        />
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

