import { lazy, Suspense, type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RutaAdministrador } from '../features/sesion/GuardiaRutaAdministrador';
import { RutaOrganizador } from '../features/sesion/GuardiaRutaOrganizador';
import { RutaUsuario } from '../features/sesion/GuardiaRutaUsuario';
import { LayoutAutenticacion } from '../components/layout/LayoutAutenticacion';
import { LayoutAplicacion } from '../components/layout/LayoutAplicacion';
import { obtenerRutaInicio, obtenerSesion } from '../features/sesion/sesion';
import { SkeletonAutenticacion, SkeletonPagina } from '../components/ui/Skeleton';

const FormularioLogin = lazy(() =>
    import('../features/auth/FormularioLogin').then((modulo) => ({ default: modulo.FormularioLogin })),
);
const FormularioRegistro = lazy(() =>
    import('../features/auth/FormularioRegistro').then((modulo) => ({ default: modulo.FormularioRegistro })),
);
const GestionCategorias = lazy(() =>
    import('../features/categorias/GestionCategorias').then((modulo) => ({ default: modulo.GestionCategorias })),
);
const GestionOrganizadores = lazy(() =>
    import('../features/usuarios/GestionOrganizadores').then((modulo) => ({ default: modulo.GestionOrganizadores })),
);
const CrearEvento = lazy(() =>
    import('../features/eventos/CrearEvento').then((modulo) => ({ default: modulo.CrearEvento })),
);
const EditarEvento = lazy(() =>
    import('../features/eventos/EditarEvento').then((modulo) => ({ default: modulo.EditarEvento })),
);
const MisEventos = lazy(() =>
    import('../features/eventos/MisEventos').then((modulo) => ({ default: modulo.MisEventos })),
);
const DashboardEstadisticas = lazy(() =>
    import('../features/estadisticas/DashboardEstadisticas').then((modulo) => ({ default: modulo.DashboardEstadisticas })),
);
const InicioUsuario = lazy(() =>
    import('../features/sesion/InicioUsuario').then((modulo) => ({ default: modulo.InicioUsuario })),
);

const pantallaDiferida = (pantalla: ReactNode, fallback: ReactNode = <SkeletonPagina />) => (
    <Suspense fallback={fallback}>{pantalla}</Suspense>
);
    
export function RutaLogin() {
    const sesion = obtenerSesion();
    if (sesion) {
        return <Navigate to={obtenerRutaInicio(sesion)} replace />;
    }
    return <FormularioLogin />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<LayoutAutenticacion />}>
                <Route path="/login" element={pantallaDiferida(<RutaLogin />, <SkeletonAutenticacion />)} />
                <Route path="/registro" element={pantallaDiferida(<FormularioRegistro />, <SkeletonAutenticacion />)} />
            </Route>

            {/* Cada guardia y layout se aplica a todas las rutas anidadas en su grupo. */}
            <Route element={<RutaAdministrador />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/admin/categorias" element={pantallaDiferida(<GestionCategorias />)} />
                    <Route path="/admin/usuarios" element={pantallaDiferida(<GestionOrganizadores />)} />
                    <Route path="/admin/estadisticas" element={pantallaDiferida(<DashboardEstadisticas />)} />
                </Route>
            </Route>

            <Route element={<RutaOrganizador />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/organizador/eventos" element={pantallaDiferida(<MisEventos />)} />
                    <Route path="/organizador/eventos/nuevo" element={pantallaDiferida(<CrearEvento />)} />
                    <Route path="/organizador/eventos/:id/editar" element={pantallaDiferida(<EditarEvento />)} />
                    <Route path="/organizador/estadisticas" element={pantallaDiferida(<DashboardEstadisticas />)} />
                </Route>
            </Route>

            <Route element={<RutaUsuario />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/usuario" element={pantallaDiferida(<InicioUsuario />)} />
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
    )
}