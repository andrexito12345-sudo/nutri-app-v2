// src/components/LoadingScreen.jsx
import React from 'react';
import './LoadingScreen.css';

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Logo con animación de pulso */}
                <div className="loading-logo">
                    <div className="logo-circle">
                        <svg viewBox="0 0 24 24" fill="none" className="logo-icon">
                            <path
                                d="M12 2C13.5 2 14.5 3 14.5 3C14.5 3 15.5 2.5 16.5 3C17.5 3.5 17 5 17 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M12 5C8 5 5 8.5 5 12.5C5 17 8 21 12 21C16 21 19 17 19 12.5C19 8.5 16 5 12 5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 5V8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M14.5 3C16 3.5 17.5 3 18.5 2C18 4 16 5.5 14 5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Nombre de la marca */}
                <h1 className="loading-title">
                    <span className="loading-title-main">NutriVida</span>
                    <span className="loading-title-sub">Pro</span>
                </h1>

                {/* Barra de progreso */}
                <div className="loading-bar-container">
                    <div className="loading-bar">
                        <div className="loading-bar-fill"></div>
                    </div>
                </div>

                {/* Texto de carga */}
                <p className="loading-text">Cargando tu experiencia...</p>
            </div>
        </div>
    );
}

export default LoadingScreen;