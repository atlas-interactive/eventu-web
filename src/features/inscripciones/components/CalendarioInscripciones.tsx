import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleX, Clock3, MapPin, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModalAccesible } from '../../../components/ui/ModalAccesible';
import type { Inscripcion } from '../../../types/inscripcion';
import { EntradaQr } from './EntradaQr';
import '../../../styles/event-detail.css';

interface CalendarioInscripcionesProps {
    inscripciones: Inscripcion[];
    onCancelar: (inscripcion: Inscripcion) => void;
}

const formatoMes = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
});
const formatoDiaAgenda = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});
const formatoDiaCorto = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
});
const formatoHora = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
});
const formatoMesCorto = new Intl.DateTimeFormat('es-CO', { month: 'short' });
const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const claveFecha = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const fechaDeInscripcion = (inscripcion: Inscripcion) => new Date(inscripcion.eventoFechaInicio);

export function CalendarioInscripciones({ inscripciones, onCancelar }: CalendarioInscripcionesProps) {
    const [mesVisible, setMesVisible] = useState(() => {
        const hoy = new Date();
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    });
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
    const [inscripcionQr, setInscripcionQr] = useState<Inscripcion | null>(null);
    const hoy = new Date();
    const claveHoy = claveFecha(hoy);
    const claveMes = `${mesVisible.getFullYear()}-${String(mesVisible.getMonth() + 1).padStart(2, '0')}`;

    const eventosPorDia = useMemo(() => {
        const grupos = new Map<string, Inscripcion[]>();
        for (const inscripcion of inscripciones) {
            const fecha = fechaDeInscripcion(inscripcion);
            if (Number.isNaN(fecha.getTime())) continue;
            const clave = claveFecha(fecha);
            const eventos = grupos.get(clave) ?? [];
            eventos.push(inscripcion);
            grupos.set(clave, eventos);
        }
        for (const eventos of grupos.values()) {
            eventos.sort(
                (a, b) => fechaDeInscripcion(a).getTime() - fechaDeInscripcion(b).getTime(),
            );
        }
        return grupos;
    }, [inscripciones]);

    const fechasDelMes = useMemo(() => {
        const inicio = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
        const cantidadDias = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 0).getDate();
        const desplazamiento = (inicio.getDay() + 6) % 7;
        const dias: (Date | null)[] = Array.from({ length: desplazamiento }, () => null);
        for (let dia = 1; dia <= cantidadDias; dia += 1) {
            dias.push(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia));
        }
        while (dias.length % 7 !== 0) dias.push(null);
        return dias;
    }, [mesVisible]);

    const eventosDelMes = useMemo(
        () =>
            Array.from(eventosPorDia.entries())
                .filter(([clave]) => clave.startsWith(`${claveMes}-`))
                .sort(([a], [b]) => a.localeCompare(b)),
        [claveMes, eventosPorDia],
    );
    const agendaCompleta = useMemo(
        () =>
            Array.from(eventosPorDia.entries())
                .sort(([a], [b]) => a.localeCompare(b)),
        [eventosPorDia],
    );
    const totalActivasDelMes = eventosDelMes.reduce(
        (total, [, eventos]) => total + eventos.filter(({ estado }) => estado === 'ACTIVA').length,
        0,
    );
    const eventosDiaSeleccionado = fechaSeleccionada
        ? eventosPorDia.get(fechaSeleccionada) ?? []
        : [];
    const diaConMasEventos = eventosDelMes.reduce<[string, Inscripcion[]] | null>(
        (mayor, actual) => !mayor || actual[1].length > mayor[1].length ? actual : mayor,
        null,
    );

    const navegarMes = (cantidad: number) => {
        setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + cantidad, 1));
        setFechaSeleccionada(null);
    };
    const volverAHoy = () => {
        const ahora = new Date();
        setMesVisible(new Date(ahora.getFullYear(), ahora.getMonth(), 1));
        setFechaSeleccionada(null);
    };
    const seleccionarFecha = (clave: string) => {
        setFechaSeleccionada((actual) => actual === clave ? null : clave);
    };

    return (
        <div className="inscripciones-agenda-layout">
            <section className="inscripciones-agenda" aria-label="Agenda de mis inscripciones">
                {agendaCompleta.length === 0 ? (
                    <p className="inscripciones-calendario-vacio" role="status">
                        <CalendarDays aria-hidden="true" />
                        No tienes eventos publicados para mostrar
                    </p>
                ) : (
                    agendaCompleta.map(([clave, eventos]) => {
                        const fecha = fechaDeInscripcion(eventos[0]);
                        return (
                            <section
                                key={clave}
                                className="inscripciones-agenda-grupo"
                            >
                                <h2 className="inscripciones-agenda-fecha">
                                    {formatoDiaAgenda.format(fecha)}
                                    {clave === claveHoy && <span className="inscripciones-agenda-hoy">Hoy</span>}
                                    {eventos.length > 1 && (
                                        <span className="inscripciones-agenda-conteo">{eventos.length} eventos</span>
                                    )}
                                </h2>
                                <div className="inscripciones-agenda-eventos">
                                    {eventos.map((inscripcion) => {
                                        const fechaEvento = fechaDeInscripcion(inscripcion);
                                        const activa = inscripcion.estado === 'ACTIVA';
                                        return (
                                            <article
                                                className={`inscripciones-evento-tarjeta${!activa ? ' inscripciones-evento-tarjeta--cancelada' : ''}`}
                                                key={inscripcion.id}
                                            >
                                                <div className="inscripciones-evento-fecha" aria-hidden="true">
                                                    <strong>{formatoDiaCorto.format(fechaEvento)}</strong>
                                                    <span>{formatoMesCorto.format(fechaEvento).replace('.', '').toUpperCase()}</span>
                                                </div>
                                                <div className="inscripciones-evento-contenido">
                                                    <h3>
                                                        <Link to={`/eventos/${inscripcion.eventoId}`}>
                                                            {inscripcion.eventoTitulo}
                                                        </Link>
                                                    </h3>
                                                    <div className="inscripciones-evento-detalles">
                                                        <time dateTime={inscripcion.eventoFechaInicio}>
                                                            <Clock3 aria-hidden="true" />
                                                            {formatoHora.format(fechaEvento)}
                                                        </time>
                                                        <span><MapPin aria-hidden="true" />{inscripcion.eventoUbicacion}</span>
                                                    </div>
                                                </div>
                                                <div className="inscripciones-evento-acciones">
                                                    <span
                                                        className={`inscripcion-estado${activa ? ' inscripcion-estado--activa' : ' inscripcion-estado--cancelada'}`}
                                                    >
                                                        {activa ? 'Inscripción activa' : 'Inscripción cancelada'}
                                                    </span>
                                                    {activa && (
                                                        <>
                                                            {inscripcion.codigoQr && (
                                                                <button
                                                                    type="button"
                                                                    className="inscripciones-evento-accion"
                                                                    aria-label={`Ver QR de ${inscripcion.eventoTitulo}`}
                                                                    onClick={() => setInscripcionQr(inscripcion)}
                                                                >
                                                                    <QrCode aria-hidden="true" />
                                                                    Ver QR
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="inscripciones-evento-accion inscripciones-evento-accion--cancelar"
                                                                aria-label={`Cancelar inscripción a ${inscripcion.eventoTitulo}`}
                                                                onClick={() => onCancelar(inscripcion)}
                                                            >
                                                                <CircleX aria-hidden="true" />
                                                                Cancelar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })
                )}
            </section>

            <aside className="inscripciones-mini-calendario" aria-label="Calendario mensual">
                <header className="inscripciones-mini-calendario-cabecera">
                    <h2>{formatoMes.format(mesVisible)}</h2>
                    <div>
                        <button type="button" onClick={volverAHoy}>Hoy</button>
                        <button type="button" aria-label="Mes anterior" onClick={() => navegarMes(-1)}>
                            <ChevronLeft aria-hidden="true" />
                        </button>
                        <button type="button" aria-label="Mes siguiente" onClick={() => navegarMes(1)}>
                            <ChevronRight aria-hidden="true" />
                        </button>
                    </div>
                </header>
                <div className="inscripciones-mini-calendario-grid" role="grid" aria-label={formatoMes.format(mesVisible)}>
                    {diasSemana.map((dia, indice) => (
                        <span className="inscripciones-mini-dia-semana" role="columnheader" key={`${dia}-${indice}`}>
                            {dia}
                        </span>
                    ))}
                    {fechasDelMes.map((fecha, indice) => {
                        if (!fecha) {
                            return <span className="inscripciones-mini-dia-vacio" role="gridcell" key={`vacio-${indice}`} />;
                        }
                        const clave = claveFecha(fecha);
                        const eventos = eventosPorDia.get(clave) ?? [];
                        return (
                            <button
                                type="button"
                                role="gridcell"
                                className={`inscripciones-mini-dia${clave === claveHoy ? ' inscripciones-mini-dia--hoy' : ''}${clave === fechaSeleccionada ? ' inscripciones-mini-dia--seleccionado' : ''}`}
                                aria-label={`${formatoDiaAgenda.format(fecha)}${eventos.length ? `, ${eventos.length} eventos` : ''}`}
                                aria-pressed={clave === fechaSeleccionada}
                                onClick={() => seleccionarFecha(clave)}
                                key={clave}
                            >
                                {fecha.getDate()}
                                {eventos.length > 0 && (
                                    <span className="inscripciones-mini-puntos" aria-hidden="true">
                                        {eventos.slice(0, 3).map((evento) => (
                                            <i
                                                key={evento.id}
                                                className={evento.estado === 'ACTIVA' ? '' : 'inscripciones-mini-punto--cancelado'}
                                            />
                                        ))}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="inscripciones-mini-leyenda">
                    <span><i /> Inscripción activa</span>
                    <span><i className="inscripciones-mini-leyenda-cancelada" /> Inscripción o evento cancelado</span>
                </div>
                <p className="inscripciones-mini-ayuda">
                    Los puntos marcan eventos. Cambia de mes con las flechas y selecciona un día para ver su resumen.
                </p>
                <footer className="inscripciones-mini-resumen">
                    <div><strong>{totalActivasDelMes}</strong><span>Activas este mes</span></div>
                    <div>
                        <strong>
                            {fechaSeleccionada
                                ? eventosDiaSeleccionado.length
                                : diaConMasEventos
                                ? formatoDiaCorto.format(new Date(`${diaConMasEventos[0]}T12:00:00`)) +
                                  ' ' +
                                  formatoMesCorto.format(new Date(`${diaConMasEventos[0]}T12:00:00`)).replace('.', '')
                                : '—'}
                        </strong>
                        <span>{fechaSeleccionada ? 'Eventos en el día seleccionado' : 'Día con más eventos'}</span>
                    </div>
                </footer>
            </aside>

            {inscripcionQr?.codigoQr && (
                <ModalAccesible
                    titulo="Tu entrada"
                    idTitulo="titulo-qr-inscripcion"
                    onCerrar={() => setInscripcionQr(null)}
                >
                    <p className="inscripciones-qr-evento">{inscripcionQr.eventoTitulo}</p>
                    <EntradaQr
                        codigo={inscripcionQr.codigoQr}
                        nombreArchivo={`entrada-evento-${inscripcionQr.eventoId}.svg`}
                    />
                </ModalAccesible>
            )}
        </div>
    );
}
