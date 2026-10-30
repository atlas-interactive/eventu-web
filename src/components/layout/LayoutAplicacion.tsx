import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { obtenerSesion } from '../../features/sesion/sesion';
import { cerrarSesion, esAdministrador, puedeGestionarEventos } from '../../features/sesion/sesion';

const ETIQUETA_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZADOR: 'Organizador',
};

// Pantallas internas: barra superior a todo el ancho (como el mockup) y contenido centrado debajo
export function LayoutAplicacion() {
    const navigate = useNavigate();
    const sesion = obtenerSesion();

    const claseEnlace = ({ isActive }: { isActive: boolean }) =>
        `inline-flex h-full items-center text-sm ${
            isActive
                ? "relative font-semibold text-eventu-institutional-red after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-eventu-institutional-red after:content-['']"
                : 'text-eventu-main-ink hover:underline'
        }`;

    const salir = () => {
        cerrarSesion();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-eventu-page-background">
            <header className="border-b border-eventu-border bg-eventu-white-surface">
                <div className="mx-auto flex w-full max-w-[70rem] flex-col gap-2 px-3 py-2 sm:min-h-[58px] sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-2 sm:px-4 sm:py-0">
                    <div className="flex min-w-0 items-center justify-between gap-4 sm:flex-none sm:justify-start sm:gap-x-4">
                        <p className="self-center text-[1.0625rem] font-semibold text-eventu-main-ink">EventU</p>
                        {sesion && (
                            <nav
                                aria-label="Principal"
                                className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:flex-nowrap sm:justify-start sm:gap-x-4 sm:self-stretch"
                            >
                                {esAdministrador(sesion) && (
                                    <>
                                        <NavLink to="/admin/categorias" className={claseEnlace}>
                                            Categorías
                                        </NavLink>
                                        <NavLink to="/admin/usuarios" className={claseEnlace}>
                                            Organizadores
                                        </NavLink>
                                    </>
                                )}
                                {puedeGestionarEventos(sesion) && (
                                    <NavLink to="/organizador/eventos" className={claseEnlace}>
                                        {esAdministrador(sesion) ? 'Eventos' : 'Mis eventos'}
                                    </NavLink>
                                )}
                            </nav>
                        )}
                    </div>
                    {sesion && (
                        <div className="flex min-w-0 items-center justify-between gap-2 sm:ml-auto sm:flex-none sm:justify-end sm:gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-x-2 sm:flex-none">
                                <span
                                    className="min-w-0 flex-1 truncate text-sm text-eventu-secondary-text sm:max-w-[11rem] sm:flex-none lg:max-w-[16rem]"
                                    title={sesion.nombre}
                                >
                                    {sesion.nombre}
                                </span>
                                {ETIQUETA_ROL[sesion.rol.toUpperCase()] && (
                                    <span className="shrink-0 rounded bg-eventu-soft-red-background px-2 py-0.5 text-xs text-eventu-institutional-red">
                                        {ETIQUETA_ROL[sesion.rol.toUpperCase()]}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={salir}
                                className="min-h-8 shrink-0 whitespace-nowrap rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-2.5 py-1 text-xs text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red sm:min-h-9 sm:px-4 sm:text-sm"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <Outlet />
        </div>
    );
}