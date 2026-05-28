import { View, Text, TouchableOpacity, Image } from "react-native";
<<<<<<< HEAD
import { useContext } from "react";
import { MyUserContext } from "../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { authApis, endpoints } from "../configs/Apis";

WebBrowser.maybeCompleteAuthSession();

const SocialLogin = ({ onGoogleSuccess }) => {
    const [, dispatch] = useContext(MyUserContext);

    const loginGoogle = async () => {
        try {
            const redirectUrl = Linking.createURL("oauth");
            const result = await WebBrowser.openAuthSessionAsync(
                "https://part-time-job-app-production.up.railway.app/auth/google/login/",
                redirectUrl
            );

            if (result.type === "success") {
                const { queryParams } = Linking.parse(result.url);

                const access_token = queryParams?.access_token;
                const refresh_token = queryParams?.refresh_token;

                console.log("access token:", access_token);
                console.log("refresh token:", refresh_token);

                if (!access_token) {
                    console.error("Không lấy được access_token");
                    return;
                }

                const tokens = {
                    access_token,
                    refresh_token,
                };

                await AsyncStorage.setItem(
                    "tokens",
                    JSON.stringify(tokens)
                );

                const u = await authApis(access_token).get(
                    endpoints["current-user"]
                );

                dispatch({
                    type: "LOGIN",
                    payload: {
                        ...u.data,
                        ...tokens,
                    },
                });

                onGoogleSuccess?.();
            }

            // User cancel login
            if (result.type === "cancel") {
                console.log("User cancelled login");
            }
        } catch (err) {
            console.error("Google login error:", err);
        }
    };

    return (
        <>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 10,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: "#ccc",
                    }}
                />

                <Text
                    style={{
                        marginHorizontal: 10,
                        color: "#888",
                    }}
                >
                    hoặc tiếp tục bằng
                </Text>

                <View
                    style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: "#ccc",
                    }}
                />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 20,
                }}
            >
                <TouchableOpacity
                    onPress={loginGoogle}
=======
import { Button } from "react-native-paper";
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import Styles from "../styles/Styles";
import { Colors } from "../configs/Colors";
import { endpoints } from "../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const SocialLogin = ({ onGoogleSuccess, onFacebookSuccess }) => {
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    });

    const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
        clientId: 'YOUR_FACEBOOK_APP_ID',
    });

    const handleGoogle = async () => {
        try {
            const result = await googlePromptAsync();
            if (result.type === 'success') {
                const { access_token } = result.params;

                let res = await Apis.post(endpoints['loginGg'], {
                    'access_token': access_token
                });

                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);
                dispatchEvent({
                    "type": "LOGIN",
                    "payload": u.data
                });
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    const handleFacebook = async () => {
        try {
            const result = await fbPromptAsync();
            if (result.type === 'success') {
                const { access_token } = result.params;

                let res = await Apis.post(endpoints['loginFb'], {
                    'access_token': access_token
                });

                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);
                dispatchEvent({
                    "type": "LOGIN",
                    "payload": u.data
                });
            }
        } catch (ex) {
            console.error(ex);
        }
    }
    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                <Text style={{ marginHorizontal: 10, color: '#888' }}>hoặc tiếp tục bằng</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                {/* Google */}
                <TouchableOpacity
                    onPress={handleGoogle}
                    disabled={!googleRequest}
>>>>>>> origin/frontend/login_register
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
<<<<<<< HEAD
                        backgroundColor: "white",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#ddd",
                    }}
                >
                    <Image
                        source={{
                            uri: "https://www.google.com/favicon.ico",
                        }}
                        style={{
                            width: 28,
                            height: 28,
                        }}
=======
                        backgroundColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'black',
                    }}>
                    <Image
                        source={{ uri: 'https://www.google.com/favicon.ico' }}
                        style={{ width: 28, height: 28 }}
                    />
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                    onPress={handleFacebook}
                    disabled={!fbRequest}
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
                        backgroundColor: '#0168f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'black',
                    }}>
                    <Image
                        source={{ uri: 'https://www.facebook.com/favicon.ico' }}
                        style={{ width: 28, height: 28 }}
>>>>>>> origin/frontend/login_register
                    />
                </TouchableOpacity>
            </View>
        </>
    );
<<<<<<< HEAD
};

=======
}
>>>>>>> origin/frontend/login_register
export default SocialLogin;