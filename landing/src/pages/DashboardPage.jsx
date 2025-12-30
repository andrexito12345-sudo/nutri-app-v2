import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes y Hook refactorizados
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardKPIs from '../components/dashboard/DashboardKPIs';
import AppointmentsSection from '../components/dashboard/AppointmentsSection';
import PatientsSection from '../components/dashboard/PatientsSection';
import DashboardModals from '../components/dashboard/DashboardModals';
import ToolsSidebar from '../components/ToolsSidebar';

import "./DashboardPage.css";

function DashboardPage() {
    // ✅ ESTADO DEL MENÚ LATERAL - INTERNO
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    // Extraemos TODA la lógica del Hook
    const logic = useDashboardLogic();

    if (logic.loading) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (logic.error) {
        return (
            <div className="dash-error">
                <svg className="dash-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{logic.error}</p>
            </div>
        );
    }

    return (
        <div className="dash">
            {/* Header con botón de menú integrado */}
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Panel de Control</h1>
                    <p className="dash-subtitle">Sistema de Gestión Nutricional</p>
                </div>
                <div className="dash-header-actions">
                    <div className="dash-date">
                        {new Date().toLocaleDateString('es-EC', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                    {/* BOTÓN DEL MENÚ INTEGRADO */}
                    <button
                        type="button"
                        className="dash-menu-btn"
                        onClick={() => {
                            console.log('🔵 Abriendo menú desde DashboardPage');
                            setIsToolsOpen(true);
                        }}
                        title="Menú de Herramientas"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Métricas y KPIs */}
            <DashboardKPIs
                metrics={logic.metrics}
                visitStats={logic.visitStats}
            />

            {/* Sección de Citas */}
            <AppointmentsSection
                appointments={logic.filteredAppointments}
                metrics={logic.metrics}
                filters={{
                    search: logic.search,
                    status: logic.statusFilter,
                    date: logic.dateFilter
                }}
                setSearch={logic.setSearch}
                setStatusFilter={logic.setStatusFilter}
                setDateFilter={logic.setDateFilter}
                formatDate={logic.formatDate}
                changeStatus={logic.changeStatus}
                navigate={logic.navigate}
                handleCreatePatientFromAppointment={logic.handleCreatePatientFromAppointment}
            />

            {/* Sección de Pacientes */}
            <PatientsSection
                patients={logic.patients}
                loading={logic.patientsLoading}
                search={logic.patientSearch}
                setSearch={logic.setPatientSearch}
                openPatientForm={logic.openPatientForm}
                formatDate={logic.formatDate}
                viewPatientRecord={logic.viewPatientRecord}
                printLatestConsultation={logic.printLatestConsultation}
                editPatient={logic.editPatient}
                deletePatient={logic.deletePatient}
            />

            {/* Menú Lateral de Herramientas */}
            <ToolsSidebar
                isOpen={isToolsOpen}
                onClose={() => {
                    console.log('✅ Cerrando menú lateral');
                    setIsToolsOpen(false);
                }}
                onOpenStats={() => {
                    console.log('📊 Abriendo Panel de Estadísticas');
                    logic.setShowStatsModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenIMC={() => {
                    console.log('📏 Abriendo Calculadora IMC');
                    logic.setShowBMIModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenFoods={() => {
                    console.log('🍎 Tabla Nutricional');
                    alert("Tabla de Alimentos: En construcción");
                    setIsToolsOpen(false);
                }}
                onOpenDiet={() => {
                    console.log('📋 Abriendo Generador de Dietas');
                    logic.setShowDietModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenHerramientasAvanzadas={() => {
                    console.log('⚡ Abriendo Herramientas Avanzadas');
                    logic.setShowHerramientasAvanzadas(true);
                    setIsToolsOpen(false);
                }}
            />

            {/* Gestión de Todos los Modales */}
            <DashboardModals
                modals={logic.modals}
                modalData={logic.modalData}
                actions={{
                    closePatientModal: logic.closePatientModal,
                    setShowPatientForm: logic.setShowPatientForm,
                    setPendingAppointment: logic.setPendingAppointment,
                    handlePatientFormChange: logic.handlePatientFormChange,
                    savePatient: logic.savePatient,
                    setShowStatsModal: logic.setShowStatsModal,
                    setShowBMIModal: logic.setShowBMIModal,
                    setShowDietModal: logic.setShowDietModal,
                    setShowHerramientasAvanzadas: logic.setShowHerramientasAvanzadas,
                }}
            />

            {/* Contenedor invisible para impresión */}
            <div style={{ display: 'none' }}>
                <div ref={logic.printRef}></div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default DashboardPage;