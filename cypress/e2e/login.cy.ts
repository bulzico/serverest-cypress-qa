import { apiUrl, userData, createUser, deleteUser } from '../support/data';
describe('Autenticação de usuários', () => {
  let userId = '';
  let user: ReturnType<typeof userData>;
  beforeEach(() => {
    userId = ''; user = userData();
    createUser(user).then(id => { userId = id; });
  });
  afterEach(() => deleteUser(userId));
  it('não deve autenticar um usuário existente com senha incorreta', () => {
    cy.intercept('POST', apiUrl + '/login').as('login');
    cy.visit('/login');
    cy.get('[data-testid="email"]').type(user.email);
    cy.get('[data-testid="senha"]').type(user.password + '-incorreta', { log: false });
    cy.get('[data-testid="entrar"]').click();
    cy.wait('@login').its('response.statusCode').should('eq', 401);
    cy.contains('Email e/ou senha inválidos').should('be.visible');
    cy.location('pathname').should('eq', '/login');
    cy.window().then(win => expect(win.localStorage.getItem('serverest/userToken')).to.be.null);
  });
});
