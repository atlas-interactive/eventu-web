import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { UsuarioBuscado } from '../../types/usuario';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { mensajeDeError } from '../../api/mensajeDeError';
import { asignarOrganizador, buscarUsuarios, listarOrganizadores, revocarOrganizador } from './services/usuarioService';
import '../../styles/management.css';

const ETIQUETA_ROL: Record<string, string> = {
    USUARIO: 'Usuario',
    ORGANIZADOR: 'Organizador',
    ADMIN: 'Administrador',
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
                <h1 className="workflow-title">Gestión de organizadores</h1>
                <p className="workflow-description">
                    Busca un usuario ya registrado y asígnale el rol de organizador.
                </p>
            </header>

            <section className="gestion-panel">
                <div className="gestion-search">
                    <label htmlFor="criterio" className="workflow-label">
                        Buscar por nombre o correo institucional
                    </label>
                    <input
                        id="criterio"
                        type="search"
                        autoComplete="off"
                        value={criterio}
                        onChange={(e) => alEscribir(e.target.value)}
                        placeholder="Escribe al menos 2 letras del nombre o del correo..."
                        aria-invalid={hayCriterio && errorBusqueda ? true : undefined}
                        aria-describedby={hayCriterio && errorBusqueda ? 'error-busqueda' : 'ayuda-busqueda'}
                        className="gestion-search-input"
                    />
                    <p id="ayuda-busqueda" aria-live="polite" className="gestion-help">
                        {!hayCriterio
                              ? 'Solo se muestran usuarios que ya están registrados en la plataforma.'
                              : resultadosVisibles.length > 0
                                ? `${resultadosVisibles.length} ${resultadosVisibles.length === 1 ? 'coincidencia' : 'coincidencias'}`
                                : ''}
                    </p>
                </div>

                {hayCriterio && errorBusqueda && (
                    <p id="error-busqueda" role="alert" className="gestion-error-message">
                        {errorBusqueda}
                    </p>
                )}
                {hayCriterio && sinResultados && (
                    <p role="status" className="gestion-search-message">
                        {sinResultados}
                    </p>
                )}
                {mensajeExito && (
                    <p role="status" className="gestion-success-message">
                        {mensajeExito}
                    </p>
                )}
                {errorAccion && (
                    <p role="alert" className="gestion-error-message">
                        {errorAccion}
                    </p>
                )}

                {hayCriterio && buscando && (
                    <SkeletonEstado etiqueta="Buscando usuarios" className="gestion-results">
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
                                            {usuario.correo} · {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
                                        </p>
                                    </div>
                                </div>
                                {usuario.rol === 'USUARIO' && (
                                    <button
                                        type="button"
                                        className="gestion-organizer-action gestion-organizer-action--assign"
                                        disabled={procesandoId === usuario.id}
                                        aria-label={`Asignar organizador a ${usuario.nombre}`}
                                        onClick={() => asignar(usuario)}
                                    >
                                        {procesandoId === usuario.id ? 'Asignando…' : 'Asignar organizador'}
                                    </button>
                                )}
                                {usuario.rol === 'ORGANIZADOR' && (
                                    <button
                                        type="button"
                                        className="gestion-organizer-action gestion-organizer-action--revoke"
                                        aria-label={`Revocar rol de organizador a ${usuario.nombre}`}
                                        onClick={() => {
                                            setMensajeExito('');
                                            setErrorAccion('');
                                            setARevocar(usuario);
                                        }}
                                    >
                                        Revocar rol
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

            </section>

            <section aria-labelledby="titulo-organizadores" className="gestion-panel gestion-panel--spaced">
                <h2 id="titulo-organizadores" className="gestion-table-title">
                    Organizadores actuales
                </h2>
                {errorTabla && (
                    <p role="alert" className="gestion-table-error">
                        {errorTabla}
                    </p>
                )}
                {cargandoTabla ? (
                    <SkeletonEstado etiqueta="Cargando organizadores" className="gestion-table-scroll">
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
                    <p className="gestion-table-state">Aún no hay organizadores asignados.</p>
                ) : (
                    organizadores.length > 0 && (
                        <div className="gestion-table-scroll">
                            <table className="gestion-organizer-table">
                                <caption className="sr-only">Usuarios con rol de organizador</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Nombre</th>
                                        <th scope="col">Correo</th>
                                        <th scope="col">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizadores.map((organizador) => (
                                        <tr key={organizador.id} className="gestion-organizer-row">
                                            <td data-label="Nombre" className="gestion-organizer-cell gestion-organizer-cell--name">
                                                <span className="gestion-cell-value gestion-cell-value--name">{organizador.nombre}</span>
                                            </td>
                                            <td data-label="Correo" className="gestion-organizer-cell gestion-organizer-cell--email">
                                                <span className="gestion-cell-value gestion-cell-value--email">{organizador.correo}</span>
                                            </td>
                                            <td data-label="Acción" className="gestion-organizer-cell gestion-organizer-cell--action">
                                                <button
                                                    type="button"
                                                    className="gestion-organizer-action gestion-organizer-action--revoke"
                                                    aria-label={`Revocar rol de ${organizador.nombre}`}
                                                    onClick={() => {
                                                        setMensajeExito('');
                                                        setErrorAccion('');
                                                        setARevocar(organizador);
                                                    }}
                                                >
                                                    Revocar rol
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
                    titulo="¿Revocar rol de organizador?"
                    idTitulo="titulo-revocar-organizador"
                    onCerrar={() => setARevocar(null)}
                >
                    <p className="workflow-dialog-copy">
                        {aRevocar.nombre} dejará de poder crear y gestionar eventos. Conservará el acceso a su cuenta con rol
                        Usuario. Sus eventos se conservarán y, desde ahora, solo un administrador podrá editarlos.
                    </p>
                    <div className="workflow-dialog-actions">
                        <button type="button" className="workflow-button workflow-button--secondary" onClick={() => setARevocar(null)}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="workflow-button workflow-button--primary"
                            disabled={procesandoId === aRevocar.id}
                            onClick={() => revocar(aRevocar)}
                        >
                            {procesandoId === aRevocar.id ? 'Revocando…' : 'Sí, revocar rol'}
                        </button>
                    </div>
                </ModalAccesible>
            )}
        </main>
    );
}
