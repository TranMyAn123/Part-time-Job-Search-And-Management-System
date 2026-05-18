import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Styles, { inputTheme } from "../../styles/Styles";
import { Button, HelperText, TextInput } from "react-native-paper";
import * as ImgPicker from 'expo-image-picker';
import { useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import SocialLogin from "../../components/SocialLogin";

const Register = () => {
    const userInfo = [{
        field: 'first_name',
        label: 'Tên',
        icon: 'text'
    }, {
        field: 'last_name',
        label: 'Họ',
        icon: 'text'
    }, {
        field: 'email',
        label: 'Email',
        icon: 'email'
    }, {
        field: 'username',
        label: 'Tên đăng nhập',
        icon: 'account'
    }, {
        field: 'password',
        label: 'Mật khẩu',
        icon: 'eye',
        secureTextEntry: true
    }, {
        field: 'confirm',
        label: 'Xác nhận mật khẩu',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const [showPassword, setShowPassword] = useState({});

    const picker = async () => {
        let { status } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImgPicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setUser({ ...user, 'avatar': result.assets[0] });
            }
        }
    }

    const validate = () => {
        let newErr = {};
        for (var i of userInfo)
            if (!(i.field in user) || !user[i.field]) {
                newErr[i.field] = `Vui lòng nhập ${i.label}!`;
            }

        if (user.password !== user.confirm) {
            newErr.confirm = "Mật khẩu không khớp";
        }

        setErr(newErr);
        return Object.keys(newErr).length === 0;
    }

    const register = async () => {
        if (validate() === true) {
            setErr({});
            try {
                setLoading(true);

                let form = new FormData();
                for (let key of Object.keys(user)) {
                    if (key !== 'confirm') {
                        if (key === 'avatar') {
                            form.append('avatar', {
                                uri: user.avatar.uri,
                                name: user.avatar.fileName,
                                type: "image/jpeg"
                            });
                        } else
                            form.append(key, user[key]);
                    }
                }

                let res = await Apis.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (res.status === 201)
                    nav.navigate('login');
                else
                    alert("Hệ thống có lỗi!");
            } catch (ex) {
                console.error(JSON.stringify(ex.response?.data));
                setErr({ api: "Hệ thống có lỗi!" });
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={[Styles.scrollContent, Styles.gap, Styles.center]}>
            {err.api && <HelperText type="error" visible={true}>{err.api}</HelperText>}
            <TouchableOpacity onPress={picker} style={Styles.avatarPicker}>
                {user.avatar
                    ? <Image source={{ uri: user.avatar.uri }} style={Styles.avatar} />
                    : <Text style={{ fontSize: 40 }}>👤</Text>
                }
            </TouchableOpacity>

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
                    <HelperText type="error" visible={!!err[i.field]} style={{ marginTop: -5, marginBottom: -20, paddingVertical: 0 }}>
                        {err[i.field]}
                    </HelperText>
                </View>
            ))}

            <Button loading={loading} disabled={loading} onPress={register}
                style={[Styles.margin, Styles.button]} labelStyle={Styles.buttonLabel}
                mode="contained">Đăng ký</Button>

            <SocialLogin />
        </ScrollView>
    );
}

export default Register;