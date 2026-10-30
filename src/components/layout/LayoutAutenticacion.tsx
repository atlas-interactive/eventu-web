import { Outlet } from "react-router-dom";

// Pantallas de autenticación: tarjeta centrada
export function LayoutAutenticacion() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-eventu-page-background p-4">
            <Outlet />
        </div>
    );
}