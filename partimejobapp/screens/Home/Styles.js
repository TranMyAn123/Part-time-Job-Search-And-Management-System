import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },



    statsBar: {
        flexDirection: "row", backgroundColor: "#fff",
        marginHorizontal: 16, borderRadius: 18, paddingVertical: 14,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        marginBottom: 4,
    },
    statItem: { flex: 1, alignItems: "center", gap: 3 },
    statValue: { fontSize: 16, fontWeight: "800", color: "#111827" },
    statLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
    statsDivider: { width: 1, backgroundColor: "#F3F4F6" },
})

