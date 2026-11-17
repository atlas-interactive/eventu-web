# Guía de capturas para el manual EventU 1.0.0

Esta guía es material de preparación del entregable. Cada fila indica una imagen y el momento exacto en que debe tomarse. No es necesario capturar cada clic ni todos los escenarios de prueba de las historias.

## Preparación

- **Web:** utilizar la aplicación publicada, español, zoom del navegador al 100 % y una ventana de aproximadamente 1440 × 900. Si un formulario no cabe, tomar la página completa conservando su legibilidad.
- **Móvil:** utilizar la APK **EventU-v1.0.0.apk**, en vertical, manteniendo la resolución original del teléfono. Anotar el modelo y la versión de Android para registrar el entorno utilizado.
- Mantener un mismo tema y datos de ejemplo dentro de cada procedimiento. Reservar los cambios de contraste, tamaño o tema para las capturas de preferencias.
- Usar cuentas y eventos de demostración. No incluir contraseñas visibles ni enlaces de confirmación o recuperación con su token. Mostrar el formulario de destino sin la barra de direcciones que contiene ese token.
- Las entradas QR de las imágenes deben pertenecer a inscripciones de demostración destinadas al manual.
- Guardar las imágenes en PNG, sin recortar botones, títulos, estados o mensajes necesarios para entender la acción. No añadir todavía números de figura incrustados; se numerarán al unir el documento.

### Datos que conviene preparar

| Referencia | Preparación |
| --- | --- |
| A | Una cuenta Administrador para categorías, roles, eventos globales, estadísticas y actividad. Solo se usa en web. |
| O1 | Un Organizador que creará y gestionará los eventos de ejemplo. |
| U1 | Un Usuario participante, con correo institucional al que se tenga acceso para registro y confirmación. |
| O2 | Un segundo Organizador que pueda inscribirse en eventos de O1. Permite demostrar que el Organizador también presenta su propio QR como participante. |
| Evento A | Evento futuro y certificable de O1, con al menos 10 cupos. Se utiliza para catálogo, inscripción y edición. |
| Evento B | Evento certificable de O1, con inicio durante el día de la sesión de capturas, al que U1 y O2 se hayan inscrito antes del inicio. Registrar las asistencias cuando corresponda y obtener los certificados después del inicio. Tomar los QR antes de que termine ese día. |
| Evento C | Otro evento futuro de O1, destinado a demostrar la cancelación del evento. |
| Cuenta y categoría auxiliares | Una cuenta para asignar y revocar el rol y una categoría para renombrar, desactivar y activar. |

Tome las capturas de consulta, entradas y gestión antes de cancelar registros o desactivar cuentas. Para mostrar cancelaciones en ambos entornos, utilice inscripciones de demostración diferentes o vuelva a inscribirse cuando todavía esté permitido. Realice los cambios de contraseña y la desactivación de cuenta al final.

## Primer bloque para revisar el estilo

Comience con estas **12 imágenes**: **W-01, W-02, W-03, W-04, W-08, W-10, W-11, W-12, M-03, M-04, M-08 y M-09**. Permiten revisar la presentación y la continuidad entre web y móvil antes de capturar el resto. W-02 y W-03 corresponden al flujo que solicita confirmación de correo; si ese requisito no se activa en el despliegue utilizado, registre esa diferencia para ajustar el manual.

## Capturas web

Guardar en `imagenes/web/`. Los números de procedimiento corresponden al [manual web](01-manual-web.md).

