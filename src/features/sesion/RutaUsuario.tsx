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

export function InicioUsuario() {
    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <section
                className="rounded-lg border border-eventu-border bg-eventu-white-surface p-6"
                role="status"
            >
                <h1 className="text-xl font-semibold text-eventu-main-ink">
                    Sesión iniciada exitosamente, el listado de eventos estará disponible en la próxima versión.
                </h1>
            </section>
        </main>
    );
}