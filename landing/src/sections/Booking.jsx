import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, User, Mail, Phone, MessageCircle, CheckCircle, ArrowRight, ArrowLeft, Lock, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const consultTypes = [
  { value: 'primera', label: 'Primera Consulta', sub: 'Diagnóstico inicial de 45min', popular: true, badge: 'GRATIS', icon: '🎯' },
  { value: 'seguimiento', label: 'Seguimiento', sub: 'Control de progreso', popular: false, icon: '📊' },
  { value: 'urgente', label: 'Consulta Urgente', sub: 'Atención prioritaria', popular: false, icon: '⚡' }
];

export default function Booking() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    type: 'primera',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentDateTime = `${formData.date}T${formData.time}:00`;

      const payload = {
        patient_name: formData.name,
        patient_email: formData.email,
        patient_phone: formData.phone,
        reason: `${formData.type} - ${formData.message || 'Cita agendada desde Landing Page'}`,
        appointment_datetime: appointmentDateTime,
      };

      console.log('📤 Enviando cita:', payload);

      const response = await api.post('/appointments', payload);

      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.ok) {
        toast.success('¡Cita agendada exitosamente!');
        setSubmitted(true);

        setTimeout(() => {
          setSubmitted(false);
          setStep(1);
          setFormData({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            type: 'primera',
            message: ''
          });
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Error al agendar cita:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        toast.error('Error del servidor. Por favor intenta más tarde.');
      } else if (error.request) {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        toast.error('Hubo un error. Intenta nuevamente o contáctanos por WhatsApp');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) {
      toast.error('Por favor completa tus datos de contacto');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Success Screen - Minimalist
  if (submitted) {
    return (
        <section id="booking-form" className="py-24 bg-white relative overflow-hidden flex items-center justify-center min-h-screen">

          {/* Minimal Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

          <div className="container mx-auto px-4 relative z-10 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-8 relative"
              >
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
                </div>
              </motion.div>

              {/* Success Text */}
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3">
                ¡Listo! 🎉
              </h2>
              <p className="text-xl text-neutral-600 mb-12">
                Tu cita está confirmada, <span className="font-bold text-neutral-900">{formData.name}</span>
              </p>

              {/* Details Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                <div className="p-6 bg-white rounded-2xl border-2 border-neutral-100 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fecha</p>
                      <p className="font-black text-neutral-900 capitalize">
                        {new Date(formData.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border-2 border-neutral-100 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Hora</p>
                      <p className="font-black text-neutral-900">{formData.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-sm text-neutral-500 mb-2">
                Te contactaremos por WhatsApp al
              </p>
              <p className="text-lg font-bold text-neutral-900 mb-8">
                {formData.phone}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <Sparkles className="w-4 h-4" />
                <span>Revisa tu correo para más detalles</span>
              </div>
            </motion.div>
          </div>
        </section>
    );
  }

  return (
      <section id="booking-form" className="py-24 bg-white relative overflow-hidden">

        {/* Minimal Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50" />

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-16 max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Reserva tu espacio</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-neutral-900">Agenda en </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">
                3 Simples Pasos
              </span>
            </h2>

            <p className="text-xl text-neutral-600">
              Primera consulta gratuita. Sin compromiso. 45 minutos para ti.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-auto"
          >
            {/* Step Indicators */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center gap-2 p-2 bg-white rounded-full border-2 border-neutral-200 shadow-sm">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                            s === step
                                ? 'bg-primary-600 text-white shadow-lg'
                                : s < step
                                    ? 'bg-neutral-100 text-neutral-400'
                                    : 'text-neutral-400'
                        }`}
                    >
                      {s < step ? (
                          <CheckCircle className="w-5 h-5" />
                      ) : (
                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                            {s}
                          </span>
                      )}
                      <span className="font-bold text-sm hidden sm:inline">
                        {s === 1 && 'Datos'}
                        {s === 2 && 'Tipo'}
                        {s === 3 && 'Fecha'}
                      </span>
                    </div>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-8 md:p-12">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">

                  {/* Step 1 */}
                  {step === 1 && (
                      <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-black text-neutral-900 mb-2">
                          ¿Cómo te llamas?
                        </h3>
                        <p className="text-neutral-500 mb-8">
                          Necesitamos algunos datos para contactarte.
                        </p>

                        <div className="space-y-6">
                          <div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-neutral-200 focus:border-primary-600 transition-colors outline-none text-xl font-semibold placeholder:text-neutral-300"
                                placeholder="Nombre completo"
                                required
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-neutral-200 focus:border-primary-600 transition-colors outline-none text-lg placeholder:text-neutral-300"
                                placeholder="Email"
                                required
                            />

                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-neutral-200 focus:border-primary-600 transition-colors outline-none text-lg placeholder:text-neutral-300"
                                placeholder="WhatsApp"
                                required
                            />
                          </div>
                        </div>

                        <button
                            type="button"
                            onClick={nextStep}
                            className="mt-12 w-full md:w-auto px-8 py-4 bg-neutral-900 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
                        >
                          Continuar
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                      <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-black text-neutral-900 mb-2">
                          ¿Qué tipo de consulta necesitas?
                        </h3>
                        <p className="text-neutral-500 mb-8">
                          Selecciona la opción que mejor se ajuste a ti.
                        </p>

                        <div className="space-y-4 mb-8">
                          {consultTypes.map((type) => (
                              <label
                                  key={type.value}
                                  className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                                      formData.type === type.value
                                          ? 'border-neutral-900 bg-neutral-50'
                                          : 'border-neutral-200 hover:border-neutral-300'
                                  }`}
                              >
                                <input
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    checked={formData.type === type.value}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="sr-only"
                                />
                                <div className="text-4xl">{type.icon}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-black text-lg text-neutral-900">{type.label}</h4>
                                    {type.badge && (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-black rounded-md">
                                          {type.badge}
                                        </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-600">{type.sub}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    formData.type === type.value
                                        ? 'border-neutral-900 bg-neutral-900'
                                        : 'border-neutral-300'
                                }`}>
                                  {formData.type === type.value && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                              </label>
                          ))}
                        </div>

                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-0 py-4 bg-transparent border-0 border-b-2 border-neutral-200 focus:border-primary-600 transition-colors outline-none resize-none placeholder:text-neutral-300"
                            rows="3"
                            placeholder="Cuéntanos brevemente tu objetivo (opcional)"
                        />

                        <div className="flex gap-4 mt-12">
                          <button
                              type="button"
                              onClick={prevStep}
                              className="px-6 py-4 rounded-full font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                          >
                            Atrás
                          </button>
                          <button
                              type="button"
                              onClick={nextStep}
                              className="flex-1 px-8 py-4 bg-neutral-900 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
                          >
                            Continuar
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                      <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-black text-neutral-900 mb-2">
                          ¿Cuándo te viene mejor?
                        </h3>
                        <p className="text-neutral-500 mb-8">
                          Elige la fecha y hora que prefieras.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block text-sm font-bold text-neutral-600 mb-3 uppercase tracking-wider">
                              Fecha
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-neutral-900 transition-colors outline-none text-lg font-semibold"
                                required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-neutral-600 mb-3 uppercase tracking-wider">
                              Hora
                            </label>
                            <select
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-neutral-900 transition-colors outline-none text-lg font-semibold appearance-none cursor-pointer"
                                required
                            >
                              <option value="">Seleccionar</option>
                              {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="mb-8">
                          <label className="block text-sm font-bold text-neutral-600 mb-3 uppercase tracking-wider">
                            Horarios disponibles
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time })}
                                    className={`py-3 rounded-xl font-bold transition-all ${
                                        formData.time === time
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                  {time}
                                </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                              type="button"
                              onClick={prevStep}
                              className="px-6 py-4 rounded-full font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                          >
                            Atrás
                          </button>
                          <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 px-8 py-4 bg-neutral-900 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Confirmando...
                                </>
                            ) : (
                                <>
                                  Confirmar Cita
                                  <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-neutral-400">
                          <Lock className="w-3 h-3" />
                          <span>Datos protegidos y seguros</span>
                        </div>
                      </motion.div>
                  )}

                </AnimatePresence>
              </form>
            </div>

            {/* Urgency Note */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-full">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
                <span className="text-sm font-bold text-rose-900">
                  Solo 3 cupos disponibles esta semana
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}