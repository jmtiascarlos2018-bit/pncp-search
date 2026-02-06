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
        console.error('Brain analyze error:', error);
        res.status(500).json({ error: 'Erro interno ao processar inteligência.' });
    }
};
