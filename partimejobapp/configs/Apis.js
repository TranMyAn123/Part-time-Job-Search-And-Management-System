import axios from "axios";

export const endpoints = {
    'login': "/auth/login/",
    'logout': "/auth/logout/",
    'register': "/auth/register/",
    'current-user': "/users/current_user/"
};

export const authApis = (token) => {
    return axios.create({
        baseURL: "http://192.168.1.12:8000/",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: "http://192.168.1.12:8000/",
});


