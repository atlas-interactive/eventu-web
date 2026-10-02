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