import { StyleSheet } from "react-native";
import { Colors } from "../../configs/Colors";

export const inputTheme = {
    colors: {
        primary: Colors.navy[500],
        onSurfaceVariant: Colors.navy[700],
        outline: Colors.navy[700],
    }
};

export default StyleSheet.create({
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
    profileHeader: {
        backgroundColor: Colors.navy[700],
        height: 160,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 50,
    },
    profileAvatarWrapper: {
        alignSelf: 'center',
        marginTop: -50,
        borderWidth: 3,
        borderColor: 'white',
        borderRadius: 60,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.blue[200],
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.navy[700],
    },
    profileUsername: {
        textAlign: 'center',
        color: Colors.text.muted,
        marginBottom: 20,
    },
    profileCard: {
        marginHorizontal: 16,
        borderRadius: 16,
        backgroundColor: Colors.bg.card,
        borderWidth: 0.5,
        borderColor: Colors.border,
        overflow: 'hidden',
        marginBottom: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
    },
    profileRowLabel: {
        fontSize: 12,
        color: Colors.text.muted,
    },
    profileRowValue: {
        fontSize: 15,
        color: Colors.text.main,
        fontWeight: '500',
    },
    profileRowIcon: {
        fontSize: 18,
        marginRight: 12,
    },
});