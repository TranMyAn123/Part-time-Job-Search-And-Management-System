import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    StatusBar,
    Share,
    Image,
    ActivityIndicator,
} from "react-native";
import { Icon } from "react-native-paper";
import CommentSection from "../../components/CommentSection";
import {
    getJobPalette,
    getInitials,
    formatSalary,
    formatDate,
    timeAgo,
    parseBenefits,
    parseRequirements,
    benefitIcon
} from "./Helpers";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ title, color }) {
    return (
        <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionAccent, { backgroundColor: color }]} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

function RequirementItem({ text }) {
    return (
        <View style={styles.reqRow}>
            <View style={styles.reqDot} />
            <Text style={styles.reqText}>{text}</Text>
        </View>
    );
}

function BenefitItem({ text, accentColor, bgColor }) {
    return (
        <View style={[styles.benefitItem, { backgroundColor: bgColor }]}>
            <View style={[styles.benefitIconWrap, { backgroundColor: accentColor + "20" }]}>
                <Icon source={benefitIcon(text)} size={18} color={accentColor} />
            </View>
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );
}

function StatPill({ icon, label }) {
    return (
        <View style={styles.statPill}>
            <Icon source={icon} size={13} color="rgba(255,255,255,0.85)" />
            <Text style={styles.statPillText}>{label}</Text>
        </View>
    );
}

