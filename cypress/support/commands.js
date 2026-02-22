// ============================================================
// COMANDOS CUSTOMIZADOS CYPRESS - FakeStore API Suite
// ============================================================

// Armazena resultados de todos os testes para o relatório
const testResults = []

// ──────────────────────────────────────────
// Auth
// ──────────────────────────────────────────
Cypress.Commands.add('login', (username, password) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('BASE_URL')}/auth/login`,
        body: { username, password },
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('getValidToken', () => {
    return cy.fixture('data').then((data) => {
        return cy.login(data.validUser.username, data.validUser.password).then((res) => {
            return res.body.token
        })
    })
})

// ──────────────────────────────────────────
// Products
// ──────────────────────────────────────────
Cypress.Commands.add('getAllProducts', (limit = null) => {
    const url = limit
        ? `${Cypress.env('BASE_URL')}/products?limit=${limit}`
        : `${Cypress.env('BASE_URL')}/products`
    return cy.request('GET', url)
})

Cypress.Commands.add('getProductById', (id) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('BASE_URL')}/products/${id}`,
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('createProduct', (product) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('BASE_URL')}/products`,
        body: product,
    })
})

Cypress.Commands.add('updateProduct', (id, product) => {
    return cy.request({
        method: 'PUT',
        url: `${Cypress.env('BASE_URL')}/products/${id}`,
        body: product,
    })
})

Cypress.Commands.add('patchProduct', (id, fields) => {
    return cy.request({
        method: 'PATCH',
        url: `${Cypress.env('BASE_URL')}/products/${id}`,
        body: fields,
    })
})

Cypress.Commands.add('deleteProduct', (id) => {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.env('BASE_URL')}/products/${id}`,
    })
})

Cypress.Commands.add('getCategories', () => {
    return cy.request('GET', `${Cypress.env('BASE_URL')}/products/categories`)
})

Cypress.Commands.add('getProductsByCategory', (category) => {
    return cy.request(
        'GET',
        `${Cypress.env('BASE_URL')}/products/category/${encodeURIComponent(category)}`
    )
})

// ──────────────────────────────────────────
// Cart
// ──────────────────────────────────────────
Cypress.Commands.add('getAllCarts', () => {
    return cy.request('GET', `${Cypress.env('BASE_URL')}/carts`)
})

Cypress.Commands.add('getCartById', (id) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('BASE_URL')}/carts/${id}`,
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('getUserCarts', (userId) => {
    return cy.request('GET', `${Cypress.env('BASE_URL')}/carts/user/${userId}`)
})

Cypress.Commands.add('createCart', (cart) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('BASE_URL')}/carts`,
        body: cart,
    })
})

Cypress.Commands.add('updateCart', (id, cart) => {
    return cy.request({
        method: 'PUT',
        url: `${Cypress.env('BASE_URL')}/carts/${id}`,
        body: cart,
    })
})

Cypress.Commands.add('deleteCart', (id) => {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.env('BASE_URL')}/carts/${id}`,
    })
})

Cypress.Commands.add('getCartsByDateRange', (startDate, endDate) => {
    return cy.request(
        'GET',
        `${Cypress.env('BASE_URL')}/carts?startdate=${startDate}&enddate=${endDate}`
    )
})

// ──────────────────────────────────────────
// Users
// ──────────────────────────────────────────
Cypress.Commands.add('getAllUsers', () => {
    return cy.request('GET', `${Cypress.env('BASE_URL')}/users`)
})

Cypress.Commands.add('getUserById', (id) => {
    return cy.request({
        method: 'GET',
        url: `${Cypress.env('BASE_URL')}/users/${id}`,
        failOnStatusCode: false,
    })
})

Cypress.Commands.add('createUser', (user) => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('BASE_URL')}/users`,
        body: user,
    })
})

Cypress.Commands.add('updateUser', (id, user) => {
    return cy.request({
        method: 'PUT',
        url: `${Cypress.env('BASE_URL')}/users/${id}`,
        body: user,
    })
})

Cypress.Commands.add('deleteUser', (id) => {
    return cy.request({
        method: 'DELETE',
        url: `${Cypress.env('BASE_URL')}/users/${id}`,
    })
})

// ──────────────────────────────────────────
// Coleta de Resultados para Relatório
// ──────────────────────────────────────────
Cypress.Commands.add('saveResult', (suite, test, status, details = '') => {
    testResults.push({
        suite,
        test,
        status, // 'passed' | 'failed' | 'skipped'
        details,
        timestamp: new Date().toISOString(),
    })
    cy.writeFile('report/raw-results.json', testResults)
})

// ──────────────────────────────────────────
// Validações Comuns
// ──────────────────────────────────────────
Cypress.Commands.add('validateProductSchema', (product) => {
    expect(product).to.have.all.keys(
        'id',
        'title',
        'price',
        'description',
        'category',
        'image',
        'rating'
    )
    expect(product.id).to.be.a('number')
    expect(product.title).to.be.a('string').and.not.empty
    expect(product.price).to.be.a('number').and.greaterThan(0)
    expect(product.rating).to.have.all.keys('rate', 'count')
})

Cypress.Commands.add('validateUserSchema', (user) => {
    expect(user).to.include.all.keys(
        'id',
        'email',
        'username',
        'password',
        'name',
        'address',
        'phone'
    )
    expect(user.name).to.have.all.keys('firstname', 'lastname')
    expect(user.address).to.include.all.keys(
        'city',
        'street',
        'number',
        'zipcode',
        'geolocation'
    )
})

Cypress.Commands.add('validateCartSchema', (cart) => {
    expect(cart).to.have.all.keys('id', 'userId', 'date', 'products', '__v')
    expect(cart.products).to.be.an('array').and.not.empty
    cart.products.forEach((p) => {
        expect(p).to.have.all.keys('productId', 'quantity')
    })
})
