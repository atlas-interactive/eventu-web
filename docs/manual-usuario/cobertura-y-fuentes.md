# Cobertura y fuentes del manual

Material editorial para verificar el manual antes de integrarlo al entregable. Los números de sección remiten a los capítulos [web](01-manual-web.md) y [móvil](02-manual-movil.md).

## Fuentes consultadas

- **Especificación:** libro «Historias de usuario - EventU.xlsx», hoja **EventU, Criterios**, rango **B5:J141**. Se consultó la copia disponible en el escritorio durante esta edición; el libro no se modifica ni se copia al repositorio. Las otras hojas contienen plantilla, instructivo o ejemplo y no se utilizan como requisitos del producto.
- **Alcance proporcionado por el responsable:** versión 1.0.0, todos los roles, internet obligatorio, web centrada en gestión y móvil centrado en presentación de entradas y registro de asistencia.
- **Web:** código local del repositorio eventu-web, revisión `7b9b4debd78706f97b41aad035fd74eaf4e9fd79`, y URL indicada por el responsable: <https://eventu-web-sigma.vercel.app/>. Se consultaron rutas, guardias, pantallas, componentes, servicios y textos en español.
- **Móvil:** código local de [eventu-mobile](https://github.com/atlas-interactive/eventu-mobile), revisión `536c2530ee38f8e8ef59b11ad5984c188770c71d`; `app.json` declara versión 1.0.0. Se consultaron navegación, autenticación, catálogo, detalle, inscripciones, QR, escáner, certificados y perfil.
- **Distribución móvil:** la API pública de GitHub confirmó la [release v1.0.0](https://github.com/atlas-interactive/eventu-mobile/releases/tag/v1.0.0) y el asset `EventU-v1.0.0.apk`. Esto verifica la referencia de descarga; no demuestra por sí solo que el código local y el binario instalado sean idénticos.
- **Reglas de asistencia:** consulta puntual de `AsistenciaController.java` y `AsistenciaService.java` del backend local para contrastar autorización y rechazo de códigos duplicados o cancelados.

Consulta realizada el **17 de noviembre de 2026**. No se probó la aplicación publicada ni se instaló o ejecutó la APK para redactar esta edición. Las capturas y la revisión de los procedimientos sobre esos entornos quedan pendientes.

## Relación con las 20 historias de usuario

| Historia | Filas en la hoja | Función | Manual web | Manual móvil |
| --- | --- | --- | --- | --- |
| HU-01 | 5–11 | Registro institucional | 2.1 | 3.2 remite al registro web |
| HU-02 | 13–21 | Sesión, reactivación y recuperación | 2.2–2.3 y 2.4 | 3.2 y 3.10.2; recuperación mediante web |
| HU-03 | 23–29 | Asignar y revocar organizador | 2.16 | Administración mediante web |
| HU-04 | 31–37 | Crear, editar, desactivar y activar categorías | 2.17 | Administración mediante web |
| HU-05 | 39–44 | Crear eventos | 2.11 | 3.7 remite a creación web |
| HU-06 | 46–51 | Editar eventos | 2.12 | Gestión mediante web |
| HU-07 | 53–58 | Cancelar eventos y notificar inscritos | 2.13 | Gestión mediante web |
| HU-08 | 60–65 | Buscar y filtrar eventos | 2.5 | 3.3 |
| HU-09 | 67–70 | Consultar detalle y disponibilidad | 2.5 | 3.3 |
| HU-10 | 72–79 | Inscribirse y obtener entrada | 2.6 | 3.4 |
| HU-11 | 81–83 | Consultar inscripciones e historial | 2.7 | 3.5 |
| HU-12 | 85–90 | Cancelar inscripción y volver a inscribirse | 2.7 | 3.6 |
| HU-13 | 92–94 | Consultar participantes y asistencia | 2.14 | 3.7 |
| HU-14 | 96–99 | Presentar el QR propio | 2.6–2.7 como función adicional de la web | 3.5 |
| HU-15 | 101–106 | Validar QR o código manual y registrar asistencia | 2.14 remite a móvil | 3.8, 3.8.1 y 3.8.2 |
| HU-16 | 108–110 | Estadísticas propias y globales | 2.15 | Consulta mediante web |
| HU-17 | 112–114 | Exportar reporte PDF de inscritos/asistentes | 2.14 | Exportación mediante web |
| HU-18 | 116–120 | Certificado individual de asistencia | 2.8 como función adicional de la web | 3.9 |
| HU-19 | 122–131 | Perfil, contraseña y desactivación | 2.9–2.9.2 | 3.10–3.10.2 para Usuario y Organizador |
| HU-20 | 133–141 | Actividad y filtros de auditoría | 2.18 | Administración mediante web |

La relación cubre las funciones y las condiciones de uso de las historias. No constituye un reporte de ejecución de todos los criterios de aceptación. Los criterios técnicos, como cifrado de contraseñas o control transaccional del último cupo, se traducen solo en su efecto para el usuario; no se exponen como instrucciones de uso.

## Funciones documentadas además de la formulación de las historias

- Confirmación de correo y reenvío del enlace, según los componentes de autenticación y el requisito de confirmación del despliegue.
- Accesibilidad, tema e idioma en web; accesibilidad y apariencia del dispositivo en móvil.
- Descarga de entrada y archivo de calendario en web.
- Disponibilidad del QR y del certificado también en web, aunque HU-14 y HU-18 se formulen para móvil.
- El estado temporal «finalizado» se explica como indicación del momento del evento. No se inventa una acción manual de finalizarlo.

## Diferencias que deben conservarse al revisar

| Evidencia | Tratamiento en el manual |
| --- | --- |
| `src/app/login.tsx` móvil rechaza ADMIN y remite al panel web | Administrador documentado en web. No se le indica iniciar sesión, editar perfil o escanear desde la APK. |
| El backend admite validación por Organizador o Administrador, pero el acceso móvil del Administrador está bloqueado | El procedimiento visible de escaneo se describe para el Organizador de sus eventos; no se inventa una navegación móvil para ADMIN. |
| La entrada al detalle móvil de inscritos se ofrece en eventos propios | Se indica Solo mis eventos, Ver detalle e Inscritos y asistencia para O1. |
| El botón de certificado puede mostrarse después del inicio y antes de verificar asistencia | Se explica que el botón no prueba el derecho a recibirlo y que el servidor valida la asistencia. |
| La confirmación del correo depende de la exigencia configurada | Revisar W-02, W-03 y W-05 sobre el entorno publicado antes de eliminar la formulación condicional. |

## Revisión pendiente para cerrar la edición ilustrada

1. Obtener las imágenes de la [guía de capturas](guia-de-capturas.md) sobre la web publicada y la APK de la release.
2. Comparar los textos y pasos con esas interfaces, corrigiendo cualquier diferencia respecto del código local consultado.
3. Registrar modelo/versión de Android y navegador utilizados, sin inferir compatibilidad mínima a partir de un único dispositivo.
4. Insertar las figuras y revisar que todas puedan leerse al exportar a Word o PDF.
5. Verificar el índice, la numeración continua y la cobertura de los tres roles en el documento unido.
