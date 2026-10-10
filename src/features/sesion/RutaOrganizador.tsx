import { Navigate, Outlet } from 'react-router-dom';
import { obtenerSesion, puedeGestionarEventos } from './sesion';

// Protege las pantallas de eventos (ORGANIZADOR o ADMIN). La seguridad real está en el backend
export function RutaOrganizador() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }
    if (!puedeGestionarEventos(sesion)) {
        return <Navigate to="/no-autorizado" replace />;
    }
    return <Outlet />;
}
