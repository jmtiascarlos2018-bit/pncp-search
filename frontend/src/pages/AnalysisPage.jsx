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
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-row">
                    <div className="brand">
                        <h1>LicitaPro Brain</h1>
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
                    {bid?.objeto && <h2 className="result-title" style={{ fontSize: '1.25rem', marginTop: '1rem' }}>{bid.objeto}</h2>}
                </div>

                <section className="search-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Análise Inteligente</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Powered by Gemini 2.0</span>
                        </div>
                        <div className="score-circle" style={{ borderColor: scoreColor }}>
                            <span className="score-value" style={{ color: scoreColor }}>{score}%</span>
                            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-secondary)' }}>Match</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Resumo Executivo</h3>
                        <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{analysis.resumo_negocio}</p>
                    </div>

                    {analysis.nicho_identificado && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="meta-tag" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>
                                🎯 {analysis.nicho_identificado}
                            </span>
                        </div>
                    )}

                    {analysis.match_perfil?.o_que_falta?.length > 0 && (
                        <div style={{ marginBottom: '1.5rem', background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            <strong style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0.5rem' }}>
                                ⚠️ Documentos Faltantes
                            </strong>
                            <ul style={{ margin: '0 0 0 1.25rem', padding: 0, color: '#b91c1c', fontSize: '0.9rem' }}>
                                {analysis.match_perfil.o_que_falta.map((item, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>)}
                            </ul>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Viabilidade & Riscos</h3>
                        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '12px', border: '1px solid #fef3c7', fontSize: '0.95rem', color: '#92400e' }}>
                            {analysis.viabilidade_e_riscos}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Estratégia Vencedora</h3>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0', color: '#166534' }}>
                            {analysis.estrategia_sugerida}
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
};

export default AnalysisPage;
