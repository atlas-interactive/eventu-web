// Datos mínimos de la sesión. El login debe llamar a guardarSesion() con la respuesta del servidor.
// Cuando entre el PR de JWT, el backend tomará la identidad del token y esto solo servirá para la interfaz.
const CLAVE_TOKEN = 'auth_token';
const CLAVE_USUARIO = 'auth_usuario';

export interface SesionUsuario {
    usuarioId: number;
    nombre: string;
    correo: string;
    rol: string;
}

interface DatosLogin extends SesionUsuario {
    token: string;
}

export const guardarSesion = ({ token, ...usuario }: DatosLogin): void => {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
};

export const cerrarSesion = (): void => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
};

export const obtenerSesion = (): SesionUsuario | null => {
    try {
        const crudo = localStorage.getItem(CLAVE_USUARIO);
        return crudo ? (JSON.parse(crudo) as SesionUsuario) : null;
    } catch {
        return null;
    }
};

export const esAdministrador = (sesion: SesionUsuario | null): boolean =>
    sesion?.rol.toUpperCase() === 'ADMIN';