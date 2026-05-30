import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Image,
  StatusBar,
  TextInput,
} from "react-native";
import { authApis, endpoints } from "../../configs/Apis";

import { STATUS_CONFIG } from "../../configs/ApplicationStatus";
import { MyUserContext } from "../../configs/Contexts";

function getFullName(candidate) {
  const full = `${candidate.last_name} ${candidate.first_name}`.trim();
  return full || "???";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ uri, name }) {
  const initials = name === "???" ? "?" : name.charAt(0).toUpperCase();
  if (uri) {
    return <Image source={{ uri }} style={styles.avatar} />;
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{initials}</Text>
    </View>
  );
}

function ApplicationCard({ item, onUpdateStatus, onChat, token }) {
  const { candidate, apply_date, cv_file, status } = item;
  const name = getFullName(candidate);
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.REVIEWING;
  const { label: statusLabel, color: statusColor, bgColor: statusBg } = statusCfg;

  const [expanded, setExpanded] = useState(false);
  const [evaluation, setEvaluation] = useState(item.evaluation ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [saving, setSaving] = useState(false);

  const handleOpenCV = () => {
    if (!cv_file) return;
    Linking.openURL(cv_file).catch(() =>
      Alert.alert("Lỗi", "Không thể mở file CV.")
    );
  };

  const handleSaveReview = async () => {
    setSaving(true);
    try {
      await authApis(token).patch(endpoints["update-application"](item.id), {
        evaluation,
        note,
      });
      Alert.alert("Đã lưu", "Đánh giá và ghi chú đã được cập nhật.");
    } catch (err) {
      Alert.alert("Lỗi", err?.response?.data?.detail ?? "Không thể lưu đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar uri={candidate.avatar} name={name} />
        <View style={{ flex: 1 }}>
          <Text style={styles.candidateName}>{name}</Text>
          {candidate.phone_num ? (
            <Text style={styles.phone}>📞 {candidate.phone_num}</Text>
          ) : null}
          <Text style={styles.applyDate}>🕐 {formatDate(apply_date)}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
            <Text style={styles.expandBtn}>{expanded ? "Thu gọn ▲" : "Chi tiết ▼"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandBox}>
          <Text style={styles.expandLabel}>Đánh giá</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="Nhập đánh giá ứng viên..."
            placeholderTextColor="#bbb"
            value={evaluation}
            onChangeText={setEvaluation}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.expandLabel}>Ghi chú nội bộ</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            placeholder="Ghi chú thêm (chỉ employer thấy)..."
            placeholderTextColor="#bbb"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSaveReview}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>💾 Lưu đánh giá</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btn, !cv_file && styles.btnDisabled]}
          onPress={handleOpenCV}
          disabled={!cv_file}
        >
          <Text style={styles.btnText}>📄 Xem CV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnChat]}
          onPress={() => onChat(item)}
        >
          <Text style={[styles.btnText, { color: "#185FA5" }]}>💬 Nhắn tin</Text>
        </TouchableOpacity>

        {status === "REVIEWING" && (
          <>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: STATUS_CONFIG.INTERVIEW.bgColor, borderColor: STATUS_CONFIG.INTERVIEW.color }]}
              onPress={() => onUpdateStatus(item, "INTERVIEW")}
            >
              <Text style={[styles.btnText, { color: STATUS_CONFIG.INTERVIEW.color }]}>📅 Hẹn phỏng vấn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: STATUS_CONFIG.ACCEPTED.bgColor, borderColor: STATUS_CONFIG.ACCEPTED.color }]}
              onPress={() => onUpdateStatus(item, "ACCEPTED")}
            >
              <Text style={[styles.btnText, { color: STATUS_CONFIG.ACCEPTED.color }]}>✓ Trúng tuyển</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: STATUS_CONFIG.REJECTED.bgColor, borderColor: STATUS_CONFIG.REJECTED.color }]}
              onPress={() => onUpdateStatus(item, "REJECTED")}
            >
              <Text style={[styles.btnText, { color: STATUS_CONFIG.REJECTED.color }]}>✕ Từ chối</Text>
            </TouchableOpacity>
          </>
        )}
        {status === "INTERVIEW" && (
          <>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: STATUS_CONFIG.ACCEPTED.bgColor, borderColor: STATUS_CONFIG.ACCEPTED.color }]}
              onPress={() => onUpdateStatus(item, "ACCEPTED")}
            >
              <Text style={[styles.btnText, { color: STATUS_CONFIG.ACCEPTED.color }]}>✓ Trúng tuyển</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: STATUS_CONFIG.REJECTED.bgColor, borderColor: STATUS_CONFIG.REJECTED.color }]}
              onPress={() => onUpdateStatus(item, "REJECTED")}
            >
              <Text style={[styles.btnText, { color: STATUS_CONFIG.REJECTED.color }]}>✕ Từ chối</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function ApplicationsScreen({ route, navigation }) {
  const { jobId, jobTitle } = route.params ?? {};

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [user] = useContext(MyUserContext)

  const fetchApplications = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await authApis(user.access_token).get(
        endpoints["em-application"](jobId)
      );
      setApplications(res.data ?? []);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Không thể tải danh sách ứng tuyển.";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleUpdateStatus = (item, newStatus) => {
    const label = newStatus === "ACCEPTED" ? "chấp nhận" : "từ chối";
    const name = getFullName(item.candidate);
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn ${label} ứng viên "${name}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xác nhận",
          style: newStatus === "REJECTED" ? "destructive" : "default",
          onPress: async () => {
            try {
              await authApis(user.access_token).patch(
                endpoints["update-application"](item.id),
                { status: newStatus }
              );
              setApplications((prev) =>
                prev.map((a) =>
                  a.id === item.id ? { ...a, status: newStatus } : a
                )
              );
            } catch (err) {
              Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
            }
          },
        },
      ]
    );
  };

  const handleChat = (item) => {
    navigation.navigate("Chat", {
      jobId,
      receiverId: item.candidate.id,
      receiverName: getFullName(item.candidate),
      receiverAvatar: item.candidate.avatar,
    });
  };

  const stats = {
    total: applications.length,
    reviewing: applications.filter((a) => a.status === "REVIEWING").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const renderHeader = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: STATUS_CONFIG.REVIEWING.color }]}>{stats.reviewing}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: STATUS_CONFIG.INTERVIEW.color }]}>{stats.interview}</Text>
          <Text style={styles.statLabel}>Phỏng vấn</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: STATUS_CONFIG.ACCEPTED.color }]}>{stats.accepted}</Text>
          <Text style={styles.statLabel}>Trúng tuyển</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: STATUS_CONFIG.REJECTED.color }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Trượt</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>Chưa có ứng viên nào.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Danh sách ứng tuyển</Text>
          {jobTitle && (
            <Text style={styles.headerSub} numberOfLines={1}>{jobTitle}</Text>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={() => fetchApplications()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => (
            <ApplicationCard
              item={item}
              onUpdateStatus={handleUpdateStatus}
              onChat={handleChat}
              token={user.access_token}
            />
          )}
          ListHeaderComponent={applications.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchApplications(true)}
              tintColor="#555"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    gap: 10,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 20, color: "#1a1a1a" },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  headerSub: { fontSize: 12, color: "#888", marginTop: 1 },

  listContent: { padding: 16, paddingBottom: 32 },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "600", color: "#1a1a1a" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2 },

  card: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0eaff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 18, fontWeight: "600", color: "#3730A3" },

  candidateName: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 2 },
  phone: { fontSize: 12, color: "#666", marginBottom: 2 },
  applyDate: { fontSize: 12, color: "#999" },

  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "500" },

  expandBtn: { fontSize: 11, color: "#185FA5" },
  expandBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#f0f0f0",
    gap: 6,
  },
  expandLabel: { fontSize: 12, fontWeight: "600", color: "#555", marginTop: 4 },
  input: {
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  inputMulti: { minHeight: 70, paddingTop: 8 },
  saveBtn: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 6,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "500" },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#f0f0f0",
    flexWrap: "wrap",
  },
  btn: {
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnSuccess: { backgroundColor: "#E8F5E2", borderColor: "#c3e6ab" },
  btnDanger: { backgroundColor: "#FCEBEB", borderColor: "#f09595" },
  btnChat: { backgroundColor: "#EBF4FF", borderColor: "#185FA5" },
  btnText: { fontSize: 12, color: "#555" },

  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 14, color: "#999" },
  emptyBox: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#999" },
  errorBox: {
    margin: 16,
    backgroundColor: "#FCEBEB",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: { fontSize: 13, color: "#A32D2D", flex: 1 },
  retryText: { fontSize: 13, color: "#A32D2D", fontWeight: "600", marginLeft: 8 },
})