import { StyleSheet } from "react-native";

export const inputTheme = {
    colors: {
        primary: 'black',
        onSurfaceVariant: '#001F5B',
        outline: 'black',
    }
};

export default StyleSheet.create({
    input: {
        backgroundColor: "#E8EEF7",
    },
    inputContent: {
        color: 'black',
    },
    center: {
        flex: 1,
        justifyContent: "center",
    },
    outlineStyle: {
        borderRadius: 20,
        borderColor: "black",
    }
});