import React, { useEffect, useState, useContext, useCallback } from "react";
import {
    View, Text, StyleSheet, FlatList,
    Pressable, StatusBar, ActivityIndicator, Image,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import { CARD_COLORS } from "../../configs/Colors";
import { getInitials } from "../../helpers";

// ─── Employer Card ────────────────────────────────────────────────────────────
function EmployerCard({ item, index, onFollow, followLoading }) {
    const nav = useNavigation();
    const { color, bgColor } = CARD_COLORS[index % CARD_COLORS.length];
    const initials = getInitials(item.company_name);
    const isFollowed = item.is_followed;
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.95, transform: [{ scale: 0.985 }] },
            ]}
            onPress={() => nav.navigate("EmployerDetail", { employer: item })}
        >
            <View style={[styles.cardAccent, { backgroundColor: color }]} />
            <View style={styles.cardInner}>
                {/* Logo + info */}
                <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                        {item.logo_company ? (
                            <Image
                                source={{ uri: item.logo_company }}
                                style={[styles.logo, { borderColor: color + "30" }]}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.logoFallback, { backgroundColor: bgColor }]}>
                                <Text style={[styles.logoText, { color }]}>{initials}</Text>
                            </View>
                        )}
                        <View style={styles.cardInfo}>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {item.company_name}
                            </Text>
                            <Text style={styles.fullName} numberOfLines={1}>
                                {item.full_name}
                            </Text>
                        </View>
                    </View>

                    {/* Follow button */}
                    <Pressable
                        style={[
                            styles.followBtn,
                            isFollowed
                                ? { backgroundColor: bgColor, borderColor: color }
                                : { backgroundColor: color },
                        ]}
                        onPress={() => onFollow(item)}
                        disabled={followLoading === item.user_id}
                    >
                        {followLoading === item.user_id ? (
                            <ActivityIndicator size={14} color={isFollowed ? color : "#fff"} />
                        ) : (
                            <>
                                <Icon
                                    source={isFollowed ? "check" : "plus"}
                                    size={14}
                                    color={isFollowed ? color : "#fff"}
                                />
                                <Text style={[
                                    styles.followBtnText,
                                    { color: isFollowed ? color : "#fff" }
                                ]}>
                                    {isFollowed ? "Đang theo dõi" : "Theo dõi"}
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: bgColor }]}>
                        <Icon source="account-multiple-outline" size={14} color={color} />
                        <Text style={[styles.statText, { color }]}>
                            {item.follow_count} theo dõi
                        </Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: bgColor }]}>
                        <Icon source="briefcase-outline" size={14} color={color} />
                        <Text style={[styles.statText, { color }]}>
                            {item.job_count} việc làm
                        </Text>
                    </View>
                </View>

                {/* Description */}
                {!!item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EmployerList() {
    const [user] = useContext(MyUserContext);
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [nextUrl, setNextUrl] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [followLoading, setFollowLoading] = useState(null);

    const fetchEmployers = useCallback(async (url = null, isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await authApis(user.access_token).get(url || endpoints["employers"]);
            const data = res.data;
            setEmployers((prev) =>
                url && !isRefresh ? [...prev, ...data.results] : data.results
            );
            setNextUrl(data.next);
            setHasMore(data.next ? true : false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployers();
    }, [fetchEmployers]);

    const loadMore = useCallback(() => {
        if (nextUrl && !loading) fetchEmployers(nextUrl);
    }, [nextUrl, loading, fetchEmployers]);

    const handleFollow = useCallback(async (employer) => {
        if (!user) return;
        setFollowLoading(employer.user_id);
        try {
            const res = await authApis(user.access_token).post(
                endpoints["follow"](employer.user_id)
            );
            const updated = res.data;
            setEmployers((prev) =>
                prev.map((e) =>
                    e.user_id === employer.user_id ? { ...e, ...updated } : e
                )
            );
        } catch (e) {
            console.error(e);
        } finally {
            setFollowLoading(null);
        }
    }, [user]);

    const ListHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerSub}>Khám phá</Text>
                <Text style={styles.headerTitle}>Nhà tuyển dụng</Text>
            </View>
            <View style={styles.headerBadge}>
                <Icon source="domain" size={22} color="#185FA5" />
            </View>
        </View>
    );

    const ListFooter = () => {
        if (!hasMore) return null;
        return (
            <ActivityIndicator
                color="#185FA5"
                style={{ paddingVertical: 20 }}
            />
        );
    };

    const ListEmpty = () => (
        <View style={styles.empty}>
            <Icon source="domain-off" size={44} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Chưa có nhà tuyển dụng</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
            <FlatList
                data={employers}
                keyExtractor={(item) => item.user_id}
                renderItem={({ item, index }) => (
                    <EmployerCard
                        item={item}
                        index={index}
                        onFollow={handleFollow}
                        followLoading={followLoading}
                    />
                )}
                ListHeaderComponent={<ListHeader />}
                ListFooterComponent={<ListFooter />}
                ListEmptyComponent={!loading ? <ListEmpty /> : null}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                onRefresh={() => fetchEmployers(null, true)}
                refreshing={refreshing}
                showsVerticalScrollIndicator={false}
            />
            {loading && employers.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="#185FA5" size="large" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },
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
        backgroundColor: "#EBF4FF",
        justifyContent: "center", alignItems: "center",
    },

    // Card
    card: {
        backgroundColor: "#fff", borderRadius: 20,
        marginHorizontal: 16, marginBottom: 14,
        flexDirection: "row", overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3,
    },
    cardAccent: { width: 5 },
    cardInner: { flex: 1, padding: 16, gap: 12 },

    cardTop: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", gap: 10,
    },
    cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },

    logo: {
        width: 48, height: 48, borderRadius: 14,
        borderWidth: 1.5, backgroundColor: "#fff",
    },
    logoFallback: {
        width: 48, height: 48, borderRadius: 14,
        justifyContent: "center", alignItems: "center",
    },
    logoText: { fontWeight: "800", fontSize: 18 },

    cardInfo: { flex: 1 },
    companyName: { fontSize: 15, fontWeight: "800", color: "#111827", marginBottom: 2 },
    fullName: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },

    // Follow button
    followBtn: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 10, borderWidth: 1.5, borderColor: "transparent",
        minWidth: 110, justifyContent: "center",
    },
    followBtnText: { fontSize: 12, fontWeight: "700" },

    // Stats
    statsRow: { flexDirection: "row", gap: 8 },
    statItem: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    statText: { fontSize: 12, fontWeight: "600" },

    // Description
    description: { fontSize: 13, color: "#6B7280", lineHeight: 19 },

    // Empty
    empty: {
        alignItems: "center", paddingVertical: 60, gap: 10,
    },
    emptyTitle: { fontSize: 15, fontWeight: "700", color: "#6B7280" },

    // Loading overlay
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center", alignItems: "center",
        backgroundColor: "#F4F6FB",
    },
});
