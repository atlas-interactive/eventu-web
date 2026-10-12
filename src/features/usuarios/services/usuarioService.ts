import { axiosClient } from '../../../api';
import type { RespuestaCambioRol, UsuarioBuscado } from '../../../types/usuario';

// El administrador se identifica con el token JWT (el interceptor de axios lo envía), por eso no se manda su id

// Busca por nombre o correo. El backend responde 404 con {"error": "..."} si no hay coincidencias
export const buscarUsuarios = async (criterio: string): Promise<UsuarioBuscado[]> => {
    const { data } = await axiosClient.get<UsuarioBuscado[]>('/usuarios', { params: { criterio } });
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /usuarios no es una lista.');
    }
    return data;
};

// Lista a todos los organizadores actuales (requiere el endpoint GET /usuarios/organizadores, solo ADMIN)
export const listarOrganizadores = async (): Promise<UsuarioBuscado[]> => {
    const { data } = await axiosClient.get<UsuarioBuscado[]>('/usuarios/organizadores');
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /usuarios/organizadores no es una lista.');
    }
    return data;
};

export const asignarOrganizador = async (id: number): Promise<RespuestaCambioRol> =>
    (await axiosClient.put<RespuestaCambioRol>(`/usuarios/${id}/asignar-organizador`)).data;

// Revocar no elimina nada: el usuario conserva su cuenta y sus eventos
export const revocarOrganizador = async (id: number): Promise<RespuestaCambioRol> =>
    (await axiosClient.put<RespuestaCambioRol>(`/usuarios/${id}/revocar-organizador`)).data;
