import { View } from "react-native";
import { useContext, useReducer, useState } from "react";
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

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="index" component={Home} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user,] = useContext(MyUserContext);

  return (
    <Tab.Navigator sceneContainerStyle={{ backgroundColor: 'transparent' }}>
      <Tab.Screen name="home" component={StackNavigator} options={{ title: 'Trang chủ', tabBarIcon: () => <Icon source="home" size={30} /> }} />
      <Tab.Screen
        name="search"
        component={SearchJob}
        options={{
          title: "Tìm việc",
          tabBarIcon: () => (
            <Icon source="magnify" size={30} />
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