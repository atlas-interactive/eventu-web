import type { ComponentType, SVGProps } from 'react';

export interface ElementoRanking {
    clave: string;
    nombre: string;
    valor: number;
}

interface Props {
    titulo: string;
    descripcion: string;
    unidad: string;
    elementos: ElementoRanking[];
    textoVacio: string;
    Icono: ComponentType<SVGProps<SVGSVGElement>>;
}

const formatoNumero = new Intl.NumberFormat('es-CO');

// Lista ordenada con una barra proporcional al primero; al ser HTML, los lectores de pantalla la leen como una lista normal
export function RankingBarras({ titulo, descripcion, unidad, elementos, textoVacio, Icono }: Props) {
    const maximo = Math.max(1, ...elementos.map((e) => e.valor));

    return (
        <section className="flex flex-col rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-eventu-main-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-eventu-soft-red-background text-eventu-institutional-red">
                    <Icono className="h-[1.125rem] w-[1.125rem]" />
                </span>
                {titulo}
            </h2>
            <p className="mt-1 pl-10 text-sm text-eventu-secondary-text">{descripcion}</p>

            {elementos.length === 0 ? (
                <p className="mt-6 text-sm text-eventu-secondary-text">{textoVacio}</p>
            ) : (
                <ol className="mt-5 space-y-4">
                    {elementos.map((elemento, i) => (
                        <li key={elemento.clave}>
                            <div className="flex items-baseline gap-3">
                                <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                        i === 0
                                            ? 'bg-eventu-institutional-red text-eventu-white-surface'
                                            : 'bg-eventu-page-background text-eventu-secondary-text'
                                    }`}
                                    aria-hidden="true"
                                >
                                    {i + 1}
                                </span>
                                <span className="min-w-0 flex-1 break-words text-sm text-eventu-main-ink">{elemento.nombre}</span>
                                <span className="shrink-0 text-sm font-semibold text-eventu-main-ink">
                                    {formatoNumero.format(elemento.valor)}
                                    <span className="sr-only"> {unidad}</span>
                                </span>
                            </div>
                            <div className="ml-9 mt-1.5 h-1.5 overflow-hidden rounded-full bg-eventu-page-background" aria-hidden="true">
                                <div
                                    className="h-full rounded-full bg-eventu-institutional-red"
                                    style={{ width: `${(elemento.valor / maximo) * 100}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
