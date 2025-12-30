import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, User, Mail, Phone, MessageCircle, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // ✅ Correcto

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const consultTypes = [
  { value: 'primera', label: 'Primera Consulta (GRATIS)', sub: 'Diagnóstico inicial de 45min', popular: true },
  { value: 'seguimiento', label: 'Seguimiento', sub: 'Control de progreso' },
  { value: 'urgente', label: 'Consulta Urgente', sub: 'Atención prioritaria' }
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
      // ✅ CORREGIDO: Construir fecha/hora en formato ISO
      const appointmentDateTime = `${formData.date}T${formData.time}:00`;

      // ✅ CORREGIDO: Usar nombres correctos que espera el backend
      const payload = {
        patient_name: formData.name,
        patient_email: formData.email,
        patient_phone: formData.phone,
        reason: `${formData.type} - ${formData.message || 'Cita agendada desde Landing Page'}`,
        appointment_datetime: appointmentDateTime,
      };

      console.log('📤 Enviando cita:', payload);

      // ✅ CORREGIDO: Usar api en lugar de axios
      const response = await api.post('/appointments', payload);

      console.log('✅ Respuesta del servidor:', response.data);

      // ✅ CORREGIDO: Verificar con 'ok' en lugar de 'success'
      if (response.data.ok) {
        toast.success('¡Cita agendada exitosamente!');
        setSubmitted(true);

        // Resetear después de 5 segundos
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

  // Renderizado de éxito
  if (submitted) {
    return (
        <section id="booking-form" className="py-24 bg-gradient-to-br from-primary-50 via-white to-white relative overflow-hidden flex items-center justify-center min-h-[600px]">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center border border-neutral-100"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                ¡Cita Confirmada!
              </h2>
              <p className="text-neutral-500 mb-8">
                Gracias <span className="font-semibold text-neutral-800">{formData.name}</span>. Hemos recibido tu solicitud correctamente.
              </p>

              <div className="bg-neutral-50 rounded-2xl p-6 mb-8 border border-neutral-100 text-left">
                <div className="flex justify-between mb-3 border-b border-neutral-200 pb-3">
                  <span className="text-neutral-500">Fecha:</span>
                  <span className="font-semibold text-neutral-800 capitalize">
                    {new Date(formData.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                 </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Hora:</span>
                  <span className="font-semibold text-neutral-800">{formData.time}</span>
                </div>
              </div>

              <p className="text-sm text-neutral-400">
                Te hemos enviado un correo de confirmación y te contactaremos por WhatsApp al <strong>{formData.phone}</strong>.
              </p>
            </motion.div>
          </div>
        </section>
    );
  }

  return (
      <section id="booking-form" className="py-24 bg-neutral-50 relative overflow-hidden">

        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute -right-20 top-40 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl pointer-events-none"></div>
        {/* Mancha verde eliminada */}

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">

          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Left Column: Text & Info */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 text-center lg:text-left pt-8"
            >
            <span className="inline-block px-4 py-1.5 bg-white text-primary-700 rounded-full font-bold text-xs tracking-wider mb-6 border border-neutral-200 shadow-sm">
              DA EL PRIMER PASO
            </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 leading-tight">
                Agenda Tu Primera
                <span className="block mt-1 text-primary-600">
                Consulta GRATIS
              </span>
              </h2>
              <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
                Sin compromiso. 45 minutos dedicados exclusivamente a ti, donde analizaremos tus objetivos y trazaremos un plan de acción real.
              </p>

              {/* Urgency Box */}
              <div className="inline-flex items-center gap-3 px-5 py-4 bg-white border border-neutral-200 rounded-2xl shadow-sm mb-8 lg:mb-0">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <p className="text-sm font-medium text-neutral-700">
                  Solo quedan <span className="text-red-600 font-bold">3 cupos</span> disponibles para esta semana.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">

                {/* Progress Header */}
                <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-wide">Paso {step} de 3</span>
                    <span className="text-sm font-bold text-primary-600">
                      {step === 1 && 'Tus Datos'}
                      {step === 2 && 'Tipo de Consulta'}
                      {step === 3 && 'Fecha y Hora'}
                   </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary-600 rounded-full"
                        initial={{ width: '33%' }}
                        animate={{ width: `${step * 33.33}%` }}
                        transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-10 min-h-[400px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5"
                        >
                          <div className="grid md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-neutral-700 mb-2">Nombre Completo</label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    placeholder="Ej: María González"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2">Email</label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    placeholder="tucorreo@email.com"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2">WhatsApp</label>
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    placeholder="+593 99 999 9999"
                                    required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4">
                            <button type="button" onClick={nextStep} className="w-full btn-primary py-4 text-lg group flex items-center justify-center gap-2">
                              Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                          <div className="space-y-3">
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Selecciona el tipo de consulta</label>
                            {consultTypes.map((type) => (
                                <label
                                    key={type.value}
                                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                                        formData.type === type.value
                                            ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500'
                                            : 'border-neutral-200 hover:border-primary-200'
                                    }`}
                                >
                                  <input
                                      type="radio"
                                      name="type"
                                      value={type.value}
                                      checked={formData.type === type.value}
                                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                      className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                                  />
                                  <div className="ml-4 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${formData.type === type.value ? 'text-primary-900' : 'text-neutral-700'}`}>{type.label}</span>
                                      {type.popular && (
                                          <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-[10px] font-bold uppercase tracking-wide rounded-full">Popular</span>
                                      )}
                                    </div>
                                    <span className="text-sm text-neutral-500 block mt-0.5">{type.sub}</span>
                                  </div>
                                </label>
                            ))}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Cuéntanos tu objetivo (Opcional)</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                rows="3"
                                placeholder="Ej: Quiero mejorar mi energía y perder peso..."
                            />
                          </div>

                          <div className="flex gap-4 pt-2">
                            <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors">
                              Atrás
                            </button>
                            <button type="button" onClick={nextStep} className="flex-1 btn-primary py-3 text-lg flex items-center justify-center gap-2 group">
                              Siguiente <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2">Fecha Preferida</label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-neutral-700 mb-2">Hora Preferida</label>
                              <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                                <select
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
                                >
                                  <option value="">Seleccionar Hora</option>
                                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Visual Time Slots Selection (Desktop mainly) */}
                          <div className="hidden md:block">
                            <label className="block text-sm font-bold text-neutral-700 mb-3">Horarios Disponibles</label>
                            <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                              {timeSlots.map((time) => (
                                  <button
                                      key={time}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, time })}
                                      className={`py-2 px-1 rounded-lg text-sm font-semibold border transition-all ${
                                          formData.time === time
                                              ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300 hover:text-primary-600'
                                      }`}
                                  >
                                    {time}
                                  </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors">
                              Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 btn-primary py-3 text-lg shadow-lg hover:shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isSubmitting ? (
                                  <>Agendando...</>
                              ) : (
                                  <>Confirmar Cita <CheckCircle className="w-5 h-5" /></>
                              )}
                            </button>
                          </div>

                          {/* Security Note */}
                          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mt-4">
                            <Lock className="w-3 h-3" />
                            <span>Tus datos están protegidos y encriptados.</span>
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