function InfoRow({ icon, label, value, color }) {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.infoIconWrap, { backgroundColor: color + "15" }]}>
                <Icon source={icon} size={16} color={color} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function JobDetail({ navigation, route }) {
    const passedJob = route?.params?.job
    const jobID = route?.params?.jobID
    const [job, setJob] = useState(passedJob)
    const [saved, setSaved] = useState(false);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(false)
    const [user] = useContext(MyUserContext);

    useEffect(() => {
        if (!user || !job) return;
        const checkApplied = async () => {
            try {
                const res = await authApis(user.access_token).get(endpoints['applications']);
                const already = res.data.some(app => app.job?.id === job.id);
                setApplied(already);
            } catch (e) { }
        };
        checkApplied();
    }, [job]);

    useEffect(() => {
        if (passedJob) return;

        const fetchJob = async () => {
            try {
                const res = await Apis.get(endpoints['job'](jobID))
                setJob(res.data);
            } catch (e) {
                const msg = e?.response?.data?.detail ?? e?.response?.data?.message ??
                    console.log(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [passedJob, jobID]);

    if (loading || !job) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={color || "#2563EB"} />
            </View>
        );
    }

    const { color, bgColor } = getJobPalette(job);
    const initials = getInitials(job.employer?.company_name || job.employer?.full_name);
    const salary = formatSalary(job.salary_min, job.salary_max);
    const deadline = formatDate(job.available_date);
    const postedAt = timeAgo(job.created_at);
    const benefits = parseBenefits(job.benefits);
    const requirements = parseRequirements(job.requirement);
    const isOpening = job.status === "OPENING";

    const handleShare = async () => {
        await Share.share({
            message: `${job.title} tại ${job.employer?.company_name} – ${salary}`,
        });
    };
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={color} />

            <View style={[styles.hero, { backgroundColor: color }]}>
                {/* Decorative bubbles */}
                <View style={styles.bubble1} />
                <View style={styles.bubble2} />

                {/* Nav bar */}
                <View style={styles.nav}>
                    <Pressable
                        style={styles.navBtn}
                        onPress={() => navigation?.goBack()}
                    >
                        <Icon source="arrow-left" size={22} color="#fff" />
                    </Pressable>
                    <Text style={styles.navTitle}>Chi tiết việc làm</Text>
                    <View style={styles.navRight}>
                        <Pressable style={styles.navBtn} onPress={handleShare}>
                            <Icon source="share-variant-outline" size={20} color="#fff" />
                        </Pressable>
                        <Pressable
                            style={[styles.navBtn, saved && styles.navBtnSaved]}
                            onPress={() => setSaved((p) => !p)}
                        >
                            <Icon
                                source={saved ? "bookmark" : "bookmark-outline"}
                                size={20}
                                color="#fff"
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Company logo / initials */}
                <View style={styles.heroBody}>
                    {job.employer?.logo_company ? (
                        <Image
                            source={{ uri: job.employer.logo_company }}
                            style={[styles.logoImg, { borderColor: color + "40" }]}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={[styles.logoFallback, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                            <Text style={styles.logoInitials}>{initials}</Text>
                        </View>
                    )}

                    {/* Company name */}
                    <Text style={styles.companyName}>
                        {job.employer?.company_name || job.employer?.full_name}
                    </Text>

                    {/* Job title */}
                    <Text style={styles.jobTitle}>{job.title}</Text>

                    {/* Pill tags */}
                    <View style={styles.pillRow}>
                        <StatPill icon="map-marker-outline" label={job.location} />
                        <StatPill icon="briefcase-outline" label={job.industry} />
                        {isOpening && (
                            <View style={styles.urgentPill}>
                                <Text style={styles.urgentPillText}>🔥 Đang tuyển</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Salary card (floats) ── */}
                <View style={styles.salaryCard}>
                    <View>
                        <Text style={styles.salaryLabel}>Mức lương</Text>
                        <Text style={[styles.salaryValue, { color }]}>{salary}</Text>
                    </View>
                    <View style={styles.salaryDivider} />
                    <View style={styles.deadlineBlock}>
                        <Icon source="calendar-clock-outline" size={16} color={color} />
                        <View>
                            <Text style={styles.salaryLabel}>Hạn nộp hồ sơ</Text>
                            <Text style={[styles.deadlineValue, { color }]}>{deadline}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── BODY ─────────────────────────────────────────────────── */}
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick info list */}
                <View style={styles.infoCard}>
                    <InfoRow
                        icon="domain"
                        label="Ngành nghề"
                        value={job.industry}
                        color={color}
                    />
                    <View style={styles.infoSep} />
                    <InfoRow
                        icon="map-marker-outline"
                        label="Địa điểm"
                        value={job.location}
                        color={color}
                    />
                    <View style={styles.infoSep} />
                    <InfoRow
                        icon="badge-account-horizontal-outline"
                        label="Người đăng tuyển"
                        value={job.employer?.full_name}
                        color={color}
                    />
                    <View style={styles.infoSep} />
                    <InfoRow
                        icon="identifier"
                        label="Mã số thuế"
                        value={job.employer?.tax_code}
                        color={color}
                    />
                    <View style={styles.infoSep} />
                    <InfoRow
                        icon="update"
                        label="Cập nhật lần cuối"
                        value={timeAgo(job.updated_at)}
                        color={color}
                    />
                </View>

                <View style={[styles.statusBadge, { backgroundColor: isOpening ? "#DCFCE7" : "#F3F4F6" }]}>
                    <View style={[styles.statusDot, { backgroundColor: isOpening ? "#16A34A" : "#9CA3AF" }]} />
                    <Text style={[styles.statusText, { color: isOpening ? "#16A34A" : "#6B7280" }]}>
                        {isOpening ? "Đang nhận hồ sơ" : "Đã đóng tuyển dụng"}
                    </Text>
                </View>

                {job.description && (
                    <>
                        <SectionTitle title="Mô tả công việc" color={color} />
                        <View style={styles.descCard}>
                            <Text style={styles.descText}>{job.description}</Text>
                        </View>
                    </>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                    <>
                        <SectionTitle title="Yêu cầu ứng viên" color={color} />
                        <View style={styles.reqCard}>
                            {requirements.map((req, i) => (
                                <RequirementItem key={i} text={req} />
                            ))}
                        </View>
                    </>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                    <>
                        <SectionTitle title="Phúc lợi" color={color} />
                        <View style={styles.benefitsList}>
                            {benefits.map((b, i) => (
                                <BenefitItem
                                    key={i}
                                    text={b}
                                    accentColor={color}
                                    bgColor={bgColor}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* Employer description (if any) */}
                {job.employer?.description && (
                    <>
                        <SectionTitle title="Về công ty" color={color} />
                        <View style={styles.descCard}>
                            <Text style={styles.descText}>{job.employer.description}</Text>
                        </View>
                    </>
                )}
                <CommentSection jobID={job.id} labelColor={color} />

                {/* Footer meta */}
                <View style={styles.metaRow}>
                    <Icon source="clock-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.metaText}>
                        Đăng {postedAt} · Hạn nộp {deadline}
                    </Text>
                </View>

                <View style={{ height: 120 }} />

            </ScrollView>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <View style={styles.cta}>
                <Pressable style={[styles.ctaChat, { borderColor: color + "50", backgroundColor: bgColor }]}>
                    <Icon source="message-text-outline" size={22} color={color} />
                </Pressable>
                <Pressable
                    style={[
                        styles.ctaApply,
                        { backgroundColor: applied ? "#16A34A" : color },
                        (!isOpening || applied) && styles.ctaDisabled,
                    ]}
                    onPress={() => isOpening && !applied && navigation.navigate("ApplyJob", { job })}
                    disabled={!isOpening || applied}
                >
                    <Icon
                        source={applied ? "check-circle" : "send"}
                        size={18}
                        color="#fff"
                    />
                    <Text style={styles.ctaApplyText}>
                        {!isOpening
                            ? "Đã đóng tuyển dụng"
                            : applied
                                ? "Đã ứng tuyển"
                                : "Ứng tuyển ngay"}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    container: { flex: 1, backgroundColor: "#F4F6FB" },

    // Hero
    hero: {
        paddingBottom: 56,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
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

    // Nav
    nav: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    },
    navTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
    navRight: { flexDirection: "row", gap: 6 },
    navBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center", alignItems: "center",
    },
    navBtnSaved: { backgroundColor: "rgba(255,255,255,0.35)" },

    // Hero body
    heroBody: { paddingHorizontal: 20, paddingTop: 6 },
    logoImg: {
        width: 64, height: 64, borderRadius: 18,
        borderWidth: 2, backgroundColor: "#fff", marginBottom: 12,
    },
    logoFallback: {
        width: 64, height: 64, borderRadius: 18,
        justifyContent: "center", alignItems: "center", marginBottom: 12,
    },
    logoInitials: { color: "#fff", fontWeight: "800", fontSize: 24 },
    companyName: { color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: "600", marginBottom: 4 },
    jobTitle: {
        color: "#fff", fontSize: 22, fontWeight: "800",
        letterSpacing: -0.5, lineHeight: 28, marginBottom: 14,
    },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    statPill: {
        flexDirection: "row", alignItems: "center", gap: 5,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    statPillText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },
    urgentPill: {
        backgroundColor: "rgba(249,115,22,0.25)",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    urgentPillText: { fontSize: 12, fontWeight: "700", color: "#FED7AA" },

    // Salary card
    salaryCard: {
        position: "absolute", bottom: -20, left: 20, right: 20,
        backgroundColor: "#fff", borderRadius: 20,
        borderWidth: 1, borderColor: "#E9F0F8",
        flexDirection: "row", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 18,
        shadowColor: "#000", shadowOpacity: 0.1,
        shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6,
    },
    salaryLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
    salaryValue: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
    salaryDivider: { width: 1, height: 38, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
    deadlineBlock: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
    deadlineValue: { fontSize: 14, fontWeight: "700" },

    // Body
    body: { flex: 1, marginTop: 16 },
    bodyContent: { paddingHorizontal: 16, paddingTop: 6 },

    // Info card
    infoCard: {
        backgroundColor: "#fff", borderRadius: 20, padding: 4,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: "row", alignItems: "center",
        paddingVertical: 12, paddingHorizontal: 14, gap: 12,
    },
    infoIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
    infoSep: { height: 1, backgroundColor: "#F9FAFB", marginHorizontal: 14 },

    // Status badge
    statusBadge: {
        flexDirection: "row", alignItems: "center", gap: 7,
        alignSelf: "flex-start",
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 10, marginTop: 12,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 13, fontWeight: "700" },

    // Section title
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginTop: 22, marginBottom: 10,
    },
    sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: "#185FA5" },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

    // Description
    descCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    descText: { fontSize: 14, color: "#4B5563", lineHeight: 23 },

    // Requirements
    reqCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    reqRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    reqDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: "#185FA5", marginTop: 6, flexShrink: 0,
    },
    reqText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 22 },

    // Benefits
    benefitsList: { gap: 10 },
    benefitItem: {
        flexDirection: "row", alignItems: "center", gap: 12,
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    },
    benefitIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
    },
    benefitText: { fontSize: 14, color: "#374151", fontWeight: "600", flex: 1 },

    // Meta
    metaRow: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginTop: 20, justifyContent: "center",
    },
    metaText: { fontSize: 12, color: "#9CA3AF" },

    // CTA
    cta: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
        flexDirection: "row", gap: 12, alignItems: "center",
        borderTopWidth: 1, borderTopColor: "#F3F4F6",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8,
    },
    ctaChat: {
        width: 52, height: 52, borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: "center", alignItems: "center",
    },
    ctaApply: {
        flex: 1, height: 52, borderRadius: 16,
        flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    },
    ctaDisabled: { opacity: 0.5 },
    ctaApplyText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
