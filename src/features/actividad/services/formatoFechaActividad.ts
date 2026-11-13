const formatoFechaHora = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
});

const formatoFechaCorta = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
});

const formatoFechaConAnio = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const parte = (formateador: Intl.DateTimeFormat, fecha: Date, tipo: Intl.DateTimeFormatPartTypes) =>
    formateador.formatToParts(fecha).find((elemento) => elemento.type === tipo)?.value ?? '';

const fechaCorta = (fecha: Date, incluirAnio: boolean) => {
    const texto = `${parte(formatoFechaCorta, fecha, 'day')} ${parte(formatoFechaCorta, fecha, 'month')}`;
    return incluirAnio ? `${texto} ${parte(formatoFechaConAnio, fecha, 'year')}` : texto;
};

export function formatearFechaHoraActividad(fecha: string): string {
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return fecha;
    const hora = parte(formatoFechaHora, valor, 'hour');
    const minuto = parte(formatoFechaHora, valor, 'minute');
    const periodo = parte(formatoFechaHora, valor, 'dayPeriod');
    return `${fechaCorta(valor, false)}, ${hora}:${minuto} ${periodo}`;
}

export function formatearTiempoRelativoActividad(fecha: string, ahora = new Date()): string {
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return fecha;

    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioRegistro = new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    const diferenciaDias = Math.round((inicioHoy.getTime() - inicioRegistro.getTime()) / DIA);

    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias > 1 || diferenciaDias < 0) {
        return fechaCorta(valor, valor.getFullYear() !== ahora.getFullYear());
    }

    const diferencia = ahora.getTime() - valor.getTime();
    if (diferencia < 0) return formatoFechaCorta.format(valor);
    if (diferencia < MINUTO) return 'Ahora';
    if (diferencia < HORA) return `Hace ${Math.floor(diferencia / MINUTO)} min`;
    if (diferencia < DIA) return `Hace ${Math.floor(diferencia / HORA)} h`;

    return fechaCorta(valor, valor.getFullYear() !== ahora.getFullYear());
}
