<<<<<<< HEAD
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";
=======
import { View } from "react-native";
>>>>>>> origin/frontend/login_register
import { useContext, useEffect, useReducer, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { MyUserContext } from "./configs/Contexts";
import { MyUserReducer } from "./reducers/reducers";
import { LinearGradient } from 'expo-linear-gradient';
import Styles from "./styles/Styles";
<<<<<<< HEAD
import { auth } from "./configs/Firebase";
import { signInWithCustomToken } from "firebase/auth";

=======
// import Header from "./components/Header";
>>>>>>> origin/frontend/login_register
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
import EmRegister from "./screens/Employer/EmRegister";
import ApplicationDetail from "./screens/MyApplication/ApplicationDetail";
import EmployerList from "./screens/Home/EmployerList";
<<<<<<< HEAD
import { onAuthStateChanged } from "firebase/auth";
import ChatScreen from "./screens/Chat/ChatScreen";
import EmProfile from "./screens/Employer/EmProfile";
import AddJob from "./screens/Employer/AddJob";
import EmJobsScreen from "./screens/Employer/EmJobsScreen";
import EditJobScreen from "./screens/Employer/EditJobScreen"
import EmApplicationsScreen from "./screens/Employer/EmApplicationsScreen";
import ConversationListScreen from "./screens/Chat/ConversationListScreen";
import { useNavigation } from "@react-navigation/native";
=======
import EmProfile from "./screens/Employer/EmProfile";
import AddJob from "./screens/Employer/AddJob";
import EmJob from "./screens/Employer/EmJob";
import JobApplication from "./screens/Employer/JobApplication";
import EmJobDetail from "./screens/Employer/EmJobDetail";
import ApplyJob from "./screens/Job_Detail/ApplyJob";

>>>>>>> origin/frontend/login_register
const Stack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const ApplicationStack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" component={Home} />
      <Stack.Screen name="EmployerList" component={EmployerList} />
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
<<<<<<< HEAD
      <SearchStack.Screen name="Chat" component={ChatScreen} />
=======
      <SearchStack.Screen name="ApplyJob" component={ApplyJob} />
>>>>>>> origin/frontend/login_register
    </SearchStack.Navigator>
  );
};

const ApplicationStackNavigator = () => {
  return (
    <ApplicationStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <ApplicationStack.Screen name="MyApplications" component={MyApplication} />
      <ApplicationStack.Screen name="ApplicationDetail" component={ApplicationDetail} />
<<<<<<< HEAD

=======
>>>>>>> origin/frontend/login_register
    </ApplicationStack.Navigator>
  )
}
const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <ProfileStack.Screen name="profile" component={Profile} />
      <ProfileStack.Screen name="emregister" component={EmRegister} />
    </ProfileStack.Navigator>
  );
}

<<<<<<< HEAD
const EmJobStack = createNativeStackNavigator();
const EmJobStackNavigator = () => {
  return (
    <EmJobStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <EmJobStack.Screen name="employerjob" component={EmJobsScreen} />
      <EmJobStack.Screen name="editjob" component={EditJobScreen} options={{
        animation: "slide_from_right",
      }} />
      <EmJobStack.Screen name="employerapplication" component={EmApplicationsScreen} options={{
        animation: "slide_from_right",
      }} />
      <EmJobStack.Screen name="Chat" component={ChatScreen} options={{ animation: "slide_from_right" }} />
    </EmJobStack.Navigator>
  )
=======
const EmployerJobStack = createNativeStackNavigator();
const EmployerJobStackNavigator = () => {
  return (
    <EmployerJobStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <EmployerJobStack.Screen name="emjob" component={EmJob} />
      <EmployerJobStack.Screen name="jobapplication" component={JobApplication} />
      <EmployerJobStack.Screen name="emjobdetail" component={EmJobDetail} />
    </EmployerJobStack.Navigator>
  );
>>>>>>> origin/frontend/login_register
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);

  return (
    <Tab.Navigator sceneContainerStyle={{ backgroundColor: 'transparent' }}>
<<<<<<< HEAD

      <Tab.Screen name="home" component={StackNavigator} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon source="home" size={30} /> }} />
      {user === null ? <>
        <Tab.Screen name="login" component={Login} options={{ title: 'Đăng nhập', tabBarIcon: () => <Icon source="account" size={30} /> }} />
        <Tab.Screen name="register" component={Register} options={{ title: 'Đăng ký', tabBarIcon: () => <Icon source="account-plus" size={30} /> }} />
      </> : user.role === 'EMPLOYER' ? <>
        <Tab.Screen
          component={EmJobStackNavigator}
          name="employerjob"
          options={{
            title: "Quản lý tất cả tin tuyển dụng",
            tabBarIcon: () => (
              <Icon
                source="briefcase"
                size={30}
              />
            ),
          }}
        />
        <Tab.Screen name="addjob" component={AddJob} options={{ title: 'Đăng tin tuyển dụng', tabBarIcon: () => <Icon source="plus-box" size={30} /> }} />
        <Tab.Screen
          name="conversations"
          component={ConversationListScreen}
          options={{ title: 'Tin nhắn', tabBarIcon: () => <Icon source="message" size={30} /> }}
        />
        <Tab.Screen name="emprofile" component={EmProfile} options={{ title: 'Thông tin công ty', tabBarIcon: () => <Icon source="office-building" size={30} /> }} />
      </> : <>
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
        <Tab.Screen
          name="conversations"
          component={ConversationListScreen}
          options={{ title: 'Tin nhắn', tabBarIcon: () => <Icon source="message" size={30} /> }}
        />
        <Tab.Screen name="profiles" component={ProfileStackNavigator} options={{ title: 'Thông tin cá nhân', tabBarIcon: () => <Icon source="account" size={30} /> }} />
=======
      {/* <Tab.Screen
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
      /> */}

      {user?.role === 'EMPLOYER' ? <>
        <Tab.Screen name="jobs" component={EmployerJobStackNavigator} options={{ title: 'Tin tuyển dụng', tabBarIcon: () => <Icon source="briefcase-outline" size={30} /> }} />
        <Tab.Screen name="addjob" component={AddJob} options={{ title: 'Đăng tin tuyển dụng', tabBarIcon: () => <Icon source="plus-box" size={30} /> }} />
        <Tab.Screen name="emprofile" component={EmProfile} options={{ title: 'Thông tin', tabBarIcon: () => <Icon source="office-building" size={30} /> }} />
      </> : <>
        <Tab.Screen name="home" component={StackNavigator} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon source="home" size={30} /> }} />
        <Tab.Screen name="search" component={SearchStackNavigator} options={{ title: 'Tìm việc', tabBarIcon: () => <Icon source="magnify" size={30} /> }} />
        <Tab.Screen name="application" component={ApplicationStackNavigator} options={{ title: 'Hồ sơ đã nộp', tabBarIcon: () => <Icon source="file-document-outline" size={30} /> }} />
        {user === null ? <>
          <Tab.Screen name="login" component={Login} options={{ title: 'Đăng nhập', tabBarIcon: () => <Icon source="account" size={30} /> }} />
          <Tab.Screen name="register" component={Register} options={{ title: 'Đăng ký', tabBarIcon: () => <Icon source="account-plus" size={30} /> }} />
        </> :
          <Tab.Screen name="profiles" component={ProfileStackNavigator} options={{ title: 'Thông tin cá nhân', tabBarIcon: () => <Icon source="account" size={30} /> }} />
        }
