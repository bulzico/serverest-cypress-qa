import { apiUrl, userData, deleteUser } from '../support/data';

describe('Cadastro de usuários', () => {
  let user: ReturnType<typeof userData>;

  beforeEach(() => {
    user = userData();
  });

  afterEach(() => {
    cy.request({ url: apiUrl + '/usuarios', qs: { email: user.email }, log: false })
      .then(({ body }) => body.usuarios.forEach((item: { _id: string }) => deleteUser(item._id)));
  });

  it('deve cadastrar um novo usuário com dados válidos', () => {
    cy.intercept('POST', apiUrl + '/usuarios').as('register');
    cy.visit('/cadastrarusuarios');
    cy.get('[data-testid="nome"]').type(user.nome);
    cy.get('[data-testid="email"]').type(user.email);
    cy.get('[data-testid="password"]').type(user.password, { log: false });
    cy.get('[data-testid="cadastrar"]').click();
    cy.wait('@register').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);
      expect(response?.body.message).to.eq('Cadastro realizado com sucesso');
      cy.request({ url: apiUrl + '/usuarios/' + response!.body._id, log: false })
        .its('body').should('include', { nome: user.nome, email: user.email, administrador: 'false' });
    });
    cy.contains('Cadastro realizado com sucesso').should('be.visible');
    cy.location('pathname', { timeout: 10000 }).should('eq', '/home');
  });
});
