import axios from "axios";

export const endpoints = {
    'loginFb': "/auth/facebook/login/",
    'loginGg': "/auth/google/login/",
    'refresh': "/auth/refresh/",
    'login': "/auth/login/",
    'logout': "/auth/logout/",
    'register': "/auth/register/",
    'current-user': "/users/me/",
    'change-password': "/users/me/change_password/",

    'jobs': "/jobs/",
    'job': (jobID) => `/jobs/${jobID}/`,
    'industries': "/industries/",
    'comments': (jobID) => `/jobs/${jobID}/comments/`,
    'replies': (commentID) => `/comments/${commentID}/replies/`,
    'applications': '/users/me/applications',
    'employers': "/employers/",
    'follow': (employerID) => `/employers/${employerID}/follow/`,

    'firebase-token': '/chat/firebase-token/',

    'follow': (employerID) => `/employers/${employerID}/follow/`,
    'employers-profile': "/employers/profile/",
    'add-job': "/jobs/",
    'industries': "/industries/",
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


