import axios from "axios";

export const endpoints = {
    'loginFb': "/auth/facebook/login/",
    'loginGg': "/auth/google/login/",
    'refresh': "/auth/refresh/",
    'login': "/auth/login/",
    'logout': "/auth/logout/",
    'register': "/auth/register/",
    'current-user': "/users/me/",
    'my-follows': '/users/me/follows/',
    'change-password': "/users/me/change_password/",
    'jobs': "/jobs/",
    'job': (jobID) => `/jobs/${jobID}/`,
    'industries': "/industries/",
    'comments': (jobID) => `/jobs/${jobID}/comments/`,
    'replies': (commentID) => `/comments/${commentID}/replies/`,
    'applications': '/users/me/applications/',
    'employers': "/employers/",
    'follow': (employerID) => `/employers/${employerID}/follow/`,
    'notifications': (followID) => `/company-follows/${followID}/toggle-notify/`,

    'firebase-token': '/chat/firebase-token/',
    'employers-profile': "/employers/profile/",
    'add-job': "/jobs/",
    'update-job': (jobID) => `/jobs/${jobID}/`,
    'em-application': (jobID) => `/jobs/${jobID}/applications/`,
    'update-application': (applicationID) => `/applications/${applicationID}/`,

};

export const authApis = (token) => {
    return axios.create({
        baseURL: "https://part-time-job-app-production.up.railway.app",
        // baseURL: "http://192.168.1.111:8000/",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: "https://part-time-job-app-production.up.railway.app",
    // baseURL: "http://192.168.1.111:8000/",
});


