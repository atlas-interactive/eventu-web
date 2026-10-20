import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { cerrarSesion, esAdministrador, obtenerSesion, puedeGestionarEventos } from './features/sesion/sesion';import { FormularioLogin } from './features/auth/FormularioLogin';
import { FormularioRegistro } from './features/auth/FormularioRegistro';
import { GestionCategorias } from './features/categorias/GestionCategorias';
import { RutaAdministrador } from './features/sesion/RutaAdministrador';
import { GestionOrganizadores } from './features/usuarios/GestionOrganizadores';
import { CrearEvento } from './features/eventos/CrearEvento';
import { EditarEvento } from './features/eventos/EditarEvento';
import { MisEventos } from './features/eventos/MisEventos';
import { RutaOrganizador } from './features/sesion/RutaOrganizador';

// Pantallas de autenticación: tarjeta centrada
function LayoutAutenticacion() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-eventu-page-background p-4">
            <Outlet />
        </div>
    );
}

const ETIQUETA_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZADOR: 'Organizador',
};

// Pantallas internas: barra superior a todo el ancho (como el mockup) y contenido centrado debajo
function LayoutAplicacion() {
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
                <div className="flex min-h-[58px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:gap-x-8 sm:px-8 sm:py-0">
                    <p className="self-center text-[1.0625rem] font-semibold text-eventu-main-ink">EventU</p>
                    {sesion && (
                        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-6 sm:self-stretch">
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
                    {sesion && (
                        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
                            <span className="max-w-full break-words text-sm text-eventu-secondary-text">{sesion.nombre}</span>
                            {ETIQUETA_ROL[sesion.rol.toUpperCase()] && (
                                <span className="rounded bg-eventu-soft-red-background px-2 py-0.5 text-xs text-eventu-institutional-red">
                                    {ETIQUETA_ROL[sesion.rol.toUpperCase()]}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={salir}
                                className="min-h-9 rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-3 py-1 text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red sm:px-4"
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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<LayoutAutenticacion />}>
                    <Route path="/login" element={<FormularioLogin />} />
                    <Route path="/registro" element={<FormularioRegistro />} />
                </Route>

                {/* Cada guardia y layout se aplica a todas las rutas anidadas en su grupo. */}
                <Route element={<RutaAdministrador />}>
                    <Route element={<LayoutAplicacion />}>
                        <Route path="/admin/categorias" element={<GestionCategorias />} />
                        <Route path="/admin/usuarios" element={<GestionOrganizadores />} />
                    </Route>
                </Route>

                <Route element={<RutaOrganizador />}>
                    <Route element={<LayoutAplicacion />}>
                        <Route path="/organizador/eventos" element={<MisEventos />} />
                        <Route path="/organizador/eventos/nuevo" element={<CrearEvento />} />
                        <Route path="/organizador/eventos/:id/editar" element={<EditarEvento />} />
                    </Route>
                </Route>

                <Route element={<LayoutAplicacion />}>
                    <Route
                        path="/no-autorizado"
                        element={
                            <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
                                <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Sin permiso</h1>
                                <p className="mt-1 text-sm text-eventu-secondary-text">
                                    No tienes permisos para ver esta pantalla.
                                </p>
                            </main>
                        }
                    />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;