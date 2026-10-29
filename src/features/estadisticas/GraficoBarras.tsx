import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface DatoGrafico {
    etiqueta: string;
    valor: number;
}

interface Props {
    titulo: string;
    descripcion: string;
    datos: DatoGrafico[];
    nombreValor: string;
    textoVacio: string;
}

const COLOR_BARRA = '#b3141f';
const MAX_CARACTERES_EJE = 24;

const recortar = (texto: string) =>
    texto.length > MAX_CARACTERES_EJE ? `${texto.slice(0, MAX_CARACTERES_EJE - 1)}…` : texto;

// La gráfica es solo visual (aria-hidden); los mismos datos quedan en una tabla para lectores de pantalla y teclado
export function GraficoBarras({ titulo, descripcion, datos, nombreValor, textoVacio }: Props) {
    const alto = Math.max(160, datos.length * 48 + 40);

    return (
        <figure className="rounded-lg border border-eventu-border bg-eventu-white-surface p-4 sm:p-5">
            <figcaption>
                <h2 className="text-base font-semibold text-eventu-main-ink">{titulo}</h2>
                <p className="mt-1 text-sm text-eventu-secondary-text">{descripcion}</p>
            </figcaption>

            {datos.length === 0 ? (
                <p className="mt-4 text-sm text-eventu-secondary-text">{textoVacio}</p>
            ) : (
                <>
                    <div className="mt-4" style={{ height: alto }} aria-hidden="true">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
                                <CartesianGrid horizontal={false} stroke="#e4e3de" />
                                <XAxis type="number" allowDecimals={false} tick={{ fill: '#6b6b68', fontSize: 13 }} />
                                <YAxis
                                    type="category"
                                    dataKey="etiqueta"
                                    width={170}
                                    tickFormatter={recortar}
                                    tick={{ fill: '#1a1a18', fontSize: 14 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#fbeaea' }}
                                    formatter={(valor) => [valor, nombreValor]}
                                />
                                <Bar dataKey="valor" fill={COLOR_BARRA} radius={[0, 4, 4, 0]} maxBarSize={32} isAnimationActive={false}>
                                    <LabelList dataKey="valor" position="right" fill="#1a1a18" fontSize={14} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <details className="mt-3 text-sm">
                        <summary className="cursor-pointer rounded text-eventu-institutional-red underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red">
                            Ver los datos en tabla
                        </summary>
                        <table className="mt-3 w-full border-collapse text-left">
                            <caption className="sr-only">{titulo}</caption>
                            <thead>
                                <tr className="border-b border-eventu-border">
                                    <th scope="col" className="py-2 pr-4 font-semibold text-eventu-main-ink">#</th>
                                    <th scope="col" className="py-2 pr-4 font-semibold text-eventu-main-ink">Nombre</th>
                                    <th scope="col" className="py-2 text-right font-semibold text-eventu-main-ink">{nombreValor}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.map((dato, i) => (
                                    <tr key={`${dato.etiqueta}-${i}`} className="border-b border-eventu-border last:border-0">
                                        <td className="py-2 pr-4 text-eventu-secondary-text">{i + 1}</td>
                                        <td className="break-words py-2 pr-4 text-eventu-main-ink">{dato.etiqueta}</td>
                                        <td className="py-2 text-right text-eventu-main-ink">{dato.valor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </details>
                </>
            )}
        </figure>
    );
}
