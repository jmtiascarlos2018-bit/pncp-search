import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AnalysisPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};
    const analysis = state.analysis;
    const bid = state.bidData;

    if (!analysis) {
        return (
            <div className="app-container">
                <header className="app-header">
                    <div className="header-row">
                        <div className="brand">
                            <h1>LicitaPro</h1>
                            <p>Busca e Inteligência em Licitações Públicas</p>
                        </div>
                        <nav className="nav-links">
                            <Link to="/" className="nav-link">Busca</Link>
                            <Link to="/perfil" className="nav-link">Perfil</Link>
                        </nav>
                    </div>
                </header>
                <main className="app-main">
                    <div className="search-section" style={{ textAlign: 'center' }}>
                        <p>Não encontramos a análise nesta página.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="back-button"
                        >
                            Voltar para busca
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const score = analysis.match_perfil?.nota || 0;
    const scoreColor = score > 70 ? 'green' : score > 40 ? 'orange' : 'red';

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-row">
                    <div className="brand">
                        <h1>LicitaPro</h1>
                        <p>Busca e Inteligência em Licitações Públicas</p>
                    </div>
                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Busca</Link>
                        <Link to="/perfil" className="nav-link">Perfil</Link>
                    </nav>
                </div>
            </header>

            <main className="app-main">
                <div className="analysis-header">
                    <button onClick={() => navigate('/')} className="back-button">← Voltar</button>
                    {bid?.objeto && <h2 className="analysis-title">{bid.objeto}</h2>}
                </div>

                <section className="search-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-color)' }}>🧠 Análise Inteligente</h2>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-light)' }}>Compatibilidade</span>
                            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: scoreColor }}>{score}%</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <strong>Resumo:</strong> <p style={{ margin: '5px 0' }}>{analysis.resumo_negocio}</p>
                    </div>

                    {analysis.nicho_identificado && (
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ background: 'rgba(109, 211, 255, 0.12)', color: 'var(--accent-2)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                {analysis.nicho_identificado}
                            </span>
                        </div>
                    )}

                    {analysis.match_perfil?.o_que_falta?.length > 0 && (
                        <div style={{ marginBottom: '10px', background: 'rgba(255, 107, 107, 0.12)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 107, 107, 0.35)' }}>
                            <strong style={{ color: '#ffb3b3' }}>⚠️ Documentos Faltantes:</strong>
                            <ul style={{ margin: '5px 0 0 20px', padding: 0, color: '#ffb3b3' }}>
                                {analysis.match_perfil.o_que_falta.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                        </div>
                    )}

                    <div style={{ marginBottom: '10px' }}>
                        <strong>Riscos:</strong> <p style={{ margin: '5px 0', fontSize: '0.95rem' }}>{analysis.viabilidade_e_riscos}</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <strong>Estratégia:</strong> <p style={{ margin: '5px 0', fontSize: '0.95rem', fontStyle: 'italic' }}>{analysis.estrategia_sugerida}</p>
                    </div>

                </section>
            </main>
        </div>
    );
};

export default AnalysisPage;
