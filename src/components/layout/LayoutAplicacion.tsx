import { useEffect, useRef, useState } from 'react';
import { Activity, CalendarCog, CalendarDays, ChartPie, Check, ChevronDown, ClipboardList, LogOut, Menu, Moon, Tags, UserCog, UserRound, PersonStanding, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { PanelAccesibilidad } from '../../features/accesibilidad/PanelAccesibilidad';
import { useAccesibilidad } from '../../features/accesibilidad/useAccesibilidad';
import {
    cerrarSesion,
    esAdministrador,
    esUsuario,
    EVENTO_SESION_ACTUALIZADA,
    obtenerSesion,
    puedeGestionarEventos,
} from '../../features/sesion/sesion';
import { cambiarIdioma, IDIOMAS, type Idioma } from '../../i18n';
import iconoEventU from '../../assets/icons/iconoEventU.png';

const CLAVE_ROL: Record<string, string> = {
    ADMIN: 'comun.roles.admin',
    ORGANIZADOR: 'comun.roles.organizador',
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
    const [navegacionAbierta, setNavegacionAbierta] = useState(false);
    const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
    const [elementoFocoAccesibilidad, setElementoFocoAccesibilidad] = useState<HTMLElement | null>(null);
    const [sesion, setSesion] = useState(obtenerSesion);
    const { preferencias, actualizarPreferencia } = useAccesibilidad();
    const menuRef = useRef<HTMLDivElement>(null);
    const botonMenuRef = useRef<HTMLButtonElement>(null);
    const navegacionRef = useRef<HTMLElement>(null);
    const botonNavegacionRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const idiomaActual: Idioma = i18n.resolvedLanguage === 'en' ? 'en' : 'es';
    const nombreUsuario = sesion ? nombreVisible(sesion.nombre) : '';
    const etiquetaRol = sesion ? CLAVE_ROL[sesion.rol.toUpperCase()] : undefined;

    useEffect(() => {
        const actualizarSesion = () => setSesion(obtenerSesion());
        window.addEventListener(EVENTO_SESION_ACTUALIZADA, actualizarSesion);
        return () => window.removeEventListener(EVENTO_SESION_ACTUALIZADA, actualizarSesion);
    }, []);

    useEffect(() => {
        if (!menuAbierto && !navegacionAbierta) return;

        const cerrarAlHacerClicFuera = (evento: MouseEvent) => {
            if (
                evento.target instanceof Node &&
                !menuRef.current?.contains(evento.target) &&
                !navegacionRef.current?.contains(evento.target) &&
                !botonNavegacionRef.current?.contains(evento.target)
            ) {
                setMenuAbierto(false);
                setNavegacionAbierta(false);
            }
        };
        const cerrarConEscape = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') {
                setMenuAbierto(false);
                setNavegacionAbierta(false);
                if (menuAbierto) botonMenuRef.current?.focus();
                else botonNavegacionRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', cerrarAlHacerClicFuera);
        document.addEventListener('keydown', cerrarConEscape);
        return () => {
            document.removeEventListener('mousedown', cerrarAlHacerClicFuera);
            document.removeEventListener('keydown', cerrarConEscape);
        };
    }, [menuAbierto, navegacionAbierta]);

    const salir = () => {
        cerrarSesion();
        navigate('/login', { replace: true });
    };

    const claseEnlace = ({ isActive }: { isActive: boolean }) =>
        `inline-flex h-full items-center text-sm ${
            isActive
                ? "relative font-semibold text-eventu-institutional-red after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-eventu-institutional-red after:content-['']"
                : 'text-eventu-main-ink hover:underline'
        } max-[769px]:h-10 max-[769px]:w-full max-[769px]:justify-start max-[769px]:rounded-md max-[769px]:px-3`;

    return (
        <div className="min-h-screen bg-eventu-page-background">
            <header className="cabecera-aplicacion border-b border-eventu-border bg-eventu-white-surface">
                <div className="relative mx-auto flex w-full flex-col gap-2 px-8 py-2 sm:min-h-[58px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:px-10 sm:py-0 max-[769px]:flex-row max-[769px]:flex-nowrap max-[769px]:items-center max-[769px]:justify-between max-[769px]:gap-2 max-[769px]:px-3 max-[769px]:py-2">
                    <div className="flex min-w-0 items-center justify-between gap-4 sm:flex-auto sm:justify-start sm:gap-x-8 max-[769px]:flex-1 max-[769px]:justify-start max-[769px]:gap-2">
                        {sesion && (
                            <button
                                ref={botonNavegacionRef}
                                type="button"
                                aria-label={navegacionAbierta ? t('layout.cerrarNavegacion') : t('layout.abrirNavegacion')}
                                aria-expanded={navegacionAbierta}
                                aria-controls="navegacion-principal"
                                onClick={() => {
                                    setNavegacionAbierta((abierta) => !abierta);
                                    setMenuAbierto(false);
                                }}
                                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red max-[769px]:inline-flex"
                            >
                                {navegacionAbierta ? (
                                    <X className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Menu className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        )}
                        <div className="marca-eventu flex min-w-0 items-center gap-2 sm:gap-3 max-[769px]:absolute max-[769px]:left-1/2 max-[769px]:-translate-x-1/2 max-[769px]:gap-1.5">
                            <img
                                src={iconoEventU}
                                alt="EventU"
                                className="h-8 w-8.5 flex-none max-[769px]:h-7 max-[769px]:w-7"
                            />
                            <p className="marca-eventu-texto self-center whitespace-nowrap text-lg font-semibold text-eventu-main-ink max-[769px]:text-base">Event<span className="text-eventu-institutional-red">U</span></p>
                        </div>
                        
                        {sesion && (
                            <nav
                                ref={navegacionRef}
                                id="navegacion-principal"
                                aria-label={t('layout.navegacionPrincipal')}
                                onClick={() => setNavegacionAbierta(false)}
                                className={`flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:justify-start sm:gap-x-4 sm:self-stretch max-[769px]:absolute max-[769px]:left-3 max-[769px]:right-3 max-[769px]:top-full max-[769px]:z-50 max-[769px]:flex-col max-[769px]:items-stretch max-[769px]:gap-1 max-[769px]:rounded-lg max-[769px]:border max-[769px]:border-eventu-border max-[769px]:bg-eventu-white-surface max-[769px]:p-2 max-[769px]:shadow-lg${navegacionAbierta ? '' : ' max-[769px]:hidden'}`}
                            >
                                {esAdministrador(sesion) && (
                                    <>
                                        <NavLink to="/admin/categorias" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <Tags className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('layout.categorias')}
                                        </NavLink>
                                        <NavLink to="/admin/usuarios" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <UserCog className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('layout.organizadores')}
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
                                                {t('layout.explorarEventos')}
                                            </NavLink>
                                        )}
                                        {!esAdministrador(sesion) && (
                                            <NavLink
                                                to="/mis-inscripciones"
                                                className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                            >
                                                <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                {t('layout.misInscripciones')}
                                            </NavLink>
                                        )}
                                        <NavLink to="/organizador/eventos" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                            <CalendarCog className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {esAdministrador(sesion) ? t('layout.eventos') : t('layout.misEventos')}
                                        </NavLink>
                                        <NavLink
                                            to={esAdministrador(sesion) ? '/admin/estadisticas' : '/organizador/estadisticas'}
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <ChartPie className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('layout.estadisticas')}
                                        </NavLink>
                                    </>
                                )}
                                {esAdministrador(sesion) && (
                                    <NavLink to="/admin/actividad" className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}>
                                        <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {t('layout.actividad')}
                                    </NavLink>
                                )}
                                {esUsuario(sesion) && (
                                    <>
                                        <NavLink
                                            to="/eventos"
                                            end
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('layout.eventosEnCampus')}
                                        </NavLink>
                                        <NavLink
                                            to="/mis-inscripciones"
                                            className={({ isActive }) => `${claseEnlace({ isActive })} gap-1.5`}
                                        >
                                            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('layout.misInscripciones')}
                                        </NavLink>
                                    </>
                                )}
                            </nav>
                        )}
                    </div>
                    {sesion && (
                        <div
                            ref={menuRef}
                            onBlur={(evento) => {
                                if (!evento.currentTarget.contains(evento.relatedTarget)) setMenuAbierto(false);
                            }}
                            className="relative sm:ml-auto sm:flex-none max-[639px]:shrink-0"
                        >
                            <button
                                ref={botonMenuRef}
                                type="button"
                                aria-label={t('layout.menuPerfil', { nombre: nombreUsuario })}
                                aria-expanded={menuAbierto}
                                aria-controls="menu-perfil"
                                onClick={() => setMenuAbierto((abierto) => !abierto)}
                                title={t('layout.menuPerfilTitulo')}
                                className="flex min-w-0 items-center border-1 border-eventu-border justify-center sm:gap-0 rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red hover:bg-eventu-page-background sm:gap-3 sm:px-2.25 sm:py-1.25 shadow max-[639px]:h-10 max-[639px]:w-16 max-[639px]:gap-1 max-[639px]:rounded-full max-[639px]:px-1"
                            >
                                <span
                                    role="img"
                                    aria-label={t('layout.avatar', { nombre: nombreUsuario })}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-eventu-soft-red-background text-lg font-medium text-eventu-institutional-red max-[639px]:h-8 max-[639px]:w-8 max-[639px]:text-base"
                                >
                                    {inicialesNombre(nombreUsuario)}
                                </span>
                                <span className="flex min-w-0 flex-col items-start gap-1 max-[639px]:hidden">
                                    <span
                                        className="block truncate text-sm leading-4 text-eventu-main-ink sm:max-w-44 lg:max-w-64"
                                        title={nombreUsuario}
                                    >
                                        {nombreUsuario}
                                    </span>
                                    {etiquetaRol && (
                                        <span className="inline-block rounded text-xs leading-3 text-eventu-institutional-red">
                                            {t(etiquetaRol)}
                                        </span>
                                    )}
                                </span>
                                <ChevronDown
                                    className="h-4 w-4 shrink-0 text-eventu-secondary-text opacity-100 transition-opacity group-hover:opacity- group-focus-visible:opacity-100 max-[639px]:h-4 max-[639px]:w-4"
                                    aria-hidden="true"
                                />
                            </button>
                            {menuAbierto && (
                                <div
                                    id="menu-perfil"
                                    role="group"
                                    aria-label={t('layout.opcionesPerfil')}
                                    className="absolute right-0 top-full z-50 mt-2 w-48 max-w-[calc(100vw-1.5rem)] rounded-md border border-eventu-border bg-eventu-white-surface p-1 shadow-lg"
                                >
                                    <NavLink
                                        to="/perfil"
                                        onClick={() => setMenuAbierto(false)}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <UserRound className="h-4 w-4" aria-hidden="true" />
                                        {t('layout.perfil')}
                                    </NavLink>
                                    <button
                                        type="button"
                                        aria-pressed={preferencias.tema === 'oscuro'}
                                        onClick={() =>
                                            actualizarPreferencia(
                                                'tema',
                                                preferencias.tema === 'oscuro' ? 'claro' : 'oscuro',
                                            )
                                        }
                                        className="flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" aria-hidden="true" />
                                            {t('layout.modoOscuro')}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className={`relative h-5 w-9 rounded-full transition-colors ${
                                                preferencias.tema === 'oscuro'
                                                    ? 'bg-eventu-institutional-red'
                                                    : 'bg-eventu-disabled-button'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-eventu-white-surface shadow transition-transform ${
                                                    preferencias.tema === 'oscuro'
                                                        ? 'translate-x-4'
                                                        : 'translate-x-0.5'
                                                }`}
                                            />
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        aria-haspopup="dialog"
                                        onClick={() => {
                                            setElementoFocoAccesibilidad(botonMenuRef.current);
                                            setMenuAbierto(false);
                                            setAccesibilidadAbierta(true);
                                        }}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <PersonStanding className="h-4 w-4" aria-hidden="true" />
                                        {t('layout.accesibilidad')}
                                    </button>
                                    <hr className="mx-2 my-1 border-t border-eventu-border" />
                                    <div role="group" aria-label={t('layout.idioma')} className="px-1 py-1">
                                        <p className="px-2 pb-1 text-xs font-medium text-eventu-secondary-text">
                                            {t('layout.idioma')}
                                        </p>
                                        {IDIOMAS.map((idioma) => (
                                            <button
                                                key={idioma}
                                                type="button"
                                                aria-pressed={idiomaActual === idioma}
                                                onClick={() => cambiarIdioma(idioma)}
                                                className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                            >
                                                {idioma === 'es' ? t('layout.espanol') : t('layout.ingles')}
                                                {idiomaActual === idioma && (
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <hr className="mx-2 my-1 border-t border-eventu-border" />
                                    <button
                                        type="button"
                                        onClick={salir}
                                        className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:bg-eventu-page-background focus-visible:outline-none"
                                    >
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        {t('layout.cerrarSesion')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>
            <Outlet />
            {accesibilidadAbierta && (
                <PanelAccesibilidad
                    onCerrar={() => setAccesibilidadAbierta(false)}
                    elementoFocoRestaurar={elementoFocoAccesibilidad}
                />
            )}
        </div>
    );
}
