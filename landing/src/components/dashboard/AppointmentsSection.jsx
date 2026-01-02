import React from 'react';
import { motion } from 'framer-motion';

const AppointmentsSection = ({
                                 appointments,
                                 metrics,
                                 filters,
                                 setSearch,
                                 setStatusFilter,
                                 setDateFilter,
                                 formatDate,
                                 changeStatus,
                                 navigate,
                                 handleCreatePatientFromAppointment
                             }) => {

    // Función para generar gradiente único basado en el nombre
    const getAvatarGradient = (name) => {
        const gradients = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-emerald-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-purple-500',
            'from-rose-500 to-pink-500',
            'from-amber-500 to-orange-500',
            'from-lime-500 to-green-500',
        ];

        const index = name.charCodeAt(0) % gradients.length;
        return gradients[index];
    };

    return (
        <div className="appointments-modern-section">
            {/* Header */}
            <div className="appointments-header">
                <div>
                    <h2 className="appointments-title">
                        Gestión de Citas
                        {metrics.pending > 0 && (
                            <span className="badge-new">
                                {metrics.pending} NUEVA{metrics.pending > 1 ? 'S' : ''}
                            </span>
                        )}
                    </h2>
                    <p className="appointments-subtitle">Administra y da seguimiento a las citas</p>
                </div>

            </div>

            {/* Filters */}
            <div className="appointments-filters">
                <div className="filter-search">
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={filters.search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input-modern"
                    />
                </div>

                <select
                    value={filters.status}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select-modern"
                >
                    <option value="todas">📋 Todos los estados</option>
                    <option value="pendiente">⏱️ Pendientes</option>
                    <option value="realizada">✅ Completadas</option>
                    <option value="cancelada">❌ Canceladas</option>
                </select>

                <select
                    value={filters.date}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select-modern"
                >
                    <option value="todos">📅 Todas las fechas</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mes</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container-modern">
                <table className="table-modern">
                    <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Contacto</th>
                        <th>Motivo</th>
                        <th>Fecha y Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="empty-state">
                                <div className="empty-content">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="empty-text">No hay citas registradas</p>
                                    <p className="empty-subtext">Las nuevas citas aparecerán aquí</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appointment, index) => (
                            <motion.tr
                                key={appointment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`table-row-modern ${appointment.status === 'pendiente' ? 'row-pending-modern' : ''}`}
                            >
                                {/* Paciente */}
                                <td>
                                    <div className="patient-info">
                                        <div className={`avatar-gradient bg-gradient-to-br ${getAvatarGradient(appointment.patient_name)}`}>
                                            {appointment.patient_name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="patient-name">{appointment.patient_name}</span>
                                    </div>
                                </td>

                                {/* Contacto */}
                                <td>
                                    <div className="contact-info">
                                        <span className="contact-email">{appointment.patient_email || "—"}</span>
                                        <span className="contact-phone">{appointment.patient_phone}</span>
                                    </div>
                                </td>

                                {/* Motivo */}
                                <td>
                                        <span className="appointment-reason" title={appointment.reason}>
                                            {appointment.reason || "—"}
                                        </span>
                                </td>

                                {/* Fecha */}
                                <td>
                                    <div className="datetime-info">
                                        <span className="date-text">{formatDate(appointment.appointment_datetime)}</span>
                                        <span className="time-text">
                                                {new Date(appointment.appointment_datetime).toLocaleTimeString('es-EC', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                    </div>
                                </td>

                                {/* Estado */}
                                <td>
                                        <span className={`status-badge status-${appointment.status}`}>
                                            {appointment.status === 'pendiente' && (
                                                <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {appointment.status === 'realizada' && (
                                                <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {appointment.status === 'cancelada' && (
                                                <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            {appointment.status}
                                        </span>
                                </td>

                                {/* Acciones */}
                                <td>
                                    <div className="action-buttons-modern">
                                        <button
                                            onClick={() => changeStatus(appointment.id, "pendiente")}
                                            disabled={appointment.status === "pendiente"}
                                            className="action-btn-modern btn-pending"
                                            title="Marcar como Pendiente"
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => {
                                                const finalPatientId = appointment.linked_patient_id || appointment.patient_id;
                                                if (finalPatientId) {
                                                    navigate(`/consulta/nueva/${appointment.id}/${finalPatientId}`);
                                                } else {
                                                    handleCreatePatientFromAppointment(appointment);
                                                }
                                            }}
                                            className="action-btn-modern btn-complete"
                                            title={appointment.linked_patient_id ? "Realizar Consulta" : "Crear Paciente"}
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => changeStatus(appointment.id, "cancelada")}
                                            disabled={appointment.status === "cancelada"}
                                            className="action-btn-modern btn-cancel"
                                            title="Cancelar Cita"
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentsSection;