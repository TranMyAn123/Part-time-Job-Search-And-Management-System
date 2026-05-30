import {
    Image, Text, ScrollView, TouchableOpacity, View,
    Pressable, Platform, Modal
} from "react-native";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Contexts";
import { Button, TextInput, HelperText } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import { Colors } from "../../configs/Colors";
import * as ImgPicker from 'expo-image-picker';
import Styles from "../../styles/Styles";
import UserStyles, { inputTheme } from "./Styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const SectionCard = ({ title, children }) => (
    <View style={Styles.sectionCard}>
        <Text style={Styles.sectionCardTitle}>{title}</Text>
        {children}
    </View>
);

const Profile = () => {
    const nav = useNavigation();
    const [err, setErr] = useState({});
    const [user, dispatch] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm: '',
    });
    const [userEdit, setUserEdit] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        cityzenID: user?.profile?.cityzenID || '',
        email: user?.email || '',
        phone_num: user?.phone_num || '',
        address: user?.profile?.address || '',
        dob: user?.profile?.dob || '',
    });

    const userInfo = [
        { field: 'first_name', label: 'Tên', icon: 'account' },
        { field: 'last_name', label: 'Họ', icon: 'account' },
        { field: 'cityzenID', label: 'Số CMND/CCCD', icon: 'card-account-details' },
        { field: 'email', label: 'Email', icon: 'email' },
        { field: 'phone_num', label: 'Số điện thoại', icon: 'phone' },
        { field: 'address', label: 'Địa chỉ', icon: 'home' },
        { field: 'dob', label: 'Ngày sinh', icon: 'calendar' },
    ];

    useEffect(() => {
        const fetchFollowed = async () => {
            try {
                const res = await authApis(user.access_token).get(endpoints['my-follows']);
                const results = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
                setFollowedEmployers(results);
            } catch (e) {
                console.log('fetch follow error', e);
            }
        };
        if (user) fetchFollowed();
    }, [user]);


    const save = async () => {
        try {
            setLoading(true);
            let dob = userEdit.dob;
            if (dob && dob.includes('/')) {
                const parts = dob.split('/');
                dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            let dataToSend = {
                user: {
                    first_name: userEdit.first_name,
                    last_name: userEdit.last_name,
                    phone_num: userEdit.phone_num,
                },
                address: userEdit.address,
                dob: dob,
                cityzenID: userEdit.cityzenID,
            };
            let res = await authApis(user.access_token).patch(endpoints['current-user'], dataToSend);
            dispatch({ type: "LOGIN", payload: res.data });
            setEditing(false);
        } catch (ex) {
            console.error(ex);
            const msg = ex.response?.data
                ? JSON.stringify(ex.response.data)
                : ex.message;
            alert("Lỗi: " + msg);
        } finally {
            setLoading(false);
        }
    }

    const cancelEmployerRequest = async () => {
        try {
            setLoading(true);
            await authApis(user.access_token).delete(endpoints['employers']);
            dispatch({ type: "LOGIN", payload: { ...user, employer: false } });
            setShowCancelModal(false);
        } catch (ex) {
            alert("Hủy yêu cầu thất bại!");
        } finally {
            setLoading(false);
        }
    }

    const dobValue = () => {
        if (!userEdit.dob) return new Date();
        const parts = userEdit.dob.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return new Date();
    }

    const changePassword = async () => {
        let newErr = {};
        if (!passwords.old_password) newErr.old_password = 'Vui lòng nhập mật khẩu cũ!';
        if (!passwords.new_password) newErr.new_password = 'Vui lòng nhập mật khẩu mới!';
        if (!passwords.confirm) newErr.confirm = 'Vui lòng xác nhận mật khẩu!';
        if (passwords.new_password && passwords.confirm && passwords.new_password !== passwords.confirm)
            newErr.confirm = 'Mật khẩu không khớp!';

        setErr(newErr);
        if (Object.keys(newErr).length > 0) return;

        try {
            setLoading(true);
            await authApis(user.access_token).patch(endpoints['change-password'], {
                old_password: passwords.old_password,
                new_password: passwords.new_password,
            });
            alert("Đổi mật khẩu thành công!");
            setChangingPassword(false);
            setPasswords({ old_password: '', new_password: '', confirm: '' });
            setErr({});
        } catch (ex) {
            const data = ex.response?.data;
            if (data && typeof data === 'object') {
                setErr(data);
            } else {
                setErr({ old_password: ex.message });
            }
        } finally {
            setLoading(false);
        }
    }

    const picker = async () => {
        let { status, canAskAgain } = await ImgPicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            if (!canAskAgain) {
                alert("Bạn đã từ chối quyền truy cập ảnh. Vui lòng vào Cài đặt để cấp quyền!");
            } else {
                alert("Cần quyền truy cập ảnh để đổi avatar!");
            }
            return;
        } else {
            const result = await ImgPicker.launchImageLibraryAsync();
            if (!result.canceled) {
                try {
                    setLoading(true);
                    let form = new FormData();
                    form.append('avatar', {
                        uri: result.assets[0].uri,
                        name: result.assets[0].fileName,
                        type: "image/jpeg"
                    });
                    let res = await authApis(user.access_token).patch(endpoints['current-user'], form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    dispatch({
                        type: "UPDATE_AVATAR",
                        payload: res.data
                    });
                } catch (ex) {
                    console.error(ex);
                    alert("Cập nhật avatar thất bại!");
                } finally {
                    setLoading(false);
                }
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={[Styles.padding, Styles.gap]}>
            <View style={Styles.profileHeader} />
            <TouchableOpacity onPress={editing ? picker : undefined} activeOpacity={editing ? 0.7 : 1} style={Styles.avatarPicker}>
                {user?.avatar
                    ? <Image source={{ uri: user?.avatar }} style={Styles.avatar} />
                    : <Image source={{ uri: 'https://res.cloudinary.com/duxz5ias9/image/upload/v1779191141/default_avatar_izym3f.png' }} style={Styles.avatar} />
                }
            </TouchableOpacity>

            <View style={{ paddingHorizontal: 16 }}>
                <SectionCard title="Thông tin cơ bản">
                    <View style={{ marginHorizontal: 16, gap: 12, marginBottom: 16 }}>
                        {userInfo.slice(0, 3).map(i => (
                            <Pressable
                                key={i.field}
                                onPress={() => i.field === 'dob' && editing && setShowDatePicker(true)}>
                                <TextInput
                                    label={i.label}
                                    value={userEdit[i.field]}
                                    onChangeText={t => i.field !== 'dob' && setUserEdit({ ...userEdit, [i.field]: t })}
                                    mode="outlined" multiline={true}
                                    editable={editing && i.field !== 'dob'}
                                    style={[UserStyles.input, !editing && { opacity: 0.75 }]}
                                    contentStyle={UserStyles.inputContent}
                                    outlineStyle={UserStyles.outlineStyle}
                                    theme={inputTheme}
                                    left={<TextInput.Icon icon={i.icon} />}
                                    pointerEvents={i.field === 'dob' ? 'none' : 'auto'}
                                />
                            </Pressable>
                        ))}
                        <Pressable onPress={() => editing && setShowDatePicker(true)}>
                            <TextInput
                                label="Ngày sinh"
                                value={userEdit.dob}
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                style={[UserStyles.input, !editing && { opacity: 0.75 }]}
                                contentStyle={UserStyles.inputContent}
                                outlineStyle={UserStyles.outlineStyle}
                                theme={inputTheme}
                                left={<TextInput.Icon icon="calendar" />}
                                right={<TextInput.Icon icon="chevron-down" />}
                            />
                        </Pressable>
                    </View>
                </SectionCard>

                <SectionCard title="Thông tin liên hệ">
                    <View style={{ marginHorizontal: 16, gap: 12, marginBottom: 16 }}>
                        {userInfo.slice(3, 6).map(i => (
                            <Pressable
                                key={i.field}
                                onPress={() => i.field === 'dob' && editing && setShowDatePicker(true)}>
                                <TextInput
                                    label={i.label}
                                    value={userEdit[i.field]}
                                    onChangeText={t => i.field !== 'dob' && setUserEdit({ ...userEdit, [i.field]: t })}
                                    mode="outlined" multiline={true}
                                    editable={editing && i.field !== 'dob'}
                                    style={[UserStyles.input, !editing && { opacity: 0.75 }]}
                                    contentStyle={UserStyles.inputContent}
                                    outlineStyle={UserStyles.outlineStyle}
                                    theme={inputTheme}
                                    left={<TextInput.Icon icon={i.icon} />}
                                    pointerEvents={i.field === 'dob' ? 'none' : 'auto'}
                                />
                            </Pressable>
                        ))}
                    </View>
                </SectionCard>

                {showDatePicker && (
                    <Modal transparent animationType="fade">
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                borderRadius: 16,
                                padding: 16,
                                width: '90%',
                            }}>
                                <DateTimePicker
                                    value={dobValue()}
                                    mode="date"
                                    display={Platform.OS === 'android' ? 'default' : 'inline'}
                                    onChange={(event, date) => {
                                        setShowDatePicker(false);
                                        if (date) {
                                            const d = date.getDate().toString().padStart(2, '0');
                                            const m = (date.getMonth() + 1).toString().padStart(2, '0');
                                            const y = date.getFullYear();
                                            setUserEdit({ ...userEdit, dob: `${d}/${m}/${y}` });
                                        }
                                    }}
                                />
                                <Button onPress={() => setShowDatePicker(false)}>Đóng</Button>
                            </View>
                        </View>
                    </Modal>
                )}
            </View>

            {changingPassword && (
                <SectionCard title="Đổi mật khẩu">
                    <View style={{ marginHorizontal: 16, gap: 12, marginBottom: 16 }}>

                        {!!err.non_field_errors && (
                            <HelperText type="error" visible={true}>
                                {err.non_field_errors}
                            </HelperText>
                        )}

                        {[
                            { field: 'old_password', label: 'Mật khẩu cũ' },
                            { field: 'new_password', label: 'Mật khẩu mới' },
                            { field: 'confirm', label: 'Xác nhận mật khẩu mới' },
                        ].map(i => (
                            <View key={i.field}>
                                <TextInput
                                    label={i.label}
                                    value={passwords[i.field]}
                                    onChangeText={t => {
                                        setPasswords({ ...passwords, [i.field]: t });
                                        setErr({ ...err, [i.field]: '' });
                                    }}
                                    mode="outlined"
                                    secureTextEntry
                                    error={!!err[i.field]}
                                    style={UserStyles.input}
                                    contentStyle={UserStyles.inputContent}
                                    outlineStyle={UserStyles.outlineStyle}
                                    theme={inputTheme}
                                    left={<TextInput.Icon icon="lock" />}
                                />
                                {!!err[i.field] && (
                                    <HelperText type="error" visible={true} style={{ marginTop: 4 }}>
                                        {err[i.field]}
                                    </HelperText>
                                )}
                            </View>
                        ))}
                    </View>
                </SectionCard>
            )}

            <SectionCard title="🏢 Công ty đang theo dõi">
                <View style={{ marginHorizontal: 16, marginBottom: 16, gap: 10 }}>
                    {followedEmployers.length === 0 ? (
                        <Text style={UserStyles.followEmpty}>Bạn chưa theo dõi công ty nào.</Text>
                    ) : (
                        followedEmployers.map(emp => (
                            <Pressable key={emp.user_id} style={UserStyles.followCard}>
                                {emp.logo_company ? (
                                    <Image
                                        source={{ uri: emp.logo_company }}
                                        style={UserStyles.followLogo}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <View style={UserStyles.followLogoFallback}>
                                        <Text style={UserStyles.followLogoFallbackText}>
                                            {emp.company_name?.[0] ?? '?'}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={UserStyles.followCompanyName}>{emp.company_name}</Text>
                                    <Text style={UserStyles.followMeta}>
                                        {emp.follow_count} người theo dõi · {emp.job_count} việc làm
                                    </Text>
                                </View>
                                <Icon source="chevron-right" size={18} color="#9CA3AF" />
                            </Pressable>
                        ))
                    )}
                </View>
            </SectionCard>

            <View style={{ flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 12 }}>
                <Button
                    compact
                    onPress={changingPassword ? () => setChangingPassword(false) : editing ? save : () => setEditing(true)}
                    style={[Styles.button, { flex: 1, backgroundColor: changingPassword ? '#e53935' : Colors.navy[700] }]}
                    labelStyle={Styles.buttonLabel}
                    mode="contained">
                    {changingPassword ? 'Hủy' : editing ? 'Lưu' : 'Chỉnh sửa'}
                </Button>

                <Button
                    compact
                    disabled={loading}
                    onPress={editing ? () => setEditing(false) : () => {
                        if (changingPassword) {
                            changePassword();
                        } else {
                            setChangingPassword(true);
                        }
                    }}
                    style={[Styles.button, { flex: 1, backgroundColor: editing ? '#e53935' : '#F97316' }]}
                    labelStyle={Styles.buttonLabel}
                    mode="contained">
                    {editing ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
            </View>

            <Button
                onPress={() => !user?.employer && nav.navigate('emregister', { user: user })}
                disabled={!!user?.employer}
                style={[Styles.margin, Styles.button, { backgroundColor: user?.employer ? '#6b7280' : Colors.navy[500] }]}
                labelStyle={Styles.buttonLabel}
                mode="contained">
                {user?.employer ? 'Chờ xét duyệt thành nhà tuyển dụng!' : 'Trở thành nhà tuyển dụng'}
            </Button>

            <Button
                onPress={() => dispatch({ type: "LOGOUT" })}
                style={[Styles.margin, Styles.button, { backgroundColor: '#e53935' }]}
                labelStyle={Styles.buttonLabel}
                mode="contained">Đăng xuất</Button>
        </ScrollView>
    );
}

export default Profile;