import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
    }, row: {
        flexDirection: "row"
    }, wrap: {
        flexWrap: "wrap"
    }, padding: {
        padding: 10
    }, margin: {
        margin: 5
    }, gap: {
        gap: 16
    }, subject: {
        fontSize: 30,
        fontWeight: "bold",
        color: "blue",
        textAlign: "center"
    }, avatar: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignSelf: "center",
    },
    avatarPicker: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: "#E8EEF7",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#001F5B",
    },
    button: {
        backgroundColor: "#001F5B",
        padding: 5,
        borderRadius: 30,
    },
    buttonLabel: {
        color: "white",
    }
});