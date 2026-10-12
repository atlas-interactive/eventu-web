import { isAxiosError } from 'axios';

const MENSAJE_INESPERADO = 'Ocurrió un error inesperado al conectar con el servidor.';

// Muestra el mensaje que envía el backend ({"error": "..."}), por ejemplo el 409 de un evento cancelado
export const mensajeDeError = (err: unknown): string => {
    if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
        return err.response.data.error;
    }
    return MENSAJE_INESPERADO;
};
