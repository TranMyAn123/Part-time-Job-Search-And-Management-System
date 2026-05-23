import { View, ScrollView, Image, TouchableOpacity, Text } from "react-native";
import Styles, { inputTheme } from "../../styles/Styles";
import { Button, HelperText, TextInput, Snackbar, Icon } from "react-native-paper";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { MyUserContext } from "../../configs/Contexts";
import * as ImgPicker from 'expo-image-picker';
import { Colors } from "../../configs/Colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SectionCard = ({ title, children }) => (
    <View style={Styles.sectionCard}>
        <Text style={Styles.sectionCardTitle}>{title}</Text>
        {children}
    </View>
);

const EmProfile = () => {
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

    const [employer, setEmployer] = useState(null);
    const [form, setForm] = useState(null);
    const [err, setErr] = useState({});
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [logo, setLogo] = useState(null);
    const [workplaceImages, setWorkplaceImages] = useState([]);
    const [visible, setVisible] = useState(false);
    const [user, dispatch] = useContext(MyUserContext);

    const loadEmployerInfo = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['employers-profile']);
            setEmployer(res.data);
            setForm({
                company_name: res.data.company_name || '',
                tax_code: res.data.tax_code || '',
                description: res.data.description || '',
            });
            if (res.data.logo_company) setLogo({ uri: res.data.logo_company });
            if (Array.isArray(res.data.workplace_images)) {
                setWorkplaceImages(res.data.workplace_images.map(img =>
                    typeof img === 'string' ? { uri: img } : { uri: img.image || img.url || img.uri }
                ));
            }
        } catch (ex) {
            console.log(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEmployerInfo(); }, []);

    const pickLogo = async () => {
        let { status } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { alert("Permissions denied!"); return; }
        const result = await ImgPicker.launchImageLibraryAsync();
        if (!result.canceled) setLogo(result.assets[0]);
    };

    const pickWorkplaceImages = async () => {
        let { status } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { alert("Permissions denied!"); return; }
        const result = await ImgPicker.launchImageLibraryAsync({ allowsMultipleSelection: true, selectionLimit: 10 });
        if (!result.canceled) setWorkplaceImages([...workplaceImages, ...result.assets]);
    };

    const validate = () => {
        let newErr = {};
        for (var e of employerInfo)
            if (!form[e.field] || !form[e.field].trim()) {
                newErr[e.field] = `Vui lòng nhập ${e.label}!`;
            }
        if (workplaceImages.length < 3) {
            newErr.workplace_images = "Cần ít nhất 3 ảnh môi trường làm việc!";
        }
        setErr(newErr);
        return Object.keys(newErr).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setErr({});
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            let fd = new FormData();

            Object.keys(form).forEach(key => fd.append(key, form[key]));

            workplaceImages.forEach((img, idx) => {
                fd.append('workplace_images', {
                    uri: img.uri,
                    name: img.fileName || `workplace_${idx}.jpg`,
                    type: 'image/jpeg'
                });
            });

            if (logo?.fileName) {
                fd.append('logo_company', {
                    uri: logo.uri,
                    name: logo.fileName || 'logo.jpg',
                    type: 'image/jpeg'
                });
            }

            const res = await authApis(token).patch(endpoints['employers-profile'], fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.status === 200) {
                setEmployer(res.data);
                setForm({
                    company_name: res.data.company_name || '',
                    tax_code: res.data.tax_code || '',
                    description: res.data.description || '',
                });
                if (res.data.logo_company) setLogo({ uri: res.data.logo_company });
                if (Array.isArray(res.data.workplace_images)) {
                    setWorkplaceImages(res.data.workplace_images.map(img =>
                        typeof img === 'string' ? { uri: img } : { uri: img.image || img.url || img.uri }
                    ));
                }
                setEditing(false);
                setVisible(true);
            }
        } catch (ex) {
            const data = ex.response?.data;
            console.log('error:', JSON.stringify(data));
            if (data && typeof data === 'object') {
                const msgs = Object.entries(data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
                    .join('\n');
                setErr({ api: msgs });
            } else {
                setErr({ api: "Cập nhật không thành công!" });
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelEditing = () => {
        setForm({
            company_name: employer?.company_name || '',
            tax_code: employer?.tax_code || '',
            description: employer?.description || '',
        });
        if (employer?.logo_company) setLogo({ uri: employer.logo_company });
        if (Array.isArray(employer?.workplace_images)) {
            setWorkplaceImages(employer.workplace_images.map(img =>
                typeof img === 'string' ? { uri: img } : { uri: img.image || img.url || img.uri }
            ));
        }
        setErr({});
        setEditing(false);
    };

    if (!form) return null;

    return (
        <>
            <ScrollView contentContainerStyle={[Styles.padding, Styles.gap, Styles.center]}>
                {err.api && <HelperText type="error" visible={true}>{err.api}</HelperText>}

                <SectionCard title="Logo công ty">
                    <TouchableOpacity
                        onPress={editing ? pickLogo : undefined}
                        activeOpacity={editing ? 0.7 : 1}
                        style={{ alignSelf: 'center', marginBottom: 8 }}
                    >
                        {logo
                            ? <Image source={{ uri: logo.uri }} style={{ width: 100, height: 100, borderRadius: 12, opacity: editing ? 1 : 0.85 }} />
                            : <View style={[Styles.avatarPicker, {
                                width: 100, height: 100, borderRadius: 12,
                                borderWidth: 1, borderColor: Colors.navy[500],
                                backgroundColor: '#f0f4ff',
                                alignItems: 'center', justifyContent: 'center'
                            }]}>
                                <Icon source="image" size={32} color={Colors.navy[500]} />
                            </View>
                        }
                        {editing && (
                            <View style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                backgroundColor: 'rgba(0,0,0,0.45)', borderBottomLeftRadius: 12,
                                borderBottomRightRadius: 12, paddingVertical: 3, alignItems: 'center'
                            }}>
                                <Text style={{ color: '#fff', fontSize: 11 }}>Thay logo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </SectionCard>

                <SectionCard title="Thông tin công ty">
                    {employerInfo.map(i => (
                        <View key={i.field} style={{ width: '100%' }}>
                            <TextInput
                                style={[Styles.margin, Styles.input, !editing && { opacity: 0.75 }]}
                                contentStyle={Styles.inputContent}
                                theme={inputTheme}
                                mode="outlined"
                                value={form[i.field]}
                                onChangeText={t => {
                                    setForm({ ...form, [i.field]: t });
                                    setErr({ ...err, [i.field]: '' });
                                }}
                                label={i.label}
                                outlineStyle={Styles.outlineStyle}
                                multiline={i.multiline}
                                numberOfLines={i.multiline ? 3 : 1}
                                error={!!err[i.field]}
                                editable={editing}
                                right={<TextInput.Icon icon={i.icon} />}
                            />
                            <HelperText type="error" visible={!!err[i.field]} style={{ marginTop: -5, marginBottom: -20, paddingVertical: 0 }}>
                                {Array.isArray(err[i.field]) ? err[i.field][0] : err[i.field]}
                            </HelperText>
                        </View>
                    ))}
                </SectionCard>

                <SectionCard title="Ảnh môi trường làm việc">
                    {editing && (
                        <Button
                            mode="outlined"
                            icon="image-multiple"
                            onPress={pickWorkplaceImages}
                            style={[Styles.margin, { borderColor: Colors.navy[500] }]}
                        >
                            Ảnh môi trường làm việc ({workplaceImages.length})
                        </Button>
                    )}

                    {workplaceImages.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {workplaceImages.map((img, idx) => (
                                <View key={idx} style={{ marginRight: 8 }}>
                                    <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: 8, opacity: editing ? 1 : 0.85 }} />
                                    {editing && (
                                        <TouchableOpacity
                                            onPress={() => setWorkplaceImages(workplaceImages.filter((_, i) => i !== idx))}
                                            style={{
                                                position: 'absolute', top: -6, right: -6,
                                                backgroundColor: 'red', borderRadius: 10,
                                                width: 20, height: 20, alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <HelperText type="error" visible={!!err.workplace_images}>
                        {err.workplace_images}
                    </HelperText>
                </SectionCard>

                <View style={{ flexDirection: 'row', width: '100%', gap: 10, marginTop: 8 }}>
                    <Button
                        onPress={editing ? submit : () => setEditing(true)}
                        loading={loading}
                        disabled={loading}
                        style={[Styles.margin, Styles.button, { flex: 1, backgroundColor: Colors.navy[700] }]}
                        labelStyle={Styles.buttonLabel}
                        mode="contained"
                    >
                        {editing ? 'Cập nhật' : 'Chỉnh sửa'}
                    </Button>

                    {!editing && (
                        <Button
                            onPress={() => dispatch({ type: "LOGOUT" })}
                            style={[Styles.margin, Styles.button, { flex: 1, backgroundColor: '#e53935' }]}
                            labelStyle={Styles.buttonLabel}
                            mode="contained">Đăng xuất</Button>
                    )}

                    {editing && (
                        <Button
                            onPress={cancelEditing}
                            disabled={loading}
                            style={[Styles.margin, Styles.button, { flex: 1, backgroundColor: '#6b7280' }]}
                            labelStyle={Styles.buttonLabel}
                            mode="contained"
                        >
                            Hủy
                        </Button>
                    )}
                </View>
            </ScrollView>

            <Snackbar visible={visible}
                onDismiss={() => setVisible(false)}
                style={Styles.snackbarSuccess}
                wrapperStyle={Styles.snackbarTop}>
                Cập nhật thông tin thành công!
            </Snackbar >
        </>
    );
};

export default EmProfile;