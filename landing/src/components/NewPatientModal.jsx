import React from 'react';
import './NewPatientModal.css';

const NewPatientModal = ({
                             isOpen,
                             onClose,
                             formData,
                             onChange,
                             onSubmit,
                             isSaving
                         }) => {

    if (!isOpen) return null;

    return (
        <div className="npm-overlay" onClick={onClose}>
            {/* Animación de entrada suave */}
            <div
                className="npm-content bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full mx-4 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >

                {/* --- HEADER PREMIUM (Con Tailwind directo) --- */}
                {/* Fondo oscuro degradado igual al Dashboard */}
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        {/* Icono con fondo translúcido */}
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-blue-400">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Nuevo Paciente</h2>
                            <p className="text-sm text-slate-400 font-medium mt-0.5">Complete los datos del expediente</p>
                        </div>
                    </div>

                    {/* Botón cerrar hover effect */}
                    <button
                        onClick={onClose}
                        type="button"
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="npm-body p-6 md:p-8 overflow-y-auto bg-slate-50 flex-1">
                    <form onSubmit={onSubmit}>

                        {/* 1. Información Básica */}
                        <div className="npm-section mb-6">
                            <h3 className="flex items-center gap-3 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                Información Básica
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Nombre Completo <span className="npm-required">*</span></label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={onChange} placeholder="Ej: María García López" required />
                                </div>
                                <div className="npm-field">
                                    <label>Teléfono <span className="npm-required">*</span></label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="Ej: 0991234567" required />
                                </div>
                                <div className="npm-field">
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Ej: paciente@email.com" />
                                </div>
                                <div className="npm-field">
                                    <label>Fecha de Nacimiento</label>
                                    <input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} />
                                </div>
                                <div className="npm-field">
                                    <label>Género</label>
                                    <select name="gender" value={formData.gender} onChange={onChange}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="npm-field">
                                    <label>Ocupación</label>
                                    <input type="text" name="occupation" value={formData.occupation} onChange={onChange} placeholder="Ej: Ingeniero" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Información Médica */}
                        <div className="npm-section mb-6">
                            <h3 className="flex items-center gap-3 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide">
                                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </span>
                                Información Médica
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Tipo de Sangre</label>
                                    <select name="blood_type" value={formData.blood_type} onChange={onChange}>
                                        <option value="">Seleccionar...</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div className="npm-field npm-field--full">
                                    <label>Alergias</label>
                                    <textarea name="allergies" value={formData.allergies} onChange={onChange} placeholder="Ej: Penicilina, mariscos..." rows="2" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Contacto de Emergencia */}
                        <div className="npm-section mb-6">
                            <h3 className="flex items-center gap-3 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide">
                                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </span>
                                Contacto de Emergencia
                            </h3>
                            <div className="npm-grid">
                                <div className="npm-field">
                                    <label>Nombre del Contacto</label>
                                    <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={onChange} placeholder="Ej: Juan García (Esposo)" />
                                </div>
                                <div className="npm-field">
                                    <label>Teléfono de Emergencia</label>
                                    <input type="tel" name="emergency_phone" value={formData.emergency_phone} onChange={onChange} placeholder="Ej: 0987654321" />
                                </div>
                                <div className="npm-field npm-field--full">
                                    <label>Dirección Domiciliaria</label>
                                    <input type="text" name="address" value={formData.address} onChange={onChange} placeholder="Ej: Av. Principal 123, Ciudad" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Notas */}
                        <div className="npm-section">
                            <h3 className="flex items-center gap-3 text-slate-800 font-bold mb-5 text-sm uppercase tracking-wide">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                </span>
                                Notas Adicionales
                            </h3>
                            <div className="npm-field npm-field--full">
                                <textarea name="notes" value={formData.notes} onChange={onChange} placeholder="Observaciones generales sobre el paciente..." rows="3" />
                            </div>
                        </div>

                        {/* --- BOTONES DE ACCIÓN (Tailwind puro) --- */}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200 bg-white sticky bottom-0 z-10">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-all"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>

                            {/* BOTÓN PREMIUM DEFINITIVO */}
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                                    ${isSaving
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95'
                                }
                                `}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Guardar Paciente
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewPatientModal;