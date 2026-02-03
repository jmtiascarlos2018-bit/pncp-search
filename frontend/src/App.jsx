import React, { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultList from './components/ResultList';
import Loading from './components/Loading';
import { searchTenders } from './services/api';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null); 

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
    <div className="app-container">
      <header className="app-header">
        <h1>Busca de Licitação</h1>
        <p>Pesquise contratações públicas de forma simples e direta</p>
      </header>

      <main className="app-main">
        <div className="search-section">
          <SearchForm onSearch={handleSearch} isLoading={loading} />

          {error && <div className="error-message">{error}</div>}

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
        <p>Dados fornecidos pelo Portal Nacional de Contratações Públicas (PNCP)</p>
      </footer>
    </div>
  );
}

export default App;
