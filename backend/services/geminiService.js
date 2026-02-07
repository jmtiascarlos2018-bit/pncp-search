const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Inicializa o Gemini
// Inicializa o Gemini
let genAI;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
        console.warn("GEMINI_API_KEY not found. Analysis features will be disabled.");
    }
} catch (error) {
    console.error("Error initializing Gemini:", error);
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const analyzeBid = async (bidData, userProfile) => {
    try {
        if (!genAI) {
            throw new Error("Gemini not initialized (missing API Key).");
        }
        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

        // Preparar dados do perfil para o prompt
        const documentosDoUsuario = userProfile.documents ? userProfile.documents.join(", ") : "Nenhum documento informado";
        const ramoDoUsuario = userProfile.businessType || "Não informado";

        // Preparar dados da licitação (simplificado para texto)
        const dadosLicitacao = JSON.stringify(bidData, null, 2);

        const prompt = `
    Persona: Especialista em licitações (Leis 14.133/8.666).
    Tarefa: Analisar licitação vs perfil.
    
    Perfil:
    - Ramo: ${ramoDoUsuario}
    - Docs: ${documentosDoUsuario}
    
    Licitação:
    ${dadosLicitacao}

    Gere UM JSON (sem markdown):
    {
      "match_perfil": { "nota": 0-100, "o_que_falta": [] },
      "nicho_identificado": "",
      "resumo_negocio": "Resumo em 1 frase",
      "dados_chave": { "valor_estimado": "", "data_abertura": "", "orgao": "", "localidade": "" },
      "viabilidade_e_riscos": "Curto",
      "estrategia_sugerida": "Curta"
    }
    `;

        const result = await model.generateContent(prompt);
        // `result.response` may be a Promise/stream-like object; ensure we await text
        const response = await result.response;
        const rawText = typeof response.text === 'function' ? await response.text() : String(response);

        // Limpeza básica para garantir JSON válido (remover backticks se houver)
        let jsonCandidate = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Tenta extrair o primeiro objeto JSON contido no texto (mais tolerante)
        const jsonMatch = jsonCandidate.match(/(\{[\s\S]*\})/);
        const toParse = jsonMatch ? jsonMatch[1] : jsonCandidate;

        try {
            const parsed = JSON.parse(toParse);

            // Validação mínima do formato esperado
            if (!parsed || typeof parsed !== 'object' || !parsed.match_perfil) {
                console.warn('Gemini response parsed but missing expected keys:', Object.keys(parsed || {}));
            }

            return parsed;
        } catch (parseError) {
            console.error('Failed to parse Gemini response as JSON. Raw response (truncated):', jsonCandidate.slice(0, 1000));
            throw new Error('Falha ao interpretar a resposta do motor generativo como JSON válido.');
        }

    } catch (error) {
        console.error("Error in Gemini analysis:", error);
        throw new Error("Falha na análise inteligente da licitação.");
    }
};

module.exports = { analyzeBid };
