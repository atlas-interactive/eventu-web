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
];