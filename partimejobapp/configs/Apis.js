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
<<<<<<< HEAD

=======
>>>>>>> origin/frontend/login_register
    'jobs': "/jobs/",
    'job': (jobID) => `/jobs/${jobID}/`,
    'industries': "/industries/",
    'comments': (jobID) => `/jobs/${jobID}/comments/`,
    'replies': (commentID) => `/comments/${commentID}/replies/`,
    'applications': '/users/me/applications/',
    'employers': "/employers/",
    'follow': (employerID) => `/employers/${employerID}/follow/`,
<<<<<<< HEAD

    'firebase-token': '/chat/firebase-token/',
    'employers-profile': "/employers/profile/",
    'add-job': "/jobs/",
    'update-job': (jobID) => `/jobs/${jobID}/`,
    'em-application': (jobID) => `/jobs/${jobID}/applications/`,
    'update-application': (applicationID) => `/applications/${applicationID}/`
=======
    'employers-profile': "/employers/profile/",
    'self-jobs': "/employers/self-jobs/",
    'job-applications': (jobID) => `/jobs/${jobID}/applications/`,
    'application-detail': (id) => `/applications/${id}/`,
    'applications': "/applications/",
    'my-follows': '/users/me/follows/',
>>>>>>> origin/frontend/login_register
};

export const authApis = (token) => {
    return axios.create({
<<<<<<< HEAD
        // baseURL: "https://part-time-job-app-production.up.railway.app",
        baseURL: "http://192.168.1.111:8000/",
=======
        baseURL: "http://192.168.1.10:8000/",
>>>>>>> origin/frontend/login_register
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
<<<<<<< HEAD
    // baseURL: "https://part-time-job-app-production.up.railway.app",
    baseURL: "http://192.168.1.111:8000/",
=======
    baseURL: "http://192.168.1.10:8000/",
>>>>>>> origin/frontend/login_register
});


