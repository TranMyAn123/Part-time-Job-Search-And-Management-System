import { useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { Icon } from "react-native-paper";

export default function JobCard({ item, onPress }) {
    const [saved, setSaved] = useState(false);
    return (
        <Pressable
            style={({ pressed }) => [
                styles.jobCard,
                pressed && { opacity: 0.93, transform: [{ scale: 0.985 }] },
            ]}
            onPress={onPress}
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

const styles = StyleSheet.create({
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
})