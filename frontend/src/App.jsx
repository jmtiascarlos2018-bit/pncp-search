import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SearchForm from './components/SearchForm';
import ResultList from './components/ResultList';
import Loading from './components/Loading';
import { searchTenders, subscribeAlert, getSystemStatus } from './services/api';
import './App.css';
import AnalysisPage from './pages/AnalysisPage';
import ProfilePage from './pages/ProfilePage';


function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertError, setAlertError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Check system status on load
    getSystemStatus().then(status => {
      if (status) setSystemStatus(status);
    });
  }, []);

  const handleSubscribe = async ({ email, q, uf }) => {
    setAlertMessage(null);
    setAlertError(null);
    if (!email) {
      setAlertError('Informe um e-mail para receber alertas.');
      return;
    }
    try {
      await subscribeAlert({ email, q, uf });
      setAlertMessage('Alerta criado com sucesso! Você receberá e-mails quando surgirem novas licitações.');
    } catch (err) {
      setAlertError('Não foi possível criar o alerta. Tente novamente mais tarde.');
    }
  };

  const handleSearch = async (params) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await searchTenders(params);
      setResults(data.data);
      setSearchMeta({ total: data.total, pages: data.pages });
    } catch (err) {
      setError('Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app-container">
            <header className="app-header">
              <div className="header-row">
                <div className="brand">
                  <h1>LicitaPro</h1>
                  <p>Busca e Inteligência em Licitações Públicas</p>
                </div>
                <nav className="nav-links">
                  <span className="nav-link active">Busca</span>
                  <Link to="/perfil" className="nav-link">Perfil</Link>
                </nav>
              </div>
            </header>

            <main className="app-main">
              <div className="search-section">
                <SearchForm onSearch={handleSearch} onSubscribe={handleSubscribe} isLoading={loading} />

                {error && <div className="error-message">{error}</div>}
                {alertMessage && <div className="success-message">{alertMessage}</div>}
                {alertError && <div className="error-message">{alertError}</div>}

                {/* Status Indicator */}
                {systemStatus && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span className={systemStatus.services?.pncp === 'ok' ? 'status-ok' : 'status-error'}>
                      PNCP: {systemStatus.services?.pncp === 'ok' ? '✅' : '❌'}
                    </span>
                    <span className={systemStatus.services?.compras_gov === 'ok' ? 'status-ok' : 'status-error'}>
                      Compras.gov: {systemStatus.services?.compras_gov === 'ok' ? '✅' : '❌'}
                    </span>
                    <span className={systemStatus.services?.portal_transparencia === 'ok' ? 'status-ok' : 'status-error'}>
                      Portal: {systemStatus.services?.portal_transparencia === 'ok' ? '✅' : '❌'}
                    </span>
                    <span className={systemStatus.services?.gemini === 'ok' ? 'status-ok' : 'status-error'}>
                      IA: {systemStatus.services?.gemini === 'ok' ? '✅' : '❌'}
                    </span>
                  </div>
                )}

                {!loading && results && (
                  <p className="results-count">
                    Encontrados {searchMeta?.total} resultados (mostrando recentes)
                  </p>
                )}
              </div>

              <div className="results-section">
                {loading && <Loading />}

                {!loading && results && results.length > 0 && (
                  <ResultList data={results} />
                )}
                {!loading && results && results.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <p>Nenhuma licitação encontrada para os filtros selecionados.</p>
                  </div>
                )}
              </div>
            </main>

            <footer className="app-footer">
              <p>Dados fornecidos por PNCP, Compras.gov.br e Portal da Transparência</p>
            </footer>
          </div>
        }
      />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
