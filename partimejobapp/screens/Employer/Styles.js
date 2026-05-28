import { StyleSheet } from "react-native";
import { Colors } from "../../configs/Colors";

export const EmployerStyles = StyleSheet.create({
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

    summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 4 },
    summaryItem: { flex: 1, borderRadius: 16, padding: 12, alignItems: "center", gap: 4 },
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

    empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 10 },
    emptyIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: "#F9FAFB",
        justifyContent: "center", alignItems: "center", marginBottom: 4,
    },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: "#374151" },
    emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 21 },
});

export const JobApplicationStyles = StyleSheet.create({
    scrollContent: { paddingBottom: 16 },

    backBtn: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "#fff",
        alignItems: "center", justifyContent: "center",
        elevation: 1,
        shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
    },
    statusPill: {
        flexDirection: "row", alignItems: "center", gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    statusPillText: { fontSize: 12, fontWeight: "700" },

    profileSection: { alignItems: "center", paddingVertical: 20 },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "#DBEAFE",
        alignItems: "center", justifyContent: "center", marginBottom: 8,
    },
    avatarInitials: { fontSize: 26, fontWeight: "800", color: "#185FA5" },
    applyDate: { fontSize: 13, color: "#6B7280" },

    card: {
        backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 12,
        borderRadius: 16, padding: 16,
        shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    cardHeader: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginBottom: 14, paddingBottom: 10,
        borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
    },
    cardTitle: { fontSize: 14, fontWeight: "700", color: "#374151" },

    infoRow: {
        flexDirection: "row", alignItems: "flex-start", gap: 10,
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F9FAFB",
    },
    infoIconWrap: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center",
    },
    infoLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

    noteBox: { backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12, marginTop: 10 },
    noteLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", marginBottom: 4 },
    noteText: { fontSize: 13, color: "#374151", lineHeight: 20 },

    cvButton: {
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: "#FEF2F2", borderRadius: 12, padding: 14,
    },
    cvFileName: { fontSize: 14, fontWeight: "700", color: "#111827" },
    cvSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

    actionsGrid: { gap: 10 },
    actionBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, backgroundColor: "#fff",
    },
    actionBtnText: { fontSize: 14, fontWeight: "700" },
});

export const JobDetailEmployerStyles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { flex: 1, backgroundColor: "#F4F6FB" },

    hero: { paddingBottom: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    bubble1: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.07)", top: -50, right: -50 },
    bubble2: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.05)", bottom: 30, left: -40 },

    nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
    navTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
    navRight: { flexDirection: "row", gap: 6 },
    navBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },

    heroBody: { paddingHorizontal: 20, paddingTop: 6 },
    logoImg: { width: 64, height: 64, borderRadius: 18, borderWidth: 2, backgroundColor: "#fff", marginBottom: 12 },
    logoFallback: { width: 64, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 12 },
    logoInitials: { color: "#fff", fontWeight: "800", fontSize: 24 },
    companyName: { color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: "600", marginBottom: 4 },
    jobTitle: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.5, lineHeight: 28, marginBottom: 14 },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    statPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statPillText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },
    statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusPillDot: { width: 7, height: 7, borderRadius: 4 },
    statusPillText: { fontSize: 12, fontWeight: "700" },

    salaryCard: { position: "absolute", bottom: -20, left: 20, right: 20, backgroundColor: "#fff", 
        borderRadius: 20, borderWidth: 1, borderColor: "#E9F0F8",
        flexDirection: "row", alignItems: "center", paddingVertical: 14, 
        paddingHorizontal: 18, shadowColor: "#000", shadowOpacity: 0.1, 
        shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
    salaryLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
    salaryValue: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
    salaryDivider: { width: 1, height: 38, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
    deadlineBlock: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    deadlineValue: { fontSize: 14, fontWeight: "700" },

    body: { flex: 1, marginTop: 16 },
    bodyContent: { paddingHorizontal: 16, paddingTop: 6 },

    infoCard: { backgroundColor: "#fff", borderRadius: 20, padding: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 4 },
    infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, gap: 12 },
    infoIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
    infoSep: { height: 1, backgroundColor: "#F9FAFB", marginHorizontal: 14 },

    statsRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 4 },
    statBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
    statBoxLabel: { fontSize: 11, fontWeight: "600" },
    statBoxValue: { fontSize: 13, fontWeight: "800" },

    sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 22, marginBottom: 10 },
    sectionAccent: { width: 4, height: 18, borderRadius: 2 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

    descCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    descText: { fontSize: 14, color: "#4B5563", lineHeight: 23 },

    reqCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    reqRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    reqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#185FA5", marginTop: 6, flexShrink: 0 },
    reqText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 22 },

    benefitsList: { gap: 10 },
    benefitItem: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
    benefitIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    benefitText: { fontSize: 14, color: "#374151", fontWeight: "600", flex: 1 },

    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 20, justifyContent: "center" },
    metaText: { fontSize: 12, color: "#9CA3AF" },

    cta: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, flexDirection: "row", gap: 12, alignItems: "center", borderTopWidth: 1, borderTopColor: "#F3F4F6", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
    ctaToggle: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1.5 },
    ctaToggleText: { fontWeight: "700", fontSize: 14 },
    ctaEdit: { flex: 1, height: 52, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
    ctaEditText: { color: "#fff", fontWeight: "800", fontSize: 16 },

    modalContainer: { flex: 1, backgroundColor: "#fff" },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
    modalClose: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
    modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
    modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
    modalSaveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    modalBody: { padding: 16, gap: 4 },
    rowFields: { flexDirection: "row" },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
    fieldInput: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#111827" },
    fieldMultiline: { minHeight: 90, textAlignVertical: "top" },
});