| Archivo | Procedimiento y rol | Preparación y momento de la captura |
| --- | --- | --- |
| `W-01-registro.png` | 2.1 · Cuenta nueva | Formulario de registro con nombre y correo de demostración, contraseña oculta y botón Crear cuenta visibles, antes de enviarlo. |
| `W-02-confirmacion-pendiente.png` | 2.1 · Cuenta nueva | Después de registrar: mensaje que solicita revisar el correo. |
| `W-03-correo-confirmado.png` | 2.1 · Cuenta nueva | Tras abrir el enlace del correo: mensaje de confirmación correcta e Ir a iniciar sesión. |
| `W-04-login.png` | 2.2 · Todos | Inicio de sesión con correo de demostración, contraseña oculta, enlaces de registro y recuperación, y controles superiores. |
| `W-05-reenviar-confirmacion.png` | 2.2 · Cuenta pendiente | Después de intentar entrar sin confirmar: aviso y acción Reenviar enlace visibles. Tomar antes de completar la confirmación de esa cuenta. |
| `W-06-recuperar-contrasena.png` | 2.3 · Todos | Formulario de recuperación, con campo de correo, Enviar enlace y enlace de regreso. |
| `W-07-restablecer-contrasena.png` | 2.3 · Todos | Formulario abierto desde un enlace válido: ambos campos y Restablecer contraseña, con contraseñas ocultas y sin el token visible. |
| `W-08-catalogo.png` | 2.4–2.5 · U1 | Catálogo con eventos de ejemplo, navegación y Ver detalle. |
| `W-09-filtros-eventos.png` | 2.5 · U1 | Búsqueda, categoría o fechas aplicadas y al menos una coincidencia. Deben verse los filtros y el resumen. |
| `W-10-detalle-evento.png` | 2.5 · U1 | Evento A antes de inscribirse: título, fecha, hora, lugar, cupos, organizador e Inscribirme al evento. |
| `W-11-inscripcion-entrada.png` | 2.6 · U1 | Después de inscribirse en A: abrir Ver mi entrada y mostrar QR, datos de la entrada y Descargar entrada. |
| `W-12-mis-inscripciones.png` | 2.7 · U1 | Calendario en el mes correcto, día con evento seleccionado y agenda con la inscripción. |
| `W-13-cancelar-inscripcion.png` | 2.7 · U1 | Diálogo de cancelación de una inscripción futura, antes de confirmar. Mostrar evento, consecuencias y botones. |
| `W-14-certificado.png` | 2.8 · U1 | PDF abierto después de descargar el certificado de B con asistencia verificada. Deben verse participante y evento. |
| `W-15-editar-perfil.png` | 2.9 · U1 | Perfil en edición: nombre editable y Guardar cambios. Conservar a la vista los datos de identificación que quepan. |
| `W-16-cambiar-contrasena.png` | 2.9.1 · U1 | Sección con contraseña actual, nueva, confirmación y Actualizar contraseña. Todos los valores ocultos. |
| `W-17-desactivar-cuenta.png` | 2.9.2 · Cuenta auxiliar | Diálogo de confirmación, explicación y campo de contraseña, antes de confirmar. |
| `W-18-cuenta-reactivada.png` | 2.2 y 2.9.2 · Cuenta auxiliar | Tras iniciar sesión correctamente en la cuenta desactivada: aviso Cuenta reactivada y Continuar. |
| `W-19-accesibilidad.png` | 2.10 · U1 | Panel abierto con tamaño, contraste, tipografía y Aceptar visibles. |
| `W-20-menu-perfil.png` | 2.4 y 2.10 · U1 | Menú abierto con Perfil, tema, idioma, Accesibilidad y Cerrar sesión. |
| `W-21-gestion-eventos.png` | 2.11 · O1 | Mis eventos con tarjetas, Crear evento, Inscritos, Editar y Cancelar disponibles para un evento futuro. |
| `W-22-crear-evento.png` | 2.11 · O1 | Formulario completo con datos del evento A o C, categoría activa, cupo y Evento certificable antes de guardar. |
| `W-23-editar-evento.png` | 2.12 · O1 | Formulario de un evento futuro ya creado, con un cambio de ejemplo y Guardar cambios visible. |
| `W-24-cancelar-evento.png` | 2.13 · O1 | Diálogo de cancelación de C con información sobre los inscritos y Cancelar evento. |
| `W-25-participantes.png` | 2.14 · O1 | Inscritos de B después de registrar al menos una asistencia: resumen y filas con Asistió/Pendiente. |
| `W-26-reporte-pdf.png` | 2.14 · O1 | Reporte PDF de B abierto: nombre del evento y listado con estado de asistencia. |
| `W-27-estadisticas-organizador.png` | 2.15 · O1 | Estadísticas propias después de tener inscripciones y asistencias. Incluir indicadores y gráfico. |
| `W-28-buscar-usuario.png` | 2.16 · A | Gestión de organizadores con búsqueda de la cuenta auxiliar, rol Usuario y Asignar organizador visibles. |
| `W-29-organizador-asignado.png` | 2.16 · A | Después de asignar el rol: mensaje de resultado y cuenta en Organizadores actuales. |
| `W-30-revocar-rol.png` | 2.16 · A | Diálogo de revocación de esa cuenta, con consecuencias y Sí, revocar rol. |
| `W-31-nueva-categoria.png` | 2.17 · A | Diálogo Nueva categoría con nombre auxiliar y Guardar. |
| `W-32-editar-categoria.png` | 2.17 · A | Diálogo Editar categoría con el nuevo nombre y Guardar. |
| `W-33-desactivar-categoria.png` | 2.17 · A | Confirmación para desactivar la categoría, con el aviso sobre sus eventos asociados si corresponde. |
| `W-34-activar-categoria.png` | 2.17 · A | Diálogo para activar de nuevo la categoría que quedó inactiva. |
| `W-35-estadisticas-admin.png` | 2.15 · A | Estadísticas globales con indicadores y rankings de categorías/eventos; usar página completa si es necesario. |
| `W-36-registro-actividad.png` | 2.18 · A | Registro de actividad con filtros aplicados, filas y paginación. Preferir datos que incluyan EXITO y FALLIDO. |

