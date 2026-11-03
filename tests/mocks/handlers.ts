import { http, HttpResponse } from 'msw';

// Respuesta simulada del endpoint de registro para las pruebas de integración.
export const handlers = [
    http.post('*/auth/registro', () =>
        HttpResponse.json({
            mensaje: 'Registro completado correctamente.',
            usuarioId: 1,
            correo: 'laura@unillanos.edu.co',
            rol: 'estudiante',
        }),
    ),
    http.post('*/auth/login', () =>
        HttpResponse.json({
            token: 'jwt-de-integracion',
            usuarioId: 1,
            nombre: 'Admin EventU',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
            cuentaReactivada: false,
        }),
    ),
    http.post('*/auth/recuperar-contrasena', () =>
        HttpResponse.json({
            mensaje: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
        }),
    ),
    http.post('*/auth/restablecer-contrasena', () =>
        HttpResponse.json({
            mensaje: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
        }),
    ),
];