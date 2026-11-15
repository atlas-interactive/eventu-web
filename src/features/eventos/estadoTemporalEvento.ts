const ZONA_HORARIA_EVENTOS = 'America/Bogota';

const formatoBogota = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA_EVENTOS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
});

export type EstadoTemporalEvento = 'FUTURO' | 'EN_CURSO' | 'FINALIZADO';

interface FechaLocal {
    anio: number;
    mes: number;
    dia: number;
    hora: number;
    minuto: number;
    segundo: number;
    milisegundo: number;
}

const partesFecha = (fecha: Date): Record<string, number> =>
    Object.fromEntries(
        formatoBogota
            .formatToParts(fecha)
            .filter(({ type }) => type !== 'literal')
            .map(({ type, value }) => [type, Number(value)]),
    );

const obtenerFechaLocal = (fecha: string): FechaLocal | null => {
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/.exec(fecha);
    if (!coincidencia) return null;

    const [, anioTexto, mesTexto, diaTexto, horaTexto, minutoTexto, segundoTexto = '0', fraccion = ''] = coincidencia;
    const resultado: FechaLocal = {
        anio: Number(anioTexto),
        mes: Number(mesTexto),
        dia: Number(diaTexto),
        hora: Number(horaTexto),
        minuto: Number(minutoTexto),
        segundo: Number(segundoTexto),
        milisegundo: Number(fraccion.slice(0, 3).padEnd(3, '0')),
    };
    const validacion = new Date(Date.UTC(
        resultado.anio,
        resultado.mes - 1,
        resultado.dia,
        resultado.hora,
        resultado.minuto,
        resultado.segundo,
        resultado.milisegundo,
    ));

    if (
        validacion.getUTCFullYear() !== resultado.anio ||
        validacion.getUTCMonth() + 1 !== resultado.mes ||
        validacion.getUTCDate() !== resultado.dia ||
        resultado.hora > 23 ||
        resultado.minuto > 59 ||
        resultado.segundo > 59
    ) {
        return null;
    }

    return resultado;
};

const claveFecha = ({ anio, mes, dia }: FechaLocal) =>
    `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

export function obtenerEstadoTemporalEvento(
    fechaInicio: string,
    ahora = new Date(),
): EstadoTemporalEvento | null {
    const inicio = obtenerFechaLocal(fechaInicio);
    if (!inicio || Number.isNaN(ahora.getTime())) return null;

    const ahoraBogota = partesFecha(ahora);
    const inicioComoInstante = Date.UTC(
        inicio.anio,
        inicio.mes - 1,
        inicio.dia,
        inicio.hora,
        inicio.minuto,
        inicio.segundo,
        inicio.milisegundo,
    );
    const ahoraComoFechaLocal = Date.UTC(
        ahoraBogota.year,
        ahoraBogota.month - 1,
        ahoraBogota.day,
        ahoraBogota.hour,
        ahoraBogota.minute,
        ahoraBogota.second,
        ahora.getUTCMilliseconds(),
    );

    if (inicioComoInstante > ahoraComoFechaLocal) return 'FUTURO';

    const hoyBogota = claveFecha({
        anio: ahoraBogota.year,
        mes: ahoraBogota.month,
        dia: ahoraBogota.day,
        hora: 0,
        minuto: 0,
        segundo: 0,
        milisegundo: 0,
    });

    return claveFecha(inicio) < hoyBogota ? 'FINALIZADO' : 'EN_CURSO';
}

export function milisegundosHastaMedianocheBogota(ahora = new Date()): number {
    const partes = partesFecha(ahora);
    const fechaLocalComoUtc = Date.UTC(
        partes.year,
        partes.month - 1,
        partes.day,
        partes.hour,
        partes.minute,
        partes.second,
        ahora.getUTCMilliseconds(),
    );
    const diferenciaZonaHoraria = fechaLocalComoUtc - ahora.getTime();
    const siguienteDiaLocalComoUtc = Date.UTC(partes.year, partes.month - 1, partes.day + 1);
    return siguienteDiaLocalComoUtc - diferenciaZonaHoraria - ahora.getTime();
}

export const eventoYaIniciado = (fechaInicio: string, ahora = new Date()) => {
    const estado = obtenerEstadoTemporalEvento(fechaInicio, ahora);
    return estado === 'EN_CURSO' || estado === 'FINALIZADO';
};

export const terminoDiaEvento = (fechaInicio: string, ahora = new Date()) =>
    obtenerEstadoTemporalEvento(fechaInicio, ahora) === 'FINALIZADO';
