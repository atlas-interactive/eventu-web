import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { createRequire } from 'node:module'

// El plugin publica CommonJS; createRequire evita la incompatibilidad con NodeNext.
const obfuscator: typeof import('vite-plugin-javascript-obfuscator').default =
  createRequire(import.meta.url)('vite-plugin-javascript-obfuscator')

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    obfuscator({
      apply: 'build',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        identifierNamesGenerator: 'hexadecimal',
        // Vite necesita rutas literales para resolver los imports dinámicos.
        reservedStrings: ['^\\.{1,2}/'],
        stringArrayRotate: true,
        // Vite transforma y minifica el código después de este plugin.
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
      },
    })
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
