import { apiUrl, userData, productData, createUser, login, deleteUser } from '../support/data';

describe('Cadastro de produtos', () => {
  let userId = '';
  let token = '';
  let product: ReturnType<typeof productData>;

  beforeEach(() => {
    userId = ''; token = ''; product = productData();
    const admin = userData(true);
    createUser(admin).then(id => { userId = id; });
    login(admin).then(value => {
      token = value;
      cy.visit('/admin/cadastrarprodutos', { onBeforeLoad(win) {
        win.localStorage.setItem('serverest/userToken', token);
        win.localStorage.setItem('serverest/userEmail', admin.email);
        win.localStorage.setItem('serverest/userNome', admin.nome);
      } });
    });
  });

  afterEach(() => {
    // Busca pelo nome exclusivo também limpa se uma asserção falhar após o POST.
    if (token) cy.request({ url: apiUrl + '/produtos', qs: { nome: product.nome } })
      .then(({ body }) => {
        body.produtos.forEach((item: { _id: string }) => {
          cy.request({ method: 'DELETE', url: apiUrl + '/produtos/' + item._id,
            headers: { Authorization: token }, log: false }).its('status').should('eq', 200);
        });
      });
    deleteUser(userId);
  });

  it('cadastra produto com imagem selecionada e confirma persistência e listagem', () => {
    cy.intercept('POST', apiUrl + '/produtos').as('createProduct');
    cy.get('[data-testid="nome"]').type(product.nome);
    cy.get('[data-testid="preco"]').type(String(product.preco));
    cy.get('[data-testid="descricao"]').type(product.descricao);
    cy.get('[data-testid="quantity"]').type(String(product.quantidade));
    cy.get('[data-testid="imagem"]').selectFile('cypress/fixtures/produto.png')
      .should(input => {
        const file = (input[0] as HTMLInputElement).files![0];
        expect(file.name).to.eq('produto.png');
        expect(file.type).to.eq('image/png');
        expect(file.size).to.be.greaterThan(0);
      });
    cy.get('[data-testid="cadastarProdutos"]').click();
    cy.wait('@createProduct').then(({ request, response }) => {
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.message).to.eq('Cadastro realizado com sucesso');
      expect(request.body.nome).to.eq(product.nome);
      expect(request.body.imagem).to.match(/produto\.png$/);
      cy.request(apiUrl + '/produtos/' + response!.body._id).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.include(product);
        expect(body.imagem).to.eq(request.body.imagem);
      });
    });
    cy.location('pathname').should('eq', '/admin/listarprodutos');
    cy.contains('tr', product.nome).within(() => {
      cy.get('td').eq(0).should('have.text', product.nome);
      cy.get('td').eq(1).should('have.text', String(product.preco));
      cy.get('td').eq(2).should('have.text', product.descricao);
      cy.get('td').eq(3).should('have.text', String(product.quantidade));
      cy.get('td').eq(4).should('contain.text', 'produto.png');
    });
  });
});
