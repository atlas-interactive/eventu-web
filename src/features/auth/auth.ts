//Data transfer object a enviar para registrar un usuario
export interface RegisterDTO {
    nombre: string;
    email: string;
    password: string;
}

//Respuesta del servidor cuando el registro sea exitoso
export interface RegisterResponse {
    id: string | number;
    nombre: string;
    correo: string;
    token?: string;
    message?: string;
}