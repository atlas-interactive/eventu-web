import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CampoAutenticacion } from '../../../../src/features/auth/components/CampoAutenticacion';

describe('CampoAutenticacion', () => {
    afterEach(cleanup);

    it('asocia cada etiqueta con su entrada aunque existan campos del mismo nombre', () => {
        render(
            <>
                <CampoAutenticacion etiqueta="Correo institucional" name="correo" type="email" />
                <CampoAutenticacion etiqueta="Correo institucional" name="correo" type="email" />
            </>,
        );

        const campos = screen.getAllByLabelText('Correo institucional');
        expect(campos[0].id).not.toBe(campos[1].id);
        expect(campos[0]).toHaveAccessibleName('Correo institucional');
        expect(campos[1]).toHaveAccessibleName('Correo institucional');
    });

    it('vincula ayuda y error, conserva descripciones externas y retira el error al corregirlo', () => {
        const { rerender } = render(
            <>
                <p id="politica">Uso institucional.</p>
                <CampoAutenticacion
                    etiqueta="Contraseña"
                    type="password"
                    ayuda="Entre 8 y 72 caracteres."
                    error="La contraseña es demasiado corta."
                    aria-describedby="politica"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                />
            </>,
        );
        const campo = screen.getByLabelText('Contraseña');
        const id = campo.id;
        expect(campo).toHaveAccessibleDescription('Uso institucional. Entre 8 y 72 caracteres. La contraseña es demasiado corta.');
        expect(campo).toBeInvalid();
        expect(campo).toBeRequired();
        expect(campo).toHaveAttribute('autocomplete', 'new-password');
        expect(campo).toHaveAttribute('minlength', '8');
        expect(campo).toHaveAttribute('maxlength', '72');
        expect(screen.getByRole('alert')).toHaveTextContent('La contraseña es demasiado corta.');

        rerender(
            <>
                <p id="politica">Uso institucional.</p>
                <CampoAutenticacion etiqueta="Contraseña" type="password" ayuda="Entre 8 y 72 caracteres." />
            </>,
        );

        expect(screen.getByLabelText('Contraseña')).toHaveAttribute('id', id);
        expect(campo).toHaveAccessibleDescription('Entre 8 y 72 caracteres.');
        expect(campo).toBeValid();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
