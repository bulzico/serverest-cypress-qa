export const apiUrl = 'https://serverest.dev';
export const userData = (admin = false) => {
  const id = crypto.randomUUID();
  return { nome: 'QA MOUTS ' + id, email: 'qa.' + id + '@example.com',
    password: crypto.randomUUID(), administrador: String(admin) };
};
export const productData = () => ({ nome: 'QA MOUTS ' + crypto.randomUUID(),
  preco: 123, descricao: 'Produto isolado criado pela automação', quantidade: 7 });
export function createUser(user: ReturnType<typeof userData>) {
  return cy.request({ method: 'POST', url: apiUrl + '/usuarios', body: user, log: false })
    .then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq('Cadastro realizado com sucesso');
      expect(body._id).to.be.a('string').and.not.be.empty;
      return body._id as string;
    });
}
export function login(user: ReturnType<typeof userData>) {
  return cy.request({ method: 'POST', url: apiUrl + '/login',
    body: { email: user.email, password: user.password }, log: false })
    .then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.authorization).to.match(/^Bearer .+/);
      return body.authorization as string;
    });
}
export function deleteUser(id: string) {
  if (id) cy.request('DELETE', apiUrl + '/usuarios/' + id).its('status').should('eq', 200);
}
