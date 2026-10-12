// Respuesta del backend para un usuario (UsuarioResponseDTO)
export interface UsuarioBuscado {
    id: number;
    nombre: string;
    correo: string;
    // USUARIO, ORGANIZADOR o ADMIN
    rol: string;
}

// Respuesta de asignar y revocar el rol de organizador
export interface RespuestaCambioRol {
    mensaje: string;
    usuarioId: number;
    rol: string;
}
