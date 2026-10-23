# Desafio QA Sênior MOUTS — ServeRest

Automação com Cypress 16, TypeScript e Chrome contra o ambiente público ServeRest.

## Executar

Pré-requisitos: Node.js 22 e Google Chrome instalado, com acesso à internet.

```sh
npm ci
npm run typecheck
npm test
```

- `npm run test:e2e`: três cenários de interface.
- `npm run test:api`: três cenários de API.
- `npm run cy:open`: execução interativa.

## Cobertura

| Camada | Cenário | Verificações |
| --- | --- | --- |
| E2E | Cadastro de usuário válido | HTTP 201, mensagem, persistência e destino /home |
| E2E | Login com senha incorreta | Usuário existente criado por API, HTTP 401, mensagem e ausência de token |
| E2E | Cadastro de produto | Admin dinâmico por API, seleção de PNG, HTTP 201, dados persistidos e linha na listagem |
| API | Cadastro válido | HTTP 201 e consulta por ID com dados exatos |
| API | E-mail duplicado | HTTP 400, mensagem e apenas um registro |
| API | E-mail inválido | HTTP 400, mensagem e ausência de persistência |

## Decisões

Dados exclusivos com UUID, contas e senhas geradas em cada teste. Nenhuma conta compartilhada ou segredo é necessário. Os hooks removem somente usuários e produtos criados pela execução. A limpeza de produto busca pelo nome exclusivo para também funcionar após falhas de asserção. Interrupção abrupta do processo ou indisponibilidade do serviço pode impedir a limpeza.

O E2E de produtos autentica o administrador por API e prepara o localStorage antes da visita; o cadastro do produto ocorre pela interface. Intercepts apenas observam respostas reais, sem mocks. Não há esperas fixas, retries para esconder falhas ou dependência da ordem dos testes.

### Limitação de imagem observada

O frontend atual recebe um arquivo no input, mas envia o campo imagem como texto (caminho do arquivo), sem multipart nem bytes do PNG. O teste verifica seleção, nome, tipo, tamanho, campo enviado e persistência desse caminho. Isso **não comprova armazenamento ou renderização da imagem**; upload binário completo é uma limitação da aplicação, não simulada pela suíte.

## CI/CD

GitHub Actions executa instalação reproduzível com npm ci, tipagem e os seis testes em Chrome em push, pull request ou disparo manual. Publica relatório JUnit e screenshots de falhas por sete dias. Não há deploy: este repositório testa uma aplicação externa. A [execução de 23/10/2026](https://github.com/bulzico/serverest-cypress-qa/actions/runs/39975000303) passou com 6/6 testes; ela corresponde ao commit fbedc58, anterior aos ajustes finais deste README e das Actions.

## Ambiente e evidências

Frontend: https://front.serverest.dev. API padrão: https://serverest.dev, configurável pelo campo `expose.apiUrl` em `cypress.config.ts` ou por `--expose apiUrl=...` na CLI do Cypress. São ambientes públicos compartilhados: indisponibilidade, reset da base e mudanças da aplicação podem afetar os testes. Falhas não são silenciadas. Screenshots de falha ficam em cypress/screenshots; vídeo está desativado para reduzir custo de execução.

Para gerar relatórios JUnit localmente, execute npm run test:ci.

Validação local em 23/10/2026, após os ajustes finais: tipagem aprovada; 6/6 testes aprovados com `npm run test:ci` em Chrome 155 headless, Cypress 16.2.0 e Node 22.1.0. Foram gerados quatro relatórios JUnit. As novas versões das GitHub Actions ainda não foram executadas remotamente.
