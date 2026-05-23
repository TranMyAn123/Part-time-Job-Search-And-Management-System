import { useNavigation } from "@react-navigation/native";
import { formatDate, formatDateTime, formatSalary, getInitials } from "../helpers";
import { CARD_COLORS } from "../configs/Colors";
import { STATUS_CONFIG } from "../configs/ApplicationStatus";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Icon } from "react-native-paper";

export default function ApplicationCard({ application, index, onPress }) {
    const navigation = useNavigation();
    const { color, bgColor } = CARD_COLORS[index % CARD_COLORS.length];
    const statusCfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.REVIEWING;
    const job = application.job ?? {};
    const initials = getInitials(job.employer?.company_name || job.title || "?");
    const salary = formatSalary(job.salary_min, job.salary_max);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.95, transform: [{ scale: 0.985 }] },
            ]}
            onPress={onPress}
        >
            <View style={[styles.colorStrip, { backgroundColor: color }]} />

            <View style={styles.cardInner}>
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

                <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                <Text style={styles.company} numberOfLines={1}>
                    {job.employer?.company_name ?? "—"}
                </Text>

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

                <View style={styles.cardFooter}>
                    <View style={styles.footerLeft}>
                        <View style={styles.footerItem}>
                            <Icon source="send-clock-outline" size={13} color="#9CA3AF" />
                            <Text style={styles.footerText}>
                                {formatDateTime(application.apply_date)}
                            </Text>
                        </View>
                        <View style={styles.footerDot} />
                        <View style={styles.footerItem}>
                            <Icon source="calendar-remove-outline" size={13} color="#9CA3AF" />
                            <Text style={styles.footerText}>
                                Hạn {formatDate(job.available_date)}
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

const styles = StyleSheet.create({
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

})