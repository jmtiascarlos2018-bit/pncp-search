# Sistema de Busca de Licitações PNCP

Sistema web para consulta de licitações públicas utilizando a API oficial do PNCP.

## Tecnologias
- **Frontend**: React (Vite)
- **Backend**: Node.js (Express)
- **API**: PNCP (Portal Nacional de Contratações Públicas)

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

**Nota**: Devido a características da API pública, a busca textual é aplicada sobre as licitações mais recentes (últimos 90 dias, modalidade Pregão).
