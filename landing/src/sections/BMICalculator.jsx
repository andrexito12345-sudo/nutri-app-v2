import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calculator, TrendingDown, TrendingUp, Minus, CheckCircle, Calendar, Clock, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function BMICalculator() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    name: '',
    email: '',
    phone: ''
  });

  const [result, setResult] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();

    const { weight, height } = formData;
    if (!weight || !height) {
      toast.error('Por favor completa peso y altura');
      return;
    }

    const heightInMeters = parseFloat(height) / 100;
    const bmi = (parseFloat(weight) / (heightInMeters * heightInMeters)).toFixed(1);

    let category = '';
    let color = '';
    let icon = null;
    let recommendation = '';

    if (bmi < 18.5) {
      category = 'Bajo Peso';
      color = 'text-blue-600';
      icon = TrendingUp;
      recommendation = 'Necesitas aumentar de peso de forma saludable. Te ayudaremos a lograrlo.';
    } else if (bmi < 25) {
      category = 'Peso Normal';
      color = 'text-green-600';
      icon = Minus;
      recommendation = 'Excelente, podemos ayudarte a mantener tu peso ideal.';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
      color = 'text-yellow-600';
      icon = TrendingDown;
      recommendation = 'Con el plan correcto, alcanzarás tu peso ideal de forma saludable.';
    } else {
      category = 'Obesidad';
      color = 'text-red-600';
      icon = TrendingDown;
      recommendation = 'Es momento de tomar acción. Te guiaremos paso a paso hacia una vida más saludable.';
    }

    setResult({ bmi, category, color, icon, recommendation });
    setShowLeadForm(true);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, weight, height, age, gender } = formData;
    if (!name || !phone) {
      toast.error('Por favor completa nombre y teléfono');
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear fecha de cita sugerida (3 días desde hoy a las 10:00 AM)
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + 3);
      appointmentDate.setHours(10, 0, 0, 0);

      // Construir el reason con todos los datos del IMC
      const detailedReason = `
🎯 Lead desde Calculadora IMC
━━━━━━━━━━━━━━━━━━━━━━━
📊 IMC: ${result.bmi}
📈 Categoría: ${result.category}
⚖️ Peso: ${weight} kg
📏 Altura: ${height} cm
${age ? `🎂 Edad: ${age} años` : ''}
${gender ? `👤 Género: ${gender === 'female' ? 'Femenino' : 'Masculino'}` : ''}
      `.trim();

      // 🆕 ENVIAR DATOS ESTRUCTURADOS AL BACKEND
      const response = await api.post('/appointments', {
        patient_name: name,
        patient_email: email || null,
        patient_phone: phone,
        reason: detailedReason, // Mantenemos el reason para referencia
        appointment_datetime: appointmentDate.toISOString(),
        // 🆕 Datos biométricos estructurados para pre-llenar el SOAP
        patient_weight: weight ? parseFloat(weight) : null,
        patient_height: height ? parseFloat(height) : null,
        patient_age: age ? parseInt(age) : null,
        patient_gender: gender === 'female' ? 'Femenino' : gender === 'male' ? 'Masculino' : null,
        patient_bmi: result.bmi ? parseFloat(result.bmi) : null,
        patient_bmi_category: result.category || null
      });

      if (response.data.ok) {
        // Guardar datos para el modal
        setAppointmentData({
          name: name,
          phone: phone,
          date: appointmentDate,
          bmi: result.bmi,
          category: result.category
        });

        // Mostrar modal de éxito
        setShowSuccessModal(true);

      }
    } catch (error) {
      console.error('Error al enviar lead:', error);
      toast.error('Hubo un error. Por favor intenta nuevamente o contáctanos por WhatsApp', {
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAppointmentDate = (date) => {
    if (!date) return '';
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('es-ES', options);
  };

  const handleWhatsAppClick = () => {
    const message = `Hola! Acabo de agendar una cita desde la calculadora IMC. Mi nombre es ${appointmentData?.name}`;
    const whatsappURL = `https://wa.me/593999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  return (
      <>
        <style>{`
        @media (max-width: 640px) {
          .success-modal-container {
            margin-top: 2rem !important;
            margin-bottom: 2rem !important;
            max-height: calc(100vh - 4rem) !important;
          }
        }
      `}</style>

        <section id="calculadora" className="section-padding bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="container-custom relative z-10">
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <Calculator className="w-5 h-5" />
                  <span className="font-semibold">HERRAMIENTA GRATUITA</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  Descubre Tu IMC en 30 Segundos
                </h2>
                <p className="text-xl text-primary-100">
                  Conoce tu índice de masa corporal y recibe recomendaciones personalizadas
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* Calculator Form */}
                  <div className="p-8 md:p-12">
                    <form onSubmit={calculateBMI} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Peso (kg)
                          </label>
                          <input
                              type="number"
                              step="0.1"
                              value={formData.weight}
                              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                              placeholder="70"
                              required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Altura (cm)
                          </label>
                          <input
                              type="number"
                              step="0.1"
                              value={formData.height}
                              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                              placeholder="165"
                              required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Edad (opcional)
                          </label>
                          <input
                              type="number"
                              value={formData.age}
                              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                              placeholder="30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Género (opcional)
                          </label>
                          <select
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                          >
                            <option value="">Seleccionar</option>
                            <option value="female">Femenino</option>
                            <option value="male">Masculino</option>
                          </select>
                        </div>
                      </div>

                      <button
                          type="submit"
                          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                      >
                        Calcular Mi IMC Gratis
                      </button>
                    </form>
                  </div>

                  {/* Result / Lead Form */}
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-2xl border-2 border-primary-200">
                    {!result ? (
                        <div className="text-center text-neutral-600">
                          <Calculator className="w-20 h-20 mx-auto mb-4 text-primary-400" />
                          <p className="text-lg">
                            Completa los datos para conocer tu IMC y recibir recomendaciones personalizadas
                          </p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                          {/* Result Display */}
                          <div className="text-center">
                            <div className={`text-6xl font-bold ${result.color} mb-2`}>
                              {result.bmi}
                            </div>
                            <div className={`text-2xl font-semibold ${result.color} mb-4`}>
                              {result.category}
                            </div>
                            <p className="text-neutral-700 leading-relaxed">
                              {result.recommendation}
                            </p>
                          </div>

                          {/* Lead Capture Form */}
                          {showLeadForm && (
                              <form onSubmit={handleLeadSubmit} className="space-y-4 pt-6 border-t border-neutral-200">
                                <p className="text-sm font-semibold text-neutral-700 text-center mb-4">
                                  Recibe tu plan personalizado GRATIS
                                </p>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                                    placeholder="Tu nombre completo"
                                    required
                                    disabled={isSubmitting}
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                                    placeholder="Tu email (opcional)"
                                    disabled={isSubmitting}
                                />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                                    placeholder="Tu WhatsApp"
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isSubmitting ? (
                                      <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                              </span>
                                  ) : (
                                      'Recibir Mi Plan Gratis'
                                  )}
                                </button>
                                <p className="text-xs text-neutral-600 text-center">
                                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  Te contactaremos por WhatsApp en menos de 24 horas
                                </p>
                              </form>
                          )}
                        </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex justify-center gap-8 mt-12 text-primary-100 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Datos seguros</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>Sin spam</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SUCCESS MODAL */}
        <AnimatePresence>
          {showSuccessModal && appointmentData && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setShowSuccessModal(false)}
              >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative my-8 success-modal-container"
                    onClick={(e) => e.stopPropagation()}
                >
                  {/* Confetti Background */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                              background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                            }}
                            initial={{ y: -20, opacity: 1 }}
                            animate={{
                              y: 400,
                              opacity: 0,
                              rotate: Math.random() * 360
                            }}
                            transition={{
                              duration: 2 + Math.random() * 2,
                              delay: Math.random() * 0.5,
                              ease: "easeOut"
                            }}
                        />
                    ))}
                  </div>

                  {/* Close Button */}
                  <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        setTimeout(() => {
                          setResult(null);
                          setShowLeadForm(false);
                          setFormData({
                            weight: '',
                            height: '',
                            age: '',
                            gender: '',
                            name: '',
                            email: '',
                            phone: ''
                          });
                          setAppointmentData(null);
                        }, 500);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-800 transition-all shadow-md hover:shadow-lg z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header con Checkmark Animado */}
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 pt-8 pb-6 px-6 text-center relative">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.2
                        }}
                        className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-xl"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl md:text-3xl font-display font-bold text-white mb-2"
                    >
                      ¡Cita Agendada!
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-primary-100 text-lg"
                    >
                      Tu transformación comienza ahora
                    </motion.p>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    {/* Datos del Paciente */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-3"
                    >
                      <div className="flex items-center gap-2 p-2.5 md:p-3 bg-primary-50 rounded-xl border-2 border-primary-100">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Fecha Tentativa</p>
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {formatAppointmentDate(appointmentData.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 md:p-3 bg-green-50 rounded-xl border-2 border-green-100">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Fecha Tentativa</p>
                          <p className="text-xs md:text-sm font-bold text-neutral-900 line-clamp-2">
                            {formatAppointmentDate(appointmentData.date)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Mensaje Motivacional */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border-2 border-primary-200"
                    >
                      <h4 className="font-bold text-neutral-900 mb-2 text-base md:text-lg">¿Qué sigue ahora?</h4>
                      <ul className="space-y-1.5 md:space-y-2 text-neutral-700">
                        <li className="flex items-start gap-2">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Te contactaremos en <strong className="text-primary-700">menos de 24 horas</strong> por WhatsApp</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Confirmaremos tu cita y resolveremos tus dudas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Prepararemos tu plan nutricional personalizado</span>
                        </li>
                      </ul>
                    </motion.div>

                    {/* CTA WhatsApp */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        onClick={handleWhatsAppClick}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 md:py-4 rounded-xl text-sm md:text-base font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2 group"
                    >
                      <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Escríbenos por WhatsApp Ahora
                    </motion.button>

                    {/* Footer Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-center text-xs text-neutral-500"
                    >
                      Revisa tu email y WhatsApp para más detalles
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </>
  );
}