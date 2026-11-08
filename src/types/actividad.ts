export interface RegistroActividadItem {
    id: number;
    fecha: string;
    usuarioNombre: string | null;
    usuarioCorreo: string | null;
    accion: string;
    entidad: string;
    entidadId: number | null;
    resultado: string;
    motivo: string | null;
}
