import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertirErrorBlob, guardarArchivo } from '../../../src/api/descargas';

describe('descargas', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('guarda el archivo con un enlace temporal y libera la URL', () => {
        vi.useFakeTimers();
        const crearUrl = vi.fn(() => 'blob:reporte');
        const liberarUrl = vi.fn();
        Object.assign(URL, { createObjectURL: crearUrl, revokeObjectURL: liberarUrl });
        const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
        const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });

        guardarArchivo(pdf, 'reporte-evento-9.pdf');

        expect(crearUrl).toHaveBeenCalledWith(pdf);
        expect(clic).toHaveBeenCalledTimes(1);
        const enlace = clic.mock.contexts[0] as HTMLAnchorElement;
        expect(enlace.download).toBe('reporte-evento-9.pdf');
        expect(enlace.isConnected).toBe(false);
        vi.runAllTimers();
        expect(liberarUrl).toHaveBeenCalledWith('blob:reporte');
    });

    it('deja el error como llegó si el Blob no es JSON', async () => {
        const error = { isAxiosError: true, response: { status: 500, data: new Blob(['<html>'], { type: 'text/html' }) } };

        const resultado = (await convertirErrorBlob(error)) as typeof error;

        expect(resultado.response.data).toBeInstanceOf(Blob);
    });

    it('no toca errores que no son de axios', async () => {
        const error = new Error('Fallo de red');

        expect(await convertirErrorBlob(error)).toBe(error);
    });
});
