import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, StatusBar, Text } from "react-native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import Header from "../../components/Header";
import FeaturedEmployer from "../../components/FeaturedEmployer";
import NewestJob from "../../components/NewestJob";
import ListIndustries from "../../components/ListIndustries";
import { Icon } from "react-native-paper";
import { MyUserContext } from "../../configs/Contexts";
import { styles } from "./Styles";

export default function App() {
  const [activeChip, setActiveChip] = useState("Tất cả");
  const [activeNav, setActiveNav] = useState("home");

  const [user] = useContext(MyUserContext);
  useEffect(() => {
    fetchEmployers()
    fetchJobs();
    fetchIndustries();
  }, [user]);

  const [employers, setEmployers] = useState([])
  const [loadingEmployers, setLoadingEmployers] = useState(false)
  const fetchEmployers = async () => {
    try {
      setLoadingEmployers(true);
      let res;
      if (user?.access_token) {
        res = await authApis(user.access_token)
          .get(endpoints["employers"]);
      } else {
        res = await Apis.get(endpoints["employers"]);
      }
      setEmployers(res.data.results?.slice(0, 5) ?? []);
    } catch (e) {
      console.error(
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e.message ||
        e
      );
    } finally {
      setLoadingEmployers(false)
    }
  }

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await Apis.get(endpoints["jobs"]);
      setJobs(res.data.results?.slice(0, 8) ?? []);
    } catch (e) {
      console.error(e?.response?.data?.detail ??
        e?.response?.data?.message);
    } finally {
      setLoadingJobs(false);
    }
  };

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
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FB" />
      <Header user={user} />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsBar}>
          {[
            { icon: "briefcase-outline", value: `${jobs.length}+`, label: "Việc làm" },
            { icon: "domain", value: `${industries.length}`, label: "Ngành nghề" },
            { icon: "clock-fast", value: "24/7", label: "Hỗ trợ" },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statItem}>
                <Icon source={s.icon} size={16} color="#185FA5" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>


            </React.Fragment>
          ))}
        </View>
        <FeaturedEmployer employers={employers} />


        <NewestJob jobs={jobs} loading={loadingJobs} />
        <ListIndustries industries={industries} loading={loadingIndustries} />
        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
}

