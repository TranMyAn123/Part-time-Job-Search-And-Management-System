import React from "react";

import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { INDUSTRY_ICONS } from "../configs/Icons";
import { INDUSTRY_COLORS } from "../configs/Colors";
export default function ListIndustries({ industries, loading }) {
    const navigation = useNavigation();

    function SectionHeader({ title }) {
        return (
            <View style={styles.sectionHeader}>
                <View style={styles.sectionLeft}>
                    <View style={styles.sectionAccent} />
                    <Text style={styles.sectionTitle}>
                        {title}
                    </Text>
                </View>
            </View>
        );
    }

    function IndustryCard({ item, index }) {
        const navigation = useNavigation();
        const { color, bgColor } = INDUSTRY_COLORS[index % INDUSTRY_COLORS.length];

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.industryCard,
                    { backgroundColor: bgColor, borderColor: color + "30" },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => navigation.navigate("IndustryDetail", { industry: item })}
            >
                <View style={[styles.industryIconWrap, { backgroundColor: color + "20" }]}>
                    <Icon source={getIndustryIcon(item.name)} size={22} color={color} />
                </View>
                <Text style={[styles.industryName, { color }]} numberOfLines={2}>
                    {item.name}
                </Text>
                <Icon source="chevron-right" size={16} color={color + "80"} />
            </Pressable>
        );
    }


    function getIndustryIcon(name = "") {
        const lower = name.toLowerCase();
        for (const [key, icon] of Object.entries(INDUSTRY_ICONS)) {
            if (lower.includes(key)) return icon;
        }
        return "briefcase-outline";
    }

    return (
        <View>
            <SectionHeader title="Ngành nghề" />
            {
                loading ? (
                    <ActivityIndicator color="#185FA5" style={{ paddingVertical: 24 }} />
                ) : (
                    <View style={styles.industriesGrid}>
                        {industries.map((ind, i) => (
                            <IndustryCard key={ind.id} item={ind} index={i} />
                        ))}
                    </View>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    industriesGrid: {
        paddingHorizontal: 16, gap: 10,
    },
    industryCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        borderRadius: 16, padding: 14,
        borderWidth: 1,
    },
    industryIconWrap: {
        width: 42, height: 42, borderRadius: 12,
        justifyContent: "center", alignItems: "center",
    },
    industryName: { flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 20 },

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
        gap: 8,
    },

    sectionAccent: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: "#185FA5",
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
    },
})
