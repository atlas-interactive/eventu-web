# 2. Manual de la aplicación web

**EventU 1.0.0.** Acceso: [eventu-web-sigma.vercel.app](https://eventu-web-sigma.vercel.app/).

## 2.1. Crear una cuenta institucional

**Dirigido a:** personas que aún no tienen cuenta.

1. Abra la web y seleccione **Regístrate** en el inicio de sesión.
2. Ingrese su **Nombre completo**, **Correo institucional** y **Contraseña**. El botón de ojo permite mostrarla u ocultarla.
3. Use un correo terminado en **@unillanos.edu.co** y una contraseña de **8 a 72 caracteres**.
4. Seleccione **Crear cuenta** y revise el mensaje de resultado.
5. Abra el mensaje recibido en su correo institucional y siga el enlace de confirmación.
6. Cuando aparezca la confirmación correcta, seleccione **Ir a iniciar sesión**.

**Resultado:** obtiene una cuenta con rol Usuario. Si el correo ya está registrado, utilice el inicio de sesión o la recuperación de contraseña. Una cuenta desactivada se reactiva iniciando sesión, en lugar de registrarse nuevamente.

![Formulario de registro con los campos de nombre, correo y contraseña](imagenes/web/W-01-registro.png)

**Figura 1.** Registro de una cuenta institucional.

![Aviso de envío del enlace de confirmación al correo institucional](imagenes/web/W-02-confirmacion-pendiente.png)

**Figura 2.** Solicitud de confirmación del correo después del registro.

![Confirmación correcta del correo y enlace para iniciar sesión](imagenes/web/W-03-correo-confirmado.png)

**Figura 3.** Correo confirmado y acceso al inicio de sesión.

## 2.2. Iniciar sesión y reenviar la confirmación

**Dirigido a:** todos los roles.

1. Ingrese su correo institucional y contraseña. Use el botón de ojo si necesita mostrarla u ocultarla.
2. Seleccione **Iniciar sesión**.
3. Si se indica que falta confirmar el correo, seleccione **Reenviar enlace**, revise su correo y complete la confirmación antes de volver a entrar.

**Resultado:** el Usuario accede al catálogo, el Organizador a sus eventos y el Administrador a las categorías. Los demás módulos autorizados están en la navegación superior.

Si el sistema informa que reactivó su cuenta, lea el aviso y seleccione **Continuar**. Las inscripciones canceladas al desactivar la cuenta no se recuperan mediante ese aviso; consulte sus inscripciones y vuelva a inscribirse si aún es posible.

![Inicio de sesión con correo, contraseña y enlaces de registro y recuperación](imagenes/web/W-04-login.png)

**Figura 4.** Inicio de sesión con la cuenta institucional.

## 2.3. Recuperar la contraseña

**Dirigido a:** todos los roles, sin sesión iniciada.

1. En el inicio de sesión, seleccione **¿Olvidaste tu contraseña?**.
2. Ingrese su correo institucional y seleccione **Enviar enlace**.
3. Revise su correo. La pantalla muestra una respuesta genérica que no revela si existe una cuenta asociada.
4. Abra el enlace recibido dentro de sus **30 minutos** de vigencia. Es de un solo uso.
5. Ingrese una nueva contraseña de **8 a 72 caracteres**, repítala y seleccione **Restablecer contraseña**.
6. Inicie sesión con la nueva contraseña en los dispositivos que utilice.

**Resultado:** la contraseña se actualiza, se cierran las sesiones abiertas y se envía un correo avisando del cambio. Si el enlace venció o ya se utilizó, solicite uno nuevo.


## 2.4. Reconocer la navegación

Después de iniciar sesión, use la barra superior para cambiar de módulo. En pantallas estrechas, abra el botón de navegación para ver las opciones. El menú de perfil permite abrir **Perfil**, cambiar el tema y el idioma, entrar a **Accesibilidad** y **Cerrar sesión**.

| Rol | Opciones principales |
| --- | --- |
| Usuario | Eventos en campus y Mis inscripciones. |
| Organizador | Mis eventos, Explorar eventos, Mis inscripciones y Estadísticas. |
| Administrador | Categorías, Organizadores, Eventos, Estadísticas y Actividad. |

Los controles **Volver a eventos** o **Volver a mis eventos** llevan al listado indicado. Para cerrar sesión, abra el menú de perfil y seleccione **Cerrar sesión**; se mostrará el inicio de sesión.

![Menú de perfil con opciones de tema, accesibilidad, idioma y cierre de sesión](imagenes/web/W-11-menu-perfil.png)

**Figura 5.** Opciones disponibles en el menú de perfil.

## 2.5. Buscar eventos y consultar su detalle

**Dirigido a:** Usuario y Organizador que busca actividades a las que asistir.

1. Abra **Eventos en campus** o **Explorar eventos**, según su rol.
2. Escriba parte del título en **Buscar eventos...**.
3. Seleccione una categoría y, si lo necesita, un rango **Desde/Hasta**. Puede utilizar los periodos rápidos.
4. Cambie el orden por fecha o por título. En pantallas estrechas, abra **Filtros** para ver las opciones.
5. Seleccione **Ver detalle** en la tarjeta del evento.
6. Revise descripción, fecha, hora, lugar, categoría, organizador y cupos disponibles. La marca **Certificable** indica si el evento ofrece certificado.

**Resultado:** encuentra eventos que cumplen los filtros y consulta sus condiciones antes de inscribirse. La exploración ordinaria muestra eventos disponibles; la gestión y el historial permiten consultar otros estados. Si no hay coincidencias, use **Limpiar filtros**.

![Catálogo con búsqueda, fechas, categorías y tarjetas de eventos](imagenes/web/W-05-catalogo-eventos.png)

**Figura 6.** Catálogo de eventos y controles de búsqueda y filtrado.

![Detalle de Club de lectura con información del evento y botón de inscripción](imagenes/web/W-06-detalle-evento.png)

**Figura 7.** Información del evento antes de inscribirse.

## 2.6. Inscribirse y consultar la entrada

**Dirigido a:** Usuario u Organizador que asiste a un evento ajeno.

**Antes de empezar:** el evento debe estar publicado, no haber iniciado y tener cupo disponible. No debe tener ya una inscripción activa para el mismo evento.

1. Abra el detalle y seleccione **Inscribirme al evento**.
2. Espere el resultado. La pantalla debe indicar **Estás inscrito** y ofrecer el acceso a la entrada.
3. Consulte el QR en el panel **Tu entrada**. En las vistas que ofrecen **Ver mi entrada**, seleccione ese botón para abrirlo. También puede consultarlo desde **Mis inscripciones**.
4. En la entrada, utilice **Descargar entrada** si necesita guardar una copia.
5. Si desea incorporar la actividad a su agenda personal, seleccione **Añadir al calendario** en el detalle y abra el archivo descargado con su aplicación de calendario.

**Resultado:** se reserva un cupo y se genera una entrada única. El Administrador no puede inscribirse y un Organizador no puede hacerlo en sus propios eventos. Si otro participante ocupa el último cupo antes de completar la solicitud, el sistema informa que ya no está disponible.

El QR puede presentarse desde la web o la aplicación móvil. Su escaneo y validación se realizan en la aplicación móvil del organizador.

![Evento con estado Estás inscrito, entrada QR y opciones de descarga y calendario](imagenes/web/W-07-inscripcion-entrada.png)

**Figura 8.** Inscripción realizada y entrada QR del evento.

## 2.7. Consultar las inscripciones y cancelar una reserva

**Dirigido a:** Usuario y Organizador inscrito como participante.

1. Abra **Mis inscripciones**.
2. Seleccione **Todas**, **Activas** o **Canceladas**.
3. Cambie de mes con las flechas del calendario y seleccione el día del evento para consultar su agenda.
4. Use **Ver QR** para abrir una entrada vigente.
5. Para liberar un cupo, seleccione **Cancelar** en la inscripción, revise el diálogo y pulse **Confirmar cancelación**. **Volver** cierra el diálogo sin cancelar.

**Resultado:** una cancelación válida libera el cupo y conserva la inscripción en el historial como Cancelada. Solo puede cancelar una inscripción propia, activa, antes de que inicie el evento y sin asistencia registrada.

Si cambia de decisión, puede volver a inscribirse cuando el evento siga publicado, aún no inicie y tenga cupos. La nueva inscripción genera su entrada correspondiente. El QR deja de ofrecerse cuando termina el día del evento o se cancela la inscripción.

![Mis inscripciones con reserva activa, calendario y acciones de QR y cancelación](imagenes/web/W-08-mis-inscripciones.png)

**Figura 9.** Agenda personal y acciones de la inscripción activa.

![Diálogo para confirmar la cancelación de la inscripción a Club de lectura](imagenes/web/W-09-cancelar-inscripcion.png)

**Figura 10.** Confirmación antes de liberar el cupo reservado.

## 2.8. Descargar el certificado de asistencia

**Dirigido a:** Usuario u Organizador que asistió como participante.

1. Abra el detalle del evento desde su inscripción.
2. Una vez iniciado el evento, si está marcado como certificable y conserva una inscripción activa, se ofrece **Descargar certificado**.
3. Seleccione el botón y guarde el PDF.

**Resultado:** obtiene el certificado con su nombre y los datos del evento **cuando la asistencia ya fue verificada**. Que aparezca el botón no confirma por sí mismo esa verificación; si está pendiente, solicite al organizador que registre su asistencia desde el móvil.

![Ejemplo de certificado de asistencia con participante, evento y fecha de emisión](imagenes/web/W-10-certificado.jpeg)

**Figura 11.** Ejemplo de certificado de asistencia. Corresponde a un evento y participante distintos de los utilizados en las figuras anteriores.

## 2.9. Consultar y editar el perfil

**Dirigido a:** todos los roles.

1. Abra el menú de perfil y seleccione **Perfil**.
2. Consulte su nombre, correo institucional, rol y fecha de registro.
3. Seleccione **Editar información**, cambie el nombre y pulse **Guardar cambios**.
4. Para salir sin guardar, seleccione **Cancelar**.

**Resultado:** el nombre actualizado aparece en el perfil y la sesión. El nombre es obligatorio y admite hasta **100 caracteres**. El correo institucional es de solo lectura y el rol se administra desde el módulo de Organizadores.


### 2.9.1. Cambiar la contraseña

1. En **Mi perfil**, ubique **Cambiar contraseña**.
2. Ingrese la contraseña actual, una nueva de **8 a 72 caracteres** y su confirmación. Cada campo dispone de un botón de ojo independiente para mostrar u ocultar su contenido.
3. Seleccione **Actualizar contraseña** y revise el resultado.

**Resultado:** cambia su contraseña, se cierran las demás sesiones y se envía un aviso al correo. La sesión desde la que realiza el cambio se conserva.


### 2.9.2. Desactivar y reactivar la cuenta

1. En **Mi perfil**, lea las condiciones de **Desactivar cuenta**.
2. Seleccione **Desactivar mi cuenta**.
3. En el diálogo, ingrese su contraseña y seleccione **Confirmar desactivación**.

**Resultado:** se cierra la sesión y se conserva la cuenta desactivada. Sus inscripciones activas en eventos que aún no inician se cancelan y liberan los cupos. Las asistencias ya registradas se conservan.

El único Administrador activo no puede desactivarse. Un Organizador con eventos publicados pendientes debe cancelarlos o esperar a que finalicen. Para reactivar la cuenta, inicie sesión con las credenciales correctas y acepte el aviso de reactivación.


## 2.10. Ajustar accesibilidad, tema e idioma

**Dirigido a:** todos los roles.

1. Abra **Accesibilidad** desde el menú de perfil. En los formularios de acceso también puede utilizar el icono de accesibilidad de la esquina superior derecha.
2. Ajuste el tamaño de fuente, el contraste y la tipografía.
3. Seleccione **Aceptar** para cerrar el panel.
4. Utilice el control de tema para alternar entre claro y oscuro. En la sesión está en el menú de perfil; en los formularios de acceso está en la esquina superior derecha.
5. En el menú de perfil, elija **Español** o **English** para cambiar el idioma.

**Resultado:** adapta la presentación. Las preferencias visuales se guardan en el navegador y pueden ser diferentes en otro dispositivo. Puede recorrer los controles con **Tab**, activar botones con **Enter** o **Espacio**, y cerrar menús o diálogos con **Escape**.

![Panel de accesibilidad con tamaño de fuente, contraste y tipografía](imagenes/web/W-12-accesibilidad.png)

**Figura 12.** Ajustes de accesibilidad de la aplicación web.

## 2.11. Crear un evento

**Dirigido a:** Organizador y Administrador.

1. Abra **Mis eventos** o **Eventos**, según su rol, y seleccione **Crear evento**.
2. Complete los datos:

   | Campo | Qué ingresar |
   | --- | --- |
   | Título | Nombre del evento, hasta 150 caracteres. |
   | Descripción | Información que necesita conocer el participante. |
   | Fecha y hora | Inicio futuro del evento. |
   | Ubicación | Lugar donde se realizará, hasta 150 caracteres. |
   | Cupo máximo | Cantidad entera de participantes, mayor que cero. |
   | Categoría | Una categoría activa del listado. |
   | Evento certificable | Actívelo si se entregará certificado a quienes tengan asistencia verificada. |

3. Seleccione **Crear evento** y espere la confirmación.

**Resultado:** el evento queda Publicado con todos los cupos disponibles. Si no hay categorías activas, solicite al Administrador que prepare una antes de continuar.

En la gestión, el Organizador consulta sus eventos y el Administrador consulta todos los eventos. Utilice búsqueda, categoría, fechas y el filtro **Estado** para elegir **Todos**, **Publicados** o **Cancelados**. Los eventos cancelados se conservan como historial.

![Gestión de eventos propios con filtros, Crear evento y acceso a inscritos](imagenes/web/W-13-gestion-eventos.png)

**Figura 13.** Panel Mis eventos del Organizador. Los ejemplos mostrados ya finalizaron; las acciones de edición y cancelación se ofrecen para eventos que aún no han iniciado.

![Formulario de creación con título, descripción, categoría, cupo, fecha, lugar y certificación](imagenes/web/W-14-formulario-evento.png)

**Figura 14.** Datos para publicar un evento certificable.

## 2.12. Editar un evento

**Dirigido a:** Organizador dueño del evento o Administrador.

1. Localice el evento en la gestión de eventos y seleccione **Editar**.
2. Modifique los datos necesarios.
3. Conserve un cupo máximo igual o superior al número de inscritos actuales y una fecha de inicio futura.
4. Seleccione **Guardar cambios**.

**Resultado:** se actualiza la información y se recalculan los cupos disponibles conservando los inscritos. No se editan eventos cancelados ni eventos que ya iniciaron. Otro Organizador no puede editar sus eventos.


## 2.13. Cancelar un evento

**Dirigido a:** Organizador dueño del evento o Administrador.

1. Antes de que inicie el evento, localícelo y seleccione **Cancelar**.
2. Lea el diálogo que informa del cambio de estado y la notificación a los inscritos.
3. Seleccione **Cancelar evento** para confirmar, o **Volver** para conservarlo.

**Resultado:** el evento queda Cancelado, sus inscripciones activas pasan a Cancelada y no se permiten nuevas reservas. Se conserva el historial y se notifica por correo a los participantes afectados. No es posible cancelar nuevamente un evento cancelado ni cancelarlo después de su inicio.


## 2.14. Consultar participantes y exportar el reporte

**Dirigido a:** Organizador dueño del evento o Administrador.

1. En la tarjeta del evento gestionado, seleccione **Inscritos**.
2. Revise el resumen de inscritos, cupos disponibles, asistentes y pendientes.
3. Busque por nombre o correo y utilice los filtros **Todos**, **Asistieron** o **Pendientes**.
4. Para obtener el documento del evento, seleccione **Reporte PDF** y guarde el archivo.

**Resultado:** consulta el estado de los participantes y obtiene el reporte de inscritos y asistentes. El reporte corresponde al evento; la búsqueda de la tabla no define un reporte parcial. Si no hay registros, el PDF indica esa condición.

Para registrar una asistencia, utilice **Inscritos y asistencia** en la aplicación móvil; la tabla web permite consultar los resultados.

![Listado de participantes con asistencias registradas, resumen y botón Reporte PDF](imagenes/web/W-15-participantes-reporte.png)

**Figura 15.** Consulta de inscritos y acceso a la exportación del reporte PDF.

## 2.15. Consultar estadísticas

**Dirigido a:** Organizador y Administrador.

1. Abra **Estadísticas**.
2. Consulte **Inscripciones activas**, **Asistentes** y el porcentaje de asistencia.
3. Como Administrador, consulte también las categorías más concurridas y los eventos con más inscritos.

**Resultado:** el Organizador ve información de sus propios eventos; el Administrador ve los datos globales. El porcentaje se calcula como asistentes divididos entre inscripciones activas, multiplicado por cien. Un panel sin participación puede mostrar ceros o un mensaje sin datos.

![Estadísticas del Organizador con inscripciones activas, asistentes y porcentaje de asistencia](imagenes/web/W-16-estadisticas-organizador.png)

**Figura 16.** Indicadores de participación en los eventos del Organizador.

![Estadísticas del Administrador con indicadores globales y rankings de categorías y eventos](imagenes/web/W-19-estadisticas-admin.png)

**Figura 17.** Vista global de participación y encabezados de los rankings para el Administrador.

## 2.16. Asignar y revocar organizadores

**Dirigido a:** Administrador.

1. Abra **Organizadores** y escriba al menos dos caracteres del nombre o correo de una cuenta ya registrada. La búsqueda se actualiza mientras escribe.
2. Revise el nombre, correo y rol del resultado antes de modificarlo.
3. Para habilitar a un Usuario, seleccione **Asignar organizador** y compruebe el cambio en el listado.
4. Para retirar el permiso a un Organizador, seleccione **Revocar rol**, lea las consecuencias y confirme con **Sí, revocar rol**.

**Resultado:** la cuenta conserva su acceso y pasa a Organizador o Usuario. Revocar el rol conserva los eventos creados; desde ese momento, su gestión corresponde al Administrador. No es necesario crear otra cuenta para cambiar el rol.

![Gestión de organizadores con buscador de cuentas y listado de organizadores actuales](imagenes/web/W-17-organizadores.png)

**Figura 18.** Búsqueda de cuentas y acceso a la revocación del rol de Organizador.

## 2.17. Gestionar categorías

**Dirigido a:** Administrador.

1. Abra **Categorías**.
2. Para crear una, seleccione **Nueva categoría**, escriba su nombre y pulse **Guardar**.
3. Para renombrarla, seleccione **Editar** en su fila, escriba el nuevo nombre y guarde.
4. Para retirarla de los formularios nuevos, seleccione **Desactivar** y confirme el diálogo.
5. Para volver a ofrecerla, seleccione **Activar** y confirme.

**Resultado:** una categoría nueva queda activa. Los nombres no pueden estar vacíos ni duplicar otra categoría, aunque cambie el uso de mayúsculas. Cambiar el nombre se refleja en los eventos asociados. Desactivar una categoría conserva esos eventos y su clasificación; la categoría deja de estar disponible al crear eventos nuevos.

![Gestión de categorías con Nueva categoría, estado activo y acciones Editar y Desactivar](imagenes/web/W-18-categorias.png)

**Figura 19.** Creación y administración de las categorías de eventos.

## 2.18. Consultar el registro de actividad

**Dirigido a:** Administrador.

1. Abra **Actividad**.
2. Consulte fecha y hora, usuario, acción, entidad, resultado y motivo. El listado se ordena del registro más reciente al más antiguo.
3. Combine los filtros de usuario, acción, entidad, resultado y fechas. Puede utilizar los periodos rápidos.
4. Use los controles de paginación para recorrer los registros.
5. Seleccione **Limpiar filtros** para volver a la consulta general.

**Resultado:** identifica operaciones exitosas o fallidas y sus motivos. Un registro puede indicar **Sin usuario asociado**. Los registros son de solo lectura: no se editan ni eliminan desde este módulo.

![Registro de actividad con filtros, operaciones recientes y resultados](imagenes/web/W-20-actividad.png)

**Figura 20.** Consulta de actividad de la plataforma, disponible para el Administrador.
