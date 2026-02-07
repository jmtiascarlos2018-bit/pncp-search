import React, { useState } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { analyzeBid } from '../services/api';

const BrainAnalysis = ({ bidData }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const USER_ID = "demo_user_123";

    const analyze = async () => {
        setLoading(true);
        setError(null);
        try {
            let userProfile = null;
            try {
                if (db) {
                    const docSnap = await getDoc(doc(db, "users", USER_ID));
                    if (docSnap.exists()) {
                        userProfile = docSnap.data();
                    }
                }
            } catch (err) {
                console.warn("Não foi possível carregar perfil localmente, enviando ID para backend tentar.", err);
            }

            const data = await analyzeBid({
                bidData,
                userProfile,
                userId: USER_ID
            });

            setAnalysis(data);
            navigate('/analysis', { state: { analysis: data, bidData } });
        } catch (err) {
            console.error("ANALYSIS ERROR:", err);
            // Error handling tailored to the fetch API error or custom errors
            setError(`Falha ao gerar inteligência. (${err.message})`);
        } finally {
            console.log("Analysis finished (finally block reached).");
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <button
                onClick={analyze}
                className="action-btn btn-ai"
            >
                ✨ Analisar
            </button>
        );
    }

    if (loading) {
        return <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic', padding: '0.5rem' }}>🤖 Analisando...</div>;
    }

    if (error) {
        return <div style={{ fontSize: '0.8rem', color: 'var(--error)', padding: '0.5rem' }}>Erro na análise</div>;
    }

    return (
        <button
            onClick={() => navigate('/analysis', { state: { analysis, bidData } })}
            className="action-btn btn-ai"
            style={{ background: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
        >
            📄 Ver Análise
        </button>
    );
};

export default BrainAnalysis;
