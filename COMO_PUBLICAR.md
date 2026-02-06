# Documentacao do LicitaPro (Resumo tecnico + Deploy)

Este documento descreve:
1) O que foi implementado e como funciona
2) Como rodar localmente
3) Como publicar no Render (backend) e Netlify (frontend)
4) Como configurar o Firebase (Firestore) e Gemini

---

## 1) O que foi implementado

### 1.1 Fontes de licitacao
- PNCP (API oficial)
- Compras.gov.br (dados abertos)
- Portal da Transparencia (exige chave)

As fontes sao agregadas no backend e retornadas em uma unica lista, com o campo `fonte` e `linkLabel`.

### 1.2 Inteligencia (IA)
- Analise com Gemini via endpoint `POST /api/analyze`
- A analise agora abre em pagina separada com rota `/analysis`
- Removido o bloco "Sugestao WhatsApp"
- Nome do produto alterado para LicitaPro

### 1.3 Alertas por e-mail (opcional)
- Inscricao via `POST /api/alerts/subscribe`
- Execucao via `POST /api/alerts/run` (protegido por token)
- Envio SMTP (Nodemailer)
- Requer Firestore para salvar as inscricoes

### 1.4 Perfil do usuario (opcional)
- Tela de Perfil em `/perfil`
- Cadastro de ramo e documentos via Firestore
- Se o Firebase nao estiver configurado, a tela mostra instrucoes

---

## 2) Rodar localmente

### 2.1 Backend
```bash
cd backend
npm install
npm start
```
Servidor sobe em `http://localhost:3001`

### 2.2 Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend em `http://localhost:5173`

---

## 3) Variaveis de ambiente (backend)

Arquivo: `backend/.env`

Minimo recomendado:
```
PORT=3001
GEMINI_API_KEY=SUACHAVE
GEMINI_MODEL=gemini-2.5-flash
PORTAL_TRANSPARENCIA_API_KEY=SUACHAVE
```

Fontes:
```
COMPRAS_GOV_LICITACOES_URL=https://compras.dados.gov.br/licitacoes/v1/licitacoes.json
COMPRAS_GOV_PAGES=2
COMPRAS_GOV_CONCURRENCY=2
COMPRAS_GOV_TIMEOUT_MS=10000
COMPRAS_GOV_PAGE_SIZE=500

PORTAL_TRANSPARENCIA_LICITACOES_URL=https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes
PORTAL_TRANSPARENCIA_PAGES=3
PORTAL_TRANSPARENCIA_CONCURRENCY=3
PORTAL_TRANSPARENCIA_TIMEOUT_MS=10000
```

Alertas (se usar):
```
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=senha
SMTP_FROM=LicitaPro <no-reply@seudominio.com>
SMTP_SECURE=false

ALERTS_RUN_TOKEN=seu_token
ALERTS_LOOKBACK_DAYS=7
ALERTS_MAX_RESULTS=10
ALERTS_MAX_STORED_IDS=200
```

Firebase Admin (se usar):
```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

---

## 4) Variaveis de ambiente (frontend)

Arquivo: `frontend/.env`

Para apontar para o backend publicado:
```
VITE_API_URL=https://seu-backend.onrender.com
```

Firebase Web (se usar Perfil):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 5) Publicar no Render (backend)

1. Suba o repositorio no GitHub
2. Render > New > Web Service
3. Configure:
   - Root Directory: (vazio)
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/server.js`
4. Em Environment (Render), cole as variaveis do backend (.env)
5. Deploy

---

## 6) Publicar no Netlify (frontend)

1. Netlify > New site from Git
2. Configuracao:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist` (se root do repo)
3. Environment variables:
   - `VITE_API_URL` com a URL do Render
   - (Firebase Web vars se usar Perfil)

Obs: seu `frontend/netlify.toml` ja contem redirect para SPA.

---

## 7) Firestore (passo a passo)

1. Firebase Console > Create Project
2. Build > Firestore Database > Create
3. Project Settings > General > Add App (Web)
4. Copie as credenciais Web e coloque em `frontend/.env`
5. (Opcional) Service Account:
   - Project Settings > Service Accounts > Generate new private key
   - Use os valores no backend (.env)

---

## 8) Testes rapidos

### 8.1 Busca
```
http://localhost:3001/api/search?q=obras&dateStart=2026-01-01&dateEnd=2026-02-05
```

### 8.2 Analise (IA)
Clique em "Analisar com LicitaPro Brain"
e a pagina abre em `/analysis`

### 8.3 Alertas (se SMTP + Firestore estiverem ativos)
```
POST /api/alerts/run
Header: x-alert-token: SEU_TOKEN
```

---

## 9) Observacoes importantes

- Nunca compartilhe chaves em chat publico.
- Se expor uma chave, revogue e gere outra.
- Se o Firebase nao estiver configurado, o Perfil fica desativado e alertas nao funcionam.

