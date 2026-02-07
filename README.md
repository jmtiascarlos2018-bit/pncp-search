# Sistema de Busca de Licitações PNCP

Sistema web para consulta de licitações públicas utilizando a API oficial do PNCP.

## Tecnologias
- **Frontend**: React (Vite)
- **Backend**: Node.js (Express)
- **APIs**: PNCP + Portal da Transparência + Compras.gov.br (Dados Abertos)

## Pré-requisitos
- Node.js instalado (v14+ recomendado)

## Instalação e Execução

### 1. Iniciar o Backend
Abra um terminal na pasta do projeto:
```bash
cd backend
npm install
npm start
```
O servidor rodará em `http://localhost:3001`.

### 2. Iniciar o Frontend
Abra **outro** terminal na pasta do projeto:
```bash
cd frontend
npm install
npm run dev
```
Acesse no navegador: `http://localhost:5173`.

## Como Usar
1. Digite uma palavra-chave (ex: "Computador", "Limpeza").
2. (Opcional) Selecione uma UF.
3. Clique em "Buscar".
4. Visualize os resultados e clique em "Ver no PNCP" para detalhes completos.

**Nota**: Devido a características das APIs públicas, a busca textual é aplicada sobre as licitações mais recentes. O backend agrega PNCP + Portal da Transparência (quando a chave está configurada) + Compras.gov.br.

## Variáveis de ambiente (Frontend)

- Para apontar o frontend a um backend diferente, defina `VITE_API_URL` no `.env` da pasta `frontend` (ex.: `VITE_API_URL=https://meu-backend.com`). O valor será normalizado e o sufixo `/api` será adicionado automaticamente.
- No backend, configure `GEMINI_API_KEY` no `.env` para permitir uso do serviço generativo (se aplicável).
- Para integrar o Portal da Transparência, configure `PORTAL_TRANSPARENCIA_API_KEY` (chave de acesso da API de dados) e, se necessário, ajuste `PORTAL_TRANSPARENCIA_LICITACOES_URL`.
- Para configurar a busca no Compras.gov.br, ajuste `COMPRAS_GOV_LICITACOES_URL` e limites de paginação/timeout conforme necessidade (não requer chave).
- Para alertas por e-mail, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`.
- Para executar os alertas de forma segura, configure `ALERTS_RUN_TOKEN` e chame `POST /api/alerts/run` com o header `x-alert-token`.

## Deploy
Para atualizar o frontend no Netlify ou backend no Render, basta fazer um push para a branch `main`.
