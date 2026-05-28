import React, { useEffect, useState, useContext } from "react";
import {
    View, Text, FlatList, ScrollView,
    StatusBar, ActivityIndicator, Pressable,
} from "react-native";
import { Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Contexts";
import { authApis, endpoints } from "../../configs/Apis";
import ApplicationCard from "../../components/ApplicationCard";
import { EmployerStyles } from "./Styles";
import { JOB_STATUS_CONFIG, JOB_FILTERS } from "../../configs/JobStatus";
import { formatDate, timeAgo, parseBenefits, parseRequirements, benefitIcon } from "../Job_Detail/Helpers";

const EmptyState = () => (
    <View style={EmployerStyles.empty}>
        <View style={EmployerStyles.emptyIconWrap}>
            <Icon source="briefcase-outline" size={44} color="#D1D5DB" />
        </View>
        <Text style={EmployerStyles.emptyTitle}>Chưa có tin tuyển dụng</Text>
        <Text style={EmployerStyles.emptySub}>Bạn chưa đăng tin tuyển dụng nào</Text>
    </View>
);

const EmptyApplications = () => (
    <View style={EmployerStyles.empty}>
        <View style={EmployerStyles.emptyIconWrap}>
            <Icon source="file-document-outline" size={44} color="#D1D5DB" />
        </View>
        <Text style={EmployerStyles.emptyTitle}>Chưa có đơn ứng tuyển</Text>
        <Text style={EmployerStyles.emptySub}>Chưa có ứng viên nào ứng tuyển</Text>
    </View>
);

const JobCard = ({ item, onPress, onPressDetail }) => {
    const status = JOB_STATUS_CONFIG[item.status] ?? JOB_STATUS_CONFIG.CLOSED;

    return (
        <Pressable
            onPress={onPress}
            style={{
                backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 12,
                borderRadius: 16, padding: 16,
                shadowColor: "#000", shadowOpacity: 0.04,
                shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
            }}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827", flex: 1 }}>
                    {item.title}
                </Text>
                <Pressable onPress={onPressDetail} style={{ marginLeft: 8 }}>
                    <Icon source="chevron-right" size={20} color="#185FA5" />
                </Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon source="map-marker-outline" size={14} color="#6B7280" />
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>{item.location}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon source="domain" size={14} color="#6B7280" />
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>{item.industry}</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#185FA5" }}>
                    {item.salary_min} - {item.salary_max}
                </Text>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: status.bgColor }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: status.color }}>
                        {status.label}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const ApplicationList = ({ job }) => {
    const [user] = useContext(MyUserContext);
    const navigation = useNavigation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const res = await authApis(user.access_token).get(endpoints["job-applications"](job.id));
                setApplications(res.data ?? []);
            } catch (e) {
                console.error("error:", e.response?.status, e.response?.data);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [job.id]);

    return (
        <View style={{ marginTop: 8 }}>
            {loading && <ActivityIndicator color="#185FA5" style={{ marginTop: 12 }} />}
            {!loading && (
                <>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151", paddingHorizontal: 16, marginBottom: 8 }}>
                        {applications.length} đơn ứng tuyển
                    </Text>
                    {applications.length === 0
                        ? <EmptyApplications />
                        : applications.map((item, index) => (
                            <ApplicationCard
                                key={item.id}
                                application={item}
                                index={index}
                                onPress={() => navigation.navigate("jobapplication", { application: item })}
                            />
                        ))
                    }
                </>
            )}
        </View>
    );
};

const ListHeader = ({ jobCount, activeFilter, setActiveFilter, countOf }) => (
    <View>
        <View style={EmployerStyles.header}>
            <View>
                <Text style={EmployerStyles.headerTitle}>Tin tuyển dụng</Text>
                <Text style={EmployerStyles.headerSub}>Của công ty</Text>
            </View>
            <View style={EmployerStyles.headerBadge}>
                <Text style={EmployerStyles.headerBadgeText}>{jobCount}</Text>
            </View>
        </View>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        >
            {JOB_FILTERS.map((f) => {
                const isActive = activeFilter === f.key;
                const count = countOf(f.key);
                return (
                    <Pressable
                        key={f.key}
                        onPress={() => setActiveFilter(f.key)}
                        style={{
                            flexDirection: "row", alignItems: "center", gap: 6,
                            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                            backgroundColor: isActive ? "#185FA5" : "#F3F4F6",
                        }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "600", color: isActive ? "#fff" : "#6B7280" }}>
                            {f.label}
                        </Text>
                        {count > 0 && (
                            <View style={{
                                backgroundColor: isActive ? "rgba(255,255,255,0.3)" : "#D1D5DB",
                                borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
                            }}>
                                <Text style={{ fontSize: 11, fontWeight: "700", color: isActive ? "#fff" : "#374151" }}>
                                    {count}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </ScrollView>
    </View>
);

const EmJob = () => {
    const [user] = useContext(MyUserContext);
    const navigation = useNavigation();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [activeFilter, setActiveFilter] = useState("ALL");

    const fetchJobs = async (isRefresh = false) => {
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const res = await authApis(user.access_token).get(endpoints["self-jobs"]);
            setJobs(res.data ?? []);
        } catch (e) {
            console.error("error:", e.response?.status, e.response?.data);
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const filtered = activeFilter === "ALL"
        ? jobs
        : jobs.filter((j) => j.status === activeFilter);

    const countOf = (key) =>
        key === "ALL" ? jobs.length : jobs.filter((j) => j.status === key).length;

    return (
        <View style={EmployerStyles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
            {loading && (
                <View style={EmployerStyles.center}>
                    <ActivityIndicator color="#185FA5" size="large" />
                </View>
            )}
            {!loading && (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View>
                            <JobCard
                                item={item}
                                onPress={() => setSelectedJob(selectedJob?.id === item.id ? null : item)}
                                onPressDetail={() => navigation.navigate("emjobdetail", { job: item })}
                            />
                            {selectedJob?.id === item.id && <ApplicationList job={item} />}
                        </View>
                    )}
                    ListHeaderComponent={
                        <ListHeader
                            jobCount={jobs.length}
                            activeFilter={activeFilter}
                            setActiveFilter={setActiveFilter}
                            countOf={countOf}
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                    contentContainerStyle={EmployerStyles.listContent}
                    onRefresh={() => fetchJobs(true)}
                    refreshing={refreshing}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default EmJob;