import { Routes, Route, Navigate } from 'react-router-dom';
import { FormularioLogin } from '../features/auth/FormularioLogin';
import { FormularioRegistro } from '../features/auth/FormularioRegistro';
import { GestionCategorias } from '../features/categorias/GestionCategorias';
import { RutaAdministrador } from '../features/sesion/GuardiaRutaAdministrador';
import { GestionOrganizadores } from '../features/usuarios/GestionOrganizadores';
import { CrearEvento } from '../features/eventos/CrearEvento';
import { EditarEvento } from '../features/eventos/EditarEvento';
import { MisEventos } from '../features/eventos/MisEventos';
import { DashboardEstadisticas } from '../features/estadisticas/DashboardEstadisticas';
import { RutaOrganizador } from '../features/sesion/GuardiaRutaOrganizador';
import { InicioUsuario, RutaUsuario } from '../features/sesion/GuardiaRutaUsuario';
import { LayoutAutenticacion } from '../components/layout/LayoutAutenticacion';
import { LayoutAplicacion } from '../components/layout/LayoutAplicacion';
import { obtenerRutaInicio, obtenerSesion } from '../features/sesion/sesion';
    
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
                <Route path="/login" element={<RutaLogin />} />
                <Route path="/registro" element={<FormularioRegistro />} />
            </Route>

            {/* Cada guardia y layout se aplica a todas las rutas anidadas en su grupo. */}
            <Route element={<RutaAdministrador />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/admin/categorias" element={<GestionCategorias />} />
                    <Route path="/admin/usuarios" element={<GestionOrganizadores />} />
                    <Route path="/admin/estadisticas" element={<DashboardEstadisticas />} />
                </Route>
            </Route>

            <Route element={<RutaOrganizador />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/organizador/eventos" element={<MisEventos />} />
                    <Route path="/organizador/eventos/nuevo" element={<CrearEvento />} />
                    <Route path="/organizador/eventos/:id/editar" element={<EditarEvento />} />
                    <Route path="/organizador/estadisticas" element={<DashboardEstadisticas />} />
                </Route>
            </Route>

            <Route element={<RutaUsuario />}>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/usuario" element={<InicioUsuario />} />
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