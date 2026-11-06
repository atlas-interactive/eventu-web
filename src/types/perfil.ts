export interface PerfilUsuario {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    codigoInstitucional: string | null;
    creadoEn: string | null;
}

export interface ActualizacionPerfil {
    nombre: string;
    codigoInstitucional: string | null;
}
