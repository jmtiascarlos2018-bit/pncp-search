# Guia de Deploy (Publicação)

Como seu sistema tem **Backend** (Node.js) e **Frontend** (React), você precisa publicá-los em lugares diferentes para funcionar 100%.

Sugestão de Hospedagem (Grátis):
- **Backend**: Render.com
- **Frontend**: Netlify (Netfflay)

---

## 1. Publicar o Backend (Render)
O Netlify é ótimo para sites, mas ruim para servidores Node.js pesados. Vamos usar o Render para o backend.

1. Crie uma conta no [Render.com](https://render.com).
2. Clique em **New +** -> **Web Service**.
3. Conecte seu repositório GitHub (se tiver subido) ou faça upload.
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Clique em **Deploy**. Quando terminar, ele te dará uma URL (ex: `https://seu-backend.onrender.com`). **Copie essa URL.**

---

## 2. Publicar o Frontend (Netlify)
1. Crie uma conta no [Netlify](https://www.netlify.com/).
2. Arraste a pasta `frontend/dist` (veja passo abaixo) OU conecte com GitHub.
3. **Configuração Importante**:
   - Vá em **Site settings** > **Environment variables**.
   - Adicione uma variável:
     - Key: `VITE_API_URL`
     - Value: `https://seu-backend.onrender.com/api` (A URL que você copiou no passo 1 + `/api`).

### Como gerar a pasta 'dist' para arrastar manualmente:
1. No seu terminal, entre na pasta `frontend`:
   ```bash
   cd frontend
   npm run build
   ```
2. Uma pasta chamada `dist` será criada dentro de `frontend`. É essa pasta que você deve arrastar para o site do Netlify se for fazer manual.

---

**Resumo da Lógica**:
O Site (Netlify) vai chamar o Servidor (Render), que vai buscar os dados no PNCP.
