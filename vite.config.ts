import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    globals: true,
    // Usa DOM simulado y prepara MSW antes de ejecutar las pruebas.
    environment: 'jsdom',
    setupFiles: './tests/setupTests.ts',
    maxWorkers: 4,
    // Cobertura con V8: solo el código de src/, sin el punto de entrada ni los tipos.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/types/**'],
    },
  }
})
