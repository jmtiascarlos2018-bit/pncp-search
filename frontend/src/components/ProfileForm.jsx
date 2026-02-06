import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";

const DOCUMENTS_LIST = [
    "CNPJ Ativo",
    "Certidão Negativa Federal",
    "Certidão Negativa Estadual",
    "Certidão Negativa Municipal",
    "Certidão FGTS",
    "Certidão Trabalhista (CNDT)",
    "Balanço Patrimonial",
    "Atestado de Capacidade Técnica"
];

const ProfileForm = ({ onClose }) => {
    const [businessType, setBusinessType] = useState('');
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    // Simulação de ID de usuário fixo para MVP (ideal seria Auth)
    const USER_ID = "demo_user_123";

    useEffect(() => {
        if (db) {
            loadProfile();
        }
    }, []);

    const loadProfile = async () => {
        try {
            const docRef = doc(db, "users", USER_ID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBusinessType(data.businessType || '');
                setSelectedDocs(data.documents || []);
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        }
    };

    const handleToggleDoc = (docName) => {
        setSelectedDocs(prev =>
            prev.includes(docName)
                ? prev.filter(d => d !== docName)
                : [...prev, docName]
        );
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(doc(db, "users", USER_ID), {
                businessType,
                documents: selectedDocs,
                updatedAt: new Date()
            });
            setMsg('Perfil salvo com sucesso!');
            setTimeout(() => {
                setMsg('');
                if (onClose) onClose();
            }, 1500);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setMsg('Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (!db) {
        return (
            <div className="profile-card">
                <h2>Perfil da Sua Empresa</h2>
                <p className="muted">
                    Para salvar ramo e documentos, conecte o Firebase (Firestore) no frontend.
                </p>
                <p className="muted">
                    Assim que você configurar as variáveis do Firebase no <code>frontend/.env</code>,
                    esta tela será habilitada automaticamente.
                </p>
            </div>
        );
    }

    return (
        <div className="profile-card">
            <h2>Perfil da Sua Empresa</h2>
            <p className="muted">Preencha para obter análises personalizadas de licitações.</p>

            <form onSubmit={handleSave}>
                <div className="field">
                    <label>Ramo de Atividade</label>
                    <input
                        type="text"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        placeholder="Ex: Construção Civil, TI, Limpeza..."
                        className="input"
                        required
                    />
                </div>

                <div className="field">
                    <label>Documentos que Possui</label>
                    <div className="doc-grid">
                        {DOCUMENTS_LIST.map(docItem => (
                            <label key={docItem} className="doc-item">
                                <input
                                    type="checkbox"
                                    checked={selectedDocs.includes(docItem)}
                                    onChange={() => handleToggleDoc(docItem)}
                                />
                                {docItem}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="primary-button"
                >
                    {loading ? 'Salvando...' : 'Salvar Perfil'}
                </button>
                {msg && <span className={msg.includes('Erro') ? 'status-error' : 'status-ok'}>{msg}</span>}
            </form>
        </div>
    );
};

export default ProfileForm;
