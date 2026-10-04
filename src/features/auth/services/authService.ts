import { axiosClient } from "../../../api"; //Importar cliente axios
import type { 
    AutenticacionDTO, 
    RegistroDTO, 
    RespuestaRegistro,
    RespuestaAutenticacion
} from "../../../types/auth"; //Importar DTOs

export const registrarUsuario = async (data: RegistroDTO): Promise<RespuestaRegistro> => {
    const response = await axiosClient.post<RespuestaRegistro>('/auth/registro', data);
    return response.data;
};

export const autenticarUsuario = async(data: AutenticacionDTO): Promise<RespuestaAutenticacion> => {
    const response = await axiosClient.post<RespuestaAutenticacion>('/auth/login', data);
    return response.data;
}