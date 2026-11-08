import { FiltrosActividad } from './components/FiltrosActividad';
import { PaginacionActividad } from './components/PaginacionActividad';
import { TablaActividad } from './components/TablaActividad';
import '../../styles/actividad.css';

export function RegistroActividad() {
    return (
        <main className="actividad-pagina">
            <header className="actividad-encabezado">
                <div>
                    <h1>Registro de actividad</h1>
                    <p>Quién hizo qué en EventU y cómo terminó. Del más reciente al más antiguo.</p>
                </div>
                <span className="actividad-insignia-solo-lectura">
                    Solo lectura: los registros no se pueden editar ni eliminar
                </span>
            </header>

            <FiltrosActividad />

            <div className="actividad-resumen" aria-live="polite">
                <strong>0 registros</strong>
            </div>

            <TablaActividad registros={[]} />
            <PaginacionActividad totalRegistros={0} />
        </main>
    );
}
