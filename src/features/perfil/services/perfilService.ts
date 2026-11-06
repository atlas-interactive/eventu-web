import { axiosClient } from '../../../api';
import type { ActualizacionPerfil, PerfilUsuario } from '../../../types/perfil';

export interface SolicitudCambioContrasena {
    passwordActual: string;
    passwordNueva: string;
}

export interface RespuestaCambioContrasena {
    mensaje: string;
    token: string;
}

export interface RespuestaDesactivacionCuenta {
    mensaje: string;
}

export const obtenerPerfil = async (): Promise<PerfilUsuario> =>
    (await axiosClient.get<PerfilUsuario>('/perfil')).data;

export const actualizarPerfil = async (datos: ActualizacionPerfil): Promise<PerfilUsuario> =>
    (await axiosClient.put<PerfilUsuario>('/perfil', datos)).data;

export const cambiarContrasena = async (
    datos: SolicitudCambioContrasena,
): Promise<RespuestaCambioContrasena> => {
    const { data } = await axiosClient.put<RespuestaCambioContrasena>('/perfil/contrasena', datos);
    if (typeof data.token !== 'string' || !data.token.trim()) {
        throw new Error('El servidor no devolvió un token válido después del cambio de contraseña.');
    }
    return data;
};

export const desactivarCuenta = async (password: string): Promise<RespuestaDesactivacionCuenta> => {
    const { data } = await axiosClient.patch<RespuestaDesactivacionCuenta>('/perfil/desactivar', {
        password,
    });
    if (!data || typeof data.mensaje !== 'string' || !data.mensaje.trim()) {
        throw new Error('El servidor no devolvió un mensaje válido al desactivar la cuenta.');
    }
    return data;
};
