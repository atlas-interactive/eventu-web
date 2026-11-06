import { useEffect, useRef, useState } from 'react';
import { CalendarCog, CalendarDays, ChartPie, ChevronDown, ClipboardList, LogOut, Tags, UserCog, UserRound, PersonStanding } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    cerrarSesion,
    esAdministrador,
    esUsuario,
    EVENTO_SESION_ACTUALIZADA,
    obtenerSesion,
    puedeGestionarEventos,
} from '../../features/sesion/sesion';
import iconoEventU from '../../assets/icons/iconoEventU.png';

const ETIQUETA_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZADOR: 'Organizador',
};

const nombreVisible = (nombre: string): string => {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length <= 2) return partes.join(' ');
    if (partes.length === 3) return `${partes[0]} ${partes[1]}`;
    return `${partes[0]} ${partes[2]}`;
};

const inicialesNombre = (nombre: string): string =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('');

// Pantallas internas: barra superior a todo el ancho (como el mockup) y contenido centrado debajo
export function LayoutAplicacion() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [sesion, setSesion] = useState(obtenerSesion);
    const menuRef = useRef<HTMLDivElement>(null);
    const botonMenuRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const nombreUsuario = sesion ? nombreVisible(sesion.nombre) : '';

    useEffect(() => {
        const actualizarSesion = () => setSesion(obtenerSesion());
        window.addEventListener(EVENTO_SESION_ACTUALIZADA, actualizarSesion);
        return () => window.removeEventListener(EVENTO_SESION_ACTUALIZADA, actualizarSesion);
    }, []);

    useEffect(() => {
        if (!menuAbierto) return;

        const cerrarAlHacerClicFuera = (evento: MouseEvent) => {
            if (evento.target instanceof Node && !menuRef.current?.contains(evento.target)) {
                setMenuAbierto(false);
            }
        };
        const cerrarConEscape = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') {
                setMenuAbierto(false);
                botonMenuRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', cerrarAlHacerClicFuera);
        document.addEventListener('keydown', cerrarConEscape);
        return () => {
            document.removeEventListener('mousedown', cerrarAlHacerClicFuera);
            document.removeEventListener('keydown', cerrarConEscape);
        };
    }, [menuAbierto]);

    const salir = () => {
        cerrarSesion();
        navigate('/login', { replace: true });
    };

    const claseEnlace = ({ isActive }: { isActive: boolean }) =>
        `inline-flex h-full items-center text-sm ${
            isActive
                ? "relative font-semibold text-eventu-institutional-red after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-eventu-institutional-red after:content-['']"
                : 'text-eventu-main-ink hover:underline'
        }`;

    return (
        <div className="min-h-screen bg-eventu-page-background">
            <header className="border-b border-eventu-border bg-eventu-white-surface">
                <div className="mx-auto flex w-full flex-col gap-2 px-8 py-2 sm:min-h-[58px] sm:flex-row sm:items-center sm:gap-x-4 sm:gap-y-2 sm:px-10 sm:py-0">
                    <div className="flex min-w-0 items-center justify-between gap-4 sm:flex-none sm:justify-start sm:gap-x-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <img
                                src={iconoEventU}
                                alt="EventU"
                                className="h-8 w-8.5 flex-none"
                            />
                            <p className="self-center text-[1.075rem] font-semibold text-eventu-main-ink">Event<span className="text-eventu-institutional-red">U</span></p>
                        </div>
                        
                        {sesion && (
                            <nav
                                aria-label="Principal"
                                className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:flex-nowrap sm:justify-start sm:gap-x-4 sm:self-stretch"
                            >
                                {esAdministrador(sesion) && (
                                    <>
                                        <NavLink to="/admin/categorias" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <Tags className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            Categorías
                                        </NavLink>
                                        <NavLink to="/admin/usuarios" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <UserCog className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            Organizadores
                                        </NavLink>
                                    </>
                                )}
                                {puedeGestionarEventos(sesion) && (
                                    <>
                                        {!esAdministrador(sesion) && (
                                            <NavLink
                                                to="/eventos"
                                                end
                                                className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                            >
                                                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                Explorar eventos
                                            </NavLink>
                                        )}
                                        {!esAdministrador(sesion) && (
                                            <NavLink
                                                to="/mis-inscripciones"
                                                className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                            >
                                                <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                Mis inscripciones
                                            </NavLink>
                                        )}
                                        <NavLink to="/organizador/eventos" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <CalendarCog className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {esAdministrador(sesion) ? 'Eventos' : 'Mis eventos'}
                                        </NavLink>
                                        <NavLink
                                            to={esAdministrador(sesion) ? '/admin/estadisticas' : '/organizador/estadisticas'}
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <ChartPie className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            Estadísticas
                                        </NavLink>
                                    </>
                                )}
                                {esUsuario(sesion) && (
                                    <>
                                        <NavLink
                                            to="/eventos"
                                            end
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            Eventos en campus
                                        </NavLink>
                                        <NavLink
                                            to="/mis-inscripciones"
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            Mis inscripciones
                                        </NavLink>
                                    </>
                                )}
                            </nav>
                        )}
                    </div>
                    {sesion && (
                        <div ref={menuRef} className="relative sm:ml-auto sm:flex-none">
                            <button
                                ref={botonMenuRef}
                                type="button"
                                aria-label={`Menú de perfil de ${nombreUsuario}`}
                                aria-haspopup="menu"
                                aria-expanded={menuAbierto}
                                aria-controls="menu-perfil"
                                onClick={() => setMenuAbierto((abierto) => !abierto)}
                                title="Menú de perfil"
                                className="flex min-w-0 items-center border-1 border-eventu-border justify-center sm:gap-0 rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red hover:bg-eventu-page-background sm:gap-3 sm:px-2.25 sm:py-1.25 shadow"
                            >
                                <span
                                    role="img"
                                    aria-label={`Avatar de ${nombreUsuario}`}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-eventu-soft-red-background text-lg font-medium text-eventu-institutional-red"
                                >
                                    {inicialesNombre(nombreUsuario)}
                                </span>
                                <span className="flex min-w-0 flex-col items-start gap-1">
                                    <span
                                        className="block truncate text-[0.875rem] leading-4 text-eventu-main-ink sm:max-w-[11rem] lg:max-w-[16rem]"
                                        title={nombreUsuario}
                                    >
                                        {nombreUsuario}
                                    </span>
                                    {ETIQUETA_ROL[sesion.rol.toUpperCase()] && (
                                        <span className="inline-block rounded text-[0.675rem] leading-3 text-eventu-institutional-red">
                                            {ETIQUETA_ROL[sesion.rol.toUpperCase()]}
                                        </span>
                                    )}
                                </span>
                                <ChevronDown
                                    className="h-5 w-4 shrink-0 text-eventu-secondary-text opacity-100 transition-opacity group-hover:opacity- group-focus-visible:opacity-100"
                                    aria-hidden="true"
                                />
                            </button>
                            {menuAbierto && (
                                <div
                                    id="menu-perfil"
                                    role="menu"
                                    aria-label="Opciones de perfil"
                                    className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-eventu-border bg-eventu-white-surface p-1 shadow-lg"
                                >
                                    <NavLink
                                        to="/perfil"
                                        role="menuitem"
                                        onClick={() => setMenuAbierto(false)}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <UserRound className="h-4 w-4" aria-hidden="true" />
                                        Perfil
                                    </NavLink>
                                    <NavLink
                                        to=""
                                        role="menuitem"
                                        onClick={() => setMenuAbierto(false)}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none">
                                        <PersonStanding className="h-4 w-4" aria-hidden="true" />
                                        Accesibilidad
                                    </NavLink>
                                    <div role="separator" className="mx-2 my-1 border-t border-eventu-border" />
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={salir}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
            <Outlet />
        </div>
    );
}