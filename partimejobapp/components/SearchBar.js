import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export default function SearchBar() {
    return (
        <View style={styles.bar}>
            <TextInput placeholder="Tìm việc làm thêm..." style={styles.input} />
            <View style={styles.filter}>
                <TextInput />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        margin: 16,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    input: {
        flex: 1,
    },
    filter: {
        width: 30,
    },
});