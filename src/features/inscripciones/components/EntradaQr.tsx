import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { guardarArchivo } from '../../../api/descargas';

interface EntradaQrProps {
    codigo: string;
    nombreArchivo: string;
}

export function EntradaQr({ codigo, nombreArchivo }: EntradaQrProps) {
    const { t } = useTranslation();
    const qrRef = useRef<SVGSVGElement>(null);
    const [error, setError] = useState('');

    const descargar = () => {
        const qr = qrRef.current;
        if (!qr) {
            setError(t('entradaQr.error'));
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
                    title={t('entradaQr.tituloQr')}
                />
            </div>
            <p className="detalle-evento-qr-codigo">{codigo}</p>
            <p className="detalle-evento-qr-ayuda">
                {t('entradaQr.ayuda')}
            </p>
            <button type="button" className="detalle-evento-qr-descargar" onClick={descargar}>
                <Download aria-hidden="true" />
                {t('entradaQr.descargar')}
            </button>
            {error && <p className="detalle-evento-error" role="alert">{error}</p>}
        </div>
    );
}
