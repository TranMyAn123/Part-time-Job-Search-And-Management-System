import React, { useContext, useState } from "react";
import {
    View, Text, ScrollView, Pressable,
    StatusBar, Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Icon, TextInput, HelperText } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";

const inputTheme = {
    colors: {
        primary: "#185FA5",
        outline: "#D1D5DB",
        background: "#fff",
    },
    roundness: 12,
};

const SectionCard = ({ title, icon, children }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Icon source={icon} size={18} color="#185FA5" />
            <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const ApplyJob = () => {
    const [user] = useContext(MyUserContext);
    const navigation = useNavigation();
    const route = useRoute();
    const { job } = route.params;

    const [note, setNote] = useState("");
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState({});

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets?.length > 0) {
                setCvFile(result.assets[0]);
                setErr({ ...err, cv: "" });
            }
        } catch (e) {
            Alert.alert("Lỗi", "Không thể chọn file.");
        }
    };

    const validate = () => {
        let newErr = {};
        if (!cvFile) newErr.cv = "Vui lòng đính kèm CV của bạn!";
        setErr(newErr);
        return Object.keys(newErr).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        Alert.alert(
            "Xác nhận ứng tuyển",
            `Bạn có chắc muốn ứng tuyển vào vị trí "${job.title}" tại ${job.employer?.company_name}?`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Ứng tuyển",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const form = new FormData();
                            form.append("job", job.id);
                            if (note.trim()) form.append("note", note.trim());
                            form.append("cv_file", {
                                uri: cvFile.uri,
                                name: cvFile.name,
                                type: cvFile.mimeType ?? "application/pdf",
                            });

                            await authApis(user.access_token).post(
                                endpoints["applications"],
                                form,
                                { headers: { "Content-Type": "multipart/form-data" } }
                            );

                            Alert.alert("Thành công!", "Đơn ứng tuyển đã được gửi.", [
                                { text: "OK", onPress: () => navigation.goBack() },
                            ]);
                        } catch (e) {
                            const msg =
                                e.response?.data?.detail ??
                                e.response?.data?.job?.[0] ??
                                "Ứng tuyển thất bại. Vui lòng thử lại!";
                            Alert.alert("Lỗi", msg);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon source="arrow-left" size={22} color="#111827" />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerSub}>Ứng tuyển</Text>
                    <Text style={styles.headerTitle} numberOfLines={1}>{job.title}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SectionCard title="Thông tin vị trí" icon="briefcase-outline">
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="domain" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Công ty</Text>
                            <Text style={styles.jobValue}>{job.employer?.company_name ?? "—"}</Text>
                        </View>
                    </View>
                    <View style={styles.sep} />
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="map-marker-outline" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Địa điểm</Text>
                            <Text style={styles.jobValue}>{job.location ?? "—"}</Text>
                        </View>
                    </View>
                    <View style={styles.sep} />
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="currency-usd" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Mức lương</Text>
                            <Text style={styles.jobValue}>
                                {job.salary_min && job.salary_max
                                    ? `${Number(job.salary_min).toLocaleString("vi-VN")} – ${Number(job.salary_max).toLocaleString("vi-VN")} VNĐ`
                                    : "Thoả thuận"}
                            </Text>
                        </View>
                    </View>
                </SectionCard>

                <SectionCard title="CV đính kèm" icon="file-pdf-box">
                    <Pressable onPress={pickDocument} style={[styles.cvUpload, cvFile && styles.cvUploaded]}>
                        <Icon
                            source={cvFile ? "file-check-outline" : "upload"}
                            size={28}
                            color={cvFile ? "#059669" : "#185FA5"}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.cvUploadText, cvFile && { color: "#059669" }]}>
                                {cvFile ? cvFile.name : "Chọn file CV (PDF)"}
                            </Text>
                            <Text style={styles.cvUploadSub}>
                                {cvFile ? "Nhấn để thay đổi" : "Nhấn để tải lên"}
                            </Text>
                        </View>
                        <Icon source="chevron-right" size={18} color="#9CA3AF" />
                    </Pressable>
                    {!!err.cv && (
                        <HelperText type="error" visible={true} style={{ marginTop: 4 }}>
                            {err.cv}
                        </HelperText>
                    )}
                </SectionCard>

                <SectionCard title="Ghi chú cho nhà tuyển dụng" icon="note-text-outline">
                    <TextInput
                        mode="outlined"
                        placeholder="Viết thêm thông tin bạn muốn gửi đến nhà tuyển dụng..."
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={5}
                        style={styles.noteInput}
                        contentStyle={{ paddingTop: 12 }}
                        outlineStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }}
                        theme={inputTheme}
                    />
                </SectionCard>

                <SectionCard title="Thông tin của bạn" icon="account-outline">
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="account-outline" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Họ và tên</Text>
                            <Text style={styles.jobValue}>
                                {user?.first_name && user?.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user?.username ?? "—"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.sep} />
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="email-outline" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Email</Text>
                            <Text style={styles.jobValue}>{user?.email ?? "—"}</Text>
                        </View>
                    </View>
                    <View style={styles.sep} />
                    <View style={styles.jobInfoRow}>
                        <View style={styles.jobIconWrap}>
                            <Icon source="phone-outline" size={16} color="#185FA5" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.jobLabel}>Số điện thoại</Text>
                            <Text style={styles.jobValue}>{user?.phone_num ?? "—"}</Text>
                        </View>
                    </View>
                </SectionCard>

                <View style={{ height: 110 }} />
            </ScrollView>

            <View style={styles.cta}>
                <Pressable
                    onPress={handleSubmit}
                    disabled={loading}
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon source="send" size={18} color="#fff" />
                            <Text style={styles.submitText}>Gửi đơn ứng tuyển</Text>
                        </>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FB" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 52,
        paddingBottom: 14,
        backgroundColor: "#F4F6FB",
        borderBottomWidth: 1,
        borderBottomColor: "#E9F0F8",
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center", alignItems: "center",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 6, elevation: 2,
    },
    headerSub: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },

    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },

    jobInfoRow: {
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingVertical: 10,
    },
    jobIconWrap: {
        width: 32, height: 32, borderRadius: 9,
        backgroundColor: "#EFF6FF",
        justifyContent: "center", alignItems: "center",
    },
    jobLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 2 },
    jobValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
    sep: { height: 1, backgroundColor: "#F9FAFB" },

    cvUpload: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.5, borderColor: "#DBEAFE", borderStyle: "dashed",
        borderRadius: 14, padding: 14,
        backgroundColor: "#F0F7FF",
    },
    cvUploaded: {
        borderColor: "#A7F3D0",
        backgroundColor: "#F0FDF4",
    },
    cvUploadText: {
        fontSize: 14, fontWeight: "700", color: "#185FA5", marginBottom: 2,
    },
    cvUploadSub: { fontSize: 12, color: "#9CA3AF" },

    noteInput: {
        backgroundColor: "#fff",
        fontSize: 14,
        minHeight: 110,
    },

    cta: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: "#F3F4F6",
        shadowColor: "#000", shadowOpacity: 0.06,
        shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8,
    },
    submitBtn: {
        backgroundColor: "#185FA5",
        borderRadius: 16, height: 52,
        flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    },
    submitText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default ApplyJob;