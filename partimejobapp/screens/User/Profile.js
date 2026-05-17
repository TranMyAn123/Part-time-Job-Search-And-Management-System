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

const Profile = () => {
    const nav = useNavigation();
    const [err, setErr] = useState({});
    const [user, dispatch] = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm: '',
    });
    const [userEdit, setUserEdit] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        cityzenID: user?.cityzenID || '',
        email: user?.email || '',
        phone_num: user?.phone_num || '',
        address: user?.address || '',
        dob: user?.dob || '',
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

    const save = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            let dataToSend = { ...userEdit };
            if (dataToSend.dob && dataToSend.dob.includes('/')) {
                const parts = dataToSend.dob.split('/');
                dataToSend.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            let res = await authApis(token).patch(endpoints['current-user'], dataToSend);
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
            const token = await AsyncStorage.getItem('token');
            await authApis(token).patch(endpoints['change-password'], {
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
                    const token = await AsyncStorage.getItem('token');
                    let form = new FormData();
                    form.append('avatar', {
                        uri: result.assets[0].uri,
                        name: result.assets[0].fileName,
                        type: "image/jpeg"
                    });
                    let res = await authApis(token).put(endpoints['current-user'], form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    dispatch({
                        type: "UPDATE_AVATAR",
                        payload: result.assets[0]
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
            <TouchableOpacity onPress={picker} style={Styles.avatarPicker}>
                {user?.avatar
                    ? <Image source={{ uri: user.avatar }} style={Styles.avatar} />
                    : <Text style={{ fontSize: 40 }}>👤</Text>
                }
            </TouchableOpacity>

            <View style={{ marginHorizontal: 16, gap: 12, marginBottom: 16 }}>
                {userInfo.map(i => (
                    <Pressable
                        key={i.field}
                        onPress={() => i.field === 'dob' && editing && setShowDatePicker(true)}>
                        <TextInput
                            label={i.label}
                            value={userEdit[i.field]}
                            onChangeText={t => i.field !== 'dob' && setUserEdit({ ...userEdit, [i.field]: t })}
                            mode="outlined" multiline={true}
                            editable={editing && i.field !== 'dob'}
                            style={UserStyles.input}
                            contentStyle={UserStyles.inputContent}
                            outlineStyle={UserStyles.outlineStyle}
                            theme={inputTheme}
                            left={<TextInput.Icon icon={i.icon} />}
                            pointerEvents={i.field === 'dob' ? 'none' : 'auto'}
                        />
                    </Pressable>
                ))}

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
                                        if (event.type === 'dismissed') {
                                            setShowDatePicker(false);
                                            return;
                                        }
                                        if (event.type === 'set' && date) {
                                            setShowDatePicker(false);
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
                <View style={{ marginHorizontal: 16, gap: 12, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                        <Text style={{ marginHorizontal: 10, color: '#aaa', fontSize: 13 }}>Đổi mật khẩu</Text>
                        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                    </View>

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
            )}

            <View style={{ flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 12 }}>
                <Button
                    compact
                    loading={loading}
                    disabled={loading}
                    onPress={changingPassword ? () => setChangingPassword(false) : editing ? save : () => setEditing(true)}
                    style={[Styles.button, { flex: 1, backgroundColor: changingPassword ? '#6b7280' : Colors.navy[700] }]}
                    labelStyle={Styles.buttonLabel}
                    mode="contained">
                    {changingPassword ? 'Hủy' : editing ? 'Lưu' : 'Chỉnh sửa'}
                </Button>

                <Button
                    compact
                    loading={loading}
                    disabled={loading}
                    onPress={editing ? () => setEditing(false) : () => {
                        if (changingPassword) {
                            changePassword();
                        } else {
                            setChangingPassword(true);
                        }
                    }}
                    style={[Styles.button, { flex: 1, backgroundColor: editing ? '#6b7280' : '#F97316' }]}
                    labelStyle={Styles.buttonLabel}
                    mode="contained">
                    {editing ? 'Hủy' : 'Đổi mật khẩu'}
                </Button>
            </View>

            <Button loading={loading} disabled={loading}
                onPress={() => dispatch({ type: "LOGOUT" })}
                style={[Styles.margin, Styles.button, { backgroundColor: '#e53935' }]}
                labelStyle={Styles.buttonLabel}
                mode="contained">Đăng xuất</Button>
        </ScrollView>
    );
}

export default Profile;