import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { FormularioLogin } from './features/auth/FormularioLogin';
import { FormularioRegistro } from './features/auth/FormularioRegistro';
import { GestionCategorias } from './features/categorias/GestionCategorias';
import { RutaAdministrador } from './features/sesion/RutaAdministrador';

// Pantallas de autenticación: tarjeta centrada
function LayoutAutenticacion() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-eventu-page-background p-2.5">
            <Outlet />
        </div>
    );
}

// Pantallas internas: barra superior y contenido a lo ancho
function LayoutAplicacion() {
    return (
        <div className="min-h-screen bg-eventu-page-background">
            <header className="border-b border-eventu-border bg-eventu-white-surface px-8 py-5">
                <p className="text-[1.0625rem] font-semibold text-eventu-main-ink">EventU</p>
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

                <Route element={<RutaAdministrador />}>
                    <Route element={<LayoutAplicacion />}>
                        <Route path="/admin/categorias" element={<GestionCategorias />} />
                    </Route>
                </Route>

                <Route element={<LayoutAplicacion />}>
                    <Route
                        path="/no-autorizado"
                        element={
                            <main className="mx-auto max-w-[70rem] px-8 py-8">
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