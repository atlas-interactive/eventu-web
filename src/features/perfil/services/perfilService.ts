import { axiosClient } from '../../../api';
import type { ActualizacionPerfil, PerfilUsuario } from '../types/perfil';

export const obtenerPerfil = async (): Promise<PerfilUsuario> =>
    (await axiosClient.get<PerfilUsuario>('/perfil')).data;

export const actualizarPerfil = async (datos: ActualizacionPerfil): Promise<PerfilUsuario> =>
    (await axiosClient.put<PerfilUsuario>('/perfil', datos)).data;
