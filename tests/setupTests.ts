import { configure } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

configure({ asyncUtilTimeout: 5000 });

// Hace fallar las pruebas si una petición no tiene un mock definido.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
