import { ScrollView, Image, View, Modal, Text, TouchableOpacity } from "react-native";
import Styles, { inputTheme } from "../../styles/Styles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from "../../configs/Contexts";
import SocialLogin from "../../components/SocialLogin";
import logo from "../../assets/logo.png";
import UserStyles from "./Styles";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../configs/Firebase";


const Login = () => {
    const userInfo = [{
        field: 'username',
        label: 'Tên đăng nhập',
        icon: 'account'
    }, {
        field: 'password',
        label: 'Mật khẩu',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const [, dispatch] = useContext(MyUserContext);
    const [showPassword, setShowPassword] = useState({});
    const [showRole, setShowRole] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);

    const validate = () => {
        let newErr = {};
        for (var i of userInfo)
            if (!(i.field in user) || !user[i.field])
                newErr[i.field] = `Vui lòng nhập ${i.label}!`;

        setErr(newErr);
        return Object.keys(newErr).length === 0;
    }

    const login = async () => {
        if (validate() === true) {
            setErr({});
            try {
                setLoading(true);

                let res = await Apis.post(endpoints['login'], {
                    ...user,
                    grant_type: 'password'
                });
                const access_token = res.data.access_token
                const refresh_token = res.data.refresh_token

                const [u, firebaseTokenResponse] = await Promise.all([
                    authApis(access_token).get(endpoints['current-user']),
                    authApis(access_token).get(endpoints['firebase-token']),
                ]);
                console.log(firebaseTokenResponse.data.firebase_token)
                await AsyncStorage.setItem(
                    "tokens",
                    JSON.stringify({ access_token, refresh_token })
                ); await signInWithCustomToken(auth, firebaseTokenResponse.data.firebase_token);
                dispatch({
                    type: "LOGIN",
                    payload: {
                        ...u.data,
                        access_token: res.data.access_token,
                        refresh_token: res.data.refresh_token
                    },
                });

            } catch (ex) {
                setErr({
                    api: ex.response?.data?.error_description
                        || ex.message
                        || "Đăng nhập thất bại!"
                });
                console.log(ex);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSelectRole = (role) => {
        setShowRole(false);
        if (role === 'EMPLOYER') {
            nav.navigate('emregister', { user: pendingUser })
        } else {
            dispatch({
                "type": "LOGIN",
                "payload": pendingUser
            });
        }
    };

    return (
        <ScrollView contentContainerStyle={[Styles.padding, Styles.gap, Styles.center]}>
            {err.api && <HelperText type="error" visible={true}>{err.api}</HelperText>}
            <Image source={logo} style={{ width: 250, height: 250, alignSelf: 'center' }} />
            {userInfo.map(i => (
                <View key={i.field}>
                    <TextInput
                        style={[Styles.margin, Styles.input]}
                        contentStyle={Styles.inputContent}
                        theme={inputTheme}
                        mode="outlined"
                        value={user[i.field]}
                        onChangeText={t => {
                            setUser({ ...user, [i.field]: t });
                            setErr({ ...err, [i.field]: '' });
                        }}
                        label={i.label}
                        outlineStyle={Styles.outlineStyle}
                        secureTextEntry={i.secureTextEntry && !showPassword[i.field]}
                        error={!!err[i.field]}
                        right={<TextInput.Icon
                            icon={i.secureTextEntry ? (showPassword[i.field] ? 'eye-off' : 'eye') : i.icon}
                            onPress={() => i.secureTextEntry && setShowPassword({ ...showPassword, [i.field]: !showPassword[i.field] })}
                        />}
                    />
                    <HelperText type="error" visible={!!err[i.field]}>
                        {err[i.field]}
                    </HelperText>
                </View>
            ))}

            <Button loading={loading} disabled={loading} onPress={login}
                style={[Styles.margin, Styles.button]} labelStyle={Styles.buttonLabel}
                mode="contained">Đăng nhập</Button>

            <SocialLogin />

            <Modal
                visible={showRole}
                transparent
                animationType="fade"
                onRequestClose={() => { }}
            >
                <View style={UserStyles.modalOverlay}>
                    <View style={UserStyles.modalContainer}>
                        <Text style={UserStyles.modalSubtitle}>Chào mừng {pendingUser?.first_name}!</Text>
                        <Text style={UserStyles.modalTitle}>
                            Bạn muốn sử dụng ứng dụng với tư cách gì?
                        </Text>
                        <TouchableOpacity style={UserStyles.modalOption} onPress={() => handleSelectRole('EMPLOYER')}>
                            <Text style={UserStyles.modalOptionTitle}>Nhà tuyển dụng</Text>
                            <Text style={UserStyles.modalOptionDesc}>Đăng tin và tìm kiếm ứng viên</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={UserStyles.modalOption} onPress={() => handleSelectRole('USER')}>
                            <Text style={UserStyles.modalOptionTitle}>Người tìm việc</Text>
                            <Text style={UserStyles.modalOptionDesc}>Khám phá cơ hội việc làm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

export default Login;