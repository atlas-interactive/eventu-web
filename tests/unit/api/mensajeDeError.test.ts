import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { mensajeDeError } from '../../../src/api/mensajeDeError';

describe('mensajeDeError', () => {
    it('devuelve el mensaje del backend cuando está disponible', () => {
        const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
            data: { error: 'El evento ya fue cancelado.' },
            status: 409,
            statusText: 'Conflict',
            headers: new AxiosHeaders(),
            config: { headers: new AxiosHeaders() },
        });

        expect(mensajeDeError(error)).toBe('El evento ya fue cancelado.');
    });

    it('usa el mensaje general para errores sin respuesta del backend', () => {
        expect(mensajeDeError(new Error('Error de red'))).toBe(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
    });
});
