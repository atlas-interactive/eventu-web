//Data transfer object a enviar para registrar un usuario
export interface RegistroDTO {
    nombre: string;
    correo: string;
    password: string;
}

//Respuesta del servidor cuando el registro sea exitoso
export interface RespuestaRegistro {
    mensaje: string;
    usuarioId: bigint;
    correo: string;
    rol: string;
}

//Data transfer object a enviar para autenticar un usuario
export interface AutenticacionDTO {
    correo: string;
    password: string;
}

//Respuesta del servidor cuando la autenticación sea exitosa
export interface RespuestaAutenticacion {
    token: string;
    usuarioId: bigint;
    nombre: string
    correo: string;
    rol: string;
}