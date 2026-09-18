import axios from "axios";

const apiHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.hostname
    : 'localhost';

const client = axios.create({
    baseURL: `http://${apiHost}:5000/api`
});

client.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    const lang = localStorage.getItem("language") || "en";

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Accept-Language'] = lang;

    return config;
});

export default client;
