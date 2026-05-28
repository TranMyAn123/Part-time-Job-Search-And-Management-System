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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: Colors.bg.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        borderWidth: 0.5,
        borderColor: Colors.border,
    },
    modalSubtitle: {
        fontSize: 13,
        color: Colors.text.muted,
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 20,
        color: Colors.navy[700],
    },
    modalOption: {
        borderWidth: 0.5,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: Colors.blue[100],
    },
    modalOptionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.navy[700],
        marginBottom: 4,
    },
    modalOptionDesc: {
        fontSize: 13,
        color: Colors.text.muted,
    },
<<<<<<< HEAD
=======
    followCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F0F7FF',
        borderRadius: 12,
        padding: 12,
    },
    followLogo: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    followLogoFallback: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    followLogoFallbackText: {
        fontWeight: '800',
        color: '#185FA5',
        fontSize: 16,
    },
    followCompanyName: {
        fontWeight: '700',
        color: '#111827',
        fontSize: 14,
    },
    followMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    followEmpty: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingVertical: 12,
    },
>>>>>>> origin/frontend/login_register
});