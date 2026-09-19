import { axiosClient } from "../../../api"; //Importar cliente axios
import { RegisterDTO, RegisterResponse } from "../auth"; //Importar DTOs

export const registerUser = async (data: RegisterDTO): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>('/auth', data);
    return response.data;
};
