import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import api from '../services/api'
import { printSoapReport } from "../utils/soapPrinter";

export function useDashboardLogic() {
    const navigate = useNavigate();

    const [leadToDelete, setLeadToDelete] = useState(null);

    // --- ESTADOS DE MODALES DE CONFIRMACIÓN ---
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [appointmentToConvert, setAppointmentToConvert] = useState(null);

    // --- ESTADOS DE HERRAMIENTAS (MODALES) ---
    const [showHerramientasAvanzadas, setShowHerramientasAvanzadas] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showBMIModal, setShowBMIModal] = useState(false);
    const [showDietModal, setShowDietModal] = useState(false);

    // --- ESTADOS DE DATOS ---
    const [appointments, setAppointments] = useState([]);
    const [visitStats, setVisitStats] = useState({ total: 0, today: 0 });
    const [appointmentStats, setAppointmentStats] = useState(null);

    // 👇 NUEVO: Estado para almacenar los Leads (WhatsApp/Web)
    const [leads, setLeads] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --- ESTADOS DE FILTROS ---
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todas");
    const [dateFilter, setDateFilter] = useState("todos");

    // --- ESTADOS DE PACIENTES ---
    const [patients, setPatients] = useState([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");

    // --- ESTADOS DE EDICIÓN DE PACIENTE ---
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientConsultations, setPatientConsultations] = useState([]);
    const [patientWeightHistory, setPatientWeightHistory] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [patientFormData, setPatientFormData] = useState({
        full_name: "", email: "", phone: "", birth_date: "", gender: "",
        occupation: "", address: "", emergency_contact: "", emergency_phone: "",
        blood_type: "", allergies: "", notes: ""
    });
    const [savingPatient, setSavingPatient] = useState(false);
    const [pendingAppointment, setPendingAppointment] = useState(null);

    // --- LÓGICA DE IMPRESIÓN ---
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();

    const handlePrintProcess = useReactToPrint({
        content: () => printRef.current,
        documentTitle: printData ? `Consulta_${printData.patient.full_name}` : 'Documento_Clinico',
        onAfterPrint: () => setPrintData(null),
        onPrintError: (error) => console.error("Error al imprimir:", error)
    });

    // 1. SOLICITUD: Solo abre el modal (guarda el ID)
    const requestDeleteLead = (id) => {
        setLeadToDelete(id);
    };

    // 2. CONFIRMACIÓN: Ejecuta el borrado real (cuando das click en "Sí, Eliminar")
    const confirmDeleteLead = async () => {
        if (!leadToDelete) return;

        try {
            await api.delete(`/leads/${leadToDelete}`);
            setLeads((prev) => prev.filter((lead) => lead.id !== leadToDelete));
            toast.success("Lead eliminado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar lead");
        } finally {
            setLeadToDelete(null); // Cerrar modal siempre
        }
    };

    useEffect(() => {
        if (printData) {
            setTimeout(() => {
                handlePrintProcess();
            }, 100);
        }
    }, [printData, handlePrintProcess]);

    // --- HANDLERS PARA MODALES ---
    const requestDeleteAppointment = (id) => setAppointmentToDelete(id);
    const requestDeletePatient = (id, name) => setPatientToDelete({ id, name });

    const formatDate = (isoString) => {
        if (!isoString) return "-";
        const d = new Date(isoString);
        if (isNaN(d)) return isoString;
        return d.toLocaleDateString("es-EC", {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    // --- CÁLCULO DE MÉTRICAS ---
    const metrics = useMemo(() => {
        const list = Array.isArray(appointments) ? appointments : [];
        return {
            total: list.length,
            pending: list.filter(a => a.status === "pendiente").length,
            done: list.filter(a => a.status === "completada").length,
            cancelled: list.filter(a => a.status === "cancelada").length,
        };
    }, [appointments]);

    // --- CARGA DE DATOS (DASHBOARD) ---
    const loadDashboardData = async (isBackgroundUpdate = false) => {
        try {
            if (!isBackgroundUpdate) setLoading(true);
            setError("");

            // 👇 NUEVO: Agregamos api.get("/leads") al Promise.all
            const [appointmentsRes, visitsRes, statsRes, leadsRes] = await Promise.all([
                api.get("/appointments"),
                api.get("/visits/stats"),
                api.get("/appointments/stats"),
                api.get("/leads"), // Trae los interesados de WhatsApp
            ]);

            setAppointments(Array.isArray(appointmentsRes.data?.appointments) ? appointmentsRes.data.appointments : []);

            const visitsData = visitsRes.data || {};
            setVisitStats({
                total: visitsData.total ?? 0,
                today: visitsData.today ?? 0,
            });

            setAppointmentStats(statsRes.data || null);

            // 👇 NUEVO: Guardamos los leads en el estado
            setLeads(leadsRes.data?.leads || []);

        } catch (err) {
            console.error("Error cargando dashboard:", err);
            // No mostramos error global si falla solo leads, para no bloquear la app
            if (!isBackgroundUpdate) {
                // setError("No se pudieron cargar algunos datos."); // Opcional
            }
        } finally {
            if (!isBackgroundUpdate) setLoading(false);
        }
    };

    // Efectos de Carga
    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("🔄 Radar: Buscando nuevas citas y leads...");
            loadDashboardData(true);
        }, 30000); // Actualiza cada 30 segundos
        return () => clearInterval(intervalId);
    }, []);

    // --- CARGA DE PACIENTES ---
    const fetchPatients = async (searchTerm = "") => {
        try {
            setPatientsLoading(true);
            const response = await api.get("/patients", { params: { search: searchTerm } });
            setPatients(response.data.patients || []);
        } catch (err) {
            console.error("Error cargando pacientes:", err);
        } finally {
            setPatientsLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients(patientSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    // --- FILTROS DE CITAS ---
    const filteredAppointments = useMemo(() => {
        const list = Array.isArray(appointments) ? appointments : [];
        let result = [...list];

        if (statusFilter !== "todas") {
            result = result.filter((a) => a.status === statusFilter);
        }

        if (dateFilter !== "todos") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter((a) => {
                const appointmentDate = new Date(a.appointment_datetime);
                switch (dateFilter) {
                    case "hoy": return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    case "semana":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= weekAgo;
                    case "mes":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return appointmentDate >= monthAgo;
                    default: return true;
                }
            });
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((a) => {
                const name = (a.patient_name || "").toLowerCase();
                const email = (a.patient_email || "").toLowerCase();
                const phone = (a.patient_phone || "").toLowerCase();
                return (name.includes(q) || email.includes(q) || phone.includes(q));
            });
        }

        return result.sort((a, b) => b.id - a.id);
    }, [appointments, statusFilter, search, dateFilter]);

    // --- ACCIONES (CRUD) ---
    const changeStatus = async (id, newStatus) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status: newStatus });
            setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
            toast.success("Estado actualizado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al cambiar estado");
        }
    };

    const viewPatientRecord = async (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
        try {
            const [consultationsRes, weightRes] = await Promise.all([
                api.get(`/consultations/patient/${patient.id}`),
                api.get(`/consultations/patient/${patient.id}/weight-history`)
            ]);
            setPatientConsultations(consultationsRes.data.consultations || []);
            setPatientWeightHistory(weightRes.data || []);
        } catch (err) {
            console.error("Error cargando expediente:", err);
        }
    };

    const closePatientModal = () => {
        setShowPatientModal(false);
        setSelectedPatient(null);
        setPatientConsultations([]);
        setPatientWeightHistory([]);
    };

    const openPatientForm = () => {
        setPatientFormData({
            full_name: "", email: "", phone: "", birth_date: "", gender: "",
            occupation: "", address: "", emergency_contact: "", emergency_phone: "",
            blood_type: "", allergies: "", notes: ""
        });
        setIsEditing(false);
        setShowPatientForm(true);
    };

    const editPatient = (patient) => {
        setPatientFormData({
            ...patient,
            birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
        });
        setIsEditing(true);
        setShowPatientForm(true);
    };

    const handleCreatePatientFromAppointment = (appointment) => {
        setAppointmentToConvert(appointment);
    };

    const savePatient = async (e) => {
        e.preventDefault();
        if (!patientFormData.full_name || !patientFormData.phone) {
            toast.error("El nombre y el teléfono son obligatorios");
            return;
        }

        try {
            setSavingPatient(true);
            let response;
            if (isEditing) {
                response = await api.put(`/patients/${patientFormData.id}`, patientFormData);
                toast.success("Paciente actualizado correctamente");
            } else {
                response = await api.post("/patients", patientFormData);
                toast.success("Paciente creado exitosamente");
            }

            if (pendingAppointment && !isEditing) {
                const newPatientId = response.data.patient ? response.data.patient.id : response.data.id;
                if (newPatientId) {
                    setShowPatientForm(false);
                    setPendingAppointment(null);
                    navigate(`/consulta/nueva/${pendingAppointment.id}/${newPatientId}`);
                    return;
                }
            }

            setShowPatientForm(false);
            fetchPatients();
            setPatientFormData({
                full_name: "", email: "", phone: "", birth_date: "", gender: "",
                occupation: "", address: "", emergency_contact: "", emergency_phone: "",
                blood_type: "", allergies: "", notes: ""
            });

        } catch (err) {
            console.error("Error al guardar:", err);
            const mensaje = err.response?.data?.error || "Ocurrió un error al guardar";
            toast.error(mensaje);
        } finally {
            setSavingPatient(false);
        }
    };

    const printLatestConsultation = async (patient) => {
        try {
            const response = await api.get(`/consultations/patient/${patient.id}?limit=1`);
            const consultations = response.data.consultations;
            if (!consultations || consultations.length === 0) {
                alert(`El paciente ${patient.full_name} no tiene consultas.`);
                return;
            }
            printSoapReport(consultations[0], patient);
        } catch (error) {
            console.error(error);
            alert("Error al obtener datos para imprimir.");
        }
    };

    // --- DATOS PARA GRÁFICOS ---
    const todayStats = appointmentStats?.today || { total: 0, pending: 0, done: 0, cancelled: 0 };
    const last30Stats = appointmentStats?.last30 || { total: 0, pending: 0, done: 0, cancelled: 0 };

    const donutData = [
        { name: "Pendientes", value: metrics.pending, color: "#f59e0b" },
        { name: "Realizadas", value: metrics.done, color: "#10b981" },
        { name: "Canceladas", value: metrics.cancelled, color: "#ef4444" },
    ];

    const barData = [
        { periodo: "Hoy", Pendientes: todayStats.pending, Realizadas: todayStats.done, Canceladas: todayStats.cancelled },
        { periodo: "30 días", Pendientes: last30Stats.pending, Realizadas: last30Stats.done, Canceladas: last30Stats.cancelled },
    ];

    // --- FUNCIONES DE CONFIRMACIÓN (ELIMINAR/CREAR) ---
    const deleteAppointment = requestDeleteAppointment; // Alias para compatibilidad

    const confirmDeleteAppointment = async () => {
        if (!appointmentToDelete) return;

        try {
            await api.delete(`/appointments/${appointmentToDelete}`);
            setAppointments((prev) => prev.filter((a) => a.id !== appointmentToDelete));
            toast.success("Cita eliminada correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar la cita");
        } finally {
            setAppointmentToDelete(null);
        }
    };

    const confirmDeletePatient = async () => {
        if (!patientToDelete) return;

        try {
            await api.delete(`/patients/${patientToDelete.id}`);
            setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
            toast.success("Paciente eliminado correctamente");
        } catch (error) {
            console.error("Error eliminando:", error);
            toast.error("No se pudo eliminar el paciente.");
        } finally {
            setPatientToDelete(null);
        }
    };

    const confirmCreatePatient = () => {
        if (!appointmentToConvert) return;
        const appointment = appointmentToConvert;

        setPendingAppointment(appointment);
        setPatientFormData({
            full_name: appointment.patient_name || "",
            email: appointment.patient_email || "",
            phone: appointment.patient_phone || "",
            notes: `Motivo de consulta inicial: ${appointment.reason || "No especificado"}`,
            birth_date: "", gender: "", occupation: "", address: "",
            emergency_contact: "", emergency_phone: "", blood_type: "", allergies: ""
        });
        setIsEditing(false);
        setShowPatientForm(true);
        setAppointmentToConvert(null);
    };

    // ✅ RETURN FINAL COMPLETO
    return {
        // Datos y Estados
        loading,
        error,
        metrics,
        visitStats,
        filteredAppointments,
        patients,
        patientsLoading,

        // 👇 NUEVO: Exportamos los leads para usarlos en el Dashboard
        leads,
        deleteLead: requestDeleteLead, // 👈 AGREGAR AQUÍ

        // Filtros
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        dateFilter,
        setDateFilter,
        patientSearch,
        setPatientSearch,

        // Estado Modales
        modals: {
            stats: showStatsModal,
            bmi: showBMIModal,
            diet: showDietModal,
            patientFile: showPatientModal,
            newPatient: showPatientForm,
            herramientasAvanzadas: showHerramientasAvanzadas,
            isEditing
        },

        // Datos para Modales
        modalData: {
            donutData,
            barData,
            selectedPatient,
            patientConsultations,
            patientWeightHistory,
            patientFormData,
            savingPatient
        },

        // Setters
        setShowStatsModal,
        setShowBMIModal,
        setShowDietModal,
        setShowPatientForm,
        setPendingAppointment,
        setShowHerramientasAvanzadas,

        // Handlers
        handlePatientFormChange: (e) => setPatientFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
        savePatient,
        deletePatient: requestDeletePatient,
        editPatient,
        viewPatientRecord,
        closePatientModal,
        openPatientForm,
        changeStatus,
        deleteAppointment,
        handleCreatePatientFromAppointment,
        printLatestConsultation,
        formatDate,
        navigate,

        // Modales de Confirmación
        confirmDeleteAppointment,
        appointmentToDelete,
        setAppointmentToDelete,

        patientToDelete,
        setPatientToDelete,
        confirmDeletePatient,

        appointmentToConvert,
        setAppointmentToConvert,
        confirmCreatePatient,

        leadToDelete,
        confirmDeleteLead,
        setLeadToDelete,

        // Refs
        printRef
    };
}