import React, { useEffect, useState, useContext } from "react";
import {
    View, Text, ScrollView, Pressable,
    StatusBar, Share, Image, Alert,
    Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { Icon, ActivityIndicator, TextInput, HelperText, Button, Snackbar } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import CommentSection from "../../components/CommentSection";
import { JobDetailEmployerStyles as styles } from "../Employer/Styles";
import {
    getJobPalette, getInitials, formatSalary,
    formatDate, timeAgo, parseBenefits,
    parseRequirements, benefitIcon,
} from "../Job_Detail/Helpers";
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const modalInputTheme = {
    roundness: 20,
    colors: { background: "#EBF4FF" },
};
const modalOutlineStyle = { borderRadius: 20, borderColor: "#B3D4F5" };
const modalInputStyle = { backgroundColor: "#EBF4FF", marginBottom: 0 };
const modalMultiStyle = { backgroundColor: "#EBF4FF", marginBottom: 0 };

const jobFields = [
    { field: "title", label: "Tiêu đề", icon: "briefcase-outline", multiline: false },
    { field: "description", label: "Mô tả công việc", icon: "text", multiline: true },
    { field: "requirement", label: "Yêu cầu ứng viên", icon: "clipboard-list-outline", multiline: true },
    { field: "benefits", label: "Phúc lợi", icon: "gift-outline", multiline: true },
    { field: "salary_min", label: "Lương tối thiểu", icon: "cash-minus", multiline: false, keyboardType: "numeric" },
    { field: "salary_max", label: "Lương tối đa", icon: "cash-plus", multiline: false, keyboardType: "numeric" },
    { field: "location", label: "Địa điểm", icon: "map-marker-outline", multiline: false },
    { field: "industry", label: "Ngành nghề", icon: "domain", multiline: false },
    { field: "available_date", label: "Hạn nộp hồ sơ", icon: "calendar-outline", multiline: false },
];

function SectionTitle({ title, color }) {
    return (
        <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionAccent, { backgroundColor: color }]} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

function ModalSectionHeader({ icon, title, color }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 12 }}>
            <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: color + "15",
                alignItems: "center", justifyContent: "center",
            }}>
                <Icon source={icon} size={17} color={color} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{title}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#F3F4F6", marginLeft: 4 }} />
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

function IndustryPickerModal({ visible, industries, selected, color, onSelect, onClose }) {
    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <View style={{
                    flexDirection: "row", alignItems: "center",
                    padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
                }}>
                    <Pressable onPress={onClose} style={{ padding: 4, marginRight: 12 }}>
                        <Icon source="close" size={22} color="#6B7280" />
                    </Pressable>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Chọn ngành nghề</Text>
                </View>
                <ScrollView>
                    {industries.map((item) => {
                        const isSelected = selected === item.id;
                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => { onSelect(item); onClose(); }}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    padding: 16, borderBottomWidth: 1, borderBottomColor: "#F9FAFB",
                                    backgroundColor: isSelected ? color + "10" : "#fff",
                                }}
                            >
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: isSelected ? color + "20" : "#F3F4F6",
                                    alignItems: "center", justifyContent: "center", marginRight: 12,
                                }}>
                                    <Icon source="domain" size={18} color={isSelected ? color : "#9CA3AF"} />
                                </View>
                                <Text style={{
                                    flex: 1, fontSize: 15,
                                    fontWeight: isSelected ? "700" : "400",
                                    color: isSelected ? color : "#111827",
                                }}>
                                    {item.name}
                                </Text>
                                {isSelected && <Icon source="check-circle" size={20} color={color} />}
                            </Pressable>
                        );
                    })}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

