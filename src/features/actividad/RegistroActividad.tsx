import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FiltrosActividad as FiltrosActividadType, OpcionesFiltroActividad, PaginaActividad } from '../../types/actividad';
import { mensajeDeError } from '../../api/mensajeDeError';
import { FiltrosActividad } from './components/FiltrosActividad';
import { FiltrosActivosActividad } from './components/FiltrosActivosActividad';
import { PaginacionActividad } from './components/PaginacionActividad';
import { TablaActividad } from './components/TablaActividad';
import { TablaActividadSkeleton } from './components/TablaActividadSkeleton';
import { obtenerActividad, obtenerOpcionesActividad } from './services/actividadService';
import '../../styles/actividad.css';

const FILTROS_VACIOS: FiltrosActividadType = {
    accion: '',
    entidad: '',
    resultado: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: '',
};

const PAGINA_VACIA: PaginaActividad = {
    contenido: [],
    pagina: 0,
    tamano: 20,
    totalElementos: 0,
    totalPaginas: 0,
};

export function RegistroActividad() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('actividad.titulo')} | EventU`);
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [pagina, setPagina] = useState(0);
    const [datos, setDatos] = useState(PAGINA_VACIA);
    const [opciones, setOpciones] = useState<OpcionesFiltroActividad>({
        acciones: [],
        entidades: [],
        resultados: [],
    });
    const [cargandoOpciones, setCargandoOpciones] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [errorOpciones, setErrorOpciones] = useState('');
    const [errorConsulta, setErrorConsulta] = useState('');
    const hayFiltros = Object.values(filtros).some(Boolean);

    useEffect(() => {
        let vigente = true;
        obtenerOpcionesActividad()
            .then((resultado) => {
                if (vigente) setOpciones(resultado);
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las opciones de los filtros de actividad:', err);
                if (vigente) setErrorOpciones(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargandoOpciones(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    useEffect(() => {
        const controlador = new AbortController();
        obtenerActividad(filtros, pagina, controlador.signal)
            .then((resultado) => setDatos(resultado))
            .catch((err: unknown) => {
                if (controlador.signal.aborted) return;
                console.error('No se pudo consultar el registro de actividad:', err);
                setErrorConsulta(mensajeDeError(err));
                setDatos(PAGINA_VACIA);
            })
            .finally(() => {
                if (!controlador.signal.aborted) setCargando(false);
            });
        return () => controlador.abort();
    }, [filtros, pagina]);

    const cambiarFiltros = (nuevosFiltros: FiltrosActividadType) => {
        setFiltros(nuevosFiltros);
        setPagina(0);
        setCargando(true);
        setErrorConsulta('');
    };

    const cambiarPagina = (nuevaPagina: number) => {
        setPagina(nuevaPagina);
        setCargando(true);
        setErrorConsulta('');
    };

    const quitarFiltro = (campo: keyof FiltrosActividadType) => {
        if (campo === 'fechaDesde') {
            cambiarFiltros({ ...filtros, fechaDesde: '', fechaHasta: '' });
            return;
        }
        cambiarFiltros({ ...filtros, [campo]: '' });
    };

    return (
        <main className="actividad-pagina">
            <header className="actividad-encabezado">
                <div>
                    <h1>{t('actividad.titulo')}</h1>
                    <p>{t('actividad.descripcion')}</p>
                </div>
                <span className="actividad-insignia-solo-lectura">
                    {t('actividad.soloLectura')}
                </span>
            </header>

            <FiltrosActividad
                filtros={filtros}
                opciones={opciones}
                cargandoOpciones={cargandoOpciones}
                onChange={cambiarFiltros}
                onLimpiar={() => cambiarFiltros(FILTROS_VACIOS)}
            />

            <div className="actividad-resumen" aria-live="polite">
                <strong>{t('actividad.registros', { count: datos.totalElementos })}</strong>
                <FiltrosActivosActividad filtros={filtros} onQuitar={quitarFiltro} />
            </div>

            {errorOpciones && <p className="actividad-error" role="alert">{errorOpciones}</p>}
            {errorConsulta && <p className="actividad-error" role="alert">{errorConsulta}</p>}
            {cargando && <TablaActividadSkeleton />}
            {!cargando && !errorConsulta && (
                <TablaActividad
                    registros={datos.contenido}
                    filtrosAplicados={hayFiltros}
                    mensajeVacio={hayFiltros ? t('actividad.sinResultados') : t('actividad.vacio')}
                />
            )}
            <PaginacionActividad
                totalRegistros={datos.totalElementos}
                pagina={pagina}
                totalPaginas={datos.totalPaginas}
                onCambiarPagina={cambiarPagina}
            />
        </main>
    );
}
