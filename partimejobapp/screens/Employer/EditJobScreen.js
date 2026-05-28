import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";

function Label({ text, required }) {
  return (
    <Text style={styles.label}>
      {text}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <View style={styles.fieldWrap}>
      <Label text={label} required={required} />
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export default function EditJobScreen({ route, navigation }) {
  const { job } = route.params ?? {};

  const [industries, setIndustries] = useState([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);

  const fetchIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const res = await Apis.get(endpoints["industries"]);
      setIndustries(res.data ?? []);
    } catch (e) {
      console.error(e?.response?.data?.detail ??
        e?.response?.data?.message);
    } finally {
      setLoadingIndustries(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);


  const [form, setForm] = useState({
    title: job?.title ?? "",
    requirement: job?.requirement ?? "",
    salary_min: job?.salary_min ? String(Number(job.salary_min)) : "",
    salary_max: job?.salary_max ? String(Number(job.salary_max)) : "",
    benefits: job?.benefits ?? "",
    location: job?.location ?? "",
    available_date: job?.available_date ? new Date(job.available_date) : new Date(),
    industry: job?.industry ?? null,
    description: job?.description ?? "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIndustrySheet, setShowIndustrySheet] = useState(false);

  const [user] = useContext(MyUserContext)
  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề.";
    if (!form.description.trim()) e.description = "Vui lòng nhập mô tả công việc.";
    if (!form.location.trim()) e.location = "Vui lòng nhập địa điểm.";
    const min = Number(form.salary_min);
    const max = Number(form.salary_max);
    if (!form.salary_min || isNaN(min) || min <= 0) e.salary_min = "Mức lương tối thiểu không hợp lệ.";
    if (!form.salary_max || isNaN(max) || max <= 0) e.salary_max = "Mức lương tối đa không hợp lệ.";
    if (min && max && min > max) e.salary_max = "Lương tối đa phải lớn hơn tối thiểu.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: form.title.trim(),
        requirement: form.requirement.trim(),
        salary_min: form.salary_min,
        salary_max: form.salary_max,
        benefits: form.benefits.trim(),
        location: form.location.trim(),
        available_date: form.available_date.toISOString().split("T")[0],
        industry: form.industry,
        description: form.description.trim(),
      };
      const res = await authApis(user.access_token).patch(endpoints['update-job'](job.id))
      Alert.alert("Thành công", "Tin tuyển dụng đã được cập nhật.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể cập nhật tin.");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = form.available_date.toLocaleDateString("vi-VN");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Chỉnh sửa tin tuyển dụng</Text>
          {job?.id && <Text style={styles.headerSub}>ID #{job.id}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Thông tin chung</Text>

        <Field label="Tiêu đề công việc" required>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="VD: Nhân viên phục vụ part-time"
            placeholderTextColor="#bbb"
            value={form.title}
            onChangeText={(v) => set("title", v)}
            returnKeyType="next"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </Field>

        <Field label="Mô tả công việc" required>
          <TextInput
            style={[styles.input, styles.textarea, errors.description && styles.inputError]}
            placeholder="Mô tả chi tiết công việc, ca làm việc..."
            placeholderTextColor="#bbb"
            value={form.description}
            onChangeText={(v) => set("description", v)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </Field>

        <Field label="Yêu cầu ứng viên">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Kinh nghiệm, kỹ năng, bằng cấp..."
            placeholderTextColor="#bbb"
            value={form.requirement}
            onChangeText={(v) => set("requirement", v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Phúc lợi">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Bảo hiểm, thưởng, phụ cấp..."
            placeholderTextColor="#bbb"
            value={form.benefits}
            onChangeText={(v) => set("benefits", v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Field>

        <Text style={styles.section}>Mức lương</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Tối thiểu (đ)" required>
              <TextInput
                style={[styles.input, errors.salary_min && styles.inputError]}
                placeholder="2500000"
                placeholderTextColor="#bbb"
                value={form.salary_min}
                onChangeText={(v) => set("salary_min", v.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                returnKeyType="next"
              />
              {errors.salary_min && (
                <Text style={styles.errorText}>{errors.salary_min}</Text>
              )}
            </Field>
          </View>
          <View style={styles.rowSpacer} />
          <View style={{ flex: 1 }}>
            <Field label="Tối đa (đ)" required>
              <TextInput
                style={[styles.input, errors.salary_max && styles.inputError]}
                placeholder="5000000"
                placeholderTextColor="#bbb"
                value={form.salary_max}
                onChangeText={(v) => set("salary_max", v.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                returnKeyType="next"
              />
              {errors.salary_max && (
                <Text style={styles.errorText}>{errors.salary_max}</Text>
              )}
            </Field>
          </View>
        </View>

        {form.salary_min && form.salary_max && !errors.salary_min && !errors.salary_max && (
          <View style={styles.salaryPreview}>
            <Text style={styles.salaryPreviewText}>
              💰 {Number(form.salary_min).toLocaleString("vi-VN")}đ – {Number(form.salary_max).toLocaleString("vi-VN")}đ
            </Text>
          </View>
        )}

        <Text style={styles.section}>Địa điểm & Thời hạn</Text>

        <Field label="Địa điểm làm việc" required>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            placeholder="VD: Quận 1, TP.HCM"
            placeholderTextColor="#bbb"
            value={form.location}
            onChangeText={(v) => set("location", v)}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </Field>

        <Field label="Hạn nộp hồ sơ">
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#1a1a1a", fontSize: 14 }}>
              📅 {formattedDate}
            </Text>
          </TouchableOpacity>
        </Field>

        {showDatePicker && (
          <DateTimePicker
            value={form.available_date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios");
              if (date) set("available_date", date);
            }}
          />
        )}

        {/* Section: Phân loại */}
        <Text style={styles.section}>Phân loại</Text>

        <Field label="Ngành nghề">
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowIndustrySheet(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: form.industry ? "#1a1a1a" : "#bbb", fontSize: 14 }}>
              {form.industry ?? "Chọn ngành nghề..."}
            </Text>
          </TouchableOpacity>
        </Field>



        {/* Bottom action */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>💾 Lưu thay đổi</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Industry bottom sheet */}
      {showIndustrySheet && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowIndustrySheet(false)}
        >
          <TouchableOpacity
            style={styles.sheet}
            activeOpacity={1}
            onPress={() => { }}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Chọn ngành nghề</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {industries?.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sheetItem,
                    form.industry === item.name && styles.sheetItemActive,
                  ]}
                  onPress={() => {
                    set("industry", item.name);
                    setShowIndustrySheet(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sheetItemText,
                      form.industry === item.name &&
                      styles.sheetItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>

                  {form.industry === item.name && (
                    <Text style={{ color: "#185fa5" }}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const COLORS = {
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  border: "#e8e8e8",
  borderError: "#e05555",
  text: "#1a1a1a",
  textSecondary: "#666",
  textTertiary: "#999",
  primary: "#1a1a1a",
  error: "#c0392b",
  salaryBg: "#e1f5ee",
  salaryText: "#0f6e56",
  accentBg: "#e8f5e2",
  accentText: "#3b6d11",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20, color: COLORS.text },
  headerTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 56,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "500" },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  section: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 10,
  },

  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "500", color: COLORS.text, marginBottom: 6 },
  required: { color: COLORS.error },
  hint: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4 },

  input: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
  },
  inputError: { borderColor: COLORS.borderError },
  textarea: { minHeight: 90, paddingTop: 10 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },

  row: { flexDirection: "row", alignItems: "flex-start" },
  rowSpacer: { width: 10 },

  salaryPreview: {
    backgroundColor: COLORS.salaryBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    marginTop: -4,
  },
  salaryPreviewText: { fontSize: 13, fontWeight: "500", color: COLORS.salaryText },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  sheetItemActive: { backgroundColor: "#f0f8ff" },
  sheetItemText: { fontSize: 14, color: COLORS.text },
  sheetItemTextActive: { color: "#185fa5", fontWeight: "500" },
});
