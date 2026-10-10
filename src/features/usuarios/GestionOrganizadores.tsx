import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { UsuarioBuscado } from '../../types/usuario';
import { ModalAccesible } from '../categorias/components/ModalAccesible';
import { mensajeDeError } from '../eventos/mensajeDeError';
import { asignarOrganizador, buscarUsuarios, listarOrganizadores, revocarOrganizador } from './services/usuarioService';

const botonPrimario =
    'rounded-[0.4375rem] bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:opacity-60';
const botonSecundario =
    'rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 py-2 text-sm font-medium text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const botonFila =
    'inline-flex h-11 items-center justify-center rounded-[0.4375rem] border px-4 text-sm font-normal bg-eventu-white-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const botonAsignar = `${botonFila} border-eventu-success text-eventu-success hover:bg-eventu-green-background`;
const botonRevocar = `${botonFila} border-eventu-institutional-red text-eventu-institutional-red hover:bg-eventu-soft-red-background`;

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
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6">
                <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Gestión de organizadores</h1>
                <p className="mt-1 text-sm text-eventu-secondary-text">
                    Busca un usuario ya registrado y asígnale el rol de organizador.
                </p>
            </header>

            <section className="rounded-lg border border-eventu-border bg-eventu-white-surface p-5">
                <div className="w-full sm:max-w-[32.5rem]">
                    <label htmlFor="criterio" className="mb-1 block text-sm font-medium text-eventu-main-ink">
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
                        className="h-11 w-full rounded-md border border-eventu-field-border px-3 text-sm text-eventu-main-ink outline-none focus:ring-1 focus:ring-eventu-field-border"
                    />
                    <p id="ayuda-busqueda" aria-live="polite" className="mt-1 text-xs text-eventu-secondary-text">
                        {hayCriterio && buscando
                            ? 'Buscando…'
                            : !hayCriterio
                              ? 'Solo se muestran usuarios que ya están registrados en la plataforma.'
                              : resultadosVisibles.length > 0
                                ? `${resultadosVisibles.length} ${resultadosVisibles.length === 1 ? 'coincidencia' : 'coincidencias'}`
                                : ''}
                    </p>
                </div>

                {hayCriterio && errorBusqueda && (
                    <p id="error-busqueda" role="alert" className="mt-3 text-sm text-eventu-error">
                        {errorBusqueda}
                    </p>
                )}
                {hayCriterio && sinResultados && (
                    <p role="status" className="mt-3 text-sm text-eventu-secondary-text">
                        {sinResultados}
                    </p>
                )}
                {mensajeExito && (
                    <p role="status" className="mt-3 rounded-md bg-eventu-green-background px-4 py-3 text-sm text-eventu-success">
                        {mensajeExito}
                    </p>
                )}
                {errorAccion && (
                    <p role="alert" className="mt-3 text-sm text-eventu-error">
                        {errorAccion}
                    </p>
                )}

                {resultadosVisibles.length > 0 && (
                    <ul className="mt-5 space-y-3">
                        {resultadosVisibles.map((usuario) => (
                            <li
                                key={usuario.id}
                                className="flex flex-col gap-3 rounded-lg border border-eventu-border p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-eventu-soft-red-background text-xs font-medium text-eventu-institutional-red"
                                    >
                                        {iniciales(usuario.nombre)}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-eventu-main-ink">{usuario.nombre}</p>
                                        <p className="text-sm text-eventu-secondary-text">
                                            {usuario.correo} · {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
                                        </p>
                                    </div>
                                </div>
                                {usuario.rol === 'USUARIO' && (
                                    <button
                                        type="button"
                                        className={botonAsignar}
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
                                        className={botonRevocar}
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

            <section aria-labelledby="titulo-organizadores" className="mt-6 rounded-lg border border-eventu-border bg-eventu-white-surface p-5">
                <h2 id="titulo-organizadores" className="text-base font-semibold text-eventu-main-ink">
                    Organizadores actuales
                </h2>
                {errorTabla && (
                    <p role="alert" className="mt-3 text-sm text-eventu-error">
                        {errorTabla}
                    </p>
                )}
                {cargandoTabla ? (
                    <p className="mt-3 text-sm text-eventu-secondary-text">Cargando organizadores…</p>
                ) : organizadores.length === 0 && !errorTabla ? (
                    <p className="mt-3 text-sm text-eventu-secondary-text">Aún no hay organizadores asignados.</p>
                ) : (
                    organizadores.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <caption className="sr-only">Usuarios con rol de organizador</caption>
                                <thead>
                                    <tr className="border-b border-eventu-border text-eventu-secondary-text">
                                        <th scope="col" className="py-2 pr-4 font-normal">Nombre</th>
                                        <th scope="col" className="py-2 pr-4 font-normal">Correo</th>
                                        <th scope="col" className="py-2 text-right font-normal">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizadores.map((organizador) => (
                                        <tr key={organizador.id} className="border-b border-eventu-border last:border-0">
                                            <td className="py-3 pr-4 text-eventu-main-ink">{organizador.nombre}</td>
                                            <td className="py-3 pr-4 text-eventu-secondary-text">{organizador.correo}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    type="button"
                                                    className={botonRevocar}
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
                    <p className="text-sm text-eventu-main-ink">
                        {aRevocar.nombre} dejará de poder crear y gestionar eventos. Conservará el acceso a su cuenta con rol
                        Usuario. Sus eventos se conservarán y, desde ahora, solo un administrador podrá editarlos.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" className={botonSecundario} onClick={() => setARevocar(null)}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={botonPrimario}
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
