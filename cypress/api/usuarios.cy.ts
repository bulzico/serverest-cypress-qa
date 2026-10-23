import { apiUrl, userData, createUser, deleteUser } from '../support/data';
describe('API de usuários', () => {
  let userId = '';
  beforeEach(() => { userId = ''; });
  afterEach(() => deleteUser(userId));

  it('cria usuário e consulta os dados persistidos', () => {
    const user = userData();
    createUser(user).then(id => {
      userId = id;
      cy.request({ url: apiUrl + '/usuarios/' + id, log: false }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.deep.eq({ ...user, _id: id });
      });
    });
  });

  it('rejeita e-mail duplicado sem criar um segundo usuário', () => {
    const user = userData();
    createUser(user).then(id => { userId = id; });
    cy.request({ method: 'POST', url: apiUrl + '/usuarios', body: user,
      failOnStatusCode: false, log: false }).then(({ status, body }) => {
      expect(status).to.eq(400);
      expect(body).to.deep.eq({ message: 'Este email já está sendo usado' });
    });
    cy.request({ url: apiUrl + '/usuarios', qs: { email: user.email }, log: false }).then(({ body }) => {
      expect(body.quantidade).to.eq(1);
      expect(body.usuarios[0]._id).to.eq(userId);
    });
  });

  it('rejeita e-mail inválido sem persistir o usuário', () => {
    const user = { ...userData(), email: 'invalido-' + crypto.randomUUID() };
    cy.request({ method: 'POST', url: apiUrl + '/usuarios', body: user,
      failOnStatusCode: false, log: false }).then(({ status, body }) => {
      // Guarda eventual criação indevida para limpeza mesmo se o contrato falhar.
      if (body._id) userId = body._id;
      expect(status).to.eq(400);
      expect(body).to.deep.eq({ email: 'email deve ser um email válido' });
    });
    cy.request({ url: apiUrl + '/usuarios', qs: { nome: user.nome }, log: false })
      .its('body.quantidade').should('eq', 0);
  });
});
