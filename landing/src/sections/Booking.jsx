import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, User, Mail, Phone, MessageCircle, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Lock, Sparkles, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const consultTypes = [
  { value: 'primera', label: 'Primera Consulta', sub: 'Diagnóstico inicial de 45min', popular: true, badge: 'GRATIS' },
  { value: 'seguimiento', label: 'Seguimiento', sub: 'Control de progreso', popular: false },
  { value: 'urgente', label: 'Consulta Urgente', sub: 'Atención prioritaria', popular: false }
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

  // Success Screen
  if (submitted) {
    return (
        <section id="booking-form" className="py-24 bg-gradient-to-br from-emerald-50 via-white to-white relative overflow-hidden flex items-center justify-center min-h-[700px]">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="success-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" className="text-emerald-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#success-dots)" />
            </svg>
          </div>

          <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden"
            >
              {/* Success Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-emerald-600" strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  ¡Cita Confirmada!
                </h2>
                <p className="text-emerald-50">
                  Tu consulta ha sido agendada exitosamente
                </p>
              </div>

              {/* Success Body */}
              <div className="p-8 md:p-10">
                <div className="text-center mb-8">
                  <p className="text-lg text-neutral-600 mb-2">
                    Gracias <span className="font-bold text-neutral-900">{formData.name}</span>
                  </p>
                  <p className="text-neutral-500">
                    Revisa tu correo y WhatsApp para más detalles
                  </p>
                </div>

                {/* Appointment Details Card */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 mb-8 border border-neutral-200">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 text-center">
                    Detalles de tu cita
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">Fecha</p>
                          <p className="font-bold text-neutral-900 capitalize">
                            {new Date(formData.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">Hora</p>
                          <p className="font-bold text-neutral-900">{formData.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wide">WhatsApp</p>
                          <p className="font-bold text-neutral-900">{formData.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Próximos pasos
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>Recibirás un correo de confirmación en los próximos minutos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>Te contactaremos por WhatsApp para confirmar tu cita</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <span>Prepara tus objetivos y dudas para la consulta</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-center text-neutral-400">
                  Si necesitas cambiar tu cita, contáctanos por WhatsApp
                </p>
              </div>
            </motion.div>
          </div>
        </section>
    );
  }

  return (
      <section id="booking-form" className="py-24 bg-gradient-to-b from-white via-neutral-50 to-white relative overflow-hidden">

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.4]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="booking-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-200" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#booking-grid)" />
          </svg>
        </div>

        {/* Gradient Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/40 to-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-100/30 to-orange-100/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">

          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Left Column: Enhanced Text & Info */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 lg:sticky lg:top-24"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 mb-6">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Da el Primer Paso</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="text-neutral-900">Agenda Tu</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700">
                  Primera Consulta
                </span>
              </h2>

              <p className="text-lg md:text-xl text-neutral-600 mb-8 leading-relaxed">
                Sin compromiso. <span className="font-semibold text-neutral-900">45 minutos dedicados exclusivamente a ti</span>, donde analizaremos tus objetivos y trazaremos un plan de acción real.
              </p>

              {/* Trust Indicators */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">100% Gratis</h4>
                    <p className="text-sm text-neutral-600">Sin costo ni compromiso de ningún tipo</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">Atención Personalizada</h4>
                    <p className="text-sm text-neutral-600">Análisis completo de tu situación actual</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1">Plan de Acción</h4>
                    <p className="text-sm text-neutral-600">Primeros pasos claros hacia tu objetivo</p>
                  </div>
                </div>
              </div>

              {/* Urgency Alert */}
              <div className="p-5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </div>
                  <h4 className="font-black text-rose-900 text-sm uppercase tracking-wide">Cupos Limitados</h4>
                </div>
                <p className="text-sm text-rose-800 font-medium">
                  Solo quedan <span className="font-black text-rose-600">3 espacios disponibles</span> para esta semana.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Enhanced Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-2xl shadow-neutral-300/30 border border-neutral-200 overflow-hidden">

                {/* Enhanced Progress Header */}
                <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 px-6 md:px-8 py-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Paso {step} de 3</p>
                      <h3 className="text-lg font-black text-neutral-900">
                        {step === 1 && 'Información Personal'}
                        {step === 2 && 'Tipo de Consulta'}
                        {step === 3 && 'Fecha y Horario'}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((s) => (
                          <div
                              key={s}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  s <= step ? 'bg-primary-600 w-8' : 'bg-neutral-300'
                              }`}
                          />
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
                        initial={{ width: '33%' }}
                        animate={{ width: `${step * 33.33}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="p-6 md:p-10">
                  <AnimatePresence mode="wait">

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                          <div className="space-y-5">
                            {/* Name Field */}
                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                                Nombre Completo <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-neutral-900 placeholder:text-neutral-400"
                                    placeholder="Ej: María González"
                                    required
                                />
                              </div>
                            </div>

                            {/* Email & Phone Row */}
                            <div className="grid md:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                                  Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative group">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                                  <input
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                      placeholder="tu@email.com"
                                      required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                                  WhatsApp <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative group">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                                  <input
                                      type="tel"
                                      value={formData.phone}
                                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                      className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                      placeholder="+593 99 999 9999"
                                      required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Next Button */}
                          <div className="pt-4">
                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-black text-lg rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                              Continuar
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                    )}

                    {/* Step 2: Consultation Type */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-neutral-700 mb-3">
                              Selecciona el tipo de consulta
                            </label>

                            {consultTypes.map((type) => (
                                <label
                                    key={type.value}
                                    className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${
                                        formData.type === type.value
                                            ? 'border-primary-600 bg-primary-50 shadow-lg shadow-primary-500/20'
                                            : 'border-neutral-200 hover:border-primary-300 hover:shadow-md'
                                    }`}
                                >
                                  <input
                                      type="radio"
                                      name="type"
                                      value={type.value}
                                      checked={formData.type === type.value}
                                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                      className="w-5 h-5 text-primary-600 border-2 border-neutral-300 focus:ring-4 focus:ring-primary-500/20"
                                  />
                                  <div className="ml-4 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-black text-base ${formData.type === type.value ? 'text-primary-900' : 'text-neutral-800'}`}>
                                        {type.label}
                                      </span>
                                      {type.badge && (
                                          <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-xs font-black uppercase tracking-wide rounded-full">
                                            {type.badge}
                                          </span>
                                      )}
                                      {type.popular && !type.badge && (
                                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide rounded-full">
                                            Popular
                                          </span>
                                      )}
                                    </div>
                                    <span className="text-sm text-neutral-600 block">{type.sub}</span>
                                  </div>

                                  {/* Checkmark Indicator */}
                                  {formData.type === type.value && (
                                      <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center"
                                      >
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      </motion.div>
                                  )}
                                </label>
                            ))}
                          </div>

                          {/* Optional Message */}
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                              Cuéntanos tu objetivo <span className="text-neutral-400 font-normal">(Opcional)</span>
                            </label>
                            <div className="relative group">
                              <MessageCircle className="absolute left-4 top-4 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors" />
                              <textarea
                                  value={formData.message}
                                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                  rows="4"
                                  placeholder="Ej: Quiero mejorar mi energía, perder peso y sentirme más saludable..."
                              />
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-4 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-all flex items-center gap-2"
                            >
                              <ArrowLeft className="w-5 h-5" />
                              Atrás
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-black text-lg rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                              Siguiente
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                    )}

                    {/* Step 3: Date & Time */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                          {/* Date & Time Inputs */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                                Fecha Preferida <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2.5">
                                Hora Preferida <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                                <select
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none cursor-pointer"
                                    required
                                >
                                  <option value="">Seleccionar Hora</option>
                                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Visual Time Slots */}
                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-3">
                              O selecciona un horario disponible
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                              {timeSlots.map((time) => (
                                  <button
                                      key={time}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, time })}
                                      className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all duration-300 ${
                                          formData.time === time
                                              ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-105'
                                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-400 hover:text-primary-600 hover:scale-105'
                                      }`}
                                  >
                                    {time}
                                  </button>
                              ))}
                            </div>
                          </div>

                          {/* Navigation & Submit */}
                          <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-4 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-all flex items-center gap-2"
                            >
                              <ArrowLeft className="w-5 h-5" />
                              Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-lg rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                            >
                              {isSubmitting ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Agendando...
                                  </>
                              ) : (
                                  <>
                                    Confirmar Cita
                                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  </>
                              )}
                            </button>
                          </div>

                          {/* Security Note */}
                          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-4">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Tus datos están protegidos y encriptados</span>
                          </div>
                        </motion.div>
                    )}

                  </AnimatePresence>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
  );
}