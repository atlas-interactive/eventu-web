import axios from 'axios';

//Configuracion base de axios conectada con la URL de Render
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
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

/*Manejar errores de sesion (401 / 403) y devolver a la seccion de Inicio de Sesion.

Resumen: cuando el token expira, este codigo lo interpreta automaticamente y 
pide iniciar sesion nuevamente.

Los tiempos de expiracion de tokens son configurados en el backend.*/
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
