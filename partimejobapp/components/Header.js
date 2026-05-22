import React, { useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Header({ user }) {
    const navigation = useNavigation();

    const greeting = () => {
        const h = new Date().getHours();

        if (h < 12) return "Chào buổi sáng ☀️";
        if (h < 18) return "Chào buổi chiều 👋";

        return "Chào buổi tối 🌙";
    };

    function getInitials(name = "") {
        const words = name.trim().split(/\s+/);

        if (words.length === 1)
            return words[0].slice(0, 2).toUpperCase();

        return words
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
    }

    return (
        <View style={styles.header}>
            <View style={styles.left}>
                <Text style={styles.greeting}>
                    {greeting()}
                </Text>

                <Text style={styles.headerTitle}>
                    {user ? user.full_name || user.username : "Khách"}
                </Text>

                <Text style={styles.headerSub}>
                    Hôm nay bạn muốn tìm việc gì?
                </Text>
            </View>

            <Pressable
                style={styles.avatar}
                onPress={() =>
                    navigation.navigate(user ? "Profile" : "Login")
                }
            >
                {user?.avatar ? (
                    <Image
                        source={{ uri: user.avatar }}
                        style={styles.avatarImg}
                    />
                ) : (
                    <Text style={styles.avatarText}>
                        {user
                            ? getInitials(user.full_name || user.username)
                            : "?"}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 24,
        marginBottom: 20,
    },

    left: {
        flex: 1,
        paddingRight: 12,
    },

    greeting: {
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
        marginBottom: 2,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },

    headerSub: {
        fontSize: 13,
        color: "#9CA3AF",
        marginTop: 3,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#185FA5",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    avatarImg: {
        width: "100%",
        height: "100%",
    },

    avatarText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
});