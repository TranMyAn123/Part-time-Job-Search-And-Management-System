import {
    View, Text, StyleSheet, ScrollView,
    Pressable, ActivityIndicator, StatusBar, Image,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { CARD_COLORS } from "../configs/Colors";
import { getInitials, formatSalary } from "../helpers";


// ─── Job Card (ngang, nhỏ gọn) ───────────────────────────────────────────────
function JobCard({ item, index }) {
    const navigation = useNavigation();
    const { color, bgColor } = CARD_COLORS[index % CARD_COLORS.length];
    const initials = getInitials(item.employer?.company_name || item.title);
    const salary = formatSalary(item.salary_min, item.salary_max);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.jobCard,
                pressed && { opacity: 0.93, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => navigation.navigate("JobDetail", { job: item, jobId: item.id })}
        >
            <View style={[styles.jobColorStrip, { backgroundColor: color }]} />
            <View style={styles.jobCardInner}>
                <View style={styles.jobCardTop}>
                    <View style={[styles.jobLogo, { backgroundColor: bgColor }]}>
                        <Text style={[styles.jobLogoText, { color }]}>{initials}</Text>
                    </View>
                    {item.status === "OPENING" && (
                        <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>🔥 Gấp</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.jobCompany} numberOfLines={1}>
                    {item.employer?.company_name}
                </Text>
                <View style={styles.jobFooter}>
                    <View style={[styles.jobTag, { backgroundColor: bgColor }]}>
                        <Icon source="map-marker-outline" size={11} color={color} />
                        <Text style={[styles.jobTagText, { color }]} numberOfLines={1}>
                            {item.location}
                        </Text>
                    </View>
                    <Text style={[styles.jobSalary, { color }]}>{salary}</Text>
                </View>
            </View>
        </Pressable>
    );
}



// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {onSeeAll && (
                <Pressable onPress={onSeeAll} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                    <Icon source="chevron-right" size={14} color="#185FA5" />
                </Pressable>
            )}
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NewestJob({ jobs, loading }) {
    const navigation = useNavigation();

    return (
        <View>
            <SectionHeader
                title="Việc làm mới nhất"
                onSeeAll={() => navigation.navigate("search")}
            />
            {
                loading ? (
                    <ActivityIndicator color="#185FA5" style={{ paddingVertical: 24 }} />
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.jobsScroll}
                    >
                        {jobs.map((job, i) => (
                            <JobCard key={job.id} item={job} index={i} />
                        ))}
                    </ScrollView>
                )
            }


        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    jobsScroll: { paddingHorizontal: 16, gap: 12 },
    jobCard: {
        width: 200, backgroundColor: "#fff",
        borderRadius: 20, flexDirection: "row",
        overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
    },
    jobColorStrip: { width: 5 },
    jobCardInner: { flex: 1, padding: 14 },
    jobCardTop: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
    },
    jobLogo: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: "center", alignItems: "center",
    },
    jobLogoText: { fontWeight: "800", fontSize: 15 },
    urgentBadge: {
        backgroundColor: "#FFF3E0", paddingHorizontal: 6,
        paddingVertical: 3, borderRadius: 6,
    },
    urgentText: { fontSize: 10, fontWeight: "700", color: "#F97316" },
    jobTitle: { fontSize: 14, fontWeight: "800", color: "#111827", lineHeight: 20, marginBottom: 3 },
    jobCompany: { fontSize: 12, color: "#6B7280", fontWeight: "500", marginBottom: 10 },
    jobFooter: { gap: 6 },
    jobTag: {
        flexDirection: "row", alignItems: "center", gap: 3,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
        alignSelf: "flex-start",
    },
    jobTagText: { fontSize: 11, fontWeight: "600" },
    jobSalary: { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 22,
        marginBottom: 12,
    },
    sectionLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    sectionAccent: {
        width: 4,
        height: 18,
        borderRadius: 999,

        backgroundColor: "#185FA5",

        marginRight: 8,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#111827",

        letterSpacing: -0.3,
    },

    seeAllBtn: {
        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 999,
        backgroundColor: "#EFF6FF",
    },

    seeAllText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#185FA5",

        marginRight: 2,
    }
});