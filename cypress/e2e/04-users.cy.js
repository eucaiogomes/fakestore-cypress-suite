// ============================================================
// 04 - USUÁRIOS (CRUD COMPLETO)
// FakeStore API: /users
// ============================================================

describe('👤 Usuários', () => {
    let data

    before(() => {
        cy.fixture('data').then((fixture) => {
            data = fixture
        })
    })

    // ──────────────────────────────────────────
    // GET - Listagem
    // ──────────────────────────────────────────
    context('GET - Listagem de Usuários', () => {
        it('deve retornar todos os usuários com status 200', () => {
            cy.getAllUsers().then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.not.empty
                cy.saveResult('Usuários', 'GET /users retorna array de usuários', 'passed')
            })
        })

        it('deve retornar 10 usuários por padrão', () => {
            cy.getAllUsers().then((res) => {
                expect(res.body).to.have.length(10)
                cy.saveResult('Usuários', 'GET /users retorna 10 usuários por padrão', 'passed')
            })
        })

        it('cada usuário deve ter o schema correto', () => {
            cy.getAllUsers().then((res) => {
                res.body.forEach((user) => {
                    cy.validateUserSchema(user)
                })
                cy.saveResult('Usuários', 'Schema de todos os usuários é válido', 'passed')
            })
        })

        it('todos os usuários devem ter email válido', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            cy.getAllUsers().then((res) => {
                res.body.forEach((user) => {
                    expect(user.email).to.match(emailRegex)
                })
                cy.saveResult('Usuários', 'Todos os emails têm formato válido', 'passed')
            })
        })

        it('deve respeitar o parâmetro limit', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/users?limit=5`).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.have.length(5)
                cy.saveResult('Usuários', 'Parâmetro ?limit funciona em /users', 'passed')
            })
        })

        it('deve ordenar usuários por ASC', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/users?sort=asc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((u) => u.id)
                const sorted = [...ids].sort((a, b) => a - b)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Usuários', 'Ordenação ASC funciona em /users', 'passed')
            })
        })

        it('deve ordenar usuários por DESC', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/users?sort=desc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((u) => u.id)
                const sorted = [...ids].sort((a, b) => b - a)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Usuários', 'Ordenação DESC funciona em /users', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Usuário por ID
    // ──────────────────────────────────────────
    context('GET - Usuário por ID', () => {
        it('deve retornar usuário existente pelo ID', () => {
            cy.getUserById(1).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.id).to.eq(1)
                cy.saveResult('Usuários', 'GET /users/1 retorna usuário correto', 'passed')
            })
        })

        it('usuário por ID deve ter schema válido', () => {
            cy.getUserById(1).then((res) => {
                cy.validateUserSchema(res.body)
                cy.saveResult('Usuários', 'Usuário por ID tem schema válido', 'passed')
            })
        })

        it('deve retornar null ou vazio para usuário inexistente', () => {
            cy.getUserById(9999).then((res) => {
                expect(res.body === null || res.body === '' || res.body === undefined).to.be.true
                cy.saveResult('Usuários', 'ID de usuário inexistente retorna null/vazio', 'passed')
            })
        })

        it('usuário deve ter endereço completo com geolocalização', () => {
            cy.getUserById(1).then((res) => {
                const { address } = res.body
                expect(address.geolocation).to.have.all.keys('lat', 'long')
                expect(address.geolocation.lat).to.be.a('string')
                expect(address.geolocation.long).to.be.a('string')
                cy.saveResult('Usuários', 'Endereço do usuário contém geolocalização', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // POST - Criar Usuário
    // ──────────────────────────────────────────
    context('POST - Criar Usuário', () => {
        it('deve criar um novo usuário com status 200 ou 201', () => {
            cy.createUser(data.newUser).then((res) => {
                expect(res.status).to.be.oneOf([200, 201])
                expect(res.body).to.have.property('id')
                cy.saveResult('Usuários', `POST /users cria usuário (ID: ${res.body.id})`, 'passed')
            })
        })

        it('novo usuário deve receber um ID numérico', () => {
            cy.createUser(data.newUser).then((res) => {
                expect(res.body.id).to.be.a('number').and.greaterThan(0)
                cy.saveResult('Usuários', 'Novo usuário recebe ID numérico', 'passed')
            })
        })

        it('dados do usuário criado devem conter um ID válido', () => {
            cy.createUser(data.newUser).then((res) => {
                expect(res.body).to.have.property('id')
                expect(res.body.id).to.be.a('number').and.greaterThan(0)
                cy.saveResult('Usuários', 'Usuário criado contém ID válido', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // PUT - Atualizar Usuário
    // ──────────────────────────────────────────
    context('PUT - Atualizar Usuário', () => {
        it('deve atualizar usuário com PUT', () => {
            const updatedUser = {
                ...data.newUser,
                email: 'updated@email.com',
                username: 'updated_user',
            }
            cy.updateUser(1, updatedUser).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.email).to.eq('updated@email.com')
                expect(res.body.username).to.eq('updated_user')
                cy.saveResult('Usuários', 'PUT /users/1 atualiza usuário corretamente', 'passed')
            })
        })

        it('PUT deve retornar resposta válida', () => {
            cy.updateUser(5, data.newUser).then((res) => {
                expect(res.status).to.be.oneOf([200, 201])
                expect(res.body).to.be.an('object')
                cy.saveResult('Usuários', 'PUT retorna resposta válida', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // DELETE - Remover Usuário
    // ──────────────────────────────────────────
    context('DELETE - Remover Usuário', () => {
        it('deve deletar usuário existente', () => {
            cy.deleteUser(1).then((res) => {
                expect(res.status).to.eq(200)
                cy.saveResult('Usuários', 'DELETE /users/1 retorna status 200', 'passed')
            })
        })

        it('DELETE deve retornar os dados do usuário removido', () => {
            cy.deleteUser(2).then((res) => {
                expect(res.body).to.have.property('id')
                cy.saveResult('Usuários', 'DELETE retorna dados do usuário removido', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // Validações de Negócio
    // ──────────────────────────────────────────
    context('Validações de Negócio', () => {
        it('nenhum usuário deve ter campo nome vazio', () => {
            cy.getAllUsers().then((res) => {
                res.body.forEach((user) => {
                    expect(user.name.firstname).to.not.be.empty
                    expect(user.name.lastname).to.not.be.empty
                })
                cy.saveResult('Usuários', 'Nenhum usuário tem nome vazio', 'passed')
            })
        })

        it('todos os usuários devem ter telefone cadastrado', () => {
            cy.getAllUsers().then((res) => {
                res.body.forEach((user) => {
                    expect(user.phone).to.not.be.empty
                })
                cy.saveResult('Usuários', 'Todos os usuários têm telefone cadastrado', 'passed')
            })
        })

        it('todos os usernames devem ser únicos', () => {
            cy.getAllUsers().then((res) => {
                const usernames = res.body.map((u) => u.username)
                const unique = [...new Set(usernames)]
                expect(usernames.length).to.eq(unique.length)
                cy.saveResult('Usuários', 'Todos os usernames são únicos', 'passed')
            })
        })

        it('todos os emails devem ser únicos', () => {
            cy.getAllUsers().then((res) => {
                const emails = res.body.map((u) => u.email)
                const unique = [...new Set(emails)]
                expect(emails.length).to.eq(unique.length)
                cy.saveResult('Usuários', 'Todos os emails são únicos', 'passed')
            })
        })
    })
})
