// ============================================================
// 02 - PRODUTOS (CRUD COMPLETO)
// FakeStore API: /products
// ============================================================

describe('🛍️ Produtos', () => {
    let data
    let createdProductId

    before(() => {
        cy.fixture('data').then((fixture) => {
            data = fixture
        })
    })

    // ──────────────────────────────────────────
    // GET - Listagem
    // ──────────────────────────────────────────
    context('GET - Listagem de Produtos', () => {
        it('deve retornar todos os produtos com status 200', () => {
            cy.getAllProducts().then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.have.length.greaterThan(0)
                cy.saveResult('Produtos', 'GET /products retorna array', 'passed')
            })
        })

        it('deve retornar exatamente 20 produtos por padrão', () => {
            cy.getAllProducts().then((res) => {
                expect(res.body).to.have.length(20)
                cy.saveResult('Produtos', 'GET /products retorna 20 itens por padrão', 'passed')
            })
        })

        it('deve respeitar o parâmetro limit', () => {
            cy.getAllProducts(5).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.have.length(5)
                cy.saveResult('Produtos', 'Parâmetro ?limit funciona corretamente', 'passed')
            })
        })

        it('cada produto deve ter o schema correto', () => {
            cy.getAllProducts(5).then((res) => {
                res.body.forEach((product) => {
                    cy.validateProductSchema(product)
                })
                cy.saveResult('Produtos', 'Schema de todos os produtos é válido', 'passed')
            })
        })

        it('produtos devem ter preço maior que zero', () => {
            cy.getAllProducts().then((res) => {
                res.body.forEach((product) => {
                    expect(product.price).to.be.greaterThan(0)
                })
                cy.saveResult('Produtos', 'Todos os produtos têm preço > 0', 'passed')
            })
        })

        it('deve ordenar produtos por ASC corretamente', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/products?sort=asc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((p) => p.id)
                const sorted = [...ids].sort((a, b) => a - b)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Produtos', 'Ordenação ASC funciona corretamente', 'passed')
            })
        })

        it('deve ordenar produtos por DESC corretamente', () => {
            cy.request('GET', `${Cypress.env('BASE_URL')}/products?sort=desc`).then((res) => {
                expect(res.status).to.eq(200)
                const ids = res.body.map((p) => p.id)
                const sorted = [...ids].sort((a, b) => b - a)
                expect(ids).to.deep.eq(sorted)
                cy.saveResult('Produtos', 'Ordenação DESC funciona corretamente', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Produto por ID
    // ──────────────────────────────────────────
    context('GET - Produto por ID', () => {
        it('deve retornar produto existente pelo ID', () => {
            cy.getProductById(1).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.id).to.eq(1)
                cy.saveResult('Produtos', 'GET /products/1 retorna produto correto', 'passed')
            })
        })

        it('deve retornar todos os campos obrigatórios no produto por ID', () => {
            cy.getProductById(1).then((res) => {
                cy.validateProductSchema(res.body)
                cy.saveResult('Produtos', 'Produto por ID tem schema válido', 'passed')
            })
        })

        it('deve retornar null ou vazio para produto inexistente', () => {
            cy.getProductById(9999).then((res) => {
                expect(res.body === null || res.body === '' || res.body === undefined).to.be.true
                cy.saveResult('Produtos', 'ID inexistente retorna null/vazio', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // GET - Categorias
    // ──────────────────────────────────────────
    context('GET - Categorias', () => {
        it('deve retornar lista de categorias', () => {
            cy.getCategories().then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.have.length(4)
                cy.saveResult('Produtos', 'GET /products/categories retorna 4 categorias', 'passed')
            })
        })

        it('deve conter as 4 categorias corretas', () => {
            cy.getCategories().then((res) => {
                expect(res.body).to.include('electronics')
                expect(res.body).to.include('jewelery')
                expect(res.body).to.include("men's clothing")
                expect(res.body).to.include("women's clothing")
                cy.saveResult('Produtos', 'As 4 categorias esperadas estão presentes', 'passed')
            })
        })

        it('deve filtrar produtos por categoria electronics', () => {
            cy.getProductsByCategory('electronics').then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body).to.be.an('array').and.not.empty
                res.body.forEach((p) => {
                    expect(p.category).to.eq('electronics')
                })
                cy.saveResult('Produtos', 'Filtro por categoria electronics funciona', 'passed')
            })
        })

        it('deve filtrar produtos por cada categoria existente', () => {
            const categories = ['electronics', 'jewelery', "men's clothing", "women's clothing"]
            categories.forEach((cat) => {
                cy.getProductsByCategory(cat).then((res) => {
                    expect(res.status).to.eq(200)
                    expect(res.body).to.be.an('array').and.not.empty
                    res.body.forEach((p) => expect(p.category).to.eq(cat))
                })
            })
            cy.saveResult(
                'Produtos',
                'Filtro por categoria funciona para todas as 4 categorias',
                'passed'
            )
        })
    })

    // ──────────────────────────────────────────
    // POST - Criar Produto
    // ──────────────────────────────────────────
    context('POST - Criar Produto', () => {
        it('deve criar um novo produto e retornar status 200 ou 201', () => {
            cy.createProduct(data.newProduct).then((res) => {
                expect(res.status).to.be.oneOf([200, 201])
                expect(res.body).to.have.property('id')
                createdProductId = res.body.id
                cy.saveResult(
                    'Produtos',
                    `POST /products cria produto (ID: ${createdProductId})`,
                    'passed'
                )
            })
        })

        it('produto criado deve ter os dados enviados', () => {
            cy.createProduct(data.newProduct).then((res) => {
                expect(res.body.title).to.eq(data.newProduct.title)
                expect(res.body.price).to.eq(data.newProduct.price)
                expect(res.body.category).to.eq(data.newProduct.category)
                cy.saveResult(
                    'Produtos',
                    'Dados do produto criado conferem com payload enviado',
                    'passed'
                )
            })
        })

        it('produto criado deve receber um ID numérico', () => {
            cy.createProduct(data.newProduct).then((res) => {
                expect(res.body.id).to.be.a('number')
                cy.saveResult('Produtos', 'Produto criado recebe ID numérico', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // PUT - Atualizar Produto
    // ──────────────────────────────────────────
    context('PUT - Atualizar Produto', () => {
        it('deve atualizar produto existente com PUT', () => {
            cy.updateProduct(1, data.updatedProduct).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.title).to.eq(data.updatedProduct.title)
                expect(res.body.price).to.eq(data.updatedProduct.price)
                cy.saveResult('Produtos', 'PUT /products/1 atualiza produto corretamente', 'passed')
            })
        })

        it('PUT deve retornar o produto atualizado no body', () => {
            cy.updateProduct(7, data.updatedProduct).then((res) => {
                expect(res.body).to.have.property('id')
                expect(res.body.id).to.eq(7)
                cy.saveResult('Produtos', 'PUT retorna body com ID correto', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // PATCH - Atualização Parcial
    // ──────────────────────────────────────────
    context('PATCH - Atualização Parcial', () => {
        it('deve atualizar apenas o preço com PATCH', () => {
            cy.patchProduct(1, { price: 999.99 }).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.price).to.eq(999.99)
                cy.saveResult('Produtos', 'PATCH /products/1 atualiza apenas o preço', 'passed')
            })
        })

        it('deve atualizar apenas o título com PATCH', () => {
            cy.patchProduct(2, { title: 'Título Atualizado via PATCH' }).then((res) => {
                expect(res.status).to.eq(200)
                expect(res.body.title).to.eq('Título Atualizado via PATCH')
                cy.saveResult('Produtos', 'PATCH /products/2 atualiza apenas o título', 'passed')
            })
        })
    })

    // ──────────────────────────────────────────
    // DELETE - Remover Produto
    // ──────────────────────────────────────────
    context('DELETE - Remover Produto', () => {
        it('deve deletar produto existente', () => {
            cy.deleteProduct(1).then((res) => {
                expect(res.status).to.eq(200)
                cy.saveResult('Produtos', 'DELETE /products/1 retorna status 200', 'passed')
            })
        })

        it('produto deletado deve retornar os dados do produto removido', () => {
            cy.deleteProduct(2).then((res) => {
                expect(res.body).to.have.property('id')
                cy.saveResult('Produtos', 'DELETE retorna dados do produto removido', 'passed')
            })
        })
    })
})
