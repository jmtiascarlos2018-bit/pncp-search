const { analyzeBid } = require('../services/geminiService');
const { db } = require('../config/firebase');

exports.analyze = async (req, res) => {
    try {
        const { bidData, userProfile, userId } = req.body;

        if (!bidData) {
            return res.status(400).json({ error: 'Dados da licitação são obrigatórios.' });
        }

        let finalUserProfile = userProfile;

        // Se não veio perfil mas veio ID, tenta buscar no Firestore
        if (!finalUserProfile && userId) {
            try {
                if (db) {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        finalUserProfile = userDoc.data();
                    }
                } else {
                    console.warn('Firestore not initialized. Skipping user profile fetch.');
                }
            } catch (dbError) {
                console.error("Erro ao buscar perfil no Firestore:", dbError);
                // Prossegue sem perfil ou retorna erro?
                // Vamos prosseguir assumindo perfil vazio se falhar
            }
        }

        // Default se não tiver perfil
        if (!finalUserProfile) {
            finalUserProfile = {
                documents: [],
                businessType: "Não informado"
            };
        }

        const analysisResult = await analyzeBid(bidData, finalUserProfile);

        res.json(analysisResult);

    } catch (error) {
        console.error('Brain analyze error:', error.message);

        let errorMessage = 'Erro interno ao processar inteligência.';

        if (error.message && error.message.includes('API Key')) {
            console.error('CRITICAL: GEMINI_API_KEY is missing or invalid in environment variables.');
            errorMessage = 'Configuração de IA ausente no servidor (Falta GEMINI_API_KEY).';
        } else if (error.message && error.message.includes('GoogleGenerativeAI Error')) {
            errorMessage = 'Erro remoto no serviço de IA (Google Gemini).';
        }

        res.status(500).json({ error: errorMessage, details: error.message });
    }
};
