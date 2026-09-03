# EventU - Aplicación Web

Módulo Web desarrollado en React orientado principalmente a los **Organizadores de Eventos** de la plataforma **EventU**.

## Funcionalidades Principales
* Panel de administración de eventos (Crear, editar, cancelar y finalizar eventos).
* Dashboard de estadísticas de participación y porcentaje de asistencia.
* Módulo de escaneo/validación de códigos QR de asistentes en tiempo real.
* Exportación de reportes de asistencia en PDF.
* Funcionalidades de accesibilidad integradas (alto contraste, ajuste de texto).

## Configuración Local

### Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto apuntando a la API backend:

```env
REACT_APP_API_URL=http://localhost:8080/api
