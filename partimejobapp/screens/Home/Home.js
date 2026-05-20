import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, StyleSheet } from "react-native";

import Header from "../../components/Header";
import FeaturedEmployer from "../../components/FeaturedEmployer";
// import NearbyJobs from "./components/NearbyJobs";
// import BottomNav from "./components/BottomNav";

export default function App() {
  const [activeChip, setActiveChip] = useState("Tất cả");
  const [activeNav, setActiveNav] = useState("home");

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <FeaturedEmployer />

        {/* <NearbyJobs /> */}
      </ScrollView>

      {/* <BottomNav active={activeNav} setActive={setActiveNav} /> */}
    </View>
  );
}

