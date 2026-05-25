import React from "react";
import {
    View, Text, StyleSheet, ScrollView,
    Pressable, StatusBar,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { INDUSTRY_COLORS } from "../configs/Colors";
import { INDUSTRY_ICONS } from "../configs/Icons";

function getIndustryIcon(name = "") {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(INDUSTRY_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "briefcase-outline";
}

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Mock INDUSTRY — fallback nếu không có route.params

export default function IndustryDetail({ route, navigation }) {
    const nav = useNavigation();
    const industry = route?.params?.industry
    const { color, bgColor } = INDUSTRY_COLORS[(industry.id - 1) % INDUSTRY_COLORS.length];
    const icon = getIndustryIcon(industry.name);

    // Tách description thành các đoạn
    const paragraphs = (industry.description || "").split(/\r?\n\r?\n/).filter(Boolean);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={color} />

            {/* ── Hero ── */}
            <View style={[styles.hero, { backgroundColor: color }]}>
                <View style={styles.bubble1} />
                <View style={styles.bubble2} />

                {/* Nav */}
                <View style={styles.nav}>
                    <Pressable style={styles.navBtn} onPress={() => nav.goBack()}>
                        <Icon source="arrow-left" size={22} color="#fff" />
                    </Pressable>
                    <Text style={styles.navTitle}>Chi tiết ngành nghề</Text>
                    <View style={{ width: 38 }} />
                </View>

                {/* Icon + name */}
                <View style={styles.heroBody}>
                    <View style={[styles.iconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                        <Icon source={icon} size={34} color="#fff" />
                    </View>
                    <Text style={styles.industryName}>{industry.name}</Text>
                    <View style={styles.metaPill}>
                        <Icon source="calendar-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.metaPillText}>
                            Cập nhật {formatDate(industry.updated_at || industry.created_at)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Body ── */}
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Description card */}
                <View style={styles.descCard}>
                    <View style={styles.descHeader}>
                        <View style={[styles.descAccent, { backgroundColor: color }]} />
                        <Text style={styles.descTitle}>Giới thiệu ngành</Text>
                    </View>
                    {paragraphs.map((para, i) => (
                        <Text key={i} style={styles.descPara}>{para}</Text>
                    ))}
                </View>

                {/* CTA tìm việc theo ngành */}
                <Pressable
                    style={[styles.ctaCard, { backgroundColor: color }]}
                    onPress={() => nav.navigate("SearchJob", { industry })}
                >
                    <View style={styles.ctaLeft}>
                        <Text style={styles.ctaTitle}>Tìm việc làm</Text>
                        <Text style={styles.ctaSub}>trong ngành {industry.name}</Text>
                    </View>
                    <View style={styles.ctaIcon}>
                        <Icon source="magnify" size={22} color={color} />
                    </View>
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },

    // Hero
    hero: {
        paddingBottom: 32,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: "hidden",
    },
    bubble1: {
        position: "absolute", width: 180, height: 180, borderRadius: 90,
        backgroundColor: "rgba(255,255,255,0.07)", top: -40, right: -40,
    },
    bubble2: {
        position: "absolute", width: 120, height: 120, borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.05)", bottom: 10, left: -30,
    },

    // Nav
    nav: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    },
    navBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center", alignItems: "center",
    },
    navTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },

    // Hero body
    heroBody: { paddingHorizontal: 20, alignItems: "center", paddingTop: 8 },
    iconWrap: {
        width: 72, height: 72, borderRadius: 22,
        justifyContent: "center", alignItems: "center", marginBottom: 14,
    },
    industryName: {
        color: "#fff", fontSize: 24, fontWeight: "800",
        letterSpacing: -0.5, textAlign: "center", marginBottom: 10,
    },
    metaPill: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10,
    },
    metaPillText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "500" },

    // Body
    body: { flex: 1 },
    bodyContent: { padding: 16, gap: 14 },

    // Description
    descCard: {
        backgroundColor: "#fff", borderRadius: 20, padding: 18,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    descHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    descAccent: { width: 4, height: 18, borderRadius: 2 },
    descTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    descPara: {
        fontSize: 14, color: "#4B5563", lineHeight: 24,
        marginBottom: 12,
    },

    // CTA
    ctaCard: {
        borderRadius: 20, padding: 20,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    ctaLeft: { gap: 3 },
    ctaTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
    ctaSub: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
    ctaIcon: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: "#fff",
        justifyContent: "center", alignItems: "center",
    },
});