>>>>>>> origin/frontend/login_register
      </>}
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
<<<<<<< HEAD
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const navigation = useNavigation()
  const refreshAndLogin = async () => {
    const stored = await AsyncStorage.getItem("tokens");
    if (!stored) throw new Error("NO_TOKEN");

    const { access_token, refresh_token } = JSON.parse(stored);

    try {
      const { data } = await Apis.get(endpoints['current-user'],
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (!auth.currentUser) {
        const firebaseToken = await Apis.get(endpoints['firebase-token'],
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        await signInWithCustomToken(auth, firebaseToken.data.firebase_token);
      }
      dispatch({ type: "LOGIN", payload: { ...data, access_token, refresh_token } });

    } catch (e) {
      if (e.response?.status !== 401) throw e;

      const { data } = await Apis.post(endpoints['refresh'], {
        grant_type: "refresh_token",
        refresh_token,
      });
      await AsyncStorage.setItem("tokens", JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      }));
      const [userData, firebaseToken] = await Promise.all([
        Apis.get(endpoints['current-user'],
          { headers: { Authorization: `Bearer ${data.access_token}` } }
        ),
        Apis.get(endpoints['firebase-token'],
          { headers: { Authorization: `Bearer ${data.access_token}` } }
        )
      ]);
      await signInWithCustomToken(auth, firebaseToken.data.firebase_token);
      dispatch({
        type: "LOGIN",
        payload: {
          ...userData.data,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
      });
    }
  };
=======
>>>>>>> origin/frontend/login_register

  useEffect(() => {
    const loadUser = async () => {
      try {
<<<<<<< HEAD
        await refreshAndLogin();
      } catch {
        dispatch({ type: "LOGOUT" });
        setSessionExpired(true);
=======
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
>>>>>>> origin/frontend/login_register
      } finally {
        setAppReady(true);
      }
    };
    loadUser();
  }, []);
<<<<<<< HEAD

  const handleKeepSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshAndLogin();
    } catch {
      await AsyncStorage.removeItem("tokens");
      dispatch({ type: "LOGOUT" });
      setSessionExpired(false);
      navigation.navigate("login")
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("tokens");
    dispatch({ type: "LOGOUT" });
    setSessionExpired(false);
    navigationRef.current?.navigate("login");
  };

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <LinearGradient colors={['#f3eeff', '#e5d9fc', '#f8f5ff']} style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <TabNavigator />
        </NavigationContainer>

        <Modal visible={sessionExpired} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.card}>
              {isRefreshing ? (
                <>
                  <ActivityIndicator size="large" color="#7F77DD" style={{ marginBottom: 12 }} />
                  <Text style={styles.title}>Đang kết nối lại...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Phiên làm việc hết hạn</Text>
                  <Text style={styles.subtitle}>
                    Bạn có muốn đăng xuất không?
                  </Text>
                  <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Đăng xuất</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonOutline} onPress={handleKeepSession}>
                    <Text style={styles.buttonOutlineText}>Ở lại</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </MyUserContext.Provider>
  );
};

const styles = StyleSheet.create({
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#7F77DD',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonOutlineText: {
    color: '#7F77DD',
    fontSize: 15,
    fontWeight: '500',
  },
});
=======
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
>>>>>>> origin/frontend/login_register

export default App;