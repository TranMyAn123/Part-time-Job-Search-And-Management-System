import { ScrollView, Image, View } from "react-native";
import Styles, { inputTheme } from "../../styles/Styles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyUserContext } from "../../configs/Contexts";
import SocialLogin from "../../components/SocialLogin";
import logo from "../../assets/logo.png";

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
                    'grant_type': 'password'
                });
                console.info(res.data);
                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);
                console.info(u.data);
                dispatch({
                    "type": "LOGIN",
                    "payload": u.data
                });
            } catch (ex) {
                setErr({ api: ex.response?.data?.error_description || ex.message || "Đăng nhập thất bại!" });
            } finally {
                setLoading(false);
            }
        }
    }

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
        </ScrollView>
    );
}

export default Login;