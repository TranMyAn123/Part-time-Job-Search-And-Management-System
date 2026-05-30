import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { useJobs } from "../../hooks/useJobs";
import { formatSalary, formatDateTime, formatDate } from "../../helpers";
import { MyUserContext } from "../../configs/Contexts";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import EmJobCard from "../../components/employer-components/EmJobCard";

const FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang tuyển", value: "OPENING" },
  { label: "Đã đóng", value: "CLOSED" },
];


function StatCard({ label, value, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>
        {value}
      </Text>
    </View>
  );
}



export default function EmJobsScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("Tất cả");
  const [activeFilter, setActiveFilter] = useState("all");
  const [user] = useContext(MyUserContext)
  const token = user?.access_token
  const { jobs, loading, refreshing, error, hasMore, loadMore, refresh } =
    useJobs({ industry, query, token });


  const filteredJobs =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j.status === activeFilter);

  const stats = {
    total: jobs.length,
    opening: jobs.filter((j) => j.status === "OPENING").length,
    closed: jobs.filter((j) => j.status === "CLOSED").length,
  };

  const handleEdit = (job) => {
    navigation.navigate("EditJob", { job });
  };

  const handleViewApplicants = (job) => {
    navigation.navigate("employerapplication", {
      jobId: job.id,
      jobTitle: job.title,
    });
  };

  const handleToggleStatus = (job) => {
    if (job.status !== "OPENING") return;

    Alert.alert(
      "Đóng tin tuyển dụng",
      `Tin "${job.title}" sẽ bị đóng để chốt và không thể mở lại. Bạn có chắc chắn?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đóng tin",
          style: "destructive",
          onPress: async () => {
            try {
              await authApis(token).delete(endpoints["job"](job.id));
              refresh();
            } catch (err) {
              const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                "Thao tác thất bại, vui lòng thử lại.";
              Alert.alert("Lỗi", msg);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Việc làm đã đăng</Text>
          <Text style={styles.pageSubtitle}>
            Quản lý tất cả tin tuyển dụng của bạn
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate("addjob")}
        >
          <Text style={styles.btnPrimaryText}>+ Đăng tin mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Tổng tin đăng" value={stats.total} />
        <StatCard label="Đang tuyển" value={stats.opening} accent />
        <StatCard label="Đã đóng" value={stats.closed} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tiêu đề việc làm..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.tab,
              activeFilter === f.value && styles.tabActive,
            ]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === f.value && styles.tabTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
        {loading ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Text style={styles.loadMoreText}>Tải thêm</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading && jobs.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>Không tìm thấy việc làm nào.</Text>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onViewApplicants={handleViewApplicants}
            onToggleStatus={handleToggleStatus}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#555"
          />
        }
        onEndReached={() => {
          if (hasMore && !loading) loadMore();
        }}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const COLORS = {
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  border: "#e8e8e8",
  text: "#1a1a1a",
  textSecondary: "#666",
  textTertiary: "#999",
  primary: "#1a1a1a",
  openBg: "#e8f5e2",
  openText: "#3b6d11",
  closedBg: "#f0f0f0",
  closedText: "#666",
  salaryBg: "#e1f5ee",
  salaryText: "#0f6e56",
  danger: "#a32d2d",
  success: "#3b6d11",
  accentBg: "#f0f8ff",
  accentText: "#185fa5",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    padding: 12,
  },
  statCardAccent: {
    backgroundColor: COLORS.accentBg,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.text,
  },
  statValueAccent: {
    color: COLORS.accentText,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: COLORS.bg,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: COLORS.textTertiary,
    paddingHorizontal: 4,
  },

  filterRow: {
    flexDirection: "row",
    gap: 6,
    paddingBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "500",
  },

  errorBox: {
    backgroundColor: "#fcebeb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#a32d2d",
    fontSize: 13,
  },



  emptyBox: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 8,
  },

  loadMoreBtn: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
