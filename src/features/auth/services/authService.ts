import { axiosClient } from "../../../api"; //Importar cliente axios
import type { RegistroDTO, RespuestaRegistro } from "../../../types/auth"; //Importar DTOs

export const registrarUsuario = async (data: RegistroDTO): Promise<RespuestaRegistro> => {
    const response = await axiosClient.post<RespuestaRegistro>('/auth/registro', data);
    return response.data;
};
