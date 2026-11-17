# EventU — Aplicación web

Aplicación web para gestionar eventos institucionales, inscripciones y participación. Desarrollada con React y TypeScript para usuarios, organizadores y administradores.

**Aplicación publicada:** [eventu-web-sigma.vercel.app](https://eventu-web-sigma.vercel.app/).

## Alcance y roles

La web concentra la creación y gestión de eventos y la administración de la plataforma. La [aplicación móvil Android](https://github.com/atlas-interactive/eventu-mobile) facilita presentar la entrada QR y registrar asistencias durante los eventos. Ambos entornos comparten cuentas y datos y requieren conexión a internet para operar contra el backend.

| Rol | Funciones principales en la web |
| --- | --- |
| Usuario | Explorar y filtrar eventos, inscribirse, consultar su agenda y entrada QR, cancelar inscripciones y descargar certificados cuando corresponda. |
| Organizador | Crear, editar y cancelar sus eventos; consultar participantes, exportar reportes PDF y revisar estadísticas propias. También puede inscribirse en eventos de otros organizadores. |
| Administrador | Gestionar categorías y roles de organizador, administrar todos los eventos y consultar estadísticas globales y el registro de actividad. No puede inscribirse como asistente. |

La consulta y descarga de entradas QR están disponibles en la web. **El escaneo o ingreso manual del código para validar entradas y registrar asistencia se realiza desde la APK**, con la cuenta del Organizador. El Administrador utiliza el panel web; la APK no permite el acceso de ese rol.

## Funcionalidades compartidas

- Registro con correo institucional `@unillanos.edu.co`, confirmación de correo y reenvío del enlace cuando se exige la confirmación.
- Inicio de sesión, recuperación y restablecimiento de contraseña.
- Consulta y edición del perfil, cambio de contraseña y desactivación/reactivación de la cuenta.
- Botones para mostrar u ocultar la contraseña en login, registro y cambio de contraseña del perfil.
- Accesibilidad: tamaño de texto, contraste y tipografía; temas claro y oscuro e interfaz en español e inglés.
- Descarga de entradas, archivos de calendario y certificados PDF para eventos certificables con asistencia verificada.

## Tecnologías

React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios e i18next. Los gráficos utilizan Recharts y las entradas utilizan qrcode.react. Las pruebas se ejecutan con Vitest, Testing Library, jsdom y MSW; ESLint revisa el código.

## Ejecución local

### Requisitos

- Node.js compatible con las dependencias del proyecto. Para las versiones actuales, utiliza **Node.js 24.15.0 o posterior de la rama 24.x**, o una versión compatible de la rama 26.x. El entorno de pruebas también exige una versión reciente de Node.js.
- npm y acceso al registro de paquetes para instalar las dependencias.
- Backend EventU disponible y configurado para aceptar el origen del frontend.

### Instalación y configuración

Desde la raíz del repositorio, instala las dependencias respetando `package-lock.json`:

```bash
npm ci
```

Crea un archivo `.env` en la raíz y configura la URL base del backend, incluyendo `/api`:

```env
VITE_API_URL=http://localhost:8080/api
```

Este valor es un ejemplo para un backend local. Sustitúyelo por la dirección del backend que utilizarás. Las variables con prefijo `VITE_` se incorporan al cliente y son públicas; no deben contener secretos. El archivo `.env` está excluido de Git.

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre la dirección que indique Vite en la terminal. Después de modificar `.env`, reinicia el servidor de desarrollo.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Comprobación de TypeScript y compilación de producción en `dist/`. |
| `npm run preview` | Vista previa local de la compilación; ejecutar `npm run build` primero. |
| `npm run lint` | Revisión con ESLint. |
| `npm test` | Vitest en modo interactivo durante el desarrollo. |
| `npm test -- --run` | Ejecutar las pruebas una vez. |
| `npm run test:coverage` | Pruebas con cobertura V8 e informe HTML en `coverage/`. |

Las pruebas utilizan un DOM simulado con jsdom y respuestas de API simuladas con MSW. No requieren levantar el backend para los casos que ya tienen sus respuestas simuladas.

Existe además el script `npm run test:ui`, pero `@vitest/ui` no está declarado en las dependencias de desarrollo. Su interfaz gráfica requiere ese paquete compatible con la versión instalada de Vitest.

## Despliegue

La compilación genera los archivos estáticos en `dist/`. Configura `VITE_API_URL` en el entorno de despliegue **antes de compilar**. Cambiar esa variable después requiere generar y desplegar una nueva compilación.

El repositorio incluye [vercel.json](vercel.json) con una reescritura a `/` para que las rutas de React Router funcionen al abrirlas directamente o recargar la página. Si utilizas otro alojamiento, configura el retorno a `index.html` para las rutas del frontend.

## Estructura del repositorio

| Directorio | Contenido |
| --- | --- |
| `src/api/` | Cliente HTTP, descargas y tratamiento de errores. |
| `src/components/` | Componentes compartidos de interfaz y layouts. |
| `src/features/` | Funciones organizadas por dominio: autenticación, eventos, inscripciones, perfil y administración. |
| `src/hooks/` | Hooks reutilizables y lógica de consulta y estado. |
| `src/routes/` | Rutas de la aplicación y composición de layouts y guardias. |
| `src/i18n/` | Configuración de idioma y traducciones. |
| `src/styles/` | Estilos y temas. |
| `tests/` | Pruebas unitarias, de integración y respuestas simuladas. |
| `docs/manual-usuario/` | Capítulos e imágenes de los manuales web y móvil. |

## Manuales de usuario

La documentación funcional de la versión **1.0.0** está organizada para integrarse posteriormente en un único entregable:

1. [Introducción, requisitos y roles](docs/manual-usuario/00-introduccion.md).
2. [Manual web](docs/manual-usuario/01-manual-web.md).
3. [Manual móvil Android](docs/manual-usuario/02-manual-movil.md).
4. [Solución de problemas y glosario](docs/manual-usuario/03-solucion-de-problemas.md).

Los manuales incluyen 20 capturas web y 19 móviles, con figuras numeradas del 1 al 39.

## Licencia

Consulta las condiciones de uso del software en [LICENCE](LICENCE).
