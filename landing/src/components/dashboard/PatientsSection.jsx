import React from 'react';
import { motion } from 'framer-motion';

const PatientsSection = ({
                             patients,
                             loading,
                             search,
                             setSearch,
                             openPatientForm,
                             formatDate,
                             viewPatientRecord,
                             printLatestConsultation,
                             editPatient,
                             deletePatient
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

    // Función para obtener color y categoría del IMC
    const getIMCInfo = (imc) => {
        if (!imc) return { color: '#94a3b8', category: 'Sin datos', gradient: 'from-neutral-400 to-neutral-500' };

        if (imc < 18.5) return {
            color: '#3b82f6',
            category: 'Bajo peso',
            gradient: 'from-blue-400 to-blue-500'
        };
        if (imc < 25) return {
            color: '#10b981',
            category: 'Normal',
            gradient: 'from-emerald-400 to-emerald-500'
        };
        if (imc < 30) return {
            color: '#f59e0b',
            category: 'Sobrepeso',
            gradient: 'from-amber-400 to-amber-500'
        };
        return {
            color: '#ef4444',
            category: 'Obesidad',
            gradient: 'from-red-400 to-red-500'
        };
    };

    return (
        <div className="patients-modern-section">
            {/* Header */}
            <div className="patients-header">
                <div>
                    <h2 className="patients-title">
                        Gestión de Pacientes
                    </h2>
                    <p className="patients-subtitle">Historial clínico y seguimiento</p>
                </div>
                <div className="patients-actions">
                    <div className="patients-count">
                        <span className="count-number">{patients.length}</span>
                        <span className="count-label">Total</span>
                    </div>
                    <button onClick={openPatientForm} className="btn-new-patient-modern">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Paciente
                    </button>
                </div>
            </div>

            {/* Search Filter */}
            <div className="patients-filters">
                <div className="filter-search">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input-modern"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="table-container-modern">
                <table className="table-modern">
                    <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Contacto</th>
                        <th>Última Consulta</th>
                        <th>Consultas</th>
                        <th>Peso Actual</th>
                        <th>IMC</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="empty-state">
                                <div className="empty-content">
                                    <div className="dash-spinner"></div>
                                    <p className="empty-text">Cargando pacientes...</p>
                                </div>
                            </td>
                        </tr>
                    ) : patients.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="empty-state">
                                <div className="empty-content">
                                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="empty-text">No hay pacientes registrados</p>
                                    <p className="empty-subtext">Agrega tu primer paciente para comenzar</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        patients.map((patient, index) => {
                            const imcInfo = getIMCInfo(patient.current_bmi);

                            return (
                                <motion.tr
                                    key={patient.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="table-row-modern"
                                >
                                    {/* Paciente */}
                                    <td>
                                        <div className="patient-info">
                                            <div className={`avatar-gradient bg-gradient-to-br ${getAvatarGradient(patient.full_name)}`}>
                                                {patient.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="patient-name">{patient.full_name}</span>
                                        </div>
                                    </td>

                                    {/* Contacto */}
                                    <td>
                                        <div className="contact-info">
                                            <span className="contact-email">{patient.email || "—"}</span>
                                            <span className="contact-phone">{patient.phone}</span>
                                        </div>
                                    </td>

                                    {/* Última Consulta */}
                                    <td>
                                            <span className="last-consultation">
                                                {patient.last_consultation ? formatDate(patient.last_consultation) : "Sin consultas"}
                                            </span>
                                    </td>

                                    {/* Total Consultas */}
                                    <td>
                                            <span className="consultation-badge">
                                                {patient.total_consultations || 0}
                                            </span>
                                    </td>

                                    {/* Peso Actual */}
                                    <td>
                                            <span className="weight-value">
                                                {patient.current_weight ? `${patient.current_weight} kg` : "—"}
                                            </span>
                                    </td>

                                    {/* IMC */}
                                    <td>
                                        {patient.current_bmi ? (
                                            <div className="imc-container">
                                                    <span className={`imc-value bg-gradient-to-r ${imcInfo.gradient}`}>
                                                        {patient.current_bmi.toFixed(1)}
                                                    </span>
                                                <span className="imc-category" style={{ color: imcInfo.color }}>
                                                        {imcInfo.category}
                                                    </span>
                                            </div>
                                        ) : (
                                            <span className="imc-empty">—</span>
                                        )}
                                    </td>

                                    {/* Acciones */}
                                    <td>
                                        <div className="action-buttons-modern">
                                            <button
                                                onClick={() => viewPatientRecord(patient)}
                                                className="action-btn-modern btn-view"
                                                title="Ver Expediente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => printLatestConsultation(patient)}
                                                className="action-btn-modern btn-print"
                                                title="Imprimir Última Consulta"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => editPatient(patient)}
                                                className="action-btn-modern btn-edit"
                                                title="Editar Paciente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => deletePatient(patient.id, patient.full_name)}
                                                className="action-btn-modern btn-delete"
                                                title="Eliminar Paciente"
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsSection;