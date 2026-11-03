import { axiosClient } from "../../../api"; //Importar cliente axios
import type { 
    AutenticacionDTO, 
    RegistroDTO, 
    RespuestaRegistro,
    RespuestaAutenticacion,
    SolicitudRecuperacionContrasenaDTO,
    RestablecerContrasenaDTO,
    RespuestaRecuperacionContrasena,
} from "../../../types/auth"; //Importar DTOs

export const registrarUsuario = async (data: RegistroDTO): Promise<RespuestaRegistro> => {
    const response = await axiosClient.post<RespuestaRegistro>('/auth/registro', data);
    return response.data;
};

export const autenticarUsuario = async(data: AutenticacionDTO): Promise<RespuestaAutenticacion> => {
    const response = await axiosClient.post<RespuestaAutenticacion>('/auth/login', data);
    return response.data;
}

export const solicitarRecuperacionContrasena = async (
    data: SolicitudRecuperacionContrasenaDTO,
): Promise<RespuestaRecuperacionContrasena> => {
    const response = await axiosClient.post<RespuestaRecuperacionContrasena>(
        '/auth/recuperar-contrasena',
        data,
    );
    return response.data;
};

export const restablecerContrasena = async (
    data: RestablecerContrasenaDTO,
): Promise<RespuestaRecuperacionContrasena> => {
    const response = await axiosClient.post<RespuestaRecuperacionContrasena>(
        '/auth/restablecer-contrasena',
        data,
    );
    return response.data;
};