## Capturas móviles

Guardar en `imagenes/movil/`. Los números de procedimiento corresponden al [manual móvil](02-manual-movil.md). No utilice la web en modo responsive como sustituto de estas imágenes.

| Archivo | Procedimiento y rol | Preparación y momento de la captura |
| --- | --- | --- |
| `M-01-descarga-apk.png` | 3.1 · Sin sesión | Release v1.0.0 abierta desde el navegador del teléfono, con el archivo EventU-v1.0.0.apk en Assets. |
| `M-02-instalacion.png` | 3.1 · Sin sesión | Instalador Android mostrando EventU y la acción Instalar o la instalación terminada. |
| `M-03-login.png` | 3.2 y 3.10.2 · U1/O1 | Inicio de sesión de la APK con correo y contraseña oculta. También sirve para ilustrar el destino después de cerrar sesión. |
| `M-04-catalogo.png` | 3.2–3.3 · U1 | Catálogo con tarjetas y las tres pestañas inferiores visibles. |
| `M-05-filtros.png` | 3.3 · U1 | Panel de filtros abierto con categoría y rango de fechas visibles. |
| `M-06-detalle-evento.png` | 3.3 · U1 | Detalle de A sin inscripción: información del evento y acción para inscribirse. |
| `M-07-inscripcion-realizada.png` | 3.4 · U1 | Tras inscribirse: Estás inscrito y Ver mi entrada. Si U1 ya se inscribió en web, abrir el mismo evento demuestra que comparte los datos. |
| `M-08-agenda.png` | 3.5 · U1 | Inscripciones, calendario y agenda del día seleccionado, con el evento de demostración. |
| `M-09-entrada-qr.png` | 3.5 · U1 u O2 | Entrada completa con nombre del evento, QR, código escrito e Inscripción activa. Tomar mientras sea vigente. |
| `M-10-cancelar-inscripcion.png` | 3.6 · U1/O2 | Diálogo de cancelación de una inscripción futura diferente de la que se usará para registrar asistencia. |
| `M-11-certificado.png` | 3.9 · U1 | PDF de B o menú del sistema para abrir/guardar/compartir el certificado generado tras validar la asistencia. |
| `M-12-eventos-propios.png` | 3.7 · O1 | Catálogo con Solo mis eventos seleccionado y al menos un evento propio. |
| `M-13-inscritos.png` | 3.7 · O1 | Pantalla Inscritos y asistencia de B con resumen, participantes y Escanear QR de entrada. |
| `M-14-permiso-camara.png` | 3.8 · O1 | Pantalla que solicita Permitir cámara, antes de otorgar el permiso por primera vez. |
| `M-15-escaner.png` | 3.8 · O1 | Cámara habilitada con guías del escáner y referencia al evento. Evitar rostros o elementos ajenos a la demostración. |
| `M-16-asistencia-registrada.png` | 3.8 · O1 | Inmediatamente después de validar el QR de U1: Asistencia registrada, participante, evento y hora. |
| `M-17-validacion-manual.png` | 3.8.1 · O1 | Código de O2 escrito en el campo manual y botón Validar, antes de enviarlo; usar una inscripción sin asistencia previa. |
| `M-18-asistencia-duplicada.png` | 3.8.2 · O1 | Tras validar nuevamente el código de U1: mensaje Asistencia ya registrada. |
| `M-19-perfil.png` | 3.10 · U1 | Mi perfil con nombre, correo, rol y Editar información. |
| `M-20-editar-perfil.png` | 3.10 · U1 | Edición del nombre con Guardar cambios y Cancelar. |
| `M-21-cambiar-contrasena.png` | 3.10.1 · U1 | Sección de cambio de contraseña con sus tres campos ocultos y botón para actualizar. |
| `M-22-desactivar-cuenta.png` | 3.10.2 · Cuenta auxiliar | Confirmación de desactivación con campo de contraseña oculto y botón para confirmar. |
| `M-23-accesibilidad.png` | 3.11 · U1 | Sección Accesibilidad con Alto contraste, Modo daltonismo y Tamaño de letra. |

