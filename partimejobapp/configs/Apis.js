import axios from "axios";

export const endpoints = {
    'loginFb': "/auth/facebook/login/",
    'loginGg': "/auth/google/login/",
    'login': "/auth/login/",
    'logout': "/auth/logout/",
    'register': "/auth/register/",
    'current-user': "/users/me/",
    'change-password': "/users/me/change_password/",
    'employers': "/employers/",
};

export const authApis = (token) => {
    return axios.create({
        baseURL: "http://192.168.1.16:8000/",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: "http://192.168.1.16:8000/",
});


