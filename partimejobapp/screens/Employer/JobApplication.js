import React, { useState, useContext } from "react";
import {
    View, Text, ScrollView, Pressable, Image,
    StatusBar, ActivityIndicator, Linking, Alert,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import { EmployerStyles, JobApplicationStyles as styles } from "./Styles";
import { STATUS_CONFIG } from "../../configs/ApplicationStatus";

const EMPLOYER_ACTIONS = {
    REVIEWING: [
        { status: "INTERVIEW", label: "Hẹn phỏng vấn", color: "#185FA5", icon: "calendar-clock" },
        { status: "REJECTED", label: "Từ chối", color: "#DC2626", icon: "close-circle-outline" },
    ],
    INTERVIEW: [
        { status: "ACCEPTED", label: "Trúng tuyển", color: "#059669", icon: "check-circle-outline" },
        { status: "REJECTED", label: "Từ chối", color: "#DC2626", icon: "close-circle-outline" },
    ],
    ACCEPTED: [],
    REJECTED: [],
    WITHDRAWN: [],
    CANCELLED: [],
};

const InfoRow = ({ icon, label, value, onPress }) => (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
            <Icon source={icon} size={18} color="#185FA5" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, onPress && { color: "#185FA5", textDecorationLine: "underline" }]}>
                {value || "—"}
            </Text>
        </View>
    </Pressable>
);

const SectionCard = ({ title, icon, children }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Icon source={icon} size={18} color="#185FA5" />
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const JobApplication = () => {
    const [user] = useContext(MyUserContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { application: initialApplication } = route.params;

    const [application, setApplication] = useState(initialApplication);
    const [updating, setUpdating] = useState(false);

    const statusCfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.REVIEWING;
    const actions = EMPLOYER_ACTIONS[application.status] ?? [];

    const candidate = application.candidate ?? {};
    const fullName = candidate.first_name && candidate.last_name
        ? `${candidate.first_name} ${candidate.last_name}`
        : candidate.username ?? "Ứng viên";

    const initials = fullName.split(" ").filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join("");

    const applyDate = application.apply_date
        ? new Date(application.apply_date).toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
        : "—";

    const handleChangeStatus = (newStatus, label) => {
        Alert.alert(
            "Xác nhận",
            `Bạn có chắc muốn chuyển trạng thái sang "${label}"?`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xác nhận",
                    style: newStatus === "REJECTED" || newStatus === "CANCELLED" ? "destructive" : "default",
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            const res = await authApis(user.access_token).patch(
                                endpoints["application-detail"](application.id),
                                { status: newStatus }
                            );
                            setApplication(res.data);
                        } catch (e) {
                            Alert.alert("Lỗi", e.response?.data?.detail ?? "Không thể cập nhật trạng thái.");
                        } finally {
                            setUpdating(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={EmployerStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />

            <View style={[EmployerStyles.header, { alignItems: "center" }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon source="arrow-left" size={22} color="#111827" />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={EmployerStyles.headerSub}>Đơn ứng tuyển</Text>
                    <Text style={EmployerStyles.headerTitle}>{fullName}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusCfg.bgColor }]}>
                    <Icon source={statusCfg.icon} size={13} color={statusCfg.color} />
                    <Text style={[styles.statusPillText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.profileSection}>
                    {candidate.avatar ? (
                        <Image
                            source={{ uri: candidate.avatar }}
                            style={styles.avatarCircle}
                        />
                    ) : (
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                    )}
                    <Text style={styles.applyDate}>Nộp đơn lúc {applyDate}</Text>
                </View>

                <SectionCard title="Thông tin ứng viên" icon="account-outline">
                    <InfoRow icon="account-outline" label="Họ và tên" value={fullName} />
                    <InfoRow
                        icon="email-outline" label="Email" value={candidate.email}
                        onPress={candidate.email ? () => Linking.openURL(`mailto:${candidate.email}`) : null}
                    />
                    <InfoRow
                        icon="phone-outline" label="Số điện thoại" value={candidate.phone_num}
                        onPress={candidate.phone_num ? () => Linking.openURL(`tel:${candidate.phone_num}`) : null}
                    />
                </SectionCard>

                <SectionCard title="Thông tin đơn" icon="file-document-outline">
                    <InfoRow icon="briefcase-outline" label="Vị trí" value={application.job?.title} />
                    <InfoRow icon="calendar-outline" label="Ngày nộp" value={applyDate} />
                    {application.note ? (
                        <View style={styles.noteBox}>
                            <Text style={styles.noteLabel}>Ghi chú của ứng viên</Text>
                            <Text style={styles.noteText}>{application.note}</Text>
                        </View>
                    ) : null}
                    {application.evaluation ? (
                        <View style={[styles.noteBox, { backgroundColor: "#EFF6FF" }]}>
                            <Text style={[styles.noteLabel, { color: "#1D4ED8" }]}>Đánh giá</Text>
                            <Text style={[styles.noteText, { color: "#1E40AF" }]}>{application.evaluation}</Text>
                        </View>
                    ) : null}
                </SectionCard>

                <SectionCard title="CV đính kèm" icon="file-pdf-box">
                    {application.cv_file ? (
                        <Pressable onPress={() => Linking.openURL(application.cv_file)} style={styles.cvButton}>
                            <Icon source="file-pdf-box" size={32} color="#DC2626" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cvFileName}>Xem / Tải CV</Text>
                                <Text style={styles.cvSub}>Nhấn để mở file CV</Text>
                            </View>
                            <Icon source="open-in-new" size={18} color="#185FA5" />
                        </Pressable>
                    ) : (
                        <Text style={EmployerStyles.emptySub}>Ứng viên chưa đính kèm CV</Text>
                    )}
                </SectionCard>

                {actions.length > 0 && (
                    <SectionCard title="Cập nhật trạng thái phỏng vấn" icon="swap-horizontal">
                        {updating ? (
                            <ActivityIndicator color="#185FA5" style={{ marginTop: 12 }} />
                        ) : (
                            <View style={styles.actionsGrid}>
                                {actions.map((action) => (
                                    <Pressable
                                        key={action.status}
                                        onPress={() => handleChangeStatus(action.status, action.label)}
                                        style={[styles.actionBtn, { borderColor: action.color }]}
                                    >
                                        <Icon source={action.icon} size={16} color={action.color} />
                                        <Text style={[styles.actionBtnText, { color: action.color }]}>
                                            {action.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </SectionCard>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
};

export default JobApplication;