import { View, ScrollView, Text, Platform, Modal, Pressable } from "react-native";
import { Button, HelperText, TextInput, Snackbar } from "react-native-paper";
import { useEffect, useState } from "react";
import { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../configs/Colors";
import Styles, { inputTheme } from "../../styles/Styles";
<<<<<<< HEAD
import EmployerStyles from "./Styles"
=======
import { EmployerStyles } from "./Styles"
>>>>>>> origin/frontend/login_register
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const SectionCard = ({ title, children }) => (
    <View style={Styles.sectionCard}>
        <Text style={Styles.sectionCardTitle}>{title}</Text>
        {children}
    </View>
);

const AddJob = () => {
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState({});
    const [visible, setVisible] = useState(false);
    const [industries, setIndustries] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showIndustryPicker, setShowIndustryPicker] = useState(false);
    const [form, setForm] = useState({
        title: '', requirement: '', salary_min: '', salary_max: '',
        benefits: '', location: '', available_date: '', industry: null, description: '',
    });

    const loadIndustries = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['industries']);
            setIndustries(res.data.results || res.data);
        } catch (ex) { console.log(ex); }
    };

    useEffect(() => { loadIndustries(); }, []);

    const selectedIndustry = industries.find(i => i.id === form.industry);

    const dateValue = () => {
        if (!form.available_date) return new Date();
        const parts = form.available_date.split('/');
        if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
        return new Date();
    };

    const validate = () => {
        let newErr = {};
        if (!form.title.trim()) newErr.title = 'Vui lòng nhập tiêu đề!';
        if (!form.requirement.trim()) newErr.requirement = 'Vui lòng nhập yêu cầu!';
        if (!form.salary_min) newErr.salary_min = 'Vui lòng nhập lương tối thiểu!';
        if (!form.salary_max) newErr.salary_max = 'Vui lòng nhập lương tối đa!';
        if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max))
            newErr.salary_max = 'Lương tối đa phải lớn hơn tối thiểu!';
        if (!form.location.trim()) newErr.location = 'Vui lòng nhập địa điểm!';
        if (!form.available_date) newErr.available_date = 'Vui lòng chọn ngày hết hạn!';
        if (!form.industry) newErr.industry = 'Vui lòng chọn ngành nghề!';
        setErr(newErr);
        return Object.keys(newErr).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setErr({});
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const parts = form.available_date.split('/');
            const dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            await authApis(token).post(endpoints['add-job'], {
                title: form.title, requirement: form.requirement,
                salary_min: form.salary_min, salary_max: form.salary_max,
                benefits: form.benefits, location: form.location,
                available_date: dateStr, industry: form.industry,
                description: form.description,
            });
            setVisible(true);
            setTimeout(() => nav.goBack(), 1500);
        } catch (ex) {
            const data = ex.response?.data;
            if (data && typeof data === 'object') {
                setErr({ api: Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join('\n') });
            } else {
                setErr({ api: 'Đăng tin thất bại!' });
            }
        } finally {
            setLoading(false);
        }
    };

    const fieldInput = (field, label, icon, { multiline, keyboardType } = {}) => (
        <View key={field}>
            <TextInput
                label={label}
                value={form[field]}
                onChangeText={t => {
                    setForm({ ...form, [field]: t });
                    setErr({ ...err, [field]: '' });
                }}
                mode="outlined"
                multiline={!!multiline}
                keyboardType={keyboardType || 'default'}
                error={!!err[field]}
                style={[Styles.margin, Styles.input]}
                contentStyle={Styles.inputContent}
                outlineStyle={Styles.outlineStyle}
                theme={inputTheme}
                right={<TextInput.Icon icon={icon} />}
            />
            {!!err[field] && (
                <HelperText type="error" visible style={{ marginTop: 4 }}>
                    {err[field]}
                </HelperText>
            )}
        </View>
    );

    return (
        <>
            <ScrollView
                style={{ backgroundColor: Colors.bg.main }}
                contentContainerStyle={{ paddingBottom: 32 }}>

                <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}>
                    <Text style={EmployerStyles.headerTitle}>Đăng tin tuyển dụng</Text>
                    <Text style={EmployerStyles.headerSubtitle}>
                        Điền đầy đủ thông tin để tìm kiếm các ứng viên phù hợp
                    </Text>
                </View>

                <View style={{ paddingHorizontal: 16 }}>
                    {!!err.api && (
                        <HelperText type="error" visible style={{ marginBottom: 8 }}>
                            {err.api}
                        </HelperText>
                    )}

                    <SectionCard title="Thông tin cơ bản">
                        {fieldInput('title', 'Tiêu đề công việc', 'briefcase')}
                        {fieldInput('requirement', 'Yêu cầu ứng viên', 'clipboard-list')}
                        <Pressable onPress={() => setShowIndustryPicker(true)}>
                            <TextInput
                                label="Ngành nghề"
                                value={selectedIndustry?.name || ''}
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                error={!!err.industry}
                                style={[Styles.margin, Styles.input]}
                                contentStyle={Styles.inputContent}
                                outlineStyle={Styles.outlineStyle}
                                theme={inputTheme}
                                right={<TextInput.Icon icon="chevron-down" />}
                            />
                        </Pressable>
                        {!!err.industry && (
                            <HelperText type="error" visible style={{ marginTop: 4 }}>
                                {err.industry}
                            </HelperText>
                        )}
                    </SectionCard>

                    <SectionCard title="Mức lương">
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                                {fieldInput('salary_min', 'Tối thiểu', 'cash', { keyboardType: 'numeric' })}
                            </View>
                            <View style={{ flex: 1 }}>
                                {fieldInput('salary_max', 'Tối đa', 'cash', { keyboardType: 'numeric' })}
                            </View>
                        </View>
                        {fieldInput('benefits', 'Phúc lợi', 'gift', { multiline: true })}
                    </SectionCard>

                    <SectionCard title="Địa điểm & Thời hạn">
                        {fieldInput('location', 'Địa điểm làm việc', 'map-marker')}
                        <Pressable onPress={() => setShowDatePicker(true)}>
                            <TextInput
                                label="Ngày hết hạn"
                                value={form.available_date}
                                mode="outlined"
                                editable={false}
                                pointerEvents="none"
                                error={!!err.available_date}
                                style={[Styles.margin, Styles.input]}
                                contentStyle={Styles.inputContent}
                                outlineStyle={Styles.outlineStyle}
                                theme={inputTheme}
                                right={<TextInput.Icon icon="calendar" />}
                            />
                        </Pressable>
                        {!!err.available_date && (
                            <HelperText type="error" visible style={{ marginTop: 4 }}>
                                {err.available_date}
                            </HelperText>
                        )}
                    </SectionCard>

                    <SectionCard title="Mô tả công việc">
                        {fieldInput('description', 'Mô tả chi tiết', 'text', { multiline: true })}
                    </SectionCard>

                    <Button
                        onPress={submit}
                        loading={loading}
                        disabled={loading}
                        style={[Styles.margin, Styles.button, { backgroundColor: Colors.navy[700] }]}
                        labelStyle={Styles.buttonLabel}
                        mode="contained"
                        icon="send">
                        Đăng tin tuyển dụng
                    </Button>
                </View>
            </ScrollView>

            {showDatePicker && (
                <Modal transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, width: '90%' }}>
                            <DateTimePicker
                                value={dateValue()}
                                mode="date"
                                minimumDate={new Date()}
                                display={Platform.OS === 'android' ? 'default' : 'inline'}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) {
                                        const d = date.getDate().toString().padStart(2, '0');
                                        const m = (date.getMonth() + 1).toString().padStart(2, '0');
                                        const y = date.getFullYear();
                                        setForm({ ...form, available_date: `${d}/${m}/${y}` });
                                        setErr({ ...err, available_date: '' });
                                    }
                                }}
                            />
                            <Button onPress={() => setShowDatePicker(false)}>Đóng</Button>
                        </View>
                    </View>
                </Modal>
            )}

            {showIndustryPicker && (
                <Modal transparent animationType="slide">
                    <Pressable
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                        onPress={() => setShowIndustryPicker(false)}>
                        <View style={{
                            backgroundColor: 'white',
                            borderTopLeftRadius: 24, borderTopRightRadius: 24,
                            padding: 16, maxHeight: '60%',
                        }}>
                            <View style={{
                                width: 40, height: 4, backgroundColor: Colors.border,
                                borderRadius: 2, alignSelf: 'center', marginBottom: 16,
                            }} />
                            <Text style={{
                                fontWeight: '700', fontSize: 17,
                                color: Colors.navy[700], marginBottom: 12, paddingHorizontal: 4,
                            }}>
                                Chọn ngành nghề
                            </Text>
                            <ScrollView>
                                {industries.map(ind => (
                                    <Pressable
                                        key={ind.id}
                                        onPress={() => {
                                            setForm({ ...form, industry: ind.id });
                                            setErr({ ...err, industry: '' });
                                            setShowIndustryPicker(false);
                                        }}
                                        style={{
                                            padding: 14, borderRadius: 12, marginBottom: 4,
                                            backgroundColor: form.industry === ind.id ? Colors.blue[100] : 'transparent',
                                            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                        <Text style={{
                                            color: form.industry === ind.id ? Colors.navy[700] : Colors.text.main,
                                            fontWeight: form.industry === ind.id ? '700' : '400',
                                            fontSize: 15,
                                        }}>
                                            {ind.name}
                                        </Text>
                                        {form.industry === ind.id && (
                                            <Text style={{ color: Colors.navy[500], fontSize: 18 }}>✓</Text>
                                        )}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            )}

            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                style={Styles.snackbarSuccess}
                wrapperStyle={Styles.snackbarTop}>
                Đăng tin thành công!
            </Snackbar>
        </>
    );
};

export default AddJob;