import axios from 'axios';

//Configuracion base de axios conectada con la URL de Render
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

//Adjuntar JWT en cada peticion
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Redirigir errores de autenticacion y autorizacion a sus pantallas correspondientes.
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (status === 403 && window.location.pathname !== '/no-autorizado') {
            window.location.href = '/no-autorizado';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
