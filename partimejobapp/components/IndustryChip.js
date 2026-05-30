import React from "react";
import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function IndustryChip({ industries = [], active, setActive }) {

    const data = [
        { id: "all", name: "Tất cả" },
        ...industries,
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.wrap}
        >
            {data.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => setActive(item)}
                    style={[
                        styles.chip,
                        active?.id === item.id ? styles.active : styles.inactive,
                    ]}
                >
                    <Text
                        style={{
                            color: active?.id === item.id ? "#fff" : "#888",
                        }}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    active: {
        backgroundColor: "#185FA5",
    },
    inactive: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
    },
});