## Orden recomendado para completar la sesión

1. Registrar y confirmar la cuenta de demostración; capturar el reenvío antes de confirmar si se necesita una cuenta adicional pendiente.
2. Preparar categorías y roles auxiliares, sin revocar el acceso del organizador que realizará la demostración.
3. Crear los eventos y tomar las pantallas web de creación y edición.
4. Completar el primer bloque de capturas y las consultas de catálogo, detalle, agenda y entradas.
5. Como O1, capturar la cámara, validar la entrada de U1, registrar manualmente la de O2 y mostrar el rechazo de un duplicado.
6. Consultar participantes, exportar el reporte, obtener certificados y revisar estadísticas. Para el certificado, el inicio del evento B debe haber ocurrido.
7. Capturar cancelaciones, revocación de roles, cambios de contraseña y desactivación/reactivación en las cuentas o eventos auxiliares.
8. Tomar preferencias y actividad. Comprobar cierre de sesión en ambos entornos.

## Comprobaciones finales

- [ ] Las 36 imágenes web corresponden a los procedimientos y datos indicados.
- [ ] Las 23 imágenes móviles corresponden a la APK 1.0.0 instalada.
- [ ] Se revisaron los permisos con Usuario, Organizador y Administrador; la APK informa que el Administrador debe usar la web.
- [ ] Se confirmó que una inscripción realizada en web aparece en la APK y que una asistencia registrada en la APK aparece en la consulta web tras actualizarla.
- [ ] Los PDF de reporte y certificado se abren y muestran los datos esperados.
- [ ] Cada imagen se insertó en su marcador y recibió un pie de figura coherente.

**Total previsto: 59 imágenes.** Son imágenes del manual completo, no una obligación de adjuntar 59 capturas a la pull request. Una misma captura puede ilustrar más de un paso o sección. Para la PR se puede escoger después una muestra representativa.
