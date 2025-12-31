// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import LoadingScreen from './components/LoadingScreen';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SoapConsultation from './pages/SoapConsultation';

// Sections (Landing Page)
import Hero from './sections/Hero';
import Problems from './sections/Problems';
import BMICalculator from "./sections/BMICalculator.jsx";
import Benefits from './sections/Benefits';
import Testimonials from './sections/Testimonials';
import Booking from './sections/Booking';

// Services
import { isAuthenticated } from './services/api';

// Protected Route Component
function ProtectedRoute({ children }) {
    const auth = isAuthenticated();
    if (!auth) {
        return <Navigate to="/doctora/login" replace />;
    }
    return children;
}

// Landing Page Component
function LandingPage() {
    return (
        <>
            <main>
                <Hero />
                <Problems />
                <BMICalculator />
                <Benefits />
                <Testimonials />
                <Booking />
            </main>
            <Footer />
            <WhatsAppFloat />
        </>
    );
}

// Main App Component
function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simular carga de recursos
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000); // 2 segundos de loading screen

        return () => clearTimeout(timer);
    }, []);

    // Mostrar loading screen mientras carga
    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="App">
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#fff',
                        color: '#1e293b',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Header Global - SIN onOpenTools porque el menú es interno del Dashboard */}
            <Header />

            {/* Routes */}
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Login Page */}
                <Route path="/doctora/login" element={<LoginPage />} />

                {/* Dashboard (Protected) - SIN PROPS, maneja su propio menú */}
                <Route
                    path="/doctora/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rutas de Consulta SOAP */}
                <Route
                    path="/consulta/nueva/:appointmentId/:patientId"
                    element={
                        <ProtectedRoute>
                            <SoapConsultation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consulta/nueva/:patientId"
                    element={
                        <ProtectedRoute>
                            <SoapConsultation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consulta/editar/:consultationId"
                    element={
                        <ProtectedRoute>
                            <SoapConsultation />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;