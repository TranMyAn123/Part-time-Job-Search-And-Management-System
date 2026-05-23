import React, { useState } from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { CARD_COLORS } from "../configs/Colors";
import { getInitials } from "../helpers";
import { useNavigation } from "@react-navigation/native";

function EmployerCard({ item, index }) {
    const [followed, setFollowed] = useState(false);
    const { color, bgColor } = CARD_COLORS[index % CARD_COLORS.length];
    const initials = getInitials(item?.fullname || item?.company_name);
    const isFollowed = item.is_followed
    return (
        <View style={styles.card}>
            <View style={[styles.accentBar, { backgroundColor: color }]} />

            {
                item.logo_company ? (
                    <Image
                        source={{ uri: item.logo_company }}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[
                            styles.logoWrapper,
                            { backgroundColor: color + "20" }
                        ]}
                    >
                        <Text style={[styles.logoText, { color }]}>
                            {initials}
                        </Text>
                    </View>
                )
            }

            <Text style={styles.companyName} numberOfLines={1}>
                {item.company_name}
            </Text>
            <Text style={styles.ownerName} numberOfLines={1}>
                {item.full_name}
            </Text>
            <Text style={styles.desc} numberOfLines={2}>a
                {item.description}
            </Text>

            <View style={styles.jobsBadge}>
                <Text style={styles.jobsText}>🧳 {item.job_count} việc làm</Text>
            </View>

            <Pressable
                onPress={() => setFollowed(!followed)}
                style={({ pressed }) => [
                    styles.followBtn,
                    followed && styles.followBtnActive,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
            >
                <Text style={[styles.followBtnText, followed && styles.followBtnTextActive]}>
                    {isFollowed ? "✓ Đang theo dõi" : "+ Theo dõi"}
                </Text>
            </Pressable>
        </View>
    );
}

export default function FeaturedEmployer({ employers }) {
    const navigation = useNavigation()
    return (
        <View style={styles.section}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>🔥 Nhà tuyển dụng nổi bật</Text>
                <TouchableOpacity onPress={() => navigation.navigate("EmployerList")}>
                    <Text style={styles.seeAll}>Xem tất cả →</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {employers.map((employer, index) => (
                    <EmployerCard key={index} item={employer} index={index} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingVertical: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 12,
    },
    header: {
        fontSize: 17,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.3,
    },
    seeAll: {
        fontSize: 13,
        color: "#185FA5",
        fontWeight: "600",
    },
    scrollContent: {
        paddingLeft: 16,
        paddingRight: 8,
    },

    // Card
    card: {
        width: 190,
        backgroundColor: "#ffffff",
        marginRight: 12,
        borderRadius: 16,
        overflow: "hidden",
        paddingBottom: 14,
        // Shadow iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09,
        shadowRadius: 10,
        // Shadow Android
        elevation: 4,
    },
    accentBar: {
        height: 4,
        width: "100%",
    },

    // Logo
    logoWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
        marginTop: 14,
        marginLeft: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: 1,
    },

    // Text
    companyName: {
        fontSize: 14,
        fontWeight: "800",
        color: "#111827",
        marginTop: 10,
        marginHorizontal: 14,
    },
    ownerName: {
        fontSize: 11,
        color: "#185FA5",
        fontWeight: "600",
        marginTop: 2,
        marginHorizontal: 14,
    },
    desc: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 5,
        marginHorizontal: 14,
        lineHeight: 16,
    },

    // Jobs badge
    jobsBadge: {
        marginHorizontal: 14,
        marginTop: 10,
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
    },
    jobsText: {
        fontSize: 11,
        color: "#374151",
        fontWeight: "600",
    },

    // Follow button
    followBtn: {
        marginHorizontal: 14,
        marginTop: 12,
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#185FA5",
        backgroundColor: "transparent",
    },
    followBtnActive: {
        backgroundColor: "#185FA5",
        borderColor: "#185FA5",
    },
    followBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#185FA5",
        letterSpacing: 0.2,
    },
    followBtnTextActive: {
        color: "#ffffff",
    },
});
