import React from "react";
import {
    View, Text, StyleSheet, ScrollView,
    Pressable, StatusBar, Linking,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_COLORS = [
    { color: "#FF6B6B", bgColor: "#FFF0F0" },
    { color: "#4ECDC4", bgColor: "#EEFAF9" },
    { color: "#A78BFA", bgColor: "#F5F0FF" },
    { color: "#F97316", bgColor: "#FFF4ED" },
    { color: "#185FA5", bgColor: "#EBF4FF" },
];

const STATUS_CONFIG = {
    REVIEWING: { label: "Chờ xét duyệt", color: "#F97316", bgColor: "#FFF4ED", icon: "clock-outline", desc: "Hồ sơ của bạn đang được nhà tuyển dụng xem xét." },
    INTERVIEW: { label: "Hẹn phỏng vấn", color: "#185FA5", bgColor: "#EBF4FF", icon: "calendar-check-outline", desc: "Chúc mừng! Nhà tuyển dụng muốn mời bạn phỏng vấn." },
    ACCEPTED: { label: "Trúng tuyển", color: "#16A34A", bgColor: "#DCFCE7", icon: "check-circle-outline", desc: "Chúc mừng bạn đã trúng tuyển vị trí này! 🎉" },
    REJECTED: { label: "Trượt", color: "#EF4444", bgColor: "#FEF2F2", icon: "close-circle-outline", desc: "Rất tiếc, hồ sơ của bạn không phù hợp lần này." },
    WITHDRAWN: { label: "Đã rút đơn", color: "#6B7280", bgColor: "#F3F4F6", icon: "undo-variant", desc: "Bạn đã rút đơn ứng tuyển này." },
    CANCELLED: { label: "Đã hủy", color: "#9CA3AF", bgColor: "#F9FAFB", icon: "cancel", desc: "Đơn ứng tuyển này đã bị hủy." },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatSalary(min, max) {
    const a = parseFloat(min ?? 0);
    const b = parseFloat(max ?? 0);
    if (!a && !b) return "Thỏa thuận";
    if (a && b) return `${(a / 1e6).toFixed(0)}–${(b / 1e6).toFixed(0)} triệu/tháng`;
    return "Thỏa thuận";
}

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} lúc ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDeadline(str) {
    if (!str) return "—";
    const parts = str.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getCvFileName(url = "") {
    const parts = url.split("/");
    return parts[parts.length - 1] || "cv_file";
}

function getFullName(candidate) {
    const full = `${candidate?.first_name ?? ""} ${candidate?.last_name ?? ""}`.trim();
    return full || "—";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ title }) {
    return (
        <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

function InfoRow({ icon, label, value, color = "#185FA5" }) {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: color + "15" }]}>
                <Icon source={icon} size={16} color={color} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

// Timeline step
const TIMELINE_STEPS = ["REVIEWING", "INTERVIEW", "ACCEPTED"];
function StatusTimeline({ currentStatus }) {
    const isTerminal = ["REJECTED", "WITHDRAWN", "CANCELLED"].includes(currentStatus);
    const currentIdx = TIMELINE_STEPS.indexOf(currentStatus);

    if (isTerminal) {
        const cfg = STATUS_CONFIG[currentStatus];
        return (
            <View style={[styles.terminalBox, { backgroundColor: cfg.bgColor }]}>
                <Icon source={cfg.icon} size={20} color={cfg.color} />
                <Text style={[styles.terminalText, { color: cfg.color }]}>{cfg.desc}</Text>
            </View>
        );
    }

    return (
        <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, idx) => {
                const cfg = STATUS_CONFIG[step];
                const isDone = idx < currentIdx;
                const isActive = idx === currentIdx;
                const stepColor = isDone || isActive ? cfg.color : "#E5E7EB";
                const textColor = isDone || isActive ? cfg.color : "#9CA3AF";
                const bgColor = isDone || isActive ? cfg.bgColor : "#F9FAFB";

                return (
                    <View key={step} style={styles.timelineItem}>
                        {/* Line before */}
                        {idx > 0 && (
                            <View style={[
                                styles.timelineLine,
                                { backgroundColor: idx <= currentIdx ? TIMELINE_STEPS[idx - 1] === "REVIEWING" ? STATUS_CONFIG.REVIEWING.color : STATUS_CONFIG.INTERVIEW.color : "#E5E7EB" }
                            ]} />
                        )}
                        <View style={styles.timelineCol}>
                            <View style={[
                                styles.timelineDot,
                                { backgroundColor: bgColor, borderColor: stepColor },
                                isActive && styles.timelineDotActive,
                            ]}>
                                <Icon
                                    source={isDone ? "check" : cfg.icon}
                                    size={isActive ? 16 : 14}
                                    color={stepColor}
                                />
                            </View>
                            <Text style={[styles.timelineLabel, { color: textColor, fontWeight: isActive ? "700" : "500" }]}>
                                {cfg.label}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
const MOCK = {
    id: 1,
    job: {
        employer: { company_name: "ABC", logo_company: null },
        industry: "Công nghệ thông tin",
        title: "Nhân viên phục vụ part-time",
        location: "Quận 1, TP.HCM",
        salary_min: "2500000.00",
        salary_max: "5000000.00",
        available_date: "2026-06-30",
    },
    candidate: { first_name: "", last_name: "", avatar: null, phone_num: "012345678" },
    apply_date: "2026-05-22T18:41:42.840956+07:00",
    cv_file: "http://res.cloudinary.com/duxz5ias9/raw/upload/v1779450105/paq2jnlp7qrjcx1k4j4v.jsx",
    status: "REVIEWING",
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ApplicationDetail({ route }) {
    const navigation = useNavigation();
    const application = route?.params?.application ?? MOCK;

    const job = application.job ?? {};
    const candidate = application.candidate ?? {};
    const statusCfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.REVIEWING;
    const { color, bgColor } = CARD_COLORS[(application.id - 1) % CARD_COLORS.length];
    const initials = getInitials(job.employer?.company_name || job.title || "?");
    const salary = formatSalary(job.salary_min, job.salary_max);
    const fullName = getFullName(candidate);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={color} />

            {/* ── Hero ── */}
            <View style={[styles.hero, { backgroundColor: color }]}>
                <View style={styles.bubble1} />
                <View style={styles.bubble2} />

                {/* Nav */}
                <View style={styles.nav}>
                    <Pressable style={styles.navBtn} onPress={() => navigation.goBack()}>
                        <Icon source="arrow-left" size={22} color="#fff" />
                    </Pressable>
                    <Text style={styles.navTitle}>Chi tiết đơn ứng tuyển</Text>
                    <View style={{ width: 38 }} />
                </View>

                {/* Company + Job */}
                <View style={styles.heroBody}>
                    <View style={[styles.logo, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                        <Text style={styles.logoText}>{initials}</Text>
                    </View>
                    <Text style={styles.heroCompany}>{job.employer?.company_name ?? "—"}</Text>
                    <Text style={styles.heroTitle}>{job.title}</Text>

                    <View style={styles.heroPills}>
                        <View style={styles.heroPill}>
                            <Icon source="map-marker-outline" size={13} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.heroPillText}>{job.location}</Text>
                        </View>
                        <View style={styles.heroPill}>
                            <Icon source="domain" size={13} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.heroPillText}>{job.industry}</Text>
                        </View>
                    </View>
                </View>

                {/* Status card floating */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusLeft, { backgroundColor: statusCfg.bgColor }]}>
                        <Icon source={statusCfg.icon} size={20} color={statusCfg.color} />
                        <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.applyDateLabel}>Ngày ứng tuyển</Text>
                        <Text style={styles.applyDateValue}>{formatDate(application.apply_date)}</Text>
                    </View>
                </View>
            </View>

            {/* ── Body ── */}
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Trạng thái timeline */}
                <SectionTitle title="Trạng thái hồ sơ" />
                <View style={styles.timelineCard}>
                    <Text style={styles.timelineDesc}>{statusCfg.desc}</Text>
                    <StatusTimeline currentStatus={application.status} />
                </View>

                {/* Thông tin việc làm */}
                <SectionTitle title="Thông tin việc làm" />
                <View style={styles.infoCard}>
                    <InfoRow icon="currency-usd" label="Mức lương" value={salary} color={color} />
                    <View style={styles.infoSep} />
                    <InfoRow icon="calendar-remove-outline" label="Hạn nộp hồ sơ" value={formatDeadline(job.available_date)} color={color} />
                    <View style={styles.infoSep} />
                    <InfoRow icon="domain" label="Ngành nghề" value={job.industry} color={color} />
                </View>

                {/* Thông tin ứng viên */}
                <SectionTitle title="Thông tin ứng viên" />
                <View style={styles.infoCard}>
                    {fullName !== "—" && (
                        <>
                            <InfoRow icon="account-outline" label="Họ và tên" value={fullName} color={color} />
                            <View style={styles.infoSep} />
                        </>
                    )}
                    <InfoRow icon="phone-outline" label="Số điện thoại" value={candidate.phone_num || "—"} color={color} />
                </View>

                {/* CV file */}
                <SectionTitle title="Hồ sơ đính kèm" />
                <Pressable
                    style={styles.cvCard}
                    onPress={() => application.cv_file && Linking.openURL(application.cv_file)}
                >
                    <View style={[styles.cvIcon, { backgroundColor: bgColor }]}>
                        <Icon source="file-document-outline" size={24} color={color} />
                    </View>
                    <View style={styles.cvInfo}>
                        <Text style={styles.cvName} numberOfLines={1}>
                            {getCvFileName(application.cv_file)}
                        </Text>
                        <Text style={styles.cvSub}>Nhấn để xem / tải xuống</Text>
                    </View>
                    <Icon source="open-in-new" size={18} color="#9CA3AF" />
                </Pressable>

                {/* Xem việc làm */}
                <Pressable
                    style={[styles.viewJobBtn, { backgroundColor: color }]}
                    onPress={() => navigation.navigate("search", {
                        screen: "JobDetail",
                        params: {
                            jobID: job.id,
                        },
                    })}
                >
                    <Icon source="briefcase-outline" size={18} color="#fff" />
                    <Text style={styles.viewJobText}>Xem chi tiết việc làm</Text>
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },

    // Hero
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

    // Status card
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

    // Body
    body: { flex: 1, marginTop: 16 },
    bodyContent: { paddingHorizontal: 16, paddingTop: 6 },

    // Section title
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginTop: 22, marginBottom: 10,
    },
    sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: "#185FA5" },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

    // Timeline
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

    // Info card
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

    // CV
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

    // View job btn
    viewJobBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 8, borderRadius: 16, paddingVertical: 14,
        marginTop: 16,
    },
    viewJobText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
