import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioEvento } from '../../../../src/features/eventos/FormularioEvento';
import { crearEvento, editarEvento } from '../../../../src/features/eventos/services/eventoService';
import { listarCategorias } from '../../../../src/features/categorias/services/categoriaService';
import type { Categoria } from '../../../../src/types/categoria';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    crearEvento: vi.fn(),
    editarEvento: vi.fn(),
}));
vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
}));

const crearMock = vi.mocked(crearEvento);
const editarMock = vi.mocked(editarEvento);
const listarMock = vi.mocked(listarCategorias);

const categoria = (id: number, nombre: string, activo = true): Categoria => ({
    id,
    nombre,
    activo,
    eventosActivos: 0,
    creadoEn: '2026-10-01T10:00:00',
});

// Simula el error que devuelve el backend, por ejemplo {"error": "..."} con estado 409
const errorHttp = (status: number, mensaje: string) =>
    new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
        status,
        data: { error: mensaje },
    } as AxiosResponse);

const EVENTO: Evento = {
    id: 7,
    titulo: 'Feria de ciencia',
    descripcion: 'Proyectos de los estudiantes',
    fechaInicio: '2099-10-20T14:30:00',
    ubicacion: 'Auditorio',
    cuposMaximos: 50,
    cuposDisponibles: 30, // 20 inscritos
    estado: 'PUBLICADO',
    organizadorId: 3,
    organizadorNombre: 'Luz',
    categoriaId: 2,
    categoriaNombre: 'Cultural',
};

