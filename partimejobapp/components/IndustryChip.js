import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
const data = ["Tất cả", "F&B", "Gia sư", "Giao hàng", "Bán lẻ", "Văn phòng"];


export default function IndustryChip({ industries, active, setActive }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap} >
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
    wrap: { paddingHorizontal: 10, paddingVertical: 10 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    active: { backgroundColor: "#185FA5" },
    inactive: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
});