import { View, Text, TouchableOpacity, Image } from "react-native";
import { useContext, useEffect } from "react";
import { MyUserContext } from "../configs/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";


const SocialLogin = ({ onGoogleSuccess, onFacebookSuccess }) => {
    const [, dispatch] = useContext(MyUserContext);


    const loginGoogle = () => {
        Linking.openURL("http://192.168.1.111:8000/auth/google/login");
    };

    useEffect(() => {
        const sub = Linking.addEventListener("url", async ({ url }) => {
            const { queryParams } = Linking.parse(url);

            const access_token = queryParams?.access_token;
            const refresh_token = queryParams?.refresh_token;

            if (!access_token) {
                console.error("Không lấy được access_token");
                return;
            }
            try {
                const tokens = {
                    access_token,
                    refresh_token
                };

                await AsyncStorage.setItem(
                    "tokens",
                    JSON.stringify(tokens)
                );

                const u = await authApis(access_token)
                    .get(endpoints["current-user"]);

                dispatch({
                    type: "LOGIN",
                    payload: {
                        ...u.data,
                        ...tokens
                    }
                });

            } catch (err) {
                console.error("Login error:", err);
            }
        });

        return () => sub.remove();
    }, []);

    // const handleFacebook = async () => {
    //     try {
    //         const result = await fbPromptAsync(); // ✅ bỏ useProxy
    //         if (result?.type === 'success') {
    //             const access_token = result.authentication?.accessToken
    //                 ?? result.params?.access_token;
    //             if (!access_token) {
    //                 console.error('Không lấy được Facebook access_token');
    //                 return;
    //             }
    //             const res = await Apis.post(endpoints['loginFb'], { access_token });
    //             await AsyncStorage.setItem('tokens', JSON.stringify({
    //                 access_token: res.data.access_token,
    //                 refresh_token: res.data.refresh_token,
    //             }));
    //             const u = await authApis(res.data.access_token).get(endpoints['current-user']);
    //             dispatch({ type: 'LOGIN', payload: { ...u.data, ...res.data } });
    //             onFacebookSuccess?.();
    //         }
    //     } catch (ex) {
    //         console.error('Facebook login error:', ex);
    //     }
    // };

    return (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                <Text style={{ marginHorizontal: 10, color: '#888' }}>hoặc tiếp tục bằng</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                <TouchableOpacity
                    onPress={loginGoogle}
                    // disabled={!googleRequest}
                    style={{
                        width: 54, height: 54, borderRadius: 27,
                        backgroundColor: 'white', justifyContent: 'center',
                        alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
                    }}>
                    <Image
                        source={{ uri: 'https://www.google.com/favicon.ico' }}
                        style={{ width: 28, height: 28 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleFacebook}
                    disabled={!fbRequest}
                    style={{
                        width: 54, height: 54, borderRadius: 27,
                        backgroundColor: '#0168f0', justifyContent: 'center',
                        alignItems: 'center', borderWidth: 1, borderColor: '#0168f0',
                    }}>
                    <Image
                        source={{ uri: 'https://www.facebook.com/favicon.ico' }}
                        style={{ width: 28, height: 28 }}
                    />
                </TouchableOpacity>
            </View>
        </>
    );
};

export default SocialLogin;