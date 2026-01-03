import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit } from 'lucide-react';
import './SoapConsultation.css';
import api from '../services/api';
import { toast } from 'react-toastify';
// 1. IMPORTAMOS EL COMPONENTE DE HERRAMIENTAS
import NutritionalTools from '../components/NutritionalTools';
// IMPORTAMOS EL NUEVO GENERADOR SEMANAL
import DietGeneratorWeekly from '../components/DietGeneratorWeekly';

const SoapConsultation = () => {
    const { appointmentId, patientId, consultationId } = useParams();
    const isEditing = !!consultationId; // Variable mágica: true si editamos, false si creamos
    const navigate = useNavigate();

    // Estado para mostrar el modal de herramientas
    const [showTools, setShowTools] = useState(false);
    // Estado para abrir el Generador de Dieta
    const [showDietGenerator, setShowDietGenerator] = useState(false);
    // Estado para guardar los datos básicos del paciente
    const [patient, setPatient] = useState(null);

    // 👇 ESTADOS PARA LA IA
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiMenuData, setAiMenuData] = useState(null); // Aquí guardaremos lo que responda Gemini

    // Estado del formulario completo
    const [formData, setFormData] = useState({
        // ===== SUBJETIVO =====
        subjective: '',
        symptoms: '',
        appetite: '',
        sleep_quality: '',
        stress_level: '',
        physical_activity: '',
        water_intake: '',
        bowel_habits: '',

        // ===== OBJETIVO - Antropometría =====
        weight: '',
        height: '',
        bmi: '',
        waist: '',
        hip: '',
        waist_hip_ratio: '',
        body_fat: '',
        muscle_mass: '',
        ideal_weight: '',

        // ===== OBJETIVO - Signos Vitales =====
        blood_pressure: '',
        heart_rate: '',
        temperature: '',

        // ===== OBJETIVO - Bioquímicos =====
        glucose: '',
        hba1c: '',
        cholesterol: '',
        triglycerides: '',
        hdl: '',
        ldl: '',
        hemoglobin: '',
        albumin: '',
        objective_notes: '',

        // ===== ANÁLISIS - PES =====
        pes_problem: '',
        pes_etiology: '',
        pes_signs: '',
        assessment_notes: '',
        nutritional_status: '',
        risk_level: '',
        priority: '',

        // ===== PLAN =====
        treatment_goals: '',
        calories_prescribed: '',
        protein_prescribed: '',
        carbs_prescribed: '',
        fats_prescribed: '',
        diet_type: '',
        supplements_recommended: '',
        education_provided: '',
        referrals: '',
        next_appointment: ''
    });

    // 👇 CORRECCIÓN: FUNCIÓN ACTUALIZADA PARA LEER LA SEMANA COMPLETA
    const handleSaveDietFromGenerator = (data) => {
        // data trae: { weeklyDiet, targetCalories, averageKcal }
        console.log("💾 Guardando semana completa:", data);

        let planSummary = `PLAN NUTRICIONAL SEMANAL (${data.targetCalories} kcal/día aprox):\n`;

        const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        const mealLabels = { BREAKFAST: 'Desayuno', MID_MORNING: 'Media Mañana', LUNCH: 'Almuerzo', SNACK: 'Media Tarde', DINNER: 'Cena' };

        // Recorremos cada día de la semana
        days.forEach(day => {
            const dayDiet = data.weeklyDiet[day];
            // Verificamos si el día tiene alguna comida guardada
            const hasFood = Object.values(dayDiet).some(arr => arr.length > 0);

            if (hasFood) {
                planSummary += `\n=== ${day.toUpperCase()} ===\n`;

                Object.entries(dayDiet).forEach(([mealKey, items]) => {
                    if (items.length > 0) {
                        planSummary += `  * ${mealLabels[mealKey] || mealKey}:\n`;
                        items.forEach(item => {
                            planSummary += `    - ${item.alimento} (${item.cantidad}g)\n`;
                        });
                    }
                });
            }
        });

        // ACTUALIZAMOS EL ESTADO DEL FORMULARIO PRINCIPAL
        setFormData(prev => ({
            ...prev,
            calories_prescribed: data.targetCalories, // Actualizamos calorías si cambiaron
            // Guardamos el detalle en "education_provided"
            education_provided: (prev.education_provided || "") + "\n\n" + planSummary
        }));

        setShowDietGenerator(false); // Cerramos el modal
        toast.success("✅ Plan Semanal importado a la consulta");
    };

    // 👇 LA FUNCIÓN QUE LLAMA AL CEREBRO (IA)
    const handleGenerateAIDiet = async () => {
        // Validaciones básicas
        if (!formData.calories_prescribed || formData.calories_prescribed <= 0) {
            return toast.warning("⚠️ Primero define las calorías en la Prescripción Dietética.");
        }

        setGeneratingAI(true);
        try {
            // Preparamos el paquete para el backend
            const payload = {
                patientName: patient?.full_name || "Paciente",
                targetCalories: formData.calories_prescribed,
                macros: {
                    p: formData.protein_prescribed || 0,
                    c: formData.carbs_prescribed || 0,
                    f: formData.fats_prescribed || 0
                },
                // Unimos las notas del PES y las alergias del paciente para las restricciones
                restrictions: `${formData.pes_problem || ''}. ${patient?.allergies || ''}`,
                preferences: formData.diet_type || "Comida ecuatoriana variada y saludable"
            };

            console.log("Enviando a la IA:", payload);

            // Llamada al backend
            const response = await api.post('/diets/generate-ai', payload);

            if (response.data.ok) {
                setAiMenuData(response.data.menu); // Guardamos el menú SEMANAL generado
                setShowDietGenerator(true); // Abrimos el modal
                toast.success("✨ ¡Menú Semanal generado con IA!");
            }

        } catch (error) {
            console.error("Error IA:", error);
            toast.error("Error al generar la dieta. Intenta de nuevo.");
        } finally {
            setGeneratingAI(false);
        }
    };

    // --- CARGAS DE DATOS (NO TOCAR) ---
    useEffect(() => {
        const fetchPatientData = async () => {
            if (patientId) {
                try {
                    const response = await api.get(`/patients/${patientId}`);
                    setPatient(response.data);
                } catch (error) {
                    console.error("Error al cargar datos del paciente:", error);
                }
            }
        };
        fetchPatientData();
    }, [patientId]);

    useEffect(() => {
        const fetchAppointmentData = async () => {
            if (appointmentId && !isEditing) {
                try {
                    const response = await api.get(`/appointments/${appointmentId}`);
                    const appointment = response.data.appointment;
                    if (appointment) {
                        const biometricData = {};
                        if (appointment.patient_weight) biometricData.weight = appointment.patient_weight;
                        if (appointment.patient_height) biometricData.height = appointment.patient_height;
                        if (Object.keys(biometricData).length > 0) {
                            setFormData(prev => ({ ...prev, ...biometricData }));
                            toast.success('📊 Datos biométricos cargados automáticamente');
                        }
                    }
                } catch (error) {
                    console.error("Error al cargar datos de la cita:", error);
                }
            }
        };
        fetchAppointmentData();
    }, [appointmentId, isEditing]);

    useEffect(() => {
        const { weight, height } = formData;
        if (weight && height) {
            const heightInMeters = height / 100;
            const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
            setFormData(prev => ({ ...prev, bmi: calculatedBmi }));
        }
    }, [formData.weight, formData.height]);

    useEffect(() => {
        const { waist, hip } = formData;
        if (waist && hip) {
            const icc = (waist / hip).toFixed(2);
            setFormData(prev => ({ ...prev, waist_hip_ratio: icc }));
        }
    }, [formData.waist, formData.hip]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        if (isEditing) {
            const fetchConsultation = async () => {
                try {
                    const response = await api.get(`/consultations/${consultationId}`);
                    const data = response.data;
                    if (data.next_appointment) data.next_appointment = data.next_appointment.split('T')[0];
                    setFormData(prev => ({ ...prev, ...data }));
                } catch (error) {
                    console.error("Error al cargar:", error);
                }
            };
            fetchConsultation();
        }
    }, [isEditing, consultationId]);

    const handleApplyCalculations = (data) => {
        setFormData(prev => ({
            ...prev,
            calories_prescribed: data.targetCalories,
            protein_prescribed: data.macros.protein.grams,
            carbs_prescribed: data.macros.carbs.grams,
            fats_prescribed: data.macros.fats.grams,
            assessment_notes: (prev.assessment_notes ? prev.assessment_notes + '\n' : '') +
                `[Cálculo Auto]: TMB ${data.bmr} | GET ${data.tdee} | Meta ${data.targetCalories}kcal (${data.config.goal}).`
        }));
        setShowTools(false);
        toast.success("✅ Cálculos aplicados al Plan de Alimentación");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/consultations/${consultationId}`, formData);
                alert('¡Consulta actualizada correctamente!');
            } else {
                const payload = {
                    patient_id: patientId,
                    appointment_id: appointmentId,
                    consultation_date: new Date().toISOString(),
                    ...formData
                };
                await api.post('/consultations', payload);
                alert('¡Consulta creada correctamente!');
            }
            navigate('/doctora/dashboard');
        } catch (error) {
            console.error("Error al guardar:", error);
            const mensaje = error.response?.data?.error || "Error al guardar";
            alert(mensaje);
        }
    };

    return (
        <div className="soap-container">
            <div className="clinical-header-container">
                <div className="clinical-accent-bar"></div>
                <div className="clinical-text-content">
                    <h2 className="clinical-main-title">
                        {isEditing ? 'ACTUALIZACIÓN DE EXPEDIENTE' : 'NOTA DE EVOLUCIÓN NUTRICIONAL'}
                    </h2>
                    <div className="clinical-meta-info">
                        <span className="meta-tag">DEPARTAMENTO DE NUTRICIÓN</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-tag">HISTORIA CLÍNICA (S.O.A.P.)</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="soap-form">
                {/* SECCIÓN S */}
                <div className="soap-section soap-s">
                    <div className="section-header">
                        <span className="section-letter">S</span>
                        <span className="section-title">Subjetivo - Información del Paciente</span>
                    </div>
                    <div className="form-group">
                        <label>Motivo de Consulta / Historia Dietética</label>
                        <textarea name="subjective" placeholder="Motivo de consulta..." value={formData.subjective} onChange={handleChange} rows="3" />
                    </div>
                    <div className="form-group">
                        <label>Síntomas Reportados</label>
                        <textarea name="symptoms" placeholder="Fatiga, dolores..." value={formData.symptoms} onChange={handleChange} rows="2" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Apetito</label>
                            <select name="appetite" value={formData.appetite} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Normal">Normal</option>
                                <option value="Aumentado">Aumentado</option>
                                <option value="Disminuido">Disminuido</option>
                                <option value="Variable">Variable</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Calidad del Sueño</label>
                            <select name="sleep_quality" value={formData.sleep_quality} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Buena (7-9h)">Buena (7-9h)</option>
                                <option value="Regular (5-6h)">Regular (5-6h)</option>
                                <option value="Mala (<5h)">Mala (&lt;5h)</option>
                                <option value="Insomnio">Insomnio</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nivel de Estrés</label>
                            <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Alto">Alto</option>
                                <option value="Muy alto">Muy alto</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Actividad Física</label>
                            <select name="physical_activity" value={formData.physical_activity} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Sedentario">Sedentario</option>
                                <option value="Ligera">Ligera</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Intensa">Intensa</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Consumo de Agua</label>
                            <select name="water_intake" value={formData.water_intake} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="<1 litro/día">&lt;1 litro/día</option>
                                <option value="1-2 litros/día">1-2 litros/día</option>
                                <option value="2-3 litros/día">2-3 litros/día</option>
                                <option value=">3 litros/día">&gt;3 litros/día</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Hábitos Intestinales</label>
                            <select name="bowel_habits" value={formData.bowel_habits} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Regular">Regular</option>
                                <option value="Estreñimiento">Estreñimiento</option>
                                <option value="Diarrea">Diarrea</option>
                                <option value="Alternante">Alternante</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN O */}
                <div className="soap-section soap-o">
                    <div className="section-header">
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span className="section-letter">O</span>
                            <span className="section-title">Objetivo - Datos Medibles</span>
                        </div>
                        <button type="button" className="btn-tool" onClick={() => setShowTools(true)} style={{marginLeft:'auto', background:'#e0f2fe', color:'#0284c7', border:'1px solid #bae6fd', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem', fontWeight:'600'}}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Calcular Requerimientos
                        </button>
                    </div>

                    <div className="subsection">
                        <h4>📏 Antropometría</h4>
                        <div className="metrics-grid">
                            <div className="input-group"><label>Peso (kg)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>
                            <div className="input-group"><label>Talla (cm)</label><input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} /></div>
                            <div className="input-group"><label>IMC (kg/m²)</label><input type="number" name="bmi" value={formData.bmi} readOnly className="read-only" /></div>
                            <div className="input-group"><label>Peso Ideal (kg)</label><input type="number" step="0.1" name="ideal_weight" value={formData.ideal_weight} onChange={handleChange} /></div>
                        </div>
                        <div className="metrics-grid">
                            <div className="input-group"><label>Cintura (cm)</label><input type="number" step="0.1" name="waist" value={formData.waist} onChange={handleChange} /></div>
                            <div className="input-group"><label>Cadera (cm)</label><input type="number" step="0.1" name="hip" value={formData.hip} onChange={handleChange} /></div>
                            <div className="input-group"><label>ICC</label><input type="number" name="waist_hip_ratio" value={formData.waist_hip_ratio} readOnly className="read-only" /></div>
                            <div className="input-group"><label>% Grasa Corporal</label><input type="number" step="0.1" name="body_fat" value={formData.body_fat} onChange={handleChange} /></div>
                            <div className="input-group"><label>Masa Muscular (kg)</label><input type="number" step="0.1" name="muscle_mass" value={formData.muscle_mass} onChange={handleChange} /></div>
                        </div>
                    </div>

                    <div className="subsection">
                        <h4>❤️ Signos Vitales</h4>
                        <div className="metrics-grid three-cols">
                            <div className="input-group"><label>Presión Arterial</label><input type="text" name="blood_pressure" placeholder="120/80" value={formData.blood_pressure} onChange={handleChange} /></div>
                            <div className="input-group"><label>Frecuencia Cardíaca</label><input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} /></div>
                            <div className="input-group"><label>Temperatura (°C)</label><input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} /></div>
                        </div>
                    </div>

                    <div className="subsection">
                        <h4>🧪 Datos Bioquímicos</h4>
                        <div className="metrics-grid">
                            <div className="input-group"><label>Glucosa</label><input type="number" step="0.1" name="glucose" value={formData.glucose} onChange={handleChange} /></div>
                            <div className="input-group"><label>HbA1c</label><input type="number" step="0.1" name="hba1c" value={formData.hba1c} onChange={handleChange} /></div>
                            <div className="input-group"><label>Colesterol</label><input type="number" step="0.1" name="cholesterol" value={formData.cholesterol} onChange={handleChange} /></div>
                            <div className="input-group"><label>Triglicéridos</label><input type="number" step="0.1" name="triglycerides" value={formData.triglycerides} onChange={handleChange} /></div>
                        </div>
                        <div className="metrics-grid">
                            <div className="input-group"><label>HDL</label><input type="number" step="0.1" name="hdl" value={formData.hdl} onChange={handleChange} /></div>
                            <div className="input-group"><label>LDL</label><input type="number" step="0.1" name="ldl" value={formData.ldl} onChange={handleChange} /></div>
                            <div className="input-group"><label>Hemoglobina</label><input type="number" step="0.1" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} /></div>
                            <div className="input-group"><label>Albúmina</label><input type="number" step="0.1" name="albumin" value={formData.albumin} onChange={handleChange} /></div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Otros Hallazgos</label>
                        <textarea name="objective_notes" placeholder="Notas adicionales..." value={formData.objective_notes} onChange={handleChange} rows="2" />
                    </div>
                </div>

                {/* SECCIÓN A */}
                <div className="soap-section soap-a">
                    <div className="section-header">
                        <span className="section-letter">A</span>
                        <span className="section-title">Análisis - Diagnóstico Nutricional</span>
                    </div>
                    <div className="pes-box">
                        <h4>📌 Diagnóstico PES</h4>
                        <div className="pes-field"><span className="pes-label">P</span><input type="text" name="pes_problem" placeholder="Problema..." value={formData.pes_problem} onChange={handleChange} /></div>
                        <div className="pes-field"><span className="pes-label">E</span><input type="text" name="pes_etiology" placeholder="Etiología..." value={formData.pes_etiology} onChange={handleChange} /></div>
                        <div className="pes-field"><span className="pes-label">S</span><input type="text" name="pes_signs" placeholder="Signos/Síntomas..." value={formData.pes_signs} onChange={handleChange} /></div>
                    </div>
                    <div className="form-group">
                        <label>Interpretación</label>
                        <textarea name="assessment_notes" placeholder="Conclusiones..." value={formData.assessment_notes} onChange={handleChange} rows="2" />
                    </div>
                    <div className="form-row three-cols">
                        <div className="form-group">
                            <label>Estado Nutricional</label>
                            <select name="nutritional_status" value={formData.nutritional_status} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Normal">Normal</option>
                                <option value="Desnutrición">Desnutrición</option>
                                <option value="Sobrepeso">Sobrepeso</option>
                                <option value="Obesidad">Obesidad</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nivel de Riesgo</label>
                            <select name="risk_level" value={formData.risk_level} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Prioridad</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="">Seleccionar...</option>
                                <option value="Rutina">Rutina</option>
                                <option value="Prioridad">Prioridad</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN P */}
                <div className="soap-section soap-p">
                    <div className="section-header">
                        <span className="section-letter">P</span>
                        <span className="section-title">Plan - Intervención y Tratamiento</span>
                    </div>
                    <div className="form-group">
                        <label>🎯 Metas del Tratamiento (SMART)</label>
                        <textarea name="treatment_goals" placeholder="Metas..." value={formData.treatment_goals} onChange={handleChange} rows="3" />
                    </div>

                    <div className="subsection diet-prescription-enhanced">
                        <div className="subsection-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4>Prescripción Dietética</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {formData.calories_prescribed > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleGenerateAIDiet}
                                        disabled={generatingAI}
                                        className="btn-ai-generate"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.4)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {generatingAI ? (
                                            <>
                                                <BrainCircuit className="w-5 h-5 animate-pulse" />
                                                Analizando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Generar Plan Semanal
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <div className="input-group"><label>Kcal/día</label><input type="number" name="calories_prescribed" value={formData.calories_prescribed} onChange={handleChange} placeholder="Ej: 2500" /></div>
                            <div className="input-group"><label>Proteína (g)</label><input type="number" name="protein_prescribed" value={formData.protein_prescribed} onChange={handleChange} /></div>
                            <div className="input-group"><label>Carbohidratos (g)</label><input type="number" name="carbs_prescribed" value={formData.carbs_prescribed} onChange={handleChange} /></div>
                            <div className="input-group"><label>Grasas (g)</label><input type="number" name="fats_prescribed" value={formData.fats_prescribed} onChange={handleChange} /></div>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Dieta</label>
                            <input type="text" name="diet_type" placeholder="Ej: Hipocalórica..." value={formData.diet_type} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>💊 Suplementación</label>
                        <textarea name="supplements_recommended" placeholder="Suplementos..." value={formData.supplements_recommended} onChange={handleChange} rows="2" />
                    </div>
                    <div className="form-group">
                        <label>📚 Educación Nutricional Brindada</label>
                        <textarea name="education_provided" placeholder="Temas cubiertos..." value={formData.education_provided} onChange={handleChange} rows="2" />
                    </div>
                    <div className="form-group">
                        <label>↗️ Referencias</label>
                        <input type="text" name="referrals" placeholder="Derivaciones..." value={formData.referrals} onChange={handleChange} />
                    </div>
                    <div className="form-group next-apt-group">
                        <label>📅 Próxima Cita</label>
                        <input type="date" name="next_appointment" value={formData.next_appointment} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="save-btn">
                    {isEditing ? '💾 Guardar Cambios' : '✅ Finalizar Consulta'}
                </button>
            </form>

            {/* MODAL HERRAMIENTAS */}
            {showTools && (
                <div className="modal-overlay" style={{zIndex: 2000}}>
                    <div className="modal-content" style={{maxWidth:'900px', width:'95%', padding:0, height:'auto', maxHeight:'90vh'}}>
                        <NutritionalTools
                            patientData={{
                                full_name: patient?.full_name || "Paciente",
                                weight: formData.weight,
                                height: formData.height,
                                age: null,
                                birth_date: patient?.birth_date,
                                gender: patient?.gender || 'Masculino'
                            }}
                            onSave={handleApplyCalculations}
                            onCancel={() => setShowTools(false)}
                        />
                    </div>
                </div>
            )}

            {/* 👇 CORRECCIÓN FINAL: AQUÍ CARGAMOS EL GENERADOR SEMANAL, NO EL PRO */}
            {showDietGenerator && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                    <div className="modal-content" style={{ padding: 0, width: '98%', maxWidth: '1600px', height: '95vh', background:'transparent', boxShadow:'none' }}>
                        <DietGeneratorWeekly
                            initialData={{
                                // 👇 AGREGAMOS ESTOS 4 DATOS NUEVOS
                                targetKcal: parseFloat(formData.calories_prescribed) || 0,
                                targetProtein: parseFloat(formData.protein_prescribed) || 0,
                                targetCarbs: parseFloat(formData.carbs_prescribed) || 0,
                                targetFats: parseFloat(formData.fats_prescribed) || 0,
                                patientName: patient?.full_name || "Paciente",
                            }}
                            aiGeneratedMenu={aiMenuData}
                            onClose={() => setShowDietGenerator(false)}
                            onSave={handleSaveDietFromGenerator}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SoapConsultation;