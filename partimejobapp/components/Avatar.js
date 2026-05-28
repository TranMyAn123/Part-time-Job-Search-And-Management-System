import { StyleSheet, View, Image, Text } from "react-native";

export default function Avatar({ uri, name }) {
    const initials = name === "???" ? "?" : name.charAt(0).toUpperCase();
    if (uri) {
        return <Image source={{ uri }} style={styles.avatar} />;
    }
    return (
        <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0f0f0" },
    avatarFallback: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#e0eaff",
        alignItems: "center", justifyContent: "center",
    },
    avatarInitial: { fontSize: 18, fontWeight: "600", color: "#3730A3" },
})