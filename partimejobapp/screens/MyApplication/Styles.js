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


export const ApplicationDetailStyles = StyleSheet.create({

    container: { flex: 1, backgroundColor: "#F4F6FB" },

    hero: {
        paddingBottom: 56,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        overflow: "hidden",
    },
    bubble1: {
        position: "absolute", width: 200, height: 200, borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)", top: -50, right: -50,
    },
    bubble2: {
        position: "absolute", width: 130, height: 130, borderRadius: 65,
        backgroundColor: "rgba(255,255,255,0.05)", bottom: 30, left: -40,
    },
    nav: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    },
    navBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center", alignItems: "center",
    },
    navTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },

    heroBody: { paddingHorizontal: 20, paddingTop: 4 },
    logo: {
        width: 60, height: 60, borderRadius: 18,
        justifyContent: "center", alignItems: "center", marginBottom: 10,
    },
    logoText: { color: "#fff", fontWeight: "800", fontSize: 22 },
    heroCompany: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600", marginBottom: 4 },
    heroTitle: {
        color: "#fff", fontSize: 20, fontWeight: "800",
        letterSpacing: -0.4, lineHeight: 26, marginBottom: 12,
    },
    heroPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    heroPill: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    heroPillText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },

    statusCard: {
        position: "absolute", bottom: -1, left: 20, right: 20,
        backgroundColor: "#fff", borderRadius: 20,
        borderWidth: 1, borderColor: "#E9F0F8",
        flexDirection: "row", alignItems: "center",
        paddingVertical: 12, paddingHorizontal: 16,
        shadowColor: "#000", shadowOpacity: 0.08,
        shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 6,
        gap: 14,
    },
    statusLeft: {
        flexDirection: "row", alignItems: "center", gap: 7,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    },
    statusLabel: { fontSize: 13, fontWeight: "800" },
    statusRight: { flex: 1 },
    applyDateLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    applyDateValue: { fontSize: 12, fontWeight: "700", color: "#111827" },

    body: { flex: 1, marginTop: 16 },
    bodyContent: { paddingHorizontal: 16, paddingTop: 6 },

    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginTop: 22, marginBottom: 10,
    },
    sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: "#185FA5" },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

    timelineCard: {
        backgroundColor: "#fff", borderRadius: 18, padding: 16,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    timelineDesc: { fontSize: 13, color: "#6B7280", marginBottom: 18, lineHeight: 19 },
    timeline: { flexDirection: "row", alignItems: "flex-start" },
    timelineItem: { flex: 1, flexDirection: "row", alignItems: "center" },
    timelineLine: { flex: 1, height: 2, marginBottom: 20 },
    timelineCol: { alignItems: "center", gap: 6 },
    timelineDot: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 2, justifyContent: "center", alignItems: "center",
    },
    timelineDotActive: {
        shadowColor: "#000", shadowOpacity: 0.12,
        shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
    },
    timelineLabel: { fontSize: 10, textAlign: "center", maxWidth: 64 },
    terminalBox: {
        flexDirection: "row", alignItems: "center", gap: 10,
        borderRadius: 14, padding: 14,
    },
    terminalText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 19 },

    infoCard: {
        backgroundColor: "#fff", borderRadius: 18, padding: 4,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    infoRow: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 12, paddingHorizontal: 14, gap: 12,
    },
    infoIcon: {
        width: 34, height: 34, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
    infoSep: { height: 1, backgroundColor: "#F9FAFB", marginHorizontal: 14 },

    cvCard: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#fff", borderRadius: 18, padding: 14,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    cvIcon: {
        width: 48, height: 48, borderRadius: 14,
        justifyContent: "center", alignItems: "center",
    },
    cvInfo: { flex: 1 },
    cvName: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 3 },
    cvSub: { fontSize: 12, color: "#9CA3AF" },

    viewJobBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, borderRadius: 16, paddingVertical: 14,
        marginTop: 16,
    },
    viewJobText: { color: "#fff", fontWeight: "800", fontSize: 15 },

})