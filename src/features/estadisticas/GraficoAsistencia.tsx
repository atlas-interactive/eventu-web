import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

interface Props {
    inscripciones: number;
    asistentes: number;
    porcentaje: string;
}

const COLOR_ASISTIERON = '#b3141f';
const COLOR_PENDIENTES = '#e4e3de';

// Dona de asistentes frente a inscritos que aún no asisten; el porcentaje y los totales también van en texto
export function GraficoAsistencia({ inscripciones, asistentes, porcentaje }: Props) {
    const pendientes = Math.max(0, inscripciones - asistentes);
    const datos =
        inscripciones === 0
            ? [{ nombre: 'Sin datos', valor: 1, color: COLOR_PENDIENTES }]
            : [
                  { nombre: 'Asistieron', valor: asistentes, color: COLOR_ASISTIERON },
                  { nombre: 'Aún no asisten', valor: pendientes, color: COLOR_PENDIENTES },
              ];

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <div className="relative h-44 w-44 shrink-0" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={datos}
                            dataKey="valor"
                            nameKey="nombre"
                            innerRadius="72%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {datos.map((d) => (
                                <Cell key={d.nombre} fill={d.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-eventu-main-ink">{porcentaje}</span>
                    <span className="text-xs text-eventu-secondary-text">asistencia</span>
                </div>
            </div>

            <ul className="w-full max-w-xs space-y-3 text-sm">
                <li className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-eventu-main-ink">
                        <span className="h-3 w-3 rounded-sm bg-eventu-institutional-red" aria-hidden="true" />
                        Asistieron
                    </span>
                    <span className="font-semibold text-eventu-main-ink">{asistentes}</span>
                </li>
                <li className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-eventu-main-ink">
                        <span className="h-3 w-3 rounded-sm bg-eventu-border" aria-hidden="true" />
                        Aún no asisten
                    </span>
                    <span className="font-semibold text-eventu-main-ink">{pendientes}</span>
                </li>
            </ul>
        </div>
    );
}
