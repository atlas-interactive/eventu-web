import { useEffect, useState } from 'react';
import { Search, UserCog, UserMinus, UserPlus } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import type { UsuarioBuscado } from '../../types/usuario';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { mensajeDeError } from '../../api/mensajeDeError';
import { asignarOrganizador, buscarUsuarios, listarOrganizadores, revocarOrganizador } from './services/usuarioService';
import '../../styles/management.css';

const CLAVE_ROL: Record<string, string> = {
    USUARIO: 'comun.roles.usuario',
    ORGANIZADOR: 'comun.roles.organizador',
    ADMIN: 'comun.roles.admin',
};

// Cuántos caracteres se necesitan para buscar y cuánto se espera tras la última tecla
const MINIMO_CARACTERES = 2;
const ESPERA_MS = 300;

const iniciales = (nombre: string) =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('');

// HU-03: el administrador busca un usuario ya registrado y le asigna o le revoca el rol de organizador
export function GestionOrganizadores() {
    const { t } = useTranslation();
    const [criterio, setCriterio] = useState('');
    const [resultados, setResultados] = useState<UsuarioBuscado[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [sinResultados, setSinResultados] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [errorAccion, setErrorAccion] = useState('');
    const [procesandoId, setProcesandoId] = useState<number | null>(null);
    const [aRevocar, setARevocar] = useState<UsuarioBuscado | null>(null);
    const [organizadores, setOrganizadores] = useState<UsuarioBuscado[]>([]);
    const [cargandoTabla, setCargandoTabla] = useState(true);
    const [errorTabla, setErrorTabla] = useState('');

    // Tabla de organizadores actuales: se carga al entrar y se vuelve a cargar al subir `recarga` (tras asignar o revocar)
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar la pantalla.
        let vigente = true;
        listarOrganizadores()
            .then((lista) => {
                if (!vigente) return;
                setOrganizadores(lista);
                setErrorTabla('');
            })
            .catch((err: unknown) => {
                if (vigente) setErrorTabla(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargandoTabla(false);
            });
        return () => {
            vigente = false;
        };
    }, [recarga]);

    // Búsqueda mientras se escribe: espera a que pare de teclear y descarta respuestas viejas
    useEffect(() => {
        const texto = criterio.trim();
        if (texto.length < MINIMO_CARACTERES) return;

        let vigente = true;
        const temporizador = setTimeout(async () => {
            setBuscando(true);
            try {
                const encontrados = await buscarUsuarios(texto);
                if (!vigente) return;
                setResultados(encontrados);
                setErrorBusqueda('');
                setSinResultados('');
            } catch (err: unknown) {
                if (!vigente) return;
                setResultados([]);
                // El 404 "No se encontró ningún usuario con ese criterio." no es un fallo, es un resultado vacío
                if (isAxiosError(err) && err.response?.status === 404) {
                    setErrorBusqueda('');
                    setSinResultados(mensajeDeError(err));
                } else {
                    setSinResultados('');
                    setErrorBusqueda(mensajeDeError(err));
                }
            } finally {
                if (vigente) setBuscando(false);
            }
        }, ESPERA_MS);

        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [criterio]);

    // Con menos de 2 letras no se muestra nada de la búsqueda anterior, aunque siga en el estado
    const hayCriterio = criterio.trim().length >= MINIMO_CARACTERES;
    const resultadosVisibles = hayCriterio ? resultados : [];

    const alEscribir = (valor: string) => {
        setCriterio(valor);
        setBuscando(valor.trim().length >= MINIMO_CARACTERES);
        setErrorBusqueda('');
        setSinResultados('');
        setMensajeExito('');
        setErrorAccion('');
    };

    // Cambia el rol en pantalla con lo que respondió el backend, sin volver a buscar
    const actualizarRol = (id: number, rol: string) =>
        setResultados((lista) => lista.map((u) => (u.id === id ? { ...u, rol } : u)));

    const asignar = async (usuario: UsuarioBuscado) => {
        setMensajeExito('');
        setErrorAccion('');
        setProcesandoId(usuario.id);
        try {
            const respuesta = await asignarOrganizador(usuario.id);
            actualizarRol(usuario.id, respuesta.rol);
            setMensajeExito(`${usuario.nombre}: ${respuesta.mensaje}`);
            setRecarga((n) => n + 1);
        } catch (err: unknown) {
            setErrorAccion(mensajeDeError(err));
        } finally {
            setProcesandoId(null);
        }
    };

    const revocar = async (usuario: UsuarioBuscado) => {
        setProcesandoId(usuario.id);
        try {
            const respuesta = await revocarOrganizador(usuario.id);
            actualizarRol(usuario.id, respuesta.rol);
            setMensajeExito(`${usuario.nombre}: ${respuesta.mensaje}`);
            setARevocar(null);
            setRecarga((n) => n + 1);
        } catch (err: unknown) {
            setErrorAccion(mensajeDeError(err));
            setARevocar(null);
        } finally {
            setProcesandoId(null);
        }
    };

    return (
        <main className="workflow-page gestion-organizer-page">
            <header className="workflow-page-header">
                <h1 className="workflow-title">{t('organizadores.titulo')}</h1>
                <p className="workflow-description">
                    {t('organizadores.descripcion')}
                </p>
            </header>

            <section className="gestion-panel">
                <div className="gestion-search">
                    <label htmlFor="criterio" className="workflow-label">
                        {t('organizadores.buscarLabel')}
                    </label>
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eventu-secondary-text"
                            aria-hidden="true"
                        />
                        <input
                            id="criterio"
                            type="search"
                            autoComplete="off"
                            value={criterio}
                            onChange={(e) => alEscribir(e.target.value)}
                            placeholder={t('organizadores.placeholderBusqueda')}
                            aria-invalid={hayCriterio && errorBusqueda ? true : undefined}
                            aria-describedby={hayCriterio && errorBusqueda ? 'error-busqueda' : 'ayuda-busqueda'}
                            className="gestion-search-input gestion-search-input--with-icon"
                        />
                    </div>
                    <p id="ayuda-busqueda" aria-live="polite" className="gestion-help">
                        {!hayCriterio
                              ? t('organizadores.ayuda')
                              : resultadosVisibles.length > 0
                                ? t('organizadores.coincidencias', { count: resultadosVisibles.length })
                                : ''}
                    </p>
                </div>

                {hayCriterio && errorBusqueda && (
                    <p id="error-busqueda" role="alert" className="gestion-error-message flex items-start gap-2">
                        <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                        {errorBusqueda}
                    </p>
                )}
                {hayCriterio && sinResultados && (
                    <p role="status" className="gestion-search-message">
                        {sinResultados}
                    </p>
                )}
                {mensajeExito && (
                    <p role="status" className="gestion-success-message flex items-start gap-2">
                        <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                        {mensajeExito}
                    </p>
                )}
                {errorAccion && (
                    <p role="alert" className="gestion-error-message flex items-start gap-2">
                        <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                        {errorAccion}
                    </p>
                )}

                {hayCriterio && buscando && (
                    <SkeletonEstado etiqueta={t('organizadores.buscando')} className="gestion-results">
                        {Array.from({ length: 2 }, (_, indice) => (
                            <div key={indice} className="gestion-result">
                                <div className="gestion-result-person">
                                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-full rounded-md sm:w-40" />
                            </div>
                        ))}
                    </SkeletonEstado>
                )}
                {resultadosVisibles.length > 0 && !buscando && (
                    <ul className="gestion-results">
                        {resultadosVisibles.map((usuario) => (
                            <li
                                key={usuario.id}
                                className="gestion-result"
                            >
                                <div className="gestion-result-person">
                                    <span
                                        aria-hidden="true"
                                        className="gestion-avatar"
                                    >
                                        {iniciales(usuario.nombre)}
                                    </span>
                                    <div className="gestion-result-details">
                                        <p className="gestion-result-name">{usuario.nombre}</p>
                                        <p className="gestion-result-meta">
                                            {usuario.correo} · {CLAVE_ROL[usuario.rol]
                                                ? t(CLAVE_ROL[usuario.rol])
                                                : usuario.rol}
                                        </p>
                                    </div>
                                </div>
                                {usuario.rol === 'USUARIO' && (
                                    <button
                                        type="button"
                                        className="gestion-organizer-action gestion-organizer-action--assign gap-1.5"
                                        disabled={procesandoId === usuario.id}
                                        aria-label={t('organizadores.asignarAria', { nombre: usuario.nombre })}
                                        onClick={() => asignar(usuario)}
                                    >
                                        <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {procesandoId === usuario.id ? t('organizadores.asignando') : t('organizadores.asignar')}
                                    </button>
                                )}
                                {usuario.rol === 'ORGANIZADOR' && (
                                    <button
                                        type="button"
                                        className="gestion-organizer-action gestion-organizer-action--revoke gap-1.5"
                                        aria-label={t('organizadores.revocarAria', { nombre: usuario.nombre })}
                                        onClick={() => {
                                            setMensajeExito('');
                                            setErrorAccion('');
                                            setARevocar(usuario);
                                        }}
                                    >
                                        <UserMinus className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {t('organizadores.revocar')}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

            </section>

            <section aria-labelledby="titulo-organizadores" className="gestion-panel gestion-panel--spaced">
                <h2 id="titulo-organizadores" className="gestion-table-title">
                    {t('organizadores.organizadoresActuales')}
                </h2>
                {errorTabla && (
                    <p role="alert" className="gestion-table-error flex items-start gap-2">
                        <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                        {errorTabla}
                    </p>
                )}
                {cargandoTabla ? (
                    <SkeletonEstado etiqueta={t('organizadores.cargando')} className="gestion-table-scroll">
                        <table className="gestion-organizer-table" aria-hidden="true">
                            <tbody>
                                {Array.from({ length: 3 }, (_, indice) => (
                                    <tr key={indice} className="gestion-organizer-row">
                                        <td className="gestion-organizer-cell gestion-organizer-cell--name">
                                            <Skeleton className="h-4 w-36" />
                                        </td>
                                        <td className="gestion-organizer-cell gestion-organizer-cell--email">
                                            <Skeleton className="h-4 w-48 max-w-full" />
                                        </td>
                                        <td className="gestion-organizer-cell gestion-organizer-cell--action">
                                            <Skeleton className="h-10 w-32 rounded-md" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </SkeletonEstado>
                ) : organizadores.length === 0 && !errorTabla ? (
                    <p className="gestion-table-state">
                        <UserCog className="mr-2 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
                        {t('organizadores.vacio')}
                    </p>
                ) : (
                    organizadores.length > 0 && (
                        <div className="gestion-table-scroll">
                            <table className="gestion-organizer-table">
                                <caption className="sr-only">{t('organizadores.caption')}</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">{t('organizadores.nombre')}</th>
                                        <th scope="col">{t('organizadores.correo')}</th>
                                        <th scope="col">{t('organizadores.accion')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizadores.map((organizador) => (
                                        <tr key={organizador.id} className="gestion-organizer-row">
                                            <td data-label={t('organizadores.nombre')} className="gestion-organizer-cell gestion-organizer-cell--name">
                                                <span className="gestion-cell-value gestion-cell-value--name">{organizador.nombre}</span>
                                            </td>
                                            <td data-label={t('organizadores.correo')} className="gestion-organizer-cell gestion-organizer-cell--email">
                                                <span className="gestion-cell-value gestion-cell-value--email">{organizador.correo}</span>
                                            </td>
                                            <td data-label={t('organizadores.accion')} className="gestion-organizer-cell gestion-organizer-cell--action">
                                                <button
                                                    type="button"
                                                    className="gestion-organizer-action gestion-organizer-action--revoke gap-1.5"
                                                    aria-label={t('organizadores.revocarRolAria', { nombre: organizador.nombre })}
                                                    onClick={() => {
                                                        setMensajeExito('');
                                                        setErrorAccion('');
                                                        setARevocar(organizador);
                                                    }}
                                                >
                                                    <UserMinus className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                    {t('organizadores.revocar')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </section>

            {aRevocar && (
                <ModalAccesible
                    titulo={t('organizadores.confirmarTitulo')}
                    idTitulo="titulo-revocar-organizador"
                    onCerrar={() => setARevocar(null)}
                >
                    <p className="workflow-dialog-copy">
                        {t('organizadores.confirmarMensaje', { nombre: aRevocar.nombre })}
                    </p>
                    <div className="workflow-dialog-actions">
                        <button type="button" className="workflow-button workflow-button--secondary" onClick={() => setARevocar(null)}>
                            {t('organizadores.cancelar')}
                        </button>
                        <button
                            type="button"
                            className="workflow-button workflow-button--primary gap-1.5"
                            disabled={procesandoId === aRevocar.id}
                            onClick={() => revocar(aRevocar)}
                        >
                            <UserMinus className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {procesandoId === aRevocar.id ? t('organizadores.revocando') : t('organizadores.confirmarRevocar')}
                        </button>
                    </div>
                </ModalAccesible>
            )}
        </main>
    );
}
