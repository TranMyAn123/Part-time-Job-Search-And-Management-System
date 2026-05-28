import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { paddingBottom: 100 },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingTop: 24,
        marginBottom: 20,
    },
    greeting: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    title: { fontSize: 26, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
    subTitle: { color: "#9CA3AF", marginTop: 4, fontSize: 13 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#185FA5", justifyContent: "center", alignItems: "center",
    },
    avatarText: { color: "#fff", fontWeight: "800", fontSize: 18 },

    searchWrapper: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 18,
        paddingHorizontal: 14, height: 56, marginHorizontal: 16,
        shadowColor: "#185FA5", shadowOpacity: 0.08, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    input: { flex: 1, marginLeft: 10, fontSize: 14, color: "#111827" },
    divider: { width: 1, height: 24, backgroundColor: "#E5E7EB", marginHorizontal: 10 },
    filterBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "#185FA5", justifyContent: "center", alignItems: "center",
    },

    statsRow: {
        flexDirection: "row", backgroundColor: "#fff",
        marginHorizontal: 16, marginTop: 16, borderRadius: 16, paddingVertical: 16,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    statItem: { flex: 1, alignItems: "center" },
    statNum: { fontSize: 18, fontWeight: "800", color: "#185FA5" },
    statLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2, fontWeight: "500" },
    statDivider: { width: 1, backgroundColor: "#F3F4F6" },

    sectionHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 20, marginTop: 20, marginBottom: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
    sectionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

    errorBox: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginHorizontal: 16, marginTop: 8,
        backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12,
    },
    errorText: { color: "#EF4444", fontSize: 13, flex: 1 },

    loadMoreBtn: {
        borderWidth: 0.5,
        borderColor: "#e8e8e8",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        marginTop: 8,
    },
    loadMoreText: {
        fontSize: 13,
        color: "#666",
    },

    emptyBox: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
    },
});
