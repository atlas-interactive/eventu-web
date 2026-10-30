import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InicioUsuario } from '../../../../src/features/sesion/InicioUsuario';

describe('InicioUsuario', () => {
    it('presenta el estado informativo del inicio de usuario', () => {
        render(<InicioUsuario />);

        expect(screen.getByRole('status')).toHaveTextContent(
            'Sesión iniciada exitosamente, el listado de eventos estará disponible en la próxima versión.',
        );
    });
});
