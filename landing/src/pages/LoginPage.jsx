import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Activity, ArrowLeft } from 'lucide-react';
import api, { saveAuthData } from '../services/api';

function LoginPage() {
    // --- LÓGICA ---
    const [form, setForm] = useState({
        email: 'nutri@example.com',
        password: 'ClaveSegura123',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', form);
            const data = res.data || {};

            if (data.ok) {
                saveAuthData(data.token, data.doctor);
                navigate('/doctora/dashboard');
            } else {
                setError(data.message || 'Credenciales incorrectas.');
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('No se pudo iniciar sesión. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para volver al inicio
    const handleGoBack = () => {
        navigate('/'); // Cambia esto si tu página principal tiene otra ruta
    };

    return (
        <div className="min-h-screen w-full flex font-sans text-neutral-900">

            {/* ================= IZQUIERDA (Desktop) ================= */}
            <div className="hidden lg:flex lg:w-[55%] relative bg-neutral-900 overflow-hidden flex-col justify-between p-12 text-white">

                {/* BOTÓN VOLVER (Versión Desktop - Blanco) */}
                <button
                    onClick={handleGoBack}
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al inicio</span>
                </button>

                {/* Fondo y Efectos */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-90 z-0"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>

                {/* Contenido Visual */}
                <div className="relative z-10 h-full flex flex-col justify-center max-w-xl mx-auto">
                    <div className="w-16 h-16 mb-8 rounded-2xl bg-gradient-to-tr from-white/20 to-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
                        <Activity className="text-white w-8 h-8" strokeWidth={2} />
                    </div>
                    <h1 className="text-6xl font-extrabold leading-none tracking-tight mb-6">
                        Panel <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-200">
                            Profesional
                        </span>
                    </h1>
                    <p className="text-xl text-indigo-100/80 leading-relaxed font-light">
                        Gestiona tu consultorio nutricional con la tecnología más avanzada. Seguridad, rapidez y eficiencia en un solo lugar.
                    </p>
                </div>

                {/* Copyright simple */}
                <div className="relative z-10 text-xs text-white/40 font-mono">
                    ID DEL SISTEMA: PRO-V2.5 // SECURE
                </div>
            </div>

            {/* ================= DERECHA (Formulario) ================= */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 bg-neutral-50 lg:bg-white relative">

                {/* BOTÓN VOLVER (Versión Móvil - Oscuro) */}
                {/* Solo visible en pantallas pequeñas (lg:hidden) */}
                <button
                    onClick={handleGoBack}
                    className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-neutral-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Inicio</span>
                </button>

                <div className="w-full max-w-[400px] space-y-8 relative z-10">

                    {/* Logo solo móvil */}
                    <div className="lg:hidden flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-extrabold text-neutral-900">Bienvenida</h2>
                        <p className="text-neutral-500 text-sm">Ingresa tus credenciales de doctora.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-neutral-900"
                                    placeholder="doctora@ejemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-neutral-900"
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-indigo-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Ingresar</span> <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="text-center">
                        <a href="#" className="text-sm text-indigo-600 font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
                    </div>
                </div>

                {/* Footer móvil */}
                <div className="absolute bottom-4 flex items-center gap-2 text-neutral-400 text-xs font-medium">
                    <Shield className="w-3 h-3" /> Conexión Segura TLS
                </div>
            </div>
        </div>
    );
}

export default LoginPage;