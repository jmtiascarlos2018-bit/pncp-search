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

const listModels = async () => {
    if (!genAI) {
        throw new Error("Gemini not initialized (missing API Key).");
    }
    try {
        // For google-generative-ai, we might need to use the model manager if available, 
        // or just rely on the error message suggesting ListModels. 
        // Actually the SDK doesn't always expose listModels directly on the main class in older versions,
        // but let's try to access it via the API if possible or just return a static helpful message if not found.
        // Checking documentation: genAI.getGenerativeModel is the main entry. 
        // There isn't a direct listModels on GoogleGenerativeAI instance in some versions.
        // Let's try to just return the configured model for now, but if we can, we should try to fetch.
        // Since we can't easily list without the specific manager, let's just focus on the model change.
        return { message: "Listing models requires specific API call not fully wrapper here yet." };
    } catch (error) {
        return { error: error.message };
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

module.exports = { analyzeBid };
