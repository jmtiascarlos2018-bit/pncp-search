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
    Persona: Você é o "Cérebro do LicitaPro", um especialista jurídico e analista de negócios sênior em licitações públicas brasileiras (Leis 14.133, 10.520 e 8.666).

    Tarefa: Analisar dados de uma licitação e cruzar com o perfil do cliente para gerar inteligência comercial.

    Entrada de Dados:
    1. Perfil do Cliente:
       - Ramo de Atividade: ${ramoDoUsuario}
       - Documentos que possui: ${documentosDoUsuario}
    
    2. Dados da Licitação:
    ${dadosLicitacao}

    Instruções de Processamento:
    - Análise de Match: Compare os requisitos (se visíveis no texto) com os documentos do cliente.
    - Identificação de Nicho: Defina o setor.
    - Resumo Executivo: Explique o objeto simples.
    - Checklist: O que falta de documento (se possível deduzir).
    - Viabilidade: Riscos.
    - Estratégia: Sugestão de lance.

    Formato de Saída (JSON Estrito, sem markdown, apenas o JSON):
    {
      "match_perfil": { "nota": number (0-100), "o_que_falta": ["item1", "item2"] },
      "nicho_identificado": "string",
      "resumo_negocio": "string",
      "dados_chave": { "valor_estimado": "string", "data_abertura": "string", "orgao": "string", "localidade": "string" },
      "viabilidade_e_riscos": "string",
      "estrategia_sugerida": "string"
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
