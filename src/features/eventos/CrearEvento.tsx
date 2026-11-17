import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormularioEvento } from './FormularioEvento';
import '../../styles/events.css';

// HU-05: el organizador crea un evento
export function CrearEvento() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('crearEvento.titulo')} | EventU`);
    const navigate = useNavigate();

    return (
        <main className="evento-page">
            <h1 className="evento-page-title">{t('crearEvento.titulo')}</h1>
            <p className="evento-description">
                {t('crearEvento.descripcion')}
            </p>
            <FormularioEvento
                onGuardado={(mensaje) => navigate('/organizador/eventos', { state: { mensaje } })}
                onCancelar={() => navigate('/organizador/eventos')}
            />
        </main>
    );
}
