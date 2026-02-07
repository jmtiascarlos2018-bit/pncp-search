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

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-001';

const listAvailableModels = async () => {
    if (!process.env.GEMINI_API_KEY) {
        return { error: "API Key not found in environment variables" };
    }
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        return {
            success: true,
            models: response.data.models.map(m => m.name) // Retorna apenas os nomes (ex: models/gemini-pro)
        };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status,
            statusText: error.response?.statusText,
            errorData: error.response?.data,
            message: error.message
        };
    }
};

const MODELS_TO_TRY = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-1.0-pro',
    'gemini-pro'
];

const analyzeBid = async (bidData, userProfile) => {
    if (!genAI) {
        throw new Error("Gemini not initialized (missing API Key).");
    }

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

    let lastError = null;

    // Try models in sequence
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`Attempting analysis with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const rawText = typeof response.text === 'function' ? await response.text() : String(response);

            // Clean markdown
            let jsonCandidate = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = jsonCandidate.match(/(\{[\s\S]*\})/);
            const toParse = jsonMatch ? jsonMatch[1] : jsonCandidate;

            const parsed = JSON.parse(toParse);
            return parsed; // Success!

        } catch (error) {
            console.warn(`Failed with ${modelName}: ${error.message}`);
            lastError = error;
            // Continue to next model
        }
    }

    // If all failed
    console.error("All Gemini models failed.");
    throw lastError || new Error("Falha ao analisar com todos os modelos disponíveis.");
};

module.exports = { analyzeBid, listAvailableModels };
