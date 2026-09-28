import { axiosClient } from "../../../api"; //Importar cliente axios
import type { RegisterDTO, RegisterResponse } from "../../../types/auth"; //Importar DTOs

export const registerUser = async (data: RegisterDTO): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>('/auth/registro', data);
    return response.data;
};
