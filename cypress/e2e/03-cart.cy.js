// ============================================================
// 03 - CARRINHO DE COMPRAS (CRUD COMPLETO)
// FakeStore API: /carts
// ============================================================

describe('🛒 Carrinho de Compras', () => {
    let data

    before(() => {
        cy.fixture('data').then((fixture) => {
            data = fixture
        })
    })

    // ──────────────────────────────────────────
    // GET - Listagem
    // ──────────────────────────────────────────
    context('GET - Listagem de Carrinhos', () => {
        it('deve retornar todos os carrinhos com status 200', () => {
            cy.getAllCarts().then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.not.empty
                cy.saveResult('Carrinho', 'GET /carts retorna array de carrinhos', 'passed')
            })
        })

        it('deve retornar 7 carrinhos por padrão', () => {
            cy.getAllCarts().then((res) => {
                expect(res.body).to.have.length(7)
                cy.saveResult('Carrinho', 'GET /carts retorna 7 carrinhos por padrão', 'passed')
            })
        })

        it('cada carrinho deve ter o schema correto', () => {
            cy.getAllCarts().then((res) => {
                res.body.forEach((cart) => {
                    cy.validateCartSchema(cart)
                })
                cy.saveResult('Carrinho', 'Schema de todos os carrinhos é válido', 'passed')
            })
        })

        it('deve respeitar o parâmetro limit', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/carts?limit=3`).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.have.length(3)
                cy.saveResult('Carrinho', 'Parâmetro ?limit funciona em /carts', 'passed')
            })
        })

        it('deve ordenar carrinhos por ASC', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/carts?sort=asc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((c) => c.id)
                const sorted = [...ids].sort((a, b) => a - b)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Carrinho', 'Ordenação ASC funciona em /carts', 'passed')
            })
        })

        it('deve ordenar carrinhos por DESC', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/carts?sort=desc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((c) => c.id)
                const sorted = [...ids].sort((a, b) => b - a)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Carrinho', 'Ordenação DESC funciona em /carts', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Carrinho por ID
    // ──────────────────────────────────────────
    context('GET - Carrinho por ID', () => {
        it('deve retornar carrinho existente pelo ID', () => {
            cy.getCartById(1).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.id).to.eq(1)
                cy.saveResult('Carrinho', 'GET /carts/1 retorna carrinho correto', 'passed')
            })
        })

        it('carrinho por ID deve ter schema válido', () => {
            cy.getCartById(1).then((res) => {
                cy.validateCartSchema(res.body)
                cy.saveResult('Carrinho', 'Carrinho por ID tem schema válido', 'passed')
            })
        })

        it('deve retornar null para carrinho inexistente', () => {
            cy.getCartById(9999).then((res) => {
                expect(res.body).to.be.null
                cy.saveResult('Carrinho', 'ID de carrinho inexistente retorna null', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Carrinhos por Usuário
    // ──────────────────────────────────────────
    context('GET - Carrinhos por Usuário', () => {
        it('deve retornar carrinhos do usuário 1', () => {
            cy.getUserCarts(1).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.not.empty
                res.body.forEach((cart) => {
                    expect(cart.userId).to.eq(1)
                })
                cy.saveResult(
                    'Carrinho',
                    'GET /carts/user/1 retorna carrinhos do usuário correto',
                    'passed'
                )
            })
        })

        it('deve retornar carrinhos do usuário 2', () => {
            cy.getUserCarts(2).then((res) => {
                expect(res.status).to.eq(200)
                res.body.forEach((cart) => {
                    expect(cart.userId).to.eq(2)
                })
                cy.saveResult(
                    'Carrinho',
                    'GET /carts/user/2 retorna carrinhos do userId 2',
                    'passed'
                )
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Filtro por Data
    // ──────────────────────────────────────────
    context('GET - Filtro por Intervalo de Datas', () => {
        it('deve filtrar carrinhos por intervalo de datas', () => {
            cy.getCartsByDateRange('2020-01-01', '2020-12-31').then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array')
                cy.saveResult('Carrinho', 'Filtro de carrinhos por data funciona', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // POST - Criar Carrinho
    // ──────────────────────────────────────────
    context('POST - Criar Carrinho', () => {
        it('deve criar um novo carrinho', () => {
            cy.createCart(data.newCart).then((res) => {
                expect(res.status).to.be.oneOf([200, 201])
                expect(res.body).to.have.property('id')
                cy.saveResult('Carrinho', `POST /carts cria carrinho (ID: ${res.body.id})`, 'passed')
            })
        })

        it('carrinho criado deve conter os produtos enviados', () => {
            cy.createCart(data.newCart).then((res) => {
                expect(res.body.products).to.be.an('array')
                expect(res.body.products).to.have.length(data.newCart.products.length)
                cy.saveResult('Carrinho', 'Carrinho criado contém os produtos enviados', 'passed')
            })
        })

        it('deve associar o carrinho ao userId correto', () => {
            cy.createCart(data.newCart).then((res) => {
                expect(res.body.userId).to.eq(data.newCart.userId)
                cy.saveResult(
                    'Carrinho',
                    'Carrinho criado está associado ao userId correto',
                    'passed'
                )
            })
        })
    })

    // ──────────────────────────────────────────
    // PUT - Atualizar Carrinho
    // ──────────────────────────────────────────
    context('PUT - Atualizar Carrinho', () => {
        it('deve atualizar carrinho com PUT', () => {
            const updatedCart = {
                userId: 3,
                date: '2024-01-01',
                products: [{ productId: 2, quantity: 5 }],
            }
            cy.updateCart(1, updatedCart).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.have.property('id')
                cy.saveResult('Carrinho', 'PUT /carts/1 atualiza carrinho', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // DELETE - Remover Carrinho
    // ──────────────────────────────────────────
    context('DELETE - Remover Carrinho', () => {
        it('deve deletar carrinho existente', () => {
            cy.deleteCart(1).then((res) => {
                expect(res.status).to.eq(200)
                cy.saveResult('Carrinho', 'DELETE /carts/1 retorna status 200', 'passed')
            })
        })

        it('DELETE deve retornar os dados do carrinho removido', () => {
            cy.deleteCart(2).then((res) => {
                expect(res.body).to.have.property('id')
                cy.saveResult('Carrinho', 'DELETE retorna dados do carrinho removido', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // Cálculos de Valor
    // ──────────────────────────────────────────
    context('Validações de Negócio', () => {
        it('todos os produtos no carrinho devem ter quantity > 0', () => {
            cy.getAllCarts().then((res) => {
                res.body.forEach((cart) => {
                    cart.products.forEach((p) => {
                        expect(p.quantity).to.be.greaterThan(0)
                    })
                })
                cy.saveResult(
                    'Carrinho',
                    'Todos os itens do carrinho têm quantity > 0',
                    'passed'
                )
            })
        })

        it('deve calcular corretamente o total de itens no carrinho 1', () => {
            cy.getCartById(1).then((cartRes) => {
                const cartItems = cartRes.body.products
                const totalQuantity = cartItems.reduce((acc, p) => acc + p.quantity, 0)
                expect(totalQuantity).to.be.greaterThan(0)
                cy.saveResult('Carrinho', `Total de itens no carrinho 1: ${totalQuantity}`, 'passed')
            })
        })
    })
})
