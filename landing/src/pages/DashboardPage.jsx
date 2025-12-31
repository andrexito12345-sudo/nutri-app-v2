import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu } from 'lucide-react';

// Componentes refactorizados
import { useDashboardLogic } from '../hooks/useDashboardLogic';

// NUEVOS COMPONENTES MODERNOS
import DashboardKPIsModern from '../components/dashboard/DashboardKPIsModern';
import TodaySummary from '../components/dashboard/TodaySummary';
import TrendChart from '../components/dashboard/TrendChart';
import UpcomingTimeline from '../components/dashboard/UpcomingTimeline';
import QuickActions from '../components/dashboard/QuickActions';

// Componentes existentes
import AppointmentsSection from '../components/dashboard/AppointmentsSection';
import PatientsSection from '../components/dashboard/PatientsSection';
import DashboardModals from '../components/dashboard/DashboardModals';
import ToolsSidebar from '../components/ToolsSidebar';

import "./DashboardPage.css";

function DashboardPage() {
    const [isToolsOpen, setIsToolsOpen] = useState(false);
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
            {/* Header Mejorado */}
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
                    <button
                        type="button"
                        className="dash-menu-btn"
                        onClick={() => setIsToolsOpen(true)}
                        title="Menú de Herramientas"
                    >
                        <Menu className="w-6 h-6" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Quick Actions - SOLO DESKTOP (oculto en móvil) */}
            <div className="hidden lg:block">
                <QuickActions
                    onOpenPatientForm={logic.openPatientForm}
                    onOpenIMC={() => logic.setShowBMIModal(true)}
                    onOpenStats={() => logic.setShowStatsModal(true)}
                    onOpenDiet={() => logic.setShowDietModal(true)}
                    onOpenHerramientasAvanzadas={() => logic.setShowHerramientasAvanzadas(true)}
                />
            </div>

            {/* Resumen de Hoy - NUEVO */}
            <TodaySummary
                appointments={logic.filteredAppointments}
                visitStats={logic.visitStats}
            />

            {/* KPIs Modernos - REEMPLAZADO */}
            <DashboardKPIsModern
                metrics={logic.metrics}
                visitStats={logic.visitStats}
            />

            {/* Gráficas y Timeline - NUEVO */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Gráfica de Tendencias (2 columnas) */}
                <div className="lg:col-span-2">
                    <TrendChart appointments={logic.filteredAppointments} />
                </div>

                {/* Timeline de Próximas Citas (1 columna) */}
                <div className="lg:col-span-1">
                    <UpcomingTimeline
                        appointments={logic.filteredAppointments}
                        formatDate={logic.formatDate}
                    />
                </div>
            </div>

            {/* Sección de Citas - EXISTENTE */}
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

            {/* Sección de Pacientes - EXISTENTE */}
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
                onClose={() => setIsToolsOpen(false)}
                onOpenStats={() => {
                    logic.setShowStatsModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenIMC={() => {
                    logic.setShowBMIModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenFoods={() => {
                    alert("Tabla de Alimentos: En construcción");
                    setIsToolsOpen(false);
                }}
                onOpenDiet={() => {
                    logic.setShowDietModal(true);
                    setIsToolsOpen(false);
                }}
                onOpenHerramientasAvanzadas={() => {
                    logic.setShowHerramientasAvanzadas(true);
                    setIsToolsOpen(false);
                }}
            />

            {/* Modales */}
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

            {/* Contenedor de impresión */}
            <div style={{ display: 'none' }}>
                <div ref={logic.printRef}></div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default DashboardPage;