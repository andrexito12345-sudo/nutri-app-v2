import React, { useRef, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";



import { useDashboardLogic } from '../hooks/useDashboardLogic';
import DashboardKPIsModern from '../components/dashboard/DashboardKPIsModern';
import TrendChart from '../components/dashboard/TrendChart';
import UpcomingTimeline from '../components/dashboard/UpcomingTimeline';
//import QuickActions from '../components/dashboard/QuickActions';
import AppointmentsSection from '../components/dashboard/AppointmentsSection';
import PatientsSection from '../components/dashboard/PatientsSection';
import DashboardModals from '../components/dashboard/DashboardModals';
import ToolsSidebar from '../components/ToolsSidebar';

import DietGeneratorWeekly from "../components/DietGeneratorWeekly.jsx";

import "./DashboardPage.css";
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import ConfirmCreationModal from '../components/modals/ConfirmCreationModal';

// 👇 IMPORTAR LEADS
import LeadsSection from '../components/dashboard/LeadsSection';
import ConfirmDeleteLeadModal from '../components/modals/ConfirmDeleteLeadModal';

function DashboardPage() {
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const logic = useDashboardLogic();

    const navigate = useNavigate();


    // Refs para “navegación” por secciones (sin depender de rutas)
    const topRef = useRef(null);
    const appointmentsRef = useRef(null);
    const patientsRef = useRef(null);

    const scrollToRef = (ref) => {
        if (!ref?.current) return;
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Fecha formateada para usar en el diseño
    const currentDate = new Date().toLocaleDateString('es-EC', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
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
        <div className="dash dash-shell" ref={topRef}>

            {/* =============== SIDEBAR (DESKTOP) =============== */}
            <aside className="dash-sidebar">
                <div className="dash-sidebar-inner">
                    <div className="dash-brand">
                        <div className="dash-brand-mark" aria-hidden="true" />
                        <div className="dash-brand-text">
                            <div className="dash-brand-title">Dashboard</div>
                            <div className="dash-brand-subtitle">Daniela Vaca Nutrición</div>
                        </div>
                    </div>

                    <nav className="dash-nav">
                        <button className="dash-nav-item is-active" onClick={() => scrollToRef(topRef)}>
                            Panel
                        </button>

                        <button className="dash-nav-item" onClick={() => scrollToRef(appointmentsRef)}>
                            Citas
                        </button>

                        <button className="dash-nav-item" onClick={() => scrollToRef(patientsRef)}>
                            Pacientes
                        </button>

                        <button className="dash-nav-item" onClick={logic.openPatientForm}>
                            Nuevo paciente
                        </button>

                        <button className="dash-nav-item" onClick={() => navigate("/doctora/dietas-ia")}>
                            Generador IA
                        </button>


                        <button className="dash-nav-item" onClick={() => logic.setShowStatsModal(true)}>
                            Estadísticas
                        </button>

                        <button className="dash-nav-item" onClick={() => logic.setShowBMIModal(true)}>
                            IMC
                        </button>

                        <button className="dash-nav-item" onClick={() => logic.setShowHerramientasAvanzadas(true)}>
                            Herramientas avanzadas
                        </button>
                    </nav>

                    <div className="dash-sidebar-footer">
                        <div className="dash-date-label">Hoy</div>
                        <div className="dash-date-value">{formattedDate}</div>

                        <button
                            className="dash-sidebar-softbtn"
                            onClick={() => setIsToolsOpen(true)}
                        >
                            Abrir herramientas (móvil)
                        </button>
                    </div>
                </div>
            </aside>

            {/* =============== MAIN CONTENT =============== */}
            <main className="dash-main">
                {/* Header superior (tipo “top bar”) */}
                <div className="dash-topbar">
                    <div className="dash-topbar-left">
                        <h1 className="dash-title">Reportes</h1>
                        <p className="dash-subtitle">{formattedDate}</p>
                    </div>

                    {/* Quick Actions - SOLO DESKTOP
                    <div className="dash-topbar-right hidden lg:block">
                        <QuickActions
                            onOpenPatientForm={logic.openPatientForm}
                            onOpenIMC={() => logic.setShowBMIModal(true)}
                            onOpenStats={() => logic.setShowStatsModal(true)}
                            onOpenDiet={() => logic.setShowDietModal(true)}
                            onOpenHerramientasAvanzadas={() => logic.setShowHerramientasAvanzadas(true)}
                        />
                    </div>
                    */}
                </div>

                {/* KPIs Modernos + BOTÓN DE MENÚ MÓVIL (Integrado por prop) */}
                <DashboardKPIsModern
                    metrics={logic.metrics}
                    visitStats={logic.visitStats}
                    appointmentStats={logic.appointmentStats}
                    onOpenMenu={() => setIsToolsOpen(true)}
                />

                {/* Barra de filtros arriba (estilo del ejemplo)
                <div className="dash-filters">
                    <div className="dash-filter">
                        <label className="dash-filter-label">Buscar</label>
                        <input
                            className="dash-filter-input"
                            value={logic.search}
                            onChange={(e) => logic.setSearch(e.target.value)}
                            placeholder="Paciente, motivo, etc."
                        />
                    </div>

                    <div className="dash-filter">
                        <label className="dash-filter-label">Estado</label>
                        <select
                            className="dash-filter-input"
                            value={logic.statusFilter}
                            onChange={(e) => logic.setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                        </select>
                    </div>

                    <div className="dash-filter">
                        <label className="dash-filter-label">Fecha</label>
                        <input
                            className="dash-filter-input"
                            type="date"
                            value={logic.dateFilter || ""}
                            onChange={(e) => logic.setDateFilter(e.target.value)}
                        />
                    </div>
                </div>*/}

                {/* Gráficas y Timeline (como el ejemplo: tarjeta grande + tarjeta lateral) */}
                <div className="dash-grid hidden md:grid">
                    <div className="dash-card-span-2">
                        <TrendChart appointments={logic.filteredAppointments} />
                    </div>
                    <div className="dash-card-span-1">
                        <UpcomingTimeline
                            appointments={logic.filteredAppointments}
                            formatDate={logic.formatDate}
                        />
                    </div>
                </div>

                {/* LEADS (opcional) — lo dejo listo para que no quede import sin uso */}
                {Array.isArray(logic.leads) && logic.leads.length > 0 && (
                    <div className="dash-section">
                        <LeadsSection leads={logic.leads} onDelete={logic.deleteLead} />
                    </div>
                )}

                {/* Sección de Citas */}
                <section className="dash-section" ref={appointmentsRef}>
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
                        deleteAppointment={logic.deleteAppointment}
                        navigate={logic.navigate}
                        handleCreatePatientFromAppointment={logic.handleCreatePatientFromAppointment}
                    />
                </section>

                {/* Sección de Pacientes */}
                <section className="dash-section" ref={patientsRef}>
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
                </section>
            </main>

            {/* Menú Lateral de Herramientas (móvil) */}
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

            {/* Modal: eliminar cita */}
            <ConfirmDeleteModal
                isOpen={!!logic.appointmentToDelete}
                onClose={() => logic.setAppointmentToDelete(null)}
                onConfirm={logic.confirmDeleteAppointment}
            />

            {/* Modal: eliminar paciente */}
            <ConfirmDeleteModal
                isOpen={!!logic.patientToDelete}
                onClose={() => logic.setPatientToDelete(null)}
                onConfirm={logic.confirmDeletePatient}
                title="¿Eliminar Paciente?"
                message={
                    <>
                        Estás a punto de eliminar a <span className="font-bold text-slate-800">{logic.patientToDelete?.name}</span>.<br />
                        Esto borrará <span className="text-red-500 font-bold">todo su historial clínico y citas.</span>
                    </>
                }
            />

            {/* Modal: crear paciente desde cita */}
            <ConfirmCreationModal
                isOpen={!!logic.appointmentToConvert}
                onClose={() => logic.setAppointmentToConvert(null)}
                onConfirm={logic.confirmCreatePatient}
                patientName={logic.appointmentToConvert?.patient_name}
            />

            {/* Modal: eliminar lead */}
            <ConfirmDeleteLeadModal
                isOpen={!!logic.leadToDelete}
                onClose={() => logic.setLeadToDelete(null)}
                onConfirm={logic.confirmDeleteLead}
            />

            <ToastContainer />
        </div>
    );
}

export default DashboardPage;
