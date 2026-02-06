import React from 'react';
import { Link } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';

const ProfilePage = () => {
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
                        <span className="nav-link active">Perfil</span>
                    </nav>
                </div>
            </header>

            <main className="app-main">
                <div className="analysis-header">
                    <Link to="/" className="back-button">← Voltar</Link>
                    <h2 className="analysis-title">Perfil da Empresa</h2>
                </div>

                <ProfileForm />
            </main>
        </div>
    );
};

export default ProfilePage;
