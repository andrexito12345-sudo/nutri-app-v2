import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PatientFileModal.css';
import NutritionalTools from './NutritionalTools';

const PatientFileModal = ({ isOpen, onClose, patient, consultations = [], weightHistory = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ficha');
    const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
    const [calculationHistory, setCalculationHistory] = useState([]);


    useEffect(() => {
        if (activeTab === 'herramientas' && patient?.id) {
            try {
                const saved = localStorage.getItem(`calc_history_${patient.id}`);
                if (saved) {
                    setCalculationHistory(JSON.parse(saved));
                } else {
                    setCalculationHistory([]);
                }
            } catch (error) {
                console.error("Error cargando historial:", error);
                setCalculationHistory([]);
            }
        }
    }, [activeTab, patient]);

    const handleSaveCalculation = (calculationData) => {
        const newCalculation = {
            id: Date.now(),
            patientId: patient.id,
            date: calculationData.date,
            bmr: calculationData.bmr,
            tdee: calculationData.tdee,
            targetCalories: calculationData.targetCalories,
            macros: calculationData.macros,
            config: calculationData.config,
            patientWeight: calculationData.patientWeight,
            patientHeight: calculationData.patientHeight,
            patientAge: calculationData.patientAge
        };

        const updatedHistory = [newCalculation, ...calculationHistory];
        setCalculationHistory(updatedHistory);
        localStorage.setItem(`calc_history_${patient.id}`, JSON.stringify(updatedHistory));
        alert("✅ Cálculo guardado en el historial del paciente");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return "—";
        return `${new Date().getFullYear() - new Date(birthDate).getFullYear()} años`;
    };

    const getLatestMetrics = () => {
        if (!consultations || consultations.length === 0) return { weight: '', height: '' };
        const latestWithData = consultations.find(c => c.weight > 0 && c.height > 0);
        if (latestWithData) {
            return { weight: latestWithData.weight, height: latestWithData.height };
        }
        return { weight: '', height: '' };
    };

    const latestMetrics = getLatestMetrics();
    const toolData = {
        ...patient,
        weight: latestMetrics.weight,
        height: latestMetrics.height
    };

    const DataItem = ({ label, value, suffix = '' }) => {
        if (!value) return null;
        return (
            <div className="data-item-inline">
                <span className="data-label-inline">{label}</span>
                <span className="data-value-inline">{value}{suffix}</span>
            </div>
        );
    };

    const ConsultationCard = ({ consultation, formatDate, navigate }) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <article className="consultation-card-premium">
                {/* HEADER CLICKEABLE */}
                <div
                    className="consultation-header-premium"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="consultation-header-left">
                        {/* ICONO COLLAPSE */}
                        <div className={`collapse-icon ${isExpanded ? 'is-expanded' : ''}`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* FECHA Y QUICK INFO */}
                        <div className="consultation-info">
                            <div className="consultation-date-info">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="date-text">{formatDate(consultation.consultation_date)}</span>
                            </div>

                            {consultation.weight && (
                                <div className="quick-metrics">
                                <span className="metric-badge metric-badge--weight">
                                    {consultation.weight} kg
                                </span>
                                    {consultation.bmi && (
                                        <span className="metric-badge metric-badge--bmi">
                                        IMC {consultation.bmi}
                                    </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTÓN EDITAR */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/consulta/editar/${consultation.id}`);
                        }}
                        className="btn-edit-consultation"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>
                </div>

                {/* CONTENIDO COLAPSABLE - SOAP */}
                {isExpanded && (
                    <div className="consultation-body-premium">
                        <div className="soap-sections-premium">

                            {/* S: SUBJETIVO */}
                            <div className="soap-card soap-card--subjective">
                                <div className="soap-card-header">
                                    <div className="soap-badge soap-badge--blue">S</div>
                                    <h5 className="soap-card-title">Subjetivo</h5>
                                </div>
                                <div className="soap-card-body">
                                    {consultation.subjective && (
                                        <div className="soap-field-premium">
                                            <span className="field-label-premium">Motivo/Historia</span>
                                            <p className="field-text-premium">{consultation.subjective}</p>
                                        </div>
                                    )}
                                    {consultation.symptoms && (
                                        <div className="soap-field-premium">
                                            <span className="field-label-premium field-label--alert">Síntomas</span>
                                            <p className="field-text-premium">{consultation.symptoms}</p>
                                        </div>
                                    )}
                                    {(consultation.appetite || consultation.sleep_quality || consultation.stress_level ||
                                        consultation.physical_activity || consultation.water_intake || consultation.bowel_habits) && (
                                        <div className="lifestyle-grid">
                                            {consultation.appetite && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Apetito</span>
                                                    <span className="lifestyle-value">{consultation.appetite}</span>
                                                </div>
                                            )}
                                            {consultation.sleep_quality && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Sueño</span>
                                                    <span className="lifestyle-value">{consultation.sleep_quality}</span>
                                                </div>
                                            )}
                                            {consultation.stress_level && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Estrés</span>
                                                    <span className="lifestyle-value">{consultation.stress_level}</span>
                                                </div>
                                            )}
                                            {consultation.physical_activity && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Actividad</span>
                                                    <span className="lifestyle-value">{consultation.physical_activity}</span>
                                                </div>
                                            )}
                                            {consultation.water_intake && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Agua</span>
                                                    <span className="lifestyle-value">{consultation.water_intake}</span>
                                                </div>
                                            )}
                                            {consultation.bowel_habits && (
                                                <div className="lifestyle-item">
                                                    <span className="lifestyle-label">Intestino</span>
                                                    <span className="lifestyle-value">{consultation.bowel_habits}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* O: OBJETIVO */}
                            <div className="soap-card soap-card--objective">
                                <div className="soap-card-header">
                                    <div className="soap-badge soap-badge--orange">O</div>
                                    <h5 className="soap-card-title">Objetivo</h5>
                                </div>
                                <div className="soap-card-body">
                                    {(consultation.weight || consultation.height || consultation.bmi) && (
                                        <div className="measurements-section">
                                            <span className="measurements-title">Antropometría</span>
                                            <div className="measurements-grid-premium">
                                                {consultation.weight && (
                                                    <div className="measurement-pill">
                                                        <span>Peso</span>
                                                        <strong>{consultation.weight} kg</strong>
                                                    </div>
                                                )}
                                                {consultation.height && (
                                                    <div className="measurement-pill">
                                                        <span>Talla</span>
                                                        <strong>{consultation.height} cm</strong>
                                                    </div>
                                                )}
                                                {consultation.bmi && (
                                                    <div className="measurement-pill">
                                                        <span>IMC</span>
                                                        <strong>{consultation.bmi}</strong>
                                                    </div>
                                                )}
                                                {consultation.waist && (
                                                    <div className="measurement-pill">
                                                        <span>Cintura</span>
                                                        <strong>{consultation.waist} cm</strong>
                                                    </div>
                                                )}
                                                {consultation.hip && (
                                                    <div className="measurement-pill">
                                                        <span>Cadera</span>
                                                        <strong>{consultation.hip} cm</strong>
                                                    </div>
                                                )}
                                                {consultation.body_fat && (
                                                    <div className="measurement-pill">
                                                        <span>Grasa</span>
                                                        <strong>{consultation.body_fat}%</strong>
                                                    </div>
                                                )}
                                                {consultation.muscle_mass && (
                                                    <div className="measurement-pill">
                                                        <span>Músculo</span>
                                                        <strong>{consultation.muscle_mass} kg</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(consultation.blood_pressure || consultation.glucose || consultation.cholesterol) && (
                                        <div className="measurements-section">
                                            <span className="measurements-title">Clínico / Laboratorio</span>
                                            <div className="measurements-grid-premium">
                                                {consultation.blood_pressure && (
                                                    <div className="measurement-pill">
                                                        <span>PA</span>
                                                        <strong>{consultation.blood_pressure}</strong>
                                                    </div>
                                                )}
                                                {consultation.heart_rate && (
                                                    <div className="measurement-pill">
                                                        <span>FC</span>
                                                        <strong>{consultation.heart_rate} lpm</strong>
                                                    </div>
                                                )}
                                                {consultation.temperature && (
                                                    <div className="measurement-pill">
                                                        <span>Temp</span>
                                                        <strong>{consultation.temperature}°C</strong>
                                                    </div>
                                                )}
                                                {consultation.glucose && (
                                                    <div className="measurement-pill">
                                                        <span>Glucosa</span>
                                                        <strong>{consultation.glucose} mg/dL</strong>
                                                    </div>
                                                )}
                                                {consultation.hba1c && (
                                                    <div className="measurement-pill">
                                                        <span>HbA1c</span>
                                                        <strong>{consultation.hba1c}%</strong>
                                                    </div>
                                                )}
                                                {consultation.cholesterol && (
                                                    <div className="measurement-pill">
                                                        <span>Colest.</span>
                                                        <strong>{consultation.cholesterol}</strong>
                                                    </div>
                                                )}
                                                {consultation.triglycerides && (
                                                    <div className="measurement-pill">
                                                        <span>Triglic.</span>
                                                        <strong>{consultation.triglycerides}</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {consultation.objective_notes && (
                                        <p className="field-notes-premium">"{consultation.objective_notes}"</p>
                                    )}
                                </div>
                            </div>

                            {/* A: ANÁLISIS */}
                            <div className="soap-card soap-card--assessment">
                                <div className="soap-card-header">
                                    <div className="soap-badge soap-badge--purple">A</div>
                                    <h5 className="soap-card-title">Análisis</h5>
                                </div>
                                <div className="soap-card-body">
                                    {consultation.pes_problem && (
                                        <div className="pes-diagnosis-premium">
                                            <div className="pes-item-premium"><strong>P:</strong> {consultation.pes_problem}</div>
                                            {consultation.pes_etiology && (
                                                <div className="pes-item-premium"><strong>E:</strong> {consultation.pes_etiology}</div>
                                            )}
                                            {consultation.pes_signs && (
                                                <div className="pes-item-premium"><strong>S:</strong> {consultation.pes_signs}</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="clinical-badges">
                                        {consultation.nutritional_status && (
                                            <span className="clinical-badge">Estado: {consultation.nutritional_status}</span>
                                        )}
                                        {consultation.risk_level && (
                                            <span className="clinical-badge">Riesgo: {consultation.risk_level}</span>
                                        )}
                                        {consultation.priority && (
                                            <span className="clinical-badge">Prioridad: {consultation.priority}</span>
                                        )}
                                    </div>
                                    {consultation.assessment_notes && (
                                        <p className="field-notes-premium">{consultation.assessment_notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* P: PLAN */}
                            <div className="soap-card soap-card--plan">
                                <div className="soap-card-header">
                                    <div className="soap-badge soap-badge--green">P</div>
                                    <h5 className="soap-card-title">Plan</h5>
                                </div>
                                <div className="soap-card-body">
                                    {consultation.treatment_goals && (
                                        <div className="soap-field-premium">
                                            <span className="field-label-premium">Metas de Tratamiento</span>
                                            <p className="field-text-premium">{consultation.treatment_goals}</p>
                                        </div>
                                    )}
                                    {consultation.calories_prescribed && (
                                        <div className="prescription-premium">
                                            <span className="prescription-title">Prescripción Nutricional</span>
                                            <div className="prescription-grid-premium">
                                                <div className="prescription-pill">
                                                    <span>Calorías</span>
                                                    <strong>{consultation.calories_prescribed} kcal</strong>
                                                </div>
                                                {consultation.protein_prescribed && (
                                                    <div className="prescription-pill">
                                                        <span>Proteína</span>
                                                        <strong>{consultation.protein_prescribed}g</strong>
                                                    </div>
                                                )}
                                                {consultation.carbs_prescribed && (
                                                    <div className="prescription-pill">
                                                        <span>Carbos</span>
                                                        <strong>{consultation.carbs_prescribed}g</strong>
                                                    </div>
                                                )}
                                                {consultation.fats_prescribed && (
                                                    <div className="prescription-pill">
                                                        <span>Grasas</span>
                                                        <strong>{consultation.fats_prescribed}g</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {consultation.diet_type && (
                                        <div className="soap-field-premium">
                                            <span className="field-label-premium">Tipo de Dieta</span>
                                            <p className="field-text-premium">{consultation.diet_type}</p>
                                        </div>
                                    )}
                                    {consultation.supplements_recommended && (
                                        <div className="soap-field-premium">
                                            <span className="field-label-premium">Suplementos Recomendados</span>
                                            <p className="field-text-premium">{consultation.supplements_recommended}</p>
                                        </div>
                                    )}
                                    {consultation.next_appointment && (
                                        <div className="next-appointment-premium">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Próxima Cita: <strong>{formatDate(consultation.next_appointment)}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </article>
        );
    };

    const tabStyle = {
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        color: '#64748b',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const activeTabStyle = {
        ...tabStyle,
        color: '#0284c7',
        borderBottom: '3px solid #0284c7'
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>


                <div className="modal-header" style={{borderBottom:'none', paddingBottom:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:'20px', paddingRight:'20px'}}>
                        <div className="modal-patient-info">
                            <div className="patient-avatar patient-avatar--large">
                                {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="patient-header-text">
                                <h2 className="patient-name">{patient.full_name}</h2>
                                <p className="patient-contact">{patient.phone} {patient.email && `• ${patient.email}`}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="patient-modal-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                    </div>
                    <div className="patient-tabs-wrapper">
                        {/* --- VISTA ESCRITORIO: tabs horizontales --- */}
                        <div className="patient-tabs-bar">
                            <button
                                className={
                                    "patient-tab" + (activeTab === "ficha" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("ficha");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ficha
                            </button>

                            <button
                                className={
                                    "patient-tab" + (activeTab === "evolucion" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("evolucion");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Evolución
                            </button>

                            <button
                                className={
                                    "patient-tab" + (activeTab === "historial" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("historial");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Historial
                            </button>

                            <button
                                className={
                                    "patient-tab patient-tab--tools" +
                                    (activeTab === "herramientas" ? " is-active" : "")
                                }
                                onClick={() => {
                                    setActiveTab("herramientas");
                                    setTabsMenuOpen(false);
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Herramientas
                            </button>
                        </div>

                        {/* --- VISTA MÓVIL: botón + menú desplegable --- */}
                        <div className="patient-tabs-mobile">
                            <button
                                type="button"
                                className="patient-tabs-toggle"
                                onClick={() => setTabsMenuOpen((v) => !v)}
                            >
                                  <span>
                                    {activeTab === "ficha" && "Ficha"}
                                      {activeTab === "evolucion" && "Evolución"}
                                      {activeTab === "historial" && "Historial"}
                                      {activeTab === "herramientas" && "Herramientas"}
                                  </span>
                                <span className="patient-tabs-toggle-icon">
                                {tabsMenuOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {tabsMenuOpen && (
                                <div className="patient-tabs-dropdown">
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "ficha" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("ficha");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Ficha
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "evolucion" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("evolucion");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Evolución
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "historial" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("historial");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Historial
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            "patient-tabs-dropdown-item" +
                                            (activeTab === "herramientas" ? " is-active" : "")
                                        }
                                        onClick={() => {
                                            setActiveTab("herramientas");
                                            setTabsMenuOpen(false);
                                        }}
                                    >
                                        Herramientas
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>



                </div>

                <div className="modal-body" style={{paddingTop:'20px'}}>
                    {activeTab === 'ficha' && (
                        <section className="expediente-section">
                            <div className="premium-info-grid">

                                {/* PERFIL PERSONAL */}
                                <div className="premium-card">
                                    <div className="premium-card-header">
                                        <div className="premium-header-line"></div>
                                        <h4 className="premium-card-title">PERFIL PERSONAL</h4>
                                        <div className="premium-header-line"></div>
                                    </div>
                                    <div className="premium-card-body">
                                        <div className="premium-data-grid">
                                            <div className="premium-data-item">
                                                <span className="premium-label">Género</span>
                                                <span className="premium-value">{patient.gender || "—"}</span>
                                            </div>
                                            <div className="premium-data-item">
                                                <span className="premium-label">Edad</span>
                                                <span className="premium-value">{calculateAge(patient.birth_date)}</span>
                                            </div>
                                            <div className="premium-data-item">
                                                <span className="premium-label">Nacimiento</span>
                                                <span className="premium-value">{formatDate(patient.birth_date)}</span>
                                            </div>
                                            <div className="premium-data-item">
                                                <span className="premium-label">Ocupación</span>
                                                <span className="premium-value">{patient.occupation || "—"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* INFORMACIÓN MÉDICA */}
                                <div className="premium-card premium-card--medical">
                                    <div className="premium-card-header">
                                        <div className="premium-header-line premium-header-line--red"></div>
                                        <h4 className="premium-card-title">INFORMACIÓN MÉDICA</h4>
                                        <div className="premium-header-line premium-header-line--red"></div>
                                    </div>
                                    <div className="premium-card-body">
                                        <div className="premium-data-grid">
                                            <div className="premium-data-item">
                                                <span className="premium-label">Tipo de Sangre</span>
                                                <span className="premium-value premium-value--highlight">{patient.blood_type || "—"}</span>
                                            </div>
                                            <div className="premium-data-item premium-data-item--full">
                                                <span className="premium-label">Alergias</span>
                                                <span className={`premium-value ${patient.allergies ? 'premium-value--alert' : ''}`}>
                                {patient.allergies || "Ninguna registrada"}
                            </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CONTACTO */}
                                <div className="premium-card premium-card--contact">
                                    <div className="premium-card-header">
                                        <div className="premium-header-line premium-header-line--blue"></div>
                                        <h4 className="premium-card-title">CONTACTO</h4>
                                        <div className="premium-header-line premium-header-line--blue"></div>
                                    </div>
                                    <div className="premium-card-body">
                                        <div className="premium-data-grid">
                                            <div className="premium-data-item premium-data-item--full">
                                                <span className="premium-label">Dirección</span>
                                                <span className="premium-value">{patient.address || "—"}</span>
                                            </div>
                                            <div className="premium-data-item">
                                                <span className="premium-label">Contacto Emergencia</span>
                                                <span className="premium-value">{patient.emergency_contact || "—"}</span>
                                            </div>
                                            <div className="premium-data-item">
                                                <span className="premium-label">Teléfono Emergencia</span>
                                                <span className="premium-value">{patient.emergency_phone || "—"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NOTAS GENERALES */}
                                {patient.notes && (
                                    <div className="premium-card premium-card--notes premium-card--full">
                                        <div className="premium-card-header">
                                            <div className="premium-header-line premium-header-line--orange"></div>
                                            <h4 className="premium-card-title">NOTAS GENERALES</h4>
                                            <div className="premium-header-line premium-header-line--orange"></div>
                                        </div>
                                        <div className="premium-card-body">
                                            <p className="premium-notes-text">{patient.notes}</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </section>
                    )}

                    {activeTab === 'evolucion' && (
                        <section className="expediente-section">
                            <div className="evolution-premium-container">

                                {/* HEADER CON ESTADÍSTICAS */}
                                <div className="evolution-header">
                                    <div className="evolution-title-section">
                                        <h3 className="evolution-main-title">Evolución Corporal</h3>
                                        <p className="evolution-subtitle">Seguimiento de peso, músculo y composición</p>
                                    </div>

                                    {weightHistory && weightHistory.length > 0 && (
                                        <div className="evolution-stats-grid">
                                            <div className="evolution-stat-card">
                                                <div className="stat-icon stat-icon--purple">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-label">Registros</span>
                                                    <span className="stat-value">{weightHistory.length}</span>
                                                </div>
                                            </div>

                                            <div className="evolution-stat-card">
                                                <div className="stat-icon stat-icon--blue">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                    </svg>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-label">Peso Actual</span>
                                                    <span className="stat-value">{weightHistory[weightHistory.length - 1]?.weight || "—"} kg</span>
                                                </div>
                                            </div>

                                            <div className="evolution-stat-card">
                                                <div className="stat-icon stat-icon--green">
                                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div className="stat-content">
                                                    <span className="stat-label">Cambio Total</span>
                                                    <span className="stat-value stat-value--change">
                                    {weightHistory.length > 1
                                        ? `${(weightHistory[weightHistory.length - 1]?.weight - weightHistory[0]?.weight).toFixed(1)} kg`
                                        : "—"
                                    }
                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* GRÁFICA */}
                                {weightHistory && weightHistory.length > 0 ? (
                                    <div className="evolution-chart-container">
                                        <div className="chart-glass-card">
                                            <div className="chart-header">
                                                <h4 className="chart-title">Progreso en el Tiempo</h4>
                                                <div className="chart-legend-custom">
                                                    <div className="legend-item">
                                                        <span className="legend-dot legend-dot--purple"></span>
                                                        <span className="legend-text">Peso</span>
                                                    </div>
                                                    <div className="legend-item">
                                                        <span className="legend-dot legend-dot--green"></span>
                                                        <span className="legend-text">Músculo</span>
                                                    </div>
                                                    <div className="legend-item">
                                                        <span className="legend-dot legend-dot--orange"></span>
                                                        <span className="legend-text">Grasa %</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="chart-body">
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <ComposedChart data={weightHistory}>
                                                        <defs>
                                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                                                        <XAxis
                                                            dataKey="date"
                                                            stroke="#64748b"
                                                            style={{ fontSize: '0.75rem', fontWeight: '600' }}
                                                            tickFormatter={(val) => formatDate(val).slice(0,6)}
                                                        />
                                                        <YAxis
                                                            yAxisId="left"
                                                            orientation="left"
                                                            stroke="#8b5cf6"
                                                            style={{ fontSize: '0.75rem', fontWeight: '700' }}
                                                            label={{ value: 'Kg', angle: -90, position: 'insideLeft', style: { fill: '#8b5cf6', fontWeight: '700' } }}
                                                        />
                                                        <YAxis
                                                            yAxisId="right"
                                                            orientation="right"
                                                            stroke="#f97316"
                                                            style={{ fontSize: '0.75rem', fontWeight: '700' }}
                                                            label={{ value: '% Grasa', angle: 90, position: 'insideRight', style: { fill: '#f97316', fontWeight: '700' } }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                border: '2px solid #e2e8f0',
                                                                borderRadius: '0.75rem',
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                                backdropFilter: 'blur(10px)'
                                                            }}
                                                            labelStyle={{ fontWeight: '700', color: '#0f172a' }}
                                                        />
                                                        <Legend
                                                            wrapperStyle={{ display: 'none' }}
                                                        />
                                                        <Line
                                                            yAxisId="left"
                                                            type="monotone"
                                                            dataKey="weight"
                                                            name="Peso (kg)"
                                                            stroke="#8b5cf6"
                                                            strokeWidth={3}
                                                            dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                                            activeDot={{ r: 7 }}
                                                            fill="url(#colorWeight)"
                                                        />
                                                        <Line
                                                            yAxisId="left"
                                                            type="monotone"
                                                            dataKey="muscle_mass"
                                                            name="Músculo (kg)"
                                                            stroke="#10b981"
                                                            strokeWidth={2.5}
                                                            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                                            strokeDasharray="5 5"
                                                        />
                                                        <Line
                                                            yAxisId="right"
                                                            type="monotone"
                                                            dataKey="body_fat_percentage"
                                                            name="Grasa (%)"
                                                            stroke="#f97316"
                                                            strokeWidth={2.5}
                                                            dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                                            strokeDasharray="3 3"
                                                        />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="evolution-empty-state">
                                        <div className="empty-icon-circle">
                                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <p className="empty-title">No hay datos suficientes</p>
                                        <p className="empty-description">Registra al menos 2 consultas con mediciones para ver la gráfica de evolución</p>
                                    </div>
                                )}

                            </div>
                        </section>
                    )}

                    {activeTab === 'historial' && (
                        <section className="expediente-section">
                            <div className="history-premium-container">

                                {/* HEADER */}
                                <div className="history-header-premium">
                                    <div className="history-title-section">
                                        <h3 className="history-main-title">Historial Clínico</h3>
                                        <p className="history-subtitle">
                                            <span className="history-count-badge">{consultations?.length || 0}</span>
                                            {consultations?.length === 1 ? 'Consulta registrada' : 'Consultas registradas'}
                                        </p>
                                    </div>
                                    <button
                                        className="btn-new-consultation-premium"
                                        onClick={() => navigate(`/consulta/nueva/${patient.id}`)}
                                    >
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Nueva Consulta
                                    </button>
                                </div>

                                {/* TIMELINE DE CONSULTAS */}
                                {consultations && consultations.length > 0 ? (
                                    <div className="history-timeline-premium">
                                        {consultations.map((consultation, idx) => (
                                            <ConsultationCard
                                                key={consultation.id || idx}
                                                consultation={consultation}
                                                formatDate={formatDate}
                                                navigate={navigate}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="history-empty-state-premium">
                                        <div className="empty-icon-circle-premium">
                                            <svg width="56" height="56" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="empty-title-premium">Sin consultas registradas</h4>
                                        <p className="empty-description-premium">
                                            Comienza el seguimiento clínico creando la primera consulta SOAP
                                        </p>
                                        <button
                                            className="btn-empty-action"
                                            onClick={() => navigate(`/consulta/nueva/${patient.id}`)}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Crear Primera Consulta
                                        </button>
                                    </div>
                                )}

                            </div>
                        </section>
                    )}

                    {activeTab === 'herramientas' && (
                        <div className="herramientas-content">
                            <NutritionalTools
                                patientData={toolData}
                                onCancel={() => setActiveTab('ficha')}
                                onSave={handleSaveCalculation}
                                actionLabel="Guardar en Historial"
                            />

                            <div className="calculation-history-section">
                                <div className="history-header">
                                    <h4 className="history-title">
                                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Historial de Cálculos ({calculationHistory.length})
                                    </h4>
                                </div>

                                {calculationHistory.length === 0 ? (
                                    <div className="history-empty">
                                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No hay cálculos guardados aún</p>
                                        <span>Los cálculos que guardes aparecerán aquí</span>
                                    </div>
                                ) : (
                                    <div className="history-list">
                                        {calculationHistory.map((calc) => (
                                            <div key={calc.id} className="history-card">
                                                <div className="history-card-header">
                                                    <div className="history-date">
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {formatDateTime(calc.date)}
                                                    </div>
                                                    <div className={`history-badge ${
                                                        calc.config.goal === 'cut' ? 'badge-cut' :
                                                            calc.config.goal === 'bulk' ? 'badge-bulk' : 'badge-maint'
                                                    }`}>
                                                        {calc.config.goal === 'cut' ? 'PÉRDIDA' :
                                                            calc.config.goal === 'bulk' ? 'GANANCIA' : 'MANT.'}
                                                    </div>
                                                </div>

                                                <div className="history-card-body">
                                                    <div className="history-metrics">
                                                        <div className="history-metric">
                                                            <span className="metric-label">TMB</span>
                                                            <span className="metric-value">{calc.bmr.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                        <div className="history-metric">
                                                            <span className="metric-label">GET</span>
                                                            <span className="metric-value">{calc.tdee.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                        <div className="history-metric highlight">
                                                            <span className="metric-label">Meta</span>
                                                            <span className="metric-value">{calc.targetCalories.toLocaleString('es-EC')} kcal</span>
                                                        </div>
                                                    </div>

                                                    <div className="history-macros">
                                                        <span className="macro-protein">P: {calc.macros.protein.grams}g ({calc.macros.protein.percent}%)</span>
                                                        <span className="macro-carbs">C: {calc.macros.carbs.grams}g ({calc.macros.carbs.percent}%)</span>
                                                        <span className="macro-fats">G: {calc.macros.fats.grams}g ({calc.macros.fats.percent}%)</span>
                                                    </div>

                                                    <div className="history-config">
                                                        <span>{calc.config.formula === 'mifflin' ? 'Mifflin-St Jeor' : 'Harris-Benedict'}</span>
                                                        <span>•</span>
                                                        <span>{calc.patientWeight}kg / {calc.patientHeight}cm</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientFileModal;