import axios from 'axios';

// Create an Axios instance configured with the backend API baseURL
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add request interceptors to inject auth tokens
apiClient.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('farmvista_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
