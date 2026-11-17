# EventU - Aplicación Web

Aplicación web de **EventU** desarrollada en React para usuarios, organizadores y administradores. Concentra la creación y gestión de eventos y la administración de la plataforma.

## Funcionalidades Principales
* Creación, edición y cancelación de eventos.
* Exploración de eventos, inscripciones, consulta de entradas QR y certificados de asistencia.
* Dashboard de estadísticas de participación y porcentaje de asistencia.
* Consulta de asistencias registradas desde la aplicación móvil. El escaneo y la validación de entradas se realizan en la APK.
* Exportación de reportes de asistencia en PDF.
* Panel de accesibilidad con ajuste de texto, contraste normal o alto y selección de tipografía; tema oscuro disponible desde el menú del perfil.

## Manuales de usuario

Los [manuales web y móvil de la versión 1.0.0](docs/manual-usuario/README.md) incluyen procedimientos por rol, solución de problemas, cobertura de las 20 historias de usuario y una guía de capturas para preparar el entregable.

## Configuración Local

### Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto apuntando a la API backend:

```env
VITE_API_URL=http://localhost:8080/api
```
