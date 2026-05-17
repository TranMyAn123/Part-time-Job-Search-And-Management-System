import { View, Text, TouchableOpacity, Image } from "react-native";
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
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
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
                    />
                </TouchableOpacity>
            </View>
        </>
    );
}
export default SocialLogin;