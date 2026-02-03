import React, { useState } from 'react';
import styles from './SearchForm.module.css';

const UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SearchForm = ({ onSearch, isLoading }) => {
    const [niche, setNiche] = useState('');
    const [uf, setUf] = useState('');

    // Default to last 30 days
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [dateStart, setDateStart] = useState(thirtyDaysAgo);
    const [dateEnd, setDateEnd] = useState(today);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ niche, uf, dateStart, dateEnd });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <label htmlFor="niche">Nicho / Palavra-chave</label>
                <input
                    type="text"
                    id="niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex: Informática, Obras, Limpeza..."
                    required
                    className={styles.input}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label htmlFor="dateStart">Data Início</label>
                    <input
                        type="date"
                        id="dateStart"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label htmlFor="dateEnd">Data Fim</label>
                    <input
                        type="date"
                        id="dateEnd"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="uf">UF (Opcional)</label>
                <select
                    id="uf"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Todas</option>
                    {UFS.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>
            </div>

            <button type="submit" disabled={isLoading} className={styles.button}>
                {isLoading ? 'Buscando...' : 'Buscar Licitações'}
            </button>
        </form>
    );
};

export default SearchForm;
