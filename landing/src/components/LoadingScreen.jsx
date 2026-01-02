// src/components/LoadingScreen.jsx
import React from 'react';
import { Activity } from 'lucide-react'; // 👇 1. Importamos el nuevo ícono
import './LoadingScreen.css';

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Logo con animación de pulso */}
                <div className="loading-logo">
                    <div className="logo-circle">
                        {/* 👇 2. Reemplazamos el SVG antiguo por Activity */}
                        {/* Mantenemos className="logo-icon" para que tus animaciones CSS sigan funcionando */}
                        <Activity className="logo-icon" strokeWidth={2.5} />
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