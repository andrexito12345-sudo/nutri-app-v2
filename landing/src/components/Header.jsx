import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 👇 1. IMPORTAMOS EL ÍCONO "ACTIVITY" (EL DEL PULSO/CORAZÓN)
import { Activity } from 'lucide-react';
import "./Header.css";

function Header({ onOpenTools }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // 1. DETECTAR RUTAS
    const isLandingPage = location.pathname === "/";
    const isLoginPage = location.pathname === "/doctora/login";
    const isDashboard = location.pathname === "/doctora/dashboard";
    const isDoctorArea = location.pathname.startsWith("/doctora");
    const isConsultation = location.pathname.startsWith("/consulta");

    // 2. VERIFICAR SI ESTÁ LOGUEADO
    const checkIfLoggedIn = () => {
        const token = localStorage.getItem("nutri_token");
        if (isDashboard || (isDoctorArea && !isLoginPage) || isConsultation) {
            return true;
        }
        return Boolean(token);
    };

    const isLoggedIn = checkIfLoggedIn();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("nutri_token");
        navigate("/");
        setTimeout(() => window.location.reload(), 100);
    };

    const scrollToForm = () => {
        if (isLandingPage) {
            const el = document.getElementById("booking-form");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            navigate("/");
            setTimeout(() => {
                const el = document.getElementById("booking-form");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        }
    };

    const handleLogoClick = () => {
        if (isLoggedIn) {
            navigate("/doctora/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <header className={`header ${scrolled ? "header--scrolled" : ""} ${isDashboard ? "header--dashboard" : ""}`}>
            <div className="header__container">
                {/* --- LOGO NUEVO + TÍTULO --- */}
                <div
                    className="header__brand"
                    onClick={handleLogoClick}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#ffffff" }}
                    title={isLoggedIn ? "Ir al Dashboard" : "Ir al Inicio"}
                >
                    <div className="header__logo">
                        {/* 👇 2. AQUÍ REEMPLAZAMOS LA MANZANA POR EL ÍCONO "ACTIVITY" */}
                        {/* Usamos la misma clase para mantener el tamaño, y strokeWidth para que se vea gordito y bien definido */}
                        <Activity className="header__logo-svg" strokeWidth={2.5} />
                    </div>

                    {/* LÓGICA DEL TÍTULO (EN BLANCO) */}
                    {isDashboard ? (
                        <div style={{ display: "flex", flexDirection: "column", marginLeft: "10px", lineHeight: "1.2" }}>
                            <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", letterSpacing: "-0.5px" }}>
                                Panel de Control
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#e2e8f0", fontWeight: "500" }}>
                                Sistema de Gestión Nutricional
                            </span>
                        </div>
                    ) : (
                        <span className="header__name">NutriVida Pro</span>
                    )}
                </div>

                {/* Navegación derecha */}
                <nav className="header__nav">
                    {/* CASO 1: VISTA DE CONSULTA */}
                    {isConsultation && (
                        <>
                            <button type="button" className="header-btn header-btn--ghost" onClick={() => navigate("/doctora/dashboard")}>
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                <span className="header-btn__text">Volver</span>
                            </button>
                            <button type="button" className="header-btn header-btn--logout" onClick={handleLogout}>
                                <svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                <span className="header-btn__text">Salir</span>
                            </button>
                        </>
                    )}

                    {/* CASO 2: LANDING PAGE - No logueado */}
                    {isLandingPage && !isLoggedIn && (
                        <>
                            <button type="button" className="header-btn header-btn--ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="header-btn__text">Inicio</span></button>
                            <button type="button" className="header-btn header-btn--outline" onClick={scrollToForm}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span className="header-btn__text">Agendar</span></button>
                            <button type="button" className="header-btn header-btn--primary" onClick={() => navigate("/doctora/login")}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span className="header-btn__text">Acceso</span></button>
                        </>
                    )}

                    {/* CASO 3: LANDING PAGE - Logueado */}
                    {isLandingPage && isLoggedIn && (
                        <>
                            <button type="button" className="header-btn header-btn--primary" onClick={() => navigate("/doctora/dashboard")}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span className="header-btn__text">Dashboard</span></button>
                            <button type="button" className="header-btn header-btn--logout" onClick={handleLogout}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span className="header-btn__text">Salir</span></button>
                        </>
                    )}

                    {/* CASO 4: LOGIN PAGE */}
                    {isLoginPage && (
                        <button type="button" className="header-btn header-btn--ghost" onClick={() => navigate("/")}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span className="header-btn__text">Volver</span></button>
                    )}

                    {/* CASO 5: DASHBOARD */}
                    {isDashboard && (
                        <>
                            <button type="button" className="header-btn header-btn--ghost" onClick={() => navigate("/")}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="header-btn__text">Inicio</span></button>
                            <button type="button" className="header-btn header-btn--logout" onClick={handleLogout}><svg className="header-btn__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span className="header-btn__text">Salir</span></button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;