import { isAxiosError } from 'axios';
import i18n from '../i18n';

// Muestra el mensaje que envía el backend ({"error": "..."}), por ejemplo el 409 de un evento cancelado
export const mensajeDeError = (err: unknown): string => {
    if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
        return err.response.data.error;
    }
    return i18n.t('comun.errorInesperado');
};
