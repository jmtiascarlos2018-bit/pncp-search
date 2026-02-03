import React from 'react';
import styles from './ResultCard.module.css';

const ResultCard = ({ item }) => {
    // Format date
    const formattedDate = new Date(item.dataPublicacao).toLocaleDateString('pt-BR');

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.date}>{formattedDate}</span>
                <span className={styles.uf}>{item.municipio} - {item.uf}</span>
            </div>

            <h3 className={styles.title}>{item.objeto}</h3>

            <div className={styles.details}>
                <p><strong>Órgão:</strong> {item.orgao}</p>
                <p><strong>Modalidade:</strong> {item.modalidade}</p>
            </div>

            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
            >
                Ver no PNCP
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        </div>
    );
};

export default ResultCard;
