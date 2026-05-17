import axios from "axios";

export const endpoints = {
    'loginFb': "/auth/facebook/login/",
    'loginGg': "/auth/google/login/",
    'login': "/auth/login/",
    'logout': "/auth/logout/",
    'register': "/auth/register/",
    'current-user': "/users/current_user/",
    'change-password': "/users/current_user/change_password/",
};

export const authApis = (token) => {
    return axios.create({
        baseURL: "http://192.168.1.14:8000/",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: "http://192.168.1.14:8000/",
});


