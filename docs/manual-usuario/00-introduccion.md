# 1. Introducción

**Producto:** EventU. **Versión documentada:** 1.0.0.

EventU permite organizar eventos institucionales, inscribirse en ellos y registrar la asistencia mediante una entrada con código QR. Este manual explica su uso para usuarios, organizadores y administradores.

## 1.1. Qué entorno utilizar

La **aplicación web** concentra la creación y gestión de eventos, la administración de la plataforma y el seguimiento de la participación. Permite realizar las operaciones del programa según los permisos del rol, salvo escanear y validar entradas para registrar asistencias.

La **aplicación móvil Android** facilita la interacción durante el evento: los usuarios y organizadores inscritos presentan su entrada, y el organizador escanea el QR o escribe el código para registrar la asistencia. También permite explorar eventos, inscribirse, consultar inscripciones, obtener certificados y gestionar el perfil.

Ambos entornos utilizan la misma cuenta y los mismos registros. Una inscripción realizada en la web puede consultarse desde la aplicación móvil. La consulta de esos datos y el registro de operaciones requieren conexión a internet en ambos entornos.

| Necesidad | Entorno recomendado |
| --- | --- |
| Crear la cuenta, confirmar el correo o recuperar la contraseña | Web |
| Crear, editar o cancelar eventos | Web |
| Administrar organizadores, categorías y actividad | Web, con rol Administrador |
| Consultar estadísticas y exportar el reporte de participantes | Web |
| Explorar eventos e inscribirse | Web o aplicación móvil |
| Consultar la propia entrada QR | Web o aplicación móvil; móvil facilita presentarla en el acceso |
| Escanear o escribir un código para registrar asistencia | Aplicación móvil, desde el evento gestionado por su organizador |
| Descargar un certificado de asistencia | Web o aplicación móvil, si se cumplen sus condiciones |
| Consultar o modificar el perfil | Web o aplicación móvil |

## 1.2. Requisitos y acceso

Para usar la web se necesita un navegador actualizado y acceso a [EventU web](https://eventu-web-sigma.vercel.app/). No es necesario instalar la APK para utilizar la web.

Para usar la aplicación móvil se necesita un dispositivo Android que permita instalar la APK, conexión a internet y una cuenta institucional de EventU. La cámara es necesaria para escanear entradas; también existe ingreso manual del código. El procedimiento de instalación se explica en el capítulo móvil. Esta edición documenta la APK Android, sin describir una instalación para iPhone.

El registro utiliza un correo con dominio **@unillanos.edu.co** y una contraseña de **8 a 72 caracteres**. Se necesita acceso al correo para la confirmación de la cuenta y la recuperación de la contraseña. La misma contraseña sirve en ambos entornos.

## 1.3. Roles

| Rol | Responsabilidades y permisos de uso |
| --- | --- |
| Usuario | Explora eventos, se inscribe, consulta su agenda, presenta su QR y obtiene certificados cuando corresponde. |
| Organizador | Gestiona sus eventos, consulta participantes, registra asistencias desde la aplicación móvil y revisa reportes y estadísticas. Además puede inscribirse como asistente en eventos de otros organizadores. |
| Administrador | Gestiona categorías, asigna o revoca el rol de organizador, administra eventos y consulta estadísticas globales y actividad desde la web. No puede inscribirse como asistente. La APK remite este rol al panel web y no permite iniciar sesión móvil. |

Una cuenta nueva recibe el rol **Usuario**. El administrador habilita el rol **Organizador** sobre una cuenta existente; no se crea una segunda cuenta. Un organizador no puede inscribirse en sus propios eventos.

Los menús y las acciones visibles dependen del rol. Para los procedimientos de administración se utiliza la web. El recorrido móvil de escaneo descrito en este manual corresponde al organizador que abre sus propios eventos.

## 1.4. Recorrido de un evento

1. El administrador prepara las categorías y habilita al organizador.
2. El organizador publica el evento desde la web, indicando fecha, lugar, capacidad y si entrega certificado.
3. El usuario o un organizador de otro evento se inscribe y obtiene una entrada QR.
4. Al ingresar al evento, el participante presenta su entrada y el organizador la valida desde la aplicación móvil.
5. El organizador consulta los participantes y exporta el reporte desde la web.
6. El asistente obtiene su certificado si el evento es certificable y su asistencia fue registrada.

Inscribirse reserva un cupo. **La asistencia queda registrada cuando el organizador valida la entrada**, no al generar o mostrar el QR.
