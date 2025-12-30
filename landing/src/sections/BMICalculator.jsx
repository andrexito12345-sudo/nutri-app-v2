import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calculator, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

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

    const { name, email, phone } = formData;
    if (!name || !email || !phone) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      // ENVIAR DATOS AL CRM BACKEND
      const response = await axios.post('/api/leads', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bmi: result.bmi,
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender,
        source: 'Landing Page - Calculadora IMC'
      });

      if (response.data.success) {
        toast.success('¡Gracias! Nos contactaremos contigo pronto');

        // Resetear después de 2 segundos
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
        }, 2000);
      }
    } catch (error) {
      console.error('Error al enviar lead:', error);
      toast.error('Hubo un error. Por favor intenta nuevamente o contáctanos por WhatsApp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                          Edad
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
                          Género
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
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 md:p-12 flex flex-col justify-center">
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
                                  placeholder="Tu nombre"
                                  required
                                  disabled={isSubmitting}
                              />
                              <input
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:outline-none text-neutral-900"
                                  placeholder="Tu email"
                                  required
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
                                {isSubmitting ? 'Enviando...' : 'Recibir Mi Plan Gratis'}
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
  );
}