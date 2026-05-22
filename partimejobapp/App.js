import { View } from "react-native";
import { useContext, useEffect, useReducer, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./reducers/reducers";
import { LinearGradient } from 'expo-linear-gradient';
import Styles from "./styles/Styles";
// import Header from "./components/Header";
import Home from "./screens/Home/Home";
import Login from "./screens/User/Login";
import Register from "./screens/User/Register";
import Profile from "./screens/User/Profile";
import SearchJob from "./screens/Search_Job/SearchJob";
import JobDetail from "./screens/Job_Detail/JobDetail";
import Apis, { endpoints } from "./configs/Apis";
import AsyncStorage from '@react-native-async-storage/async-storage';
import IndustryDetail from "./components/IndustryDetail";
import MyApplication from "./screens/MyApplication/MyApplication";

const Stack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const ApplicationStack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" component={Home} />
      <Stack.Screen name="IndustryDetail" component={IndustryDetail} />
    </Stack.Navigator>
  );
}


const SearchStackNavigator = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}
    >
      <SearchStack.Screen name="SearchJob" component={SearchJob} />
      <SearchStack.Screen name="JobDetail" component={JobDetail} />
    </SearchStack.Navigator>
  );
};

const ApplicationStackNavigator = () => {
  return (
    <ApplicationStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <ApplicationStack.Screen name="MyApplications" component={MyApplication} />
    </ApplicationStack.Navigator>
  )
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);

  return (
    <Tab.Navigator sceneContainerStyle={{ backgroundColor: 'transparent' }}>
      <Tab.Screen name="home" component={StackNavigator} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon source="home" size={30} /> }} />
      <Tab.Screen
        name="search"
        component={SearchStackNavigator}
        options={{
          title: "Tìm việc",
          tabBarIcon: () => (
            <Icon source="magnify" size={30} />
          ),
        }}
      />

      <Tab.Screen
        name="application"
        component={ApplicationStackNavigator}
        options={{
          title: "Hồ sơ đã nộp",
          tabBarIcon: () => (
            <Icon source="file-document-outline" size={30} />
          ),
        }}
      />

      {user === null ? <>
        <Tab.Screen name="login" component={Login} options={{ title: 'Đăng nhập', tabBarIcon: () => <Icon source="account" size={30} /> }} />
        <Tab.Screen name="register" component={Register} options={{ title: 'Đăng ký', tabBarIcon: () => <Icon source="account-plus" size={30} /> }} />
      </> : <>
        <Tab.Screen name="profile" component={Profile} options={{ title: 'Thông tin cá nhân', tabBarIcon: () => <Icon source="account" size={30} /> }} />
      </>}
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("tokens");
        if (!stored) return;

        const { access_token, refresh_token } = JSON.parse(stored);

        try {
          const { data } = await Apis.get(endpoints['current-user'],
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
          dispatch({
            type: "LOGIN",
            payload: { ...data, access_token, refresh_token },
          });

        } catch (e) {
          if (e.response?.status === 401) {
            try {
              const { data } = await Apis.post(endpoints['refresh'],
                {
                  grant_type: "refresh_token",
                  refresh_token,
                }
              );
              const { userData } = await Apis.get(endpoints['current-user'],
                { headers: { Authorization: `Bearer ${data.access_token}` } }
              );
              dispatch({
                type: "LOGIN",
                payload: {
                  ...userData,
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                },
              });
            } catch {
              dispatch({ type: "LOGOUT" });
            }
          }
        }
      } finally {
        setAppReady(true);
      }
    };
    loadUser();
  }, []);
  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <LinearGradient
        colors={['#f3eeff', '#e5d9fc', '#f8f5ff']}
        style={{ flex: 1 }}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </LinearGradient>
    </MyUserContext.Provider>
  );
}

export default App;