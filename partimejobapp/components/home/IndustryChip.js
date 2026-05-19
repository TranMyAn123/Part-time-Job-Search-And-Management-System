import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";

const data = ["Tất cả", "F&B", "Bán lẻ", "Gia sư", "Giao hàng"];

export default function Chips({ active, setActive }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
            {data.map((item) => (
                <TouchableOpacity
                    key={item}
                    onPress={() => setActive(item)}
                    style={[
                        styles.chip,
                        active === item ? styles.active : styles.inactive,
                    ]}
                >
                    <Text style={{ color: active === item ? "#fff" : "#888" }}>
                        {item}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 16 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    active: { backgroundColor: "#185FA5" },
    inactive: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
});