import React from "react";
import {
    View, Text, StyleSheet, ScrollView,
    Pressable, StatusBar, Linking,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { CARD_COLORS } from "../../configs/Colors";
import { STATUS_CONFIG } from "../../configs/ApplicationStatus";
import { getInitials, formatSalary, formatDate, formatDateTime, getFullName } from "../../helpers";
import { ApplicationDetailStyles as styles } from "./Styles";


function getCvFileName(url = "") {
    const parts = url.split("/");
    return parts[parts.length - 1] || "cv_file";
}


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

            <View style={[styles.hero, { backgroundColor: color }]}>
                <View style={styles.bubble1} />
                <View style={styles.bubble2} />

                <View style={styles.nav}>
                    <Pressable style={styles.navBtn} onPress={() => navigation.goBack()}>
                        <Icon source="arrow-left" size={22} color="#fff" />
                    </Pressable>
                    <Text style={styles.navTitle}>Chi tiết đơn ứng tuyển</Text>
                    <View style={{ width: 38 }} />
                </View>

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

                <View style={styles.statusCard}>
                    <View style={[styles.statusLeft, { backgroundColor: statusCfg.bgColor }]}>
                        <Icon source={statusCfg.icon} size={20} color={statusCfg.color} />
                        <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.applyDateLabel}>Ngày ứng tuyển</Text>
                        <Text style={styles.applyDateValue}>{formatDateTime(application.apply_date)}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                <SectionTitle title="Trạng thái hồ sơ" />
                <View style={styles.timelineCard}>
                    <Text style={styles.timelineDesc}>{statusCfg.desc}</Text>
                    <StatusTimeline currentStatus={application.status} />
                </View>

                <SectionTitle title="Thông tin việc làm" />
                <View style={styles.infoCard}>
                    <InfoRow icon="currency-usd" label="Mức lương" value={salary} color={color} />
                    <View style={styles.infoSep} />
                    <InfoRow icon="calendar-remove-outline" label="Hạn nộp hồ sơ" value={formatDate(job.available_date)} color={color} />
                    <View style={styles.infoSep} />
                    <InfoRow icon="domain" label="Ngành nghề" value={job.industry} color={color} />
                </View>

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

