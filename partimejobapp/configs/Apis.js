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
    'employers-profile': "/employers/profile/",
    'add-job': "/jobs/",
};

export const authApis = (token) => {
    return axios.create({
        baseURL: "https://part-time-job-app-production.up.railway.app",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: "https://part-time-job-app-production.up.railway.app",
});


