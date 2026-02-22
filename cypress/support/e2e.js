// ============================================================
// Setup Global - Cypress E2E Support
// ============================================================

import './commands'

// Captura falhas nos testes para o relatório
Cypress.on('fail', (error, runnable) => {
    const failInfo = {
        suite: runnable.parent?.title || 'Unknown Suite',
        test: runnable.title,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
    }

    cy.writeFile('report/failed-details.json', failInfo, { flag: 'a+' })

    // Re-throw para que o Cypress registre a falha
    throw error
})
