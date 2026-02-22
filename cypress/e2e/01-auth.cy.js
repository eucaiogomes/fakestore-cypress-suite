// ============================================================
// 01 - AUTENTICAÇÃO
// FakeStore API: POST /auth/login
// ============================================================

describe('🔐 Autenticação', () => {
    let data

    before(() => {
        cy.fixture('data').then((fixture) => {
            data = fixture
        })
    })

    context('Login com credenciais válidas', () => {
        it('deve retornar status 200/201 com token JWT', () => {
            cy.login(data.validUser.username, data.validUser.password).then((res) => {
                expect(res.status).to.be.oneOf([200, 201])
                expect(res.body).to.have.property('token')
                expect(res.body.token).to.be.a('string').and.not.empty
                cy.saveResult('Autenticação', 'Login válido retorna token JWT', 'passed')
            })
        })

        it('token retornado deve ser uma string JWT válida (3 partes separadas por ponto)', () => {
            cy.login(data.validUser.username, data.validUser.password).then((res) => {
                const parts = res.body.token.split('.')
                expect(parts).to.have.length(3)
                cy.saveResult('Autenticação', 'Token JWT tem formato correto', 'passed')
            })
        })

        it('response deve ter Content-Type application/json', () => {
            cy.login(data.validUser.username, data.validUser.password).then((res) => {
                expect(res.headers['content-type']).to.include('application/json')
                cy.saveResult('Autenticação', 'Content-Type correto no login', 'passed')
            })
        })
    })

    context('Login com credenciais inválidas', () => {
        it('deve retornar erro ao usar username inválido', () => {
            cy.login(data.invalidUser.username, data.invalidUser.password).then((res) => {
                expect(res.status).to.not.eq(200)
                cy.saveResult('Autenticação', 'Login inválido retorna erro', 'passed')
            })
        })

        it('deve retornar erro ao enviar body vazio', () => {
            cy.request({
                method: 'POST',
                url: `${Cypress.env('BASE_URL')}/auth/login`,
                body: {},
                failOnStatusCode: false,
            }).then((res) => {
                expect(res.status).to.not.eq(200)
                cy.saveResult('Autenticação', 'Body vazio retorna erro', 'passed')
            })
        })

        it('deve retornar erro ao enviar apenas username sem password', () => {
            cy.request({
                method: 'POST',
                url: `${Cypress.env('BASE_URL')}/auth/login`,
                body: { username: data.validUser.username },
                failOnStatusCode: false,
            }).then((res) => {
                expect(res.status).to.not.eq(200)
                cy.saveResult('Autenticação', 'Login sem password retorna erro', 'passed')
            })
        })
    })

    context('Tempo de resposta', () => {
        it('login deve responder em menos de 3 segundos', () => {
            const start = Date.now()
            cy.login(data.validUser.username, data.validUser.password).then(() => {
                const duration = Date.now() - start
                expect(duration).to.be.lessThan(3000)
                cy.saveResult('Autenticação', `Login em ${duration}ms (< 3000ms)`, 'passed')
            })
        })
    })
})
