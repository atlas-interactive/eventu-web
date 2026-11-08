import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { guardarArchivo } from '../../../api/descargas';

interface EntradaQrProps {
    codigo: string;
    nombreArchivo: string;
}

export function EntradaQr({ codigo, nombreArchivo }: EntradaQrProps) {
    const qrRef = useRef<SVGSVGElement>(null);
    const [error, setError] = useState('');

    const descargar = () => {
        const qr = qrRef.current;
        if (!qr) {
            setError('No se pudo preparar la descarga del código QR.');
            return;
        }

        const svg = qr.cloneNode(true) as SVGSVGElement;
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const contenido = new XMLSerializer().serializeToString(svg);
        guardarArchivo(new Blob([contenido], { type: 'image/svg+xml;charset=utf-8' }), nombreArchivo);
        setError('');
    };

    return (
        <div className="detalle-evento-entrada-qr">
            <div className="detalle-evento-qr-marco">
                <QRCodeSVG
                    ref={qrRef}
                    value={codigo}
                    size={176}
                    level="M"
                    marginSize={4}
                    title="Código QR de tu entrada"
                />
            </div>
            <p className="detalle-evento-qr-codigo">{codigo}</p>
            <p className="detalle-evento-qr-ayuda">
                Muéstralo en la entrada para registrar tu asistencia desde la aplicación móvil.
            </p>
            <button type="button" className="detalle-evento-qr-descargar" onClick={descargar}>
                <Download aria-hidden="true" />
                Descargar entrada
            </button>
            {error && <p className="detalle-evento-error" role="alert">{error}</p>}
        </div>
    );
}
