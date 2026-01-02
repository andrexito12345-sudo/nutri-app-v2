import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardKPIsModern from '../components/dashboard/DashboardKPIsModern';
import TrendChart from '../components/dashboard/TrendChart';
import UpcomingTimeline from '../components/dashboard/UpcomingTimeline';
import QuickActions from '../components/dashboard/QuickActions';
import AppointmentsSection from '../components/dashboard/AppointmentsSection';
import PatientsSection from '../components/dashboard/PatientsSection';
import DashboardModals from '../components/dashboard/DashboardModals';
import ToolsSidebar from '../components/ToolsSidebar';

import "./DashboardPage.css";

function DashboardPage() {
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const logic = useDashboardLogic();

    // Fecha formateada para usar en el diseño
    const currentDate = new Date().toLocaleDateString('es-EC', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    // Capitalizar primera letra de la fecha
    const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

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

            {/* --- SECCIÓN DESKTOP: HEADER DE ACCIONES RÁPIDAS --- */}
            {/* Esto llena el espacio vacío arriba de los botones negros */}
            <div className="hidden lg:flex justify-between items-end mb-4 mt-2 fade-in-up">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        Gestión Administrativa
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Accesos directos a herramientas frecuentes
                    </p>
                </div>

                {/* La fecha ahora vive aquí como un badge elegante */}
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {formattedDate}
                </div>
            </div>

            {/* Quick Actions - SOLO DESKTOP */}
            <div className="hidden lg:block mb-8">
                <QuickActions
                    onOpenPatientForm={logic.openPatientForm}
                    onOpenIMC={() => logic.setShowBMIModal(true)}
                    onOpenStats={() => logic.setShowStatsModal(true)}
                    onOpenDiet={() => logic.setShowDietModal(true)}
                    onOpenHerramientasAvanzadas={() => logic.setShowHerramientasAvanzadas(true)}
                />
            </div>

            {/* KPIs Modernos + BOTÓN DE MENÚ MÓVIL (Integrado por prop) */}
            <DashboardKPIsModern
                metrics={logic.metrics}
                visitStats={logic.visitStats}
                appointmentStats={logic.appointmentStats}
                onOpenMenu={() => setIsToolsOpen(true)} // <--- Pasamos la función aquí
            />

            {/* Gráficas y Timeline */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2">
                    <TrendChart appointments={logic.filteredAppointments} />
                </div>
                <div className="lg:col-span-1">
                    <UpcomingTimeline
                        appointments={logic.filteredAppointments}
                        formatDate={logic.formatDate}
                    />
                </div>
            </div>

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

            <div style={{ display: 'none' }}>
                <div ref={logic.printRef}></div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default DashboardPage;