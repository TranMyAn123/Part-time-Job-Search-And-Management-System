import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    listContent: { paddingBottom: 100 },

    header: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start",
        paddingHorizontal: 20, paddingTop: 24, marginBottom: 16,
    },
    headerSub: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    headerTitle: { fontSize: 26, fontWeight: "800", color: "#111827", letterSpacing: -0.5 },
    headerBadge: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: "#185FA5",
        justifyContent: "center", alignItems: "center",
    },
    headerBadgeText: { color: "#fff", fontWeight: "800", fontSize: 16 },

    summaryRow: {
        flexDirection: "row", gap: 10,
        paddingHorizontal: 16, marginBottom: 4,
    },
    summaryItem: {
        flex: 1, borderRadius: 16, padding: 12,
        alignItems: "center", gap: 4,
    },
    summaryCount: { fontSize: 20, fontWeight: "800" },
    summaryLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },

    filterScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterChip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, backgroundColor: "#fff",
        borderWidth: 1.5, borderColor: "#E5E7EB",
    },
    filterChipActive: { backgroundColor: "#185FA5", borderColor: "#185FA5" },
    filterChipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    filterChipTextActive: { color: "#fff" },
    filterCount: {
        backgroundColor: "#F3F4F6", borderRadius: 10,
        paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: "center",
    },
    filterCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
    filterCountText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
    filterCountTextActive: { color: "#fff" },

    resultRow: { paddingHorizontal: 20, marginBottom: 8 },
    resultText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },



    empty: {
        alignItems: "center", paddingVertical: 48,
        paddingHorizontal: 32, gap: 10,
    },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: "#F9FAFB",
        justifyContent: "center", alignItems: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
    emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 21 },
    findJobBtn: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#185FA5",
        paddingHorizontal: 20, paddingVertical: 12,
        borderRadius: 14, marginTop: 8,
    },
    findJobText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
