# Portfolio Backend

Backend do portfólio para registrar votos de avaliação do site com **sistema de voto único por usuário** usando token via cookie.

## Funcionalidades

- Registrar votos de 1 a 5 estrelas.
- Garantir que cada usuário só possa votar **uma vez** (via token único).
- Calcular média e total de votos.
- API pública pronta para integração com frontend hospedado no GitHub Pages.

## Tecnologias

- Node.js
- Express
- SQLite
- CORS

## Endpoints

### `POST /api/votar`

Registra um voto.

**Body (JSON):**

```json
{
  "nota": 5,
  "token": "uuid-do-usuario"
}
Respostas:

200 OK → Voto registrado com sucesso

400 Bad Request → Nota inválida ou usuário já votou

500 Internal Server Error → Erro no servidor

GET /api/avaliacao

Retorna média e total de votos.

Resposta (JSON):

{
  "success": true,
  "total": 10,
  "media": 4.2
}

Como rodar localmente

Clone o repositório:

git clone https://github.com/Douglas-Pedroso/portfolio-backend.git
cd portfolio-backend


Instale dependências:

npm install


Rode o servidor:

npm start


O backend estará rodando em http://localhost:3001 por padrão.

Observações

O banco votos.db é criado automaticamente na primeira execução.

O token único garante que cada navegador só consiga votar uma vez.
