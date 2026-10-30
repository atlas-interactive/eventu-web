import { Navigate, Outlet } from 'react-router-dom';
import { esUsuario, obtenerRutaInicio, obtenerSesion } from './sesion';

export function RutaUsuario() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }
    if (!esUsuario(sesion)) {
        return <Navigate to={obtenerRutaInicio(sesion)} replace />;
    }
    return <Outlet />;
}