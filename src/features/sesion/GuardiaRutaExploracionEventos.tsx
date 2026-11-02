import { Navigate, Outlet } from 'react-router-dom';
import { esOrganizador, esUsuario, obtenerSesion } from './sesion';

export function RutaExploracionEventos() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }
    if (!esUsuario(sesion) && !esOrganizador(sesion)) {
        return <Navigate to="/no-autorizado" replace />;
    }
    return <Outlet />;
}
