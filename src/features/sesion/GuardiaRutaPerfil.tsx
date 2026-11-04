import { Navigate, Outlet } from 'react-router-dom';
import { esAdministrador, esOrganizador, esUsuario, obtenerSesion } from './sesion';

export function RutaPerfil() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }
    if (!esAdministrador(sesion) && !esOrganizador(sesion) && !esUsuario(sesion)) {
        return <Navigate to="/no-autorizado" replace />;
    }
    return <Outlet />;
}
