import { StyleSheet } from "react-native";
import { Colors } from "../configs/Colors";

export const inputTheme = {
    colors: {
        primary: Colors.navy[500],
        onSurfaceVariant: Colors.navy[700],
        outline: Colors.navy[700],
    }
};

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
    },
    row: {
        flexDirection: "row"
    },
    wrap: {
        flexWrap: "wrap"
    },
    padding: {
        padding: 10
    },
    margin: {
        margin: 5
    },
    gap: {
        gap: 10
    },
    subject: {
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
        textAlign: "center"
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 50,
        alignSelf: "center",
        borderWidth: 2,
        borderColor: Colors.navy[500],
        borderStyle: 'solid',
    },
    avatarPicker: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: Colors.bg.soft,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: Colors.navy[500],
    },
    button: {
        padding: 5,
        borderRadius: 30,
    },
    buttonLabel: {
        color: "white",
    },
    input: {
        backgroundColor: Colors.blue[100],
    },
    inputContent: {
        color: Colors.text.main,
    },
    center: {
        flex: 1,
        justifyContent: "center",
    },
    outlineStyle: {
        borderRadius: 20,
        borderColor: Colors.navy[700],
    },
});