function EditJobModal({ visible, job, jobId, color, onClose, onSaved }) {
    const [form, setForm] = useState({});
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const [snackVisible, setSnackVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showIndustryPicker, setShowIndustryPicker] = useState(false);
    const jobIdRef = React.useRef(null);
    const [industries, setIndustries] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState(null); // { id, name }
    const [stableJobId, setStableJobId] = useState(null);

    useEffect(() => {
        if (!visible) return;
        const fetchIndustries = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints["industries"]);
                const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
                setIndustries(list);
            } catch (e) {
                console.log("fetch industries error:", e);
            }
        };
        fetchIndustries();
    }, [visible]);

    useEffect(() => {
        if (job) {
            const id = jobId ?? job.id;
            if (id) jobIdRef.current = id;
            setForm({
                title: job.title ?? "",
                description: job.description ?? "",
                requirement: job.requirement ?? "",
                benefits: job.benefits ?? "",
                salary_min: job.salary_min ?? "",
                salary_max: job.salary_max ?? "",
                location: job.location ?? "",
                available_date: job.available_date ?? "",
            });
        }
    }, [job, jobId]);

    useEffect(() => {
        if (!job || !industries.length) return;

        if (typeof job.industry === "object" && job.industry !== null) {
            setSelectedIndustry({ id: job.industry.id, name: job.industry.name });
        } else if (typeof job.industry === "number") {
            const found = industries.find(i => i.id === job.industry);
            if (found) setSelectedIndustry({ id: found.id, name: found.name });
        } else if (typeof job.industry === "string") {
            const found = industries.find(i => i.name === job.industry);
            if (found) setSelectedIndustry({ id: found.id, name: found.name });
        }
    }, [job, industries]);

    useEffect(() => {
        if (visible && (jobId || job?.id)) {
            setStableJobId(jobId ?? job?.id);
        }
    }, [visible]);

    const setField = (field, value) => {
        setForm(p => ({ ...p, [field]: value }));
        setErr(p => ({ ...p, [field]: "" }));
    };

    const dobValue = () => {
        if (!form.available_date) return new Date();
        const parts = form.available_date.split("-");
        if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
        return new Date();
    };

    const validate = () => {
        let newErr = {};
        if (!form.title?.trim()) newErr.title = "Vui lòng nhập tiêu đề";
        if (!form.description?.trim()) newErr.description = "Vui lòng nhập mô tả công việc";
        if (!form.requirement?.trim()) newErr.requirement = "Vui lòng nhập yêu cầu ứng viên";
        if (!form.benefits?.trim()) newErr.benefits = "Vui lòng nhập phúc lợi";
        if (!form.salary_min) newErr.salary_min = "Vui lòng nhập lương tối thiểu";
        if (!form.salary_max) newErr.salary_max = "Vui lòng nhập lương tối đa";
        if (!form.location?.trim()) newErr.location = "Vui lòng nhập địa điểm";
        if (!form.available_date) newErr.available_date = "Vui lòng chọn hạn nộp hồ sơ";
        if (!selectedIndustry) newErr.industry = "Vui lòng chọn ngành nghề";
        if (form.salary_min && form.salary_max) {
            if (Number(form.salary_min) > Number(form.salary_max))
                newErr.salary_max = "Lương tối đa phải lớn hơn lương tối thiểu";
        }
        setErr(newErr);
        return Object.keys(newErr).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setErr({});
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const payload = { ...form, industry: selectedIndustry.id };
            const res = await authApis(token).patch(endpoints["job"](stableJobId), payload);
            onSaved(res.data);
            setSnackVisible(true);
            setTimeout(() => { setSnackVisible(false); onClose(); }, 1500);
        } catch (e) {
            console.log("save error:", JSON.stringify(e?.response?.data));
            setErr({ api: e?.response?.data?.detail ?? "Không thể cập nhật tin" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.modalContainer}>

                    <View style={[styles.modalHeader, { borderBottomColor: color + "25" }]}>
                        <Pressable onPress={onClose} style={styles.modalClose}>
                            <Icon source="close" size={22} color="#6B7280" />
                        </Pressable>
                        <Text style={styles.modalTitle}>Chỉnh sửa tin tuyển dụng</Text>
                        <Button
                            loading={loading}
                            disabled={loading}
                            onPress={handleSave}
                            mode="contained"
                            buttonColor={color}
                            labelStyle={{ fontWeight: "700", fontSize: 14 }}
                            style={{ borderRadius: 10 }}
                        >
                            Lưu
                        </Button>
                    </View>

                    <ScrollView
                        contentContainerStyle={[styles.modalBody, { paddingHorizontal: 16 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {!!err.api && (
                            <View style={{
                                backgroundColor: "#FEF2F2", borderRadius: 10,
                                padding: 12, marginBottom: 8,
                                flexDirection: "row", alignItems: "center", gap: 8,
                            }}>
                                <Icon source="alert-circle-outline" size={18} color="#EF4444" />
                                <Text style={{ color: "#EF4444", fontSize: 13, flex: 1 }}>{err.api}</Text>
                            </View>
                        )}

                        <ModalSectionHeader icon="briefcase-outline" title="Thông tin cơ bản" color={color} />

                        <TextInput
                            mode="outlined" label="Tiêu đề công việc"
                            value={form.title ?? ""}
                            onChangeText={v => setField("title", v)}
                            error={!!err.title}
                            left={<TextInput.Icon icon="briefcase-outline" />}
                            style={modalInputStyle}
                            outlineStyle={modalOutlineStyle}
                            theme={modalInputTheme}
                        />
                        <HelperText type="error" visible={!!err.title} style={{ marginTop: -4, marginBottom: 2 }}>
                            {err.title}
                        </HelperText>

                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    mode="outlined" label="Địa điểm"
                                    value={form.location ?? ""}
                                    onChangeText={v => setField("location", v)}
                                    error={!!err.location}
                                    left={<TextInput.Icon icon="map-marker-outline" />}
                                    style={modalInputStyle}
                                    outlineStyle={modalOutlineStyle}
                                    theme={modalInputTheme}
                                />
                                <HelperText type="error" visible={!!err.location} style={{ marginTop: -4, marginBottom: 2 }}>
                                    {err.location}
                                </HelperText>
                            </View>

                            <View style={{ flex: 1 }}>
                                <Pressable onPress={() => setShowIndustryPicker(true)}>
                                    <TextInput
                                        mode="outlined" label="Ngành nghề"
                                        value={selectedIndustry?.name ?? ""}
                                        editable={false}
                                        pointerEvents="none"
                                        error={!!err.industry}
                                        left={<TextInput.Icon icon="domain" />}
                                        right={<TextInput.Icon icon="chevron-down" />}
                                        style={modalInputStyle}
                                        outlineStyle={modalOutlineStyle}
                                        theme={modalInputTheme}
                                    />
                                </Pressable>
                                <HelperText type="error" visible={!!err.industry} style={{ marginTop: -4, marginBottom: 2 }}>
                                    {err.industry}
                                </HelperText>
                            </View>
                        </View>

                        <ModalSectionHeader icon="cash-multiple" title="Lương & Thời hạn" color={color} />

                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    mode="outlined" label="Lương tối thiểu"
                                    value={String(form.salary_min ?? "")}
                                    onChangeText={v => setField("salary_min", v)}
                                    keyboardType="numeric"
                                    error={!!err.salary_min}
                                    left={<TextInput.Icon icon="cash-minus" />}
                                    style={modalInputStyle}
                                    outlineStyle={modalOutlineStyle}
                                    theme={modalInputTheme}
                                />
                                <HelperText type="error" visible={!!err.salary_min} style={{ marginTop: -4, marginBottom: 2 }}>
                                    {err.salary_min}
                                </HelperText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    mode="outlined" label="Lương tối đa"
                                    value={String(form.salary_max ?? "")}
                                    onChangeText={v => setField("salary_max", v)}
                                    keyboardType="numeric"
                                    error={!!err.salary_max}
                                    left={<TextInput.Icon icon="cash-plus" />}
                                    style={modalInputStyle}
                                    outlineStyle={modalOutlineStyle}
                                    theme={modalInputTheme}
                                />
                                <HelperText type="error" visible={!!err.salary_max} style={{ marginTop: -4, marginBottom: 2 }}>
                                    {err.salary_max}
                                </HelperText>
                            </View>
                        </View>

                        <Pressable onPress={() => setShowDatePicker(true)}>
                            <TextInput
                                mode="outlined" label="Hạn nộp hồ sơ"
                                value={form.available_date ? formatDate(form.available_date) : ""}
                                editable={false}
                                pointerEvents="none"
                                error={!!err.available_date}
                                left={<TextInput.Icon icon="calendar-outline" />}
                                right={<TextInput.Icon icon="chevron-down" />}
                                style={modalInputStyle}
                                outlineStyle={modalOutlineStyle}
                                theme={modalInputTheme}
                            />
                        </Pressable>
                        <HelperText type="error" visible={!!err.available_date} style={{ marginTop: -4, marginBottom: 2 }}>
                            {err.available_date}
                        </HelperText>

                        {showDatePicker && (
                            <Modal transparent animationType="fade">
                                <View style={{
                                    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
                                    justifyContent: "center", alignItems: "center",
                                }}>
                                    <View style={{
                                        backgroundColor: "#fff", borderRadius: 16,
                                        padding: 16, width: "90%",
                                    }}>
                                        <DateTimePicker
                                            value={dobValue()}
                                            mode="date"
                                            display={Platform.OS === "android" ? "default" : "inline"}
                                            minimumDate={new Date()}
                                            onChange={(event, date) => {
                                                setShowDatePicker(false);
                                                if (date) {
                                                    const d = date.getDate().toString().padStart(2, "0");
                                                    const m = (date.getMonth() + 1).toString().padStart(2, "0");
                                                    const y = date.getFullYear();
                                                    setField("available_date", `${y}-${m}-${d}`);
                                                }
                                            }}
                                        />
                                        <Button onPress={() => setShowDatePicker(false)}>Đóng</Button>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        <ModalSectionHeader icon="text-box-outline" title="Mô tả & Yêu cầu" color={color} />

                        <TextInput
                            mode="outlined" label="Mô tả công việc"
                            value={form.description ?? ""}
                            onChangeText={v => setField("description", v)}
                            multiline numberOfLines={4}
                            error={!!err.description}
                            left={<TextInput.Icon icon="text" />}
                            style={modalMultiStyle}
                            outlineStyle={modalOutlineStyle}
                            theme={modalInputTheme}
                        />
                        <HelperText type="error" visible={!!err.description} style={{ marginTop: -4, marginBottom: 2 }}>
                            {err.description}
                        </HelperText>

                        <TextInput
                            mode="outlined" label="Yêu cầu ứng viên"
                            value={form.requirement ?? ""}
                            onChangeText={v => setField("requirement", v)}
                            multiline numberOfLines={4}
                            error={!!err.requirement}
                            left={<TextInput.Icon icon="clipboard-list-outline" />}
                            style={modalMultiStyle}
                            outlineStyle={modalOutlineStyle}
                            theme={modalInputTheme}
                        />
                        <HelperText type="error" visible={!!err.requirement} style={{ marginTop: -4, marginBottom: 2 }}>
                            {err.requirement}
                        </HelperText>

                        <ModalSectionHeader icon="gift-outline" title="Phúc lợi" color={color} />

                        <TextInput
                            mode="outlined" label="Phúc lợi (phân cách bằng dấu phẩy)"
                            value={form.benefits ?? ""}
                            onChangeText={v => setField("benefits", v)}
                            multiline numberOfLines={3}
                            error={!!err.benefits}
                            left={<TextInput.Icon icon="gift-outline" />}
                            style={modalMultiStyle}
                            outlineStyle={modalOutlineStyle}
                            theme={modalInputTheme}
                        />
                        <HelperText type="error" visible={!!err.benefits} style={{ marginTop: -4, marginBottom: 2 }}>
                            {err.benefits}
                        </HelperText>

                        <View style={{ height: 48 }} />
                    </ScrollView>

                    <Snackbar
                        visible={snackVisible}
                        onDismiss={() => setSnackVisible(false)}
                        duration={1500}
                        style={{ backgroundColor: "#16A34A" }}
                    >
                        Cập nhật thành công!
                    </Snackbar>
                </View>
            </KeyboardAvoidingView>

            <IndustryPickerModal
                visible={showIndustryPicker}
                industries={industries}
                selected={selectedIndustry?.id}
                color={color}
                onSelect={(item) => {
                    setSelectedIndustry(item);
                    setErr(p => ({ ...p, industry: "" }));
                }}
                onClose={() => setShowIndustryPicker(false)}
            />
        </Modal>
    );
}

const JobDetailEmployer = ({ navigation, route }) => {
    const passedJob = route?.params?.job;
    const jobID = route?.params?.jobID;

    const [job, setJob] = useState(passedJob);
    const [loading, setLoading] = useState(!passedJob);
    const [toggling, setToggling] = useState(false);
    const [editVisible, setEditVisible] = useState(false);

    useEffect(() => {
        if (passedJob) return;
        const fetchJob = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const res = await authApis(token).get(endpoints["job"](jobID));
                setJob(prev => ({ ...prev, ...res.data }));
            } catch (e) {
                console.error(e?.response?.data);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [passedJob, jobID]);

    const handleToggleStatus = () => {
        const isOpening = job.status === "OPENING";
        const nextStatus = isOpening ? "CLOSED" : "OPENING";

        Alert.alert(
            isOpening ? "Đóng tuyển dụng" : "Mở lại tuyển dụng",
            isOpening
                ? "Đóng tin này? Ứng viên sẽ không thể nộp hồ sơ mới."
                : "Mở lại tin tuyển dụng này?",
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xác nhận",
                    style: isOpening ? "destructive" : "default",
                    onPress: async () => {
                        setToggling(true);
                        try {
                            const token = await AsyncStorage.getItem('token');
                            console.log("job.id trước khi toggle:", job.id);  // ← thêm
                            const res = await authApis(token).patch(
                                endpoints["job"](job.id),
                                { status: nextStatus }
                            );
                            console.log("response:", JSON.stringify(res.data)); // ← thêm
                            setJob(prev => ({ ...prev, ...res.data }));
                        } catch (e) {
                            console.log("toggle error:", JSON.stringify(e?.response?.data));
                            Alert.alert("Lỗi", e?.response?.data?.detail ?? "Không thể cập nhật trạng thái");
                        } finally {
                            setToggling(false);
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        await Share.share({
            message: `${job.title} tại ${job.employer?.company_name} – ${formatSalary(job.salary_min, job.salary_max)}`,
        });
    };

    const { color, bgColor } = job ? getJobPalette(job) : { color: "#185FA5", bgColor: "#EFF6FF" };
    const initials = job ? getInitials(job.employer?.company_name || job.employer?.full_name) : "";
    const salary = job ? formatSalary(job.salary_min, job.salary_max) : "";
    const deadline = job ? formatDate(job.available_date) : "";
    const postedAt = job ? timeAgo(job.created_at) : "";
    const benefits = job ? parseBenefits(job.benefits) : [];
    const requirements = job ? parseRequirements(job.requirement) : [];
    const isOpening = job?.status === "OPENING";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={color} />

            {(loading || !job) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#185FA5" />
                </View>
            )}

            {!loading && job && (
                <>
                    <View style={[styles.hero, { backgroundColor: color }]}>
                        <View style={styles.bubble1} />
                        <View style={styles.bubble2} />

                        <View style={styles.nav}>
                            <Pressable style={styles.navBtn} onPress={() => navigation?.goBack()}>
                                <Icon source="arrow-left" size={22} color="#fff" />
                            </Pressable>
                            <Text style={[styles.navTitle, { flex: 1, textAlign: "center" }]}>Chi tiết tin tuyển dụng</Text>
                        </View>

                        <View style={styles.heroBody}>
                            {job.employer?.logo_company ? (
                                <Image source={{ uri: job.employer.logo_company }} style={[styles.logoImg, { borderColor: color + "40" }]} resizeMode="contain" />
                            ) : (
                                <View style={[styles.logoFallback, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                                    <Text style={styles.logoInitials}>{initials}</Text>
                                </View>
                            )}
                            <Text style={styles.companyName}>{job.employer?.company_name || job.employer?.full_name}</Text>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <View style={styles.pillRow}>
                                <StatPill icon="map-marker-outline" label={job.location} />
                                <StatPill icon="briefcase-outline" label={job.industry} />
                                <View style={[styles.statusPill, { backgroundColor: isOpening ? "rgba(22,163,74,0.25)" : "rgba(239,68,68,0.25)" }]}>
                                    <View style={[styles.statusPillDot, { backgroundColor: isOpening ? "#86EFAC" : "#FCA5A5" }]} />
                                    <Text style={[styles.statusPillText, { color: isOpening ? "#86EFAC" : "#FCA5A5" }]}>
                                        {isOpening ? "Đang tuyển" : "Đã đóng"}
                                    </Text>
                                </View>
                            </View>
                        </View>

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

                    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.infoCard}>
                            <InfoRow icon="domain" label="Ngành nghề" value={job.industry} color={color} />
                            <View style={styles.infoSep} />
                            <InfoRow icon="map-marker-outline" label="Địa điểm" value={job.location} color={color} />
                            <View style={styles.infoSep} />
                            <InfoRow icon="badge-account-horizontal-outline" label="Người đăng tuyển" value={job.employer?.full_name} color={color} />
                            <View style={styles.infoSep} />
                            <InfoRow icon="identifier" label="Mã số thuế" value={job.employer?.tax_code} color={color} />
                            <View style={styles.infoSep} />
                            <InfoRow icon="update" label="Cập nhật lần cuối" value={timeAgo(job.updated_at)} color={color} />
                        </View>

                        {job.description ? (
                            <>
                                <SectionTitle title="Mô tả công việc" color={color} />
                                <View style={styles.descCard}>
                                    <Text style={styles.descText}>{job.description}</Text>
                                </View>
                            </>
                        ) : null}

                        {requirements.length > 0 && (
                            <>
                                <SectionTitle title="Yêu cầu ứng viên" color={color} />
                                <View style={styles.reqCard}>
                                    {requirements.map((req, i) => <RequirementItem key={i} text={req} />)}
                                </View>
                            </>
                        )}

                        {benefits.length > 0 && (
                            <>
                                <SectionTitle title="Phúc lợi" color={color} />
                                <View style={styles.benefitsList}>
                                    {benefits.map((b, i) => <BenefitItem key={i} text={b} accentColor={color} bgColor={bgColor} />)}
                                </View>
                            </>
                        )}

                        {job.employer?.description ? (
                            <>
                                <SectionTitle title="Về công ty" color={color} />
                                <View style={styles.descCard}>
                                    <Text style={styles.descText}>{job.employer.description}</Text>
                                </View>
                            </>
                        ) : null}

                        <View style={{ height: 120 }} />
                    </ScrollView>

                    <View style={styles.cta}>
                        <Pressable
                            onPress={handleToggleStatus}
                            disabled={toggling}
                            style={[styles.ctaToggle, {
                                borderColor: isOpening ? "#EF4444" : "#16A34A",
                                backgroundColor: isOpening ? "#FEF2F2" : "#F0FDF4",
                            }]}
                        >
                            {toggling
                                ? <ActivityIndicator size="small" color={isOpening ? "#EF4444" : "#16A34A"} />
                                : <>
                                    <Icon source={isOpening ? "pause-circle-outline" : "play-circle-outline"} size={20} color={isOpening ? "#EF4444" : "#16A34A"} />
                                    <Text style={[styles.ctaToggleText, { color: isOpening ? "#EF4444" : "#16A34A" }]}>
                                        {isOpening ? "Đóng tuyển" : "Mở lại"}
                                    </Text>
                                </>
                            }
                        </Pressable>

                        <Pressable style={[styles.ctaEdit, { backgroundColor: color }]} onPress={() => setEditVisible(true)}>
                            <Icon source="pencil" size={18} color="#fff" />
                            <Text style={styles.ctaEditText}>Chỉnh sửa tin</Text>
                        </Pressable>
                    </View>

                    <EditJobModal
                        visible={editVisible}
                        job={job}
                        jobId={job?.id ?? jobID}
                        color={color}
                        onClose={() => setEditVisible(false)}
                        onSaved={(updated) => setJob(prev => ({ ...prev, ...updated }))}
                    />
                </>
            )}
        </View>
    );
};

export default JobDetailEmployer;