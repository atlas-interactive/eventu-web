import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { RegistroActividad } from '../../../../src/features/actividad/RegistroActividad';
import { server } from '../../../mocks/server';

const pagina = {
    contenido: [
        {
            id: 1,
            fecha: '2026-11-05T12:44:00',
            usuarioId: 7,
            usuarioNombre: 'Laura Gómez',
            usuarioCorreo: 'laura@unillanos.edu.co',
            accion: 'LOGIN',
            entidad: 'USUARIO',
            entidadId: 7,
            resultado: 'FALLIDO',
            motivo: 'Credenciales inválidas',
        },
    ],
    pagina: 0,
    tamano: 20,
    totalElementos: 1,
    totalPaginas: 1,
};

describe('RegistroActividad', () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        server.use(
            http.get('*/logs/opciones', () =>
                HttpResponse.json({
                    acciones: ['LOGIN'],
                    entidades: ['USUARIO'],
                    resultados: ['EXITO', 'FALLIDO'],
                }),
            ),
            http.get('*/logs', () => HttpResponse.json(pagina)),
        );
    });

    afterEach(() => errorSpy.mockRestore());

    it('carga opciones y registros, y envía los filtros seleccionados al servicio', async () => {
        const consultas: URLSearchParams[] = [];
        server.use(
            http.get('*/logs', ({ request }) => {
                consultas.push(new URL(request.url).searchParams);
                return HttpResponse.json(pagina);
            }),
        );
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <RegistroActividad />
            </MemoryRouter>,
        );

        expect(await screen.findByText('Laura Gómez')).toBeInTheDocument();
        await user.selectOptions(screen.getByLabelText('Acción'), 'LOGIN');

        await waitFor(() => {
            expect(consultas.at(-1)?.get('accion')).toBe('LOGIN');
            expect(consultas.at(-1)?.get('pagina')).toBe('0');
            expect(consultas.at(-1)?.get('tamano')).toBe('20');
        });
        expect(screen.getByRole('button', { name: 'Quitar filtro: LOGIN' })).toBeInTheDocument();
    });

    it('aplica un periodo rápido y consulta la página siguiente con 20 registros por página', async () => {
        const consultas: URLSearchParams[] = [];
        server.use(
            http.get('*/logs', ({ request }) => {
                const parametros = new URL(request.url).searchParams;
                consultas.push(parametros);
                return HttpResponse.json({
                    ...pagina,
                    pagina: Number(parametros.get('pagina') ?? 0),
                    totalElementos: 45,
                    totalPaginas: 3,
                });
            }),
        );
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <RegistroActividad />
            </MemoryRouter>,
        );

        await screen.findByText('Laura Gómez');
        await user.click(screen.getByRole('button', { name: 'Últimos 7 días' }));
        await waitFor(() => {
            expect(consultas.at(-1)?.get('fechaDesde')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(consultas.at(-1)?.get('fechaHasta')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(consultas.at(-1)?.get('tamano')).toBe('20');
        });

        await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
        await waitFor(() => expect(consultas.at(-1)?.get('pagina')).toBe('1'));
        expect(screen.getByRole('navigation', { name: 'Paginación de actividad' })).toHaveTextContent(
            'Mostrando 21–40 de 45 registros',
        );
    });

    it('permite limpiar filtros y muestra el error de rango de fechas del backend', async () => {
        server.use(
            http.get('*/logs', ({ request }) => {
                const parametros = new URL(request.url).searchParams;
                if (parametros.get('fechaDesde') && parametros.get('fechaHasta')) {
                    return HttpResponse.json(
                        { error: 'La fecha inicial no puede ser posterior a la final.' },
                        { status: 400 },
                    );
                }
                return HttpResponse.json(pagina);
            }),
        );
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <RegistroActividad />
            </MemoryRouter>,
        );

        expect(await screen.findByText('Laura Gómez')).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Fecha desde'), { target: { value: '2026-12-01' } });
        fireEvent.change(screen.getByLabelText('Fecha hasta'), { target: { value: '2026-11-01' } });

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'La fecha inicial no puede ser posterior a la final.',
        );
        await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

        expect(await screen.findByText('Laura Gómez')).toBeInTheDocument();
    });
});
