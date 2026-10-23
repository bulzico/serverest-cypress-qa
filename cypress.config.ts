
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    specPattern: [
      'cypress/e2e/**/*.cy.ts',
      'cypress/api/**/*.cy.ts',
    ],
    supportFile: 'cypress/support/e2e.ts',
  },

  expose: {
    apiUrl: 'https://serverest.dev',
  },

  video: false,
  screenshotOnRunFailure: true,
});
