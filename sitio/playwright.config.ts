import { defineConfig, devices } from '@playwright/test';
import { puertos } from '../fabrica/scripts/lib/repo.mjs';

// Pruebas de aceptación de la fábrica. Las escribe el orquestador; los agentes las
// corren pero no las editan (hook de permisos). Corren contra el build de producción,
// que es lo que ve el visitante.
// Corren en el 4329 (PUERTO_PRUEBAS manda si se define) y toda corrida toma el turno de pruebas,
// para que nunca corran dos a la vez.
const PUERTO = puertos().pruebas;

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/comunes/turno-global.mjs',
  fullyParallel: true,
  // Hasta el 2026-10-14 el WebGL de las pruebas se dibujaba por software (SwiftShader): en paralelo
  // los cuadros se atrasaban y las pruebas de tiempos fallaban al azar (falla F20). Desde
  // entonces dibuja la tarjeta de video (launchOptions); el proceso único se queda hasta medir si
  // con la tarjeta el paralelo ya es determinista (una variable a la vez).
  workers: 1,
  forbidOnly: true,
  retries: 0, // una prueba que solo pasa al segundo intento es una prueba frágil, no verde
  reporter: [['list'], ['json', { outputFile: 'test-results/resultado.json' }]],
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // WebGL en la tarjeta de video (autor, 2026-10-14). Sin esto el Chromium sin interfaz cae a
    // SwiftShader, por software: la suite completa tardaba ~85 min y las pruebas de tiempos fallaban
    // al azar (tres corridas rojas seguidas con pruebas distintas).
    launchOptions: { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx astro preview --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
