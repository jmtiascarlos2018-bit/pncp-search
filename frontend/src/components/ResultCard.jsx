import React from 'react';
import styles from './ResultCard.module.css';
import BrainAnalysis from './BrainAnalysis';

const ResultCard = ({ item }) => {
    // Format date
    const formattedDate = item.dataPublicacao
        ? new Date(item.dataPublicacao).toLocaleDateString('pt-BR')
        : 'Data não informada';

    const getSourceClass = (source) => {
        const s = (source || '').toLowerCase();
        if (s.includes('pncp')) return 'source-pncp';
        if (s.includes('transpar')) return 'source-pt';
        if (s.includes('compras')) return 'source-comprasgov';
        return 'source-pncp';
    };

    const sourceClass = getSourceClass(item.fonte);

    return (
        <div className="result-card">
            <span className={`result-source-badge ${sourceClass}`}>
                {item.fonte || 'PNCP'}
            </span>

            <span className="result-date">{formattedDate}</span>

            <h3 className="result-title">{item.objeto}</h3>

            <div className="result-meta">
                {item.municipio && <span className="meta-tag">📍 {item.municipio}-{item.uf}</span>}
                <span className="meta-tag">🏢 {item.orgao}</span>
                <span className="meta-tag">📋 {item.modalidade}</span>
            </div>

            <div className="result-actions">
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn"
                >
                    Link Original
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>

                <BrainAnalysis bidData={item} customClass="btn-ai" />
            </div>
        </div>
    );
};


export default ResultCard;