describe('FormularioEvento', () => {
    const onGuardado = vi.fn();
    const onCancelar = vi.fn();

    beforeEach(() => {
        listarMock.mockReset().mockResolvedValue([categoria(1, 'Académico'), categoria(2, 'Cultural')]);
        crearMock.mockReset();
        editarMock.mockReset();
        onGuardado.mockReset();
        onCancelar.mockReset();
    });
    afterEach(cleanup);

    describe('crear (HU-05)', () => {
        const renderizar = async () => {
            render(<FormularioEvento onGuardado={onGuardado} onCancelar={onCancelar} />);
            await screen.findByRole('option', { name: 'Cultural' });
        };

        it('pide solo las categorías activas para el selector (criterio 2.0)', async () => {
            await renderizar();

            expect(listarMock).toHaveBeenCalledWith(true);
            expect(screen.getByRole('option', { name: 'Académico' })).toBeInTheDocument();
        });

        it('crea el evento con datos válidos (criterio 1.0)', async () => {
            crearMock.mockResolvedValue({ mensaje: 'Evento creado exitosamente.', eventoId: 9 });
            await renderizar();
            const user = userEvent.setup();

            await user.type(screen.getByLabelText('Título'), '  Feria de ciencia ');
            await user.type(screen.getByLabelText('Descripción'), 'Proyectos');
            await user.type(screen.getByLabelText('Fecha y hora de inicio'), '2099-10-20T14:30');
            await user.type(screen.getByLabelText('Ubicación'), 'Auditorio');
            await user.type(screen.getByLabelText('Cupo máximo'), '50');
            await user.selectOptions(screen.getByLabelText('Categoría'), 'Cultural');
            await user.click(screen.getByRole('button', { name: 'Crear evento' }));

            await waitFor(() => expect(onGuardado).toHaveBeenCalledWith('Evento creado exitosamente.'));
            expect(crearMock).toHaveBeenCalledWith({
                titulo: 'Feria de ciencia',
                descripcion: 'Proyectos',
                fechaInicio: '2099-10-20T14:30',
                ubicacion: 'Auditorio',
                cuposMaximos: 50,
                categoriaId: 2,
            });
        });

        it('no envía nada y marca los campos obligatorios vacíos', async () => {
            await renderizar();
            const user = userEvent.setup();

            await user.click(screen.getByRole('button', { name: 'Crear evento' }));

            expect(crearMock).not.toHaveBeenCalled();
            expect(screen.getByText('El título es obligatorio.')).toBeInTheDocument();
            expect(screen.getByText('La categoría es obligatoria.')).toBeInTheDocument();
            expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true');
        });

        it('muestra el error del backend si no se pudo crear', async () => {
            crearMock.mockRejectedValue(errorHttp(400, 'La categoría seleccionada está inactiva.'));
            await renderizar();
            const user = userEvent.setup();

            await user.type(screen.getByLabelText('Título'), 'Feria');
            await user.type(screen.getByLabelText('Descripción'), 'Proyectos');
            await user.type(screen.getByLabelText('Fecha y hora de inicio'), '2099-10-20T14:30');
            await user.type(screen.getByLabelText('Ubicación'), 'Auditorio');
            await user.type(screen.getByLabelText('Cupo máximo'), '50');
            await user.selectOptions(screen.getByLabelText('Categoría'), 'Cultural');
            await user.click(screen.getByRole('button', { name: 'Crear evento' }));

            expect(await screen.findByRole('alert')).toHaveTextContent('La categoría seleccionada está inactiva.');
            expect(onGuardado).not.toHaveBeenCalled();
        });
    });

    describe('editar (HU-06)', () => {
        const renderizar = async (evento: Evento = EVENTO) => {
            render(<FormularioEvento evento={evento} onGuardado={onGuardado} onCancelar={onCancelar} />);
            await screen.findByRole('option', { name: 'Cultural' });
        };

        it('precarga los datos del evento y muestra los inscritos actuales', async () => {
            await renderizar();

            expect(screen.getByLabelText('Título')).toHaveValue('Feria de ciencia');
            expect(screen.getByLabelText('Fecha y hora de inicio')).toHaveValue('2099-10-20T14:30');
            expect(screen.getByLabelText('Cupo máximo')).toHaveValue(50);
            expect(screen.getByLabelText('Categoría')).toHaveValue('2');
            expect(screen.getByText(/Inscritos actuales: 20/)).toBeInTheDocument();
        });

        it('envía solo el campo que cambió', async () => {
            editarMock.mockResolvedValue({ mensaje: 'Evento actualizado exitosamente.', eventoId: 7 });
            await renderizar();
            const user = userEvent.setup();

            await user.clear(screen.getByLabelText('Cupo máximo'));
            await user.type(screen.getByLabelText('Cupo máximo'), '80');
            await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            await waitFor(() => expect(onGuardado).toHaveBeenCalledWith('Evento actualizado exitosamente.'));
            expect(editarMock).toHaveBeenCalledWith(7, { cuposMaximos: 80 });
        });

        it('rechaza un cupo menor que los inscritos indicando cuántos son', async () => {
            await renderizar();
            const user = userEvent.setup();

            await user.clear(screen.getByLabelText('Cupo máximo'));
            await user.type(screen.getByLabelText('Cupo máximo'), '10');
            await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            expect(editarMock).not.toHaveBeenCalled();
            expect(
                screen.getByText('No se puede reducir la capacidad por debajo de los inscritos actuales (20).'),
            ).toBeInTheDocument();
        });

        it('rechaza una fecha pasada', async () => {
            await renderizar();
            const user = userEvent.setup();

            await user.clear(screen.getByLabelText('Fecha y hora de inicio'));
            await user.type(screen.getByLabelText('Fecha y hora de inicio'), '2020-01-01T09:00');
            await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            expect(editarMock).not.toHaveBeenCalled();
            expect(screen.getByText('La fecha de inicio debe ser futura.')).toBeInTheDocument();
        });

        it('avisa si no hay cambios y no llama al backend', async () => {
            await renderizar();
            const user = userEvent.setup();

            await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            expect(editarMock).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toHaveTextContent('No hay cambios para guardar.');
        });

        it('muestra el rechazo del backend cuando el evento es de otro organizador', async () => {
            editarMock.mockRejectedValue(errorHttp(403, 'Solo el organizador del evento puede modificarlo.'));
            await renderizar();
            const user = userEvent.setup();

            await user.clear(screen.getByLabelText('Título'));
            await user.type(screen.getByLabelText('Título'), 'Otro título');
            await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

            expect(await screen.findByRole('alert')).toHaveTextContent('Solo el organizador del evento puede modificarlo.');
            expect(onGuardado).not.toHaveBeenCalled();
        });

        it('conserva la categoría actual aunque se haya desactivado', async () => {
            listarMock.mockResolvedValue([categoria(1, 'Académico')]);
            render(<FormularioEvento evento={EVENTO} onGuardado={onGuardado} onCancelar={onCancelar} />);

            expect(await screen.findByRole('option', { name: 'Cultural (inactiva)' })).toBeInTheDocument();
            expect(screen.getByLabelText('Categoría')).toHaveValue('2');
        });
    });
});
