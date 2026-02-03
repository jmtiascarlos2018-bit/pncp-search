import React from 'react';
import ResultCard from './ResultCard';
import styles from './ResultList.module.css';

const ResultList = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.empty}>
                <p>Nenhuma licitação encontrada para os filtros selecionados.</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {data.map((item) => (
                <ResultCard key={item.id} item={item} />
            ))}
        </div>
    );
};

export default ResultList;
