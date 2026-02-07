const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
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

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash', // Mantendo como fallback caso mude
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-1.0-pro',
    'gemini-pro'
];

// Helper function to try multiple models
const analyzeWithFallback = async (prompt) => {
    let lastError = null;

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

            return JSON.parse(toParse); // Success!

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

const analyzeBid = async (bidData, userProfile) => {
    if (!genAI) {
        throw new Error("Gemini not initialized (missing API Key).");
    }

    // Preparar dados do perfil para o prompt
    const documentosDoUsuario = userProfile.documents ? userProfile.documents.join(", ") : "Nenhum documento informado";
    const ramoDoUsuario = userProfile.businessType || "Não informado";

    // Preparar dados da licitação
    const dadosLicitacao = JSON.stringify(bidData, null, 2);

    const prompt = `
    ATUE COMO: Um consultor de licitações de elite, especializado em Leis 14.133/21 e 8.666/93.
    SEU OBJETIVO: Analisar esta oportunidade de licitação CRUZANDO com o perfil do cliente para entregar insights estratégicos, não apenas óbvios.

    DADOS DO CLIENTE (PERFIL):
    - Ramo de Atividade: ${ramoDoUsuario}
    - Documentação Disponível: ${documentosDoUsuario}

    DADOS DA OPORTUNIDADE (LICITAÇÃO/EDITAL):
    ${dadosLicitacao}

    DIRETRIZES DE ANÁLISE:
    1. VALORES E VIABILIDADE: Tente inferir ou comentar sobre valores estimados se disponíveis ou preços de mercado para este objeto.
    2. EDITAL E OBJETO: Analise a descrição do objeto com profundidade. O que *realmente* está sendo pedido? Há pegadinhas técnicas?
    3. DICAS INTELIGENTES (Ouro): Dê dicas "de mestre" para vencer. Ex: "Busque impugnar se x estiver ausente", "Cuidado com a exigência y", "Este objeto geralmente requer atestado de z".

    FORMATO DE SAÍDA (JSON PURO, SEM MARKDOWN):
    {
      "match_perfil": { 
        "nota": 0-100, 
        "justificativa": "Explicação curta do percentual",
        "pontos_fortes": ["..."],
        "o_que_falta": ["Documento X", "Capacidade Y"] 
      },
      "analise_financeira": {
        "comentario_valores": "Analise se o valor é atrativo ou se há risco de inexequibilidade (se valor estiver visível), ou comente sobre margens típicas deste setor.",
        "riscos_ocultos": ["Risco A", "Risco B"]
      },
      "analise_tecnica_objeto": "Resumo detalhado do que é o objeto e suas particularidades técnicas.",
      "estrategia_vencedora": {
        "dicas_inteligentes": ["Dica 1", "Dica 2", "Dica 3"],
        "acao_imediata": "Qual o primeiro passo agora?"
      },
      "resumo_simples": "Resumo executivo em 1 frase para decisão rápida."
    }
    `;

    try {
        const jsonResult = await analyzeWithFallback(prompt);

        // Mapear campos novos para manter compatibilidade com frontend (BrainAnalysis.jsx / AnalysisPage.jsx)
        // O frontend espera: resumo_negocio, viabilidade_e_riscos, estrategia_sugerida, match_perfil.nota, match_perfil.o_que_falta
        return {
            match_perfil: {
                nota: jsonResult.match_perfil?.nota || 0,
                o_que_falta: jsonResult.match_perfil?.o_que_falta || []
            },
            resumo_negocio: jsonResult.resumo_simples || "Sem resumo disponível.",
            nicho_identificado: jsonResult.analise_tecnica_objeto ? "Análise Técnica Realizada" : "",

            // Combinar riscos e análise financeira em um texto único para o frontend
            viabilidade_e_riscos: [
                jsonResult.analise_financeira?.comentario_valores,
                ...(jsonResult.analise_financeira?.riscos_ocultos || [])
            ].filter(Boolean).join('. ') || "Nenhum risco crítico identificado.",

            // Combinar estratégia e dicas
            estrategia_sugerida: [
                ...(jsonResult.estrategia_vencedora?.dicas_inteligentes || []),
                `Ação Recomendada: ${jsonResult.estrategia_vencedora?.acao_imediata || ''}`
            ].join('\n\n'),

            // Dados extras que podem ser usados se o frontend for atualizado no futuro
            raw_data: jsonResult
        };

    } catch (error) {
        console.error("Erro na análise IA:", error);
        throw error;
    }
};

module.exports = { analyzeBid, listAvailableModels };
