import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Header() {
    return (
        <View style={styles.wrapper}>
            <View>
                <Text style={styles.sub}>Xin chào 👋</Text>
                <Text style={styles.name}>
                    Khánh <Text style={{ color: "#185FA5" }}>An</Text>
                </Text>
            </View>

            <View style={styles.right}>
                <Text style={styles.icon}>🔔</Text>
                <View style={styles.avatar}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>KA</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sub: { fontSize: 12, color: "#888" },
    name: { fontSize: 20, fontWeight: "700" },
    right: { flexDirection: "row", alignItems: "center", gap: 10 },
    icon: { fontSize: 20 },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#185FA5",
        justifyContent: "center",
        alignItems: "center",
    },
});