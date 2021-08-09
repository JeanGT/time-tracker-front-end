import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_API_URL + '/api';
axios.interceptors.request.use(function (config) {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }

    return config;
});

axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (
            error.response.data.message == "Unauthenticated." &&
            error.response.status == 401
        ) {
            localStorage.setItem("token", "");
            window.location.href = "/auth";
        }
        return Promise.reject(error);
    }
);