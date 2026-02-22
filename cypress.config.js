const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    setupNodeEvents(on, config) {
      // Coleta falhas após os testes para o relatório
      on('after:run', (results) => {
        const reportDir = path.join(__dirname, 'report')
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true })
        }

        const failedTests = []
        if (results && results.runs) {
          results.runs.forEach((run) => {
            if (run.tests) {
              run.tests.forEach((test) => {
                if (test.state === 'failed') {
                  failedTests.push({
                    fullTitle: test.title.join(' > '),
                    error: test.displayError || test.err?.message || 'Unknown error',
                    spec: run.spec?.relative || '',
                  })
                }
              })
            }
          })
        }

        fs.writeFileSync(
          path.join(reportDir, 'failed-tests.json'),
          JSON.stringify(failedTests, null, 2)
        )
      })
    },
  },
  env: {
    BASE_URL: 'https://fakestoreapi.com',
  },
})
