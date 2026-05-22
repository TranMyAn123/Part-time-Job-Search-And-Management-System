import { View, ScrollView, Image, TouchableOpacity, Text } from "react-native";
import Styles, { inputTheme } from "../../styles/Styles";
import { Button, HelperText, TextInput, Snackbar, Icon } from "react-native-paper";
import { useState } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImgPicker from 'expo-image-picker';
import { Colors } from "../../configs/Colors";
import logo from "../../assets/logo.png";
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmRegister = () => {
    const employerInfo = [{
        field: 'company_name',
        label: 'Tên công ty',
        icon: 'domain'
    }, {
        field: 'tax_code',
        label: 'Mã số thuế',
        icon: 'identifier'
    }, {
        field: 'description',
        label: 'Mô tả công ty',
        icon: 'text',
        multiline: true
    }];

    const [user, setUser] = useState({ role: 'USER' });
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const [workplaceImages, setWorkplaceImages] = useState([]);
    const nav = useNavigation();
    const route = useRoute();
    const { user: pendingUser } = route.params;
    const [visible, setVisible] = useState(false);
    const [logo, setLogo] = useState(null);

    const picker = async () => {
        let { status } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImgPicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                selectionLimit: 10,
            });
            if (!result.canceled) {
                setWorkplaceImages([...workplaceImages, ...result.assets]);
                setErr({ ...err, workplace_images: '' });
            }
        }
    }

    const pickLogo = async () => {
        let { status } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImgPicker.launchImageLibraryAsync();
            if (!result.canceled) {
                setLogo(result.assets[0]);
                setErr({ ...err, logo_company: '' });
            }
        }
    }

    const validate = () => {
        let newErr = {};
        for (var e of employerInfo)
            if (!(e.field in user) || !user[e.field]) {
                newErr[e.field] = `Vui lòng nhập ${e.label}!`;
            }
        if (!logo) {
            newErr.logo_company = "Vui lòng chọn logo công ty!";
        }
        if (workplaceImages.length < 3) {
            newErr.workplace_images = "Cần ít nhất 3 ảnh mô tả môi trường làm việc!";
        }
        setErr(newErr);
        return Object.keys(newErr).length === 0;
    }

    const register = async () => {
        if (validate() === true) {
            setErr({});
            try {
                setLoading(true);

                console.log('workplace images:', workplaceImages.map(i => i.uri));
                console.log('mimeType:', workplaceImages.map(i => i.mimeType));

                let form = new FormData();

                Object.keys(user).forEach(key => {
                    form.append(key, user[key]);
                });

                workplaceImages.forEach((img, idx) => {
                    form.append('workplace_images', {
                        uri: img.uri,
                        name: img.fileName || `workplace_${idx}.jpg`,
                        type: "image/jpeg"
                    });
                });

                if (logo) {
                    form.append('logo_company', {
                        uri: logo.uri,
                        name: logo.fileName || 'logo.jpg',
                        type: logo.mimeType || 'image/jpeg'
                    });
                }

                const token = await AsyncStorage.getItem('token');
                let res = await authApis(token).post(endpoints['employers'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201) {
                    console.log("Đã gửi yêu cầu trở thành nhà tuyển dụng! Vui lòng chờ xét duyệt.");
                    setVisible(true);
                    setTimeout(() => nav.navigate('profile'), 2000);
                }
            } catch (ex) {
                const data = ex.response?.data;
                console.log('error data:', JSON.stringify(data));
                if (data && typeof data === 'object') {
                    const msgs = Object.entries(data).map(([key, val]) => {
                        const msg = Array.isArray(val) ? val[0] : typeof val === 'object' ? Object.values(val)[0] : val;
                        return `${key}: ${msg}`;
                    }).join('\n');
                    setErr({ api: msgs });
                } else {
                    setErr({ api: "Gửi yêu cầu không thành công!" });
                }
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={[Styles.padding, Styles.gap, Styles.center]}>
            {err.api && <HelperText type="error" visible={true}>{err.api}</HelperText>}

            <TouchableOpacity onPress={pickLogo} style={{ alignSelf: 'center', marginBottom: 8 }}>
                {logo
                    ? <Image source={{ uri: logo.uri }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                    : <View style={[Styles.avatarPicker, { width: 100, height: 100, borderRadius: 12 }]}>
                        <Icon name="image" size={32} color={Colors.navy[500]} />
                    </View>
                }
                <Text style={{ textAlign: 'center', color: Colors.navy[500], marginTop: 4 }}>Logo công ty</Text>
            </TouchableOpacity>
            {!!err.logo_company && <HelperText type="error" visible>{err.logo_company}</HelperText>}

            {employerInfo.map(i => (
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
                        multiline={i.multiline}
                        numberOfLines={i.multiline ? 3 : 1}
                        error={!!err[i.field]}
                        right={<TextInput.Icon icon={i.icon} />}
                    />
                    <HelperText type="error" visible={!!err[i.field]} style={{ marginTop: -5, marginBottom: -20, paddingVertical: 0 }}>
                        {Array.isArray(err[i.field]) ? err[i.field][0] : err[i.field]}
                    </HelperText>
                </View>
            ))}

            <View style={{ width: '100%' }}>
                <Button
                    mode="outlined"
                    icon="image-multiple"
                    onPress={picker}
                    style={[Styles.margin, { borderColor: err.workplace_images ? 'red' : Colors.navy[500] }]}
                >
                    Ảnh môi trường làm việc ({workplaceImages.length}/3 tối thiểu)
                </Button>
                <HelperText type="error" visible={!!err.workplace_images}>
                    {err.workplace_images}
                </HelperText>

                {workplaceImages.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {workplaceImages.map((img, idx) => (
                            <View key={idx} style={{ marginRight: 8 }}>
                                <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                                <TouchableOpacity
                                    onPress={() => setWorkplaceImages(workplaceImages.filter((_, i) => i !== idx))}
                                    style={{
                                        position: 'absolute', top: -6, right: -6,
                                        backgroundColor: 'red', borderRadius: 10, width: 20,
                                        height: 20, alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            <Button loading={loading} disabled={loading} onPress={register}
                style={[Styles.margin, Styles.button]} labelStyle={Styles.buttonLabel}
                mode="contained">Gửi yêu cầu trở thành nhà tuyển dụng
            </Button>

            <Button onPress={() => nav.navigate('profile')}
                style={[Styles.margin, Styles.button, { backgroundColor: '#e53935' }]} labelStyle={Styles.buttonLabel}
                mode="contained">Hủy yêu cầu
            </Button>

            <Snackbar visible={visible}
                onDismiss={() => setVisible(false)}
                style={Styles.snackbarSuccess}
                wrapperStyle={Styles.snackbarTop}>
                Đã gửi yêu cầu trở thành nhà tuyển dụng! Vui lòng chờ xét duyệt.
            </Snackbar>
        </ScrollView>
    )
}

export default EmRegister;