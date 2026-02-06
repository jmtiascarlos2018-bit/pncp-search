import React, { useState } from 'react';
import axios from 'axios';
import { db } from '../services/firebase';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

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

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const response = await axios.post(`${API_URL}/api/analyze`, {
                bidData,
                userProfile,
                userId: USER_ID
            });

            setAnalysis(response.data);
            navigate('/analysis', { state: { analysis: response.data, bidData } });
        } catch (err) {
            console.error(err);
            setError("Falha ao gerar inteligência. Verifique se o backend está rodando e configurado.");
        } finally {
            setLoading(false);
        }
    };

    if (!analysis && !loading) {
        return (
            <button
                onClick={analyze}
                style={{
                    marginTop: '10px', background: 'linear-gradient(135deg, #39f0c8, #6dd3ff)',
                    color: '#061018', padding: '8px 16px', border: 'none', borderRadius: '20px',
                    cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
                }}
            >
                ✨ Analisar com LicitaPro Brain
            </button>
        );
    }

    if (loading) {
        return <div style={{ color: '#6b21a8', fontStyle: 'italic', marginTop: '10px' }}>🤖 Analisando edital e cruzando com seu perfil...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>;
    }

    return (
        <button
            onClick={() => navigate('/analysis', { state: { analysis, bidData } })}
            style={{
                marginTop: '10px', background: 'linear-gradient(135deg, #39f0c8, #6dd3ff)',
                color: '#061018', padding: '8px 16px', border: 'none', borderRadius: '20px',
                cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
            }}
        >
            📄 Ver análise completa
        </button>
    );
};

export default BrainAnalysis;
