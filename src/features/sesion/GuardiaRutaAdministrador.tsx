import { Navigate, Outlet } from 'react-router-dom';
import { esAdministrador, obtenerSesion } from './sesion';

// Protege rutas exclusivas de ADMIN. La seguridad real está en el backend, esto solo evita mostrar la pantalla
export function RutaAdministrador() {
    const sesion = obtenerSesion();

    if (!sesion) {
        return <Navigate to="/login" replace />;
    }
    if (!esAdministrador(sesion)) {
        return <Navigate to="/no-autorizado" replace />;
    }
    return <Outlet />;
}