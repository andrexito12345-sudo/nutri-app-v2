/**
 * ============================================================================
 * DIET GENERATOR WEEKLY - (Nuevo enfoque) Generación por DÍA + Regeneración por comida
 * ============================================================================
 */
import { Printer } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
    Sparkles,
    ChefHat,
    Calendar,
    RotateCcw,
    Save,
    X,
    Loader2,
    Check,
    AlertCircle,
} from "lucide-react";
import api from "../services/api";
import "./DietGeneratorWeekly.css";

import { printWeeklyDietPlan } from "../utils/printWeeklyDietPlan";

const DietGeneratorWeekly = ({ initialData, aiGeneratedMenu, onClose, onSave }) => {
    const {
        targetKcal,
        targetProtein,
        targetCarbs,
        targetFats,
        patientName,
        age,
        gender,
        weight,
        activityLevel,
        pathologies,
        restrictions,
        preferences,
    } = initialData;

    // =========================
    // Plan vacío
    // =========================
    const emptyPlan = () => ({
        lunes: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        martes: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        miercoles: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        jueves: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        viernes: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        sabado: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
        domingo: { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] },
    });

    // =========================
    // Estados
    // =========================
    const [weeklyDiet, setWeeklyDiet] = useState(emptyPlan());
    const [currentDay, setCurrentDay] = useState("lunes");

    const [isGeneratingDay, setIsGeneratingDay] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    // Loading por comida (para regenerar sin congelar todo)
    const [mealLoading, setMealLoading] = useState(() => ({})); // key: `${day}_${mealType}` -> boolean

    // JOB + POLLING
    const [jobId, setJobId] = useState(null);
    const pollRef = useRef(null);

    // =========================
    // Constantes UI
    // =========================
    const MEAL_TYPES = {
        BREAKFAST: { label: "Desayuno", icon: "🌅", color: "#f59e0b" },
        MID_MORNING: { label: "Media Mañana", icon: "☕", color: "#10b981" },
        LUNCH: { label: "Almuerzo", icon: "🍽️", color: "#3b82f6" },
        SNACK: { label: "Media Tarde", icon: "🥤", color: "#8b5cf6" },
        DINNER: { label: "Cena", icon: "🌙", color: "#ef4444" },
    };

    const DAYS = [
        { key: "lunes", label: "Lunes" },
        { key: "martes", label: "Martes" },
        { key: "miercoles", label: "Miércoles" },
        { key: "jueves", label: "Jueves" },
        { key: "viernes", label: "Viernes" },
        { key: "sabado", label: "Sábado" },
        { key: "domingo", label: "Domingo" },
    ];

    const FRONT_TO_BACK_MEAL = {
        BREAKFAST: "DESAYUNO",
        MID_MORNING: "MEDIA_MAÑANA",
        LUNCH: "ALMUERZO",
        SNACK: "MEDIA_TARDE",
        DINNER: "CENA",
    };

    // =========================
    // Helpers: normalizar recetas
    // =========================
    const normalizeRecipeItem = (item) => {
        if (!item) return null;
        if (item.receta && typeof item.receta === "object") return item.receta; // backend style
        return item; // ya es receta plana
    };

    const convertBackendDayToFrontendMeals = (backendDayObj) => {
        const converted = {
            BREAKFAST: [],
            MID_MORNING: [],
            LUNCH: [],
            SNACK: [],
            DINNER: [],
        };

        const map = {
            DESAYUNO: "BREAKFAST",
            "MEDIA_MAÑANA": "MID_MORNING",
            ALMUERZO: "LUNCH",
            "MEDIA_TARDE": "SNACK",
            CENA: "DINNER",
        };

        Object.entries(map).forEach(([bKey, fKey]) => {
            const arr = Array.isArray(backendDayObj?.[bKey]) ? backendDayObj[bKey] : [];
            converted[fKey] = arr.map(normalizeRecipeItem).filter(Boolean);
        });

        return converted;
    };

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    // (Opcional) si te llega algo ya generado en aiGeneratedMenu
    useEffect(() => {
        if (!aiGeneratedMenu) return;

        // [No verificado] No sé el formato exacto de aiGeneratedMenu en tu proyecto.
        if (typeof aiGeneratedMenu === "object" && aiGeneratedMenu.lunes) {
            setWeeklyDiet(aiGeneratedMenu);
        }
    }, [aiGeneratedMenu]);

    // =========================
    // Totales
    // =========================
    const calculateDayTotals = (day) => {
        const dayMeals = weeklyDiet[day];
        let totals = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

        Object.values(dayMeals).forEach((mealRecipes) => {
            mealRecipes.forEach((recipe) => {
                if (recipe?.nutricion) {
                    totals.calorias += recipe.nutricion.calorias || 0;
                    totals.proteinas += recipe.nutricion.proteinas || 0;
                    totals.carbohidratos += recipe.nutricion.carbohidratos || 0;
                    totals.grasas += recipe.nutricion.grasas || 0;
                }
            });
        });

        return totals;
    };

    const calculateMealTotals = (recipes) => {
        return recipes.reduce(
            (acc, recipe) => {
                if (recipe?.nutricion) {
                    acc.calorias += recipe.nutricion.calorias || 0;
                    acc.proteinas += recipe.nutricion.proteinas || 0;
                    acc.carbohidratos += recipe.nutricion.carbohidratos || 0;
                    acc.grasas += recipe.nutricion.grasas || 0;
                }
                return acc;
            },
            { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
        );
    };

    const calculateWeekTotals = () => {
        let weekTotals = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
        Object.keys(weeklyDiet).forEach((day) => {
            const d = calculateDayTotals(day);
            weekTotals.calorias += d.calorias;
            weekTotals.proteinas += d.proteinas;
            weekTotals.carbohidratos += d.carbohidratos;
            weekTotals.grasas += d.grasas;
        });
        return weekTotals;
    };

    // =========================
    // API: Generar SOLO EL DÍA actual (job + polling)
    // =========================
    const startGenerateDayJob = async (payload) => {
        try {
            const startResp = await api.post("/diet/generate-day/start", payload);

            if (!startResp?.data?.success) {
                throw new Error(startResp?.data?.error || "Error iniciando generación del día");
            }

            const newJobId = startResp.data.jobId;
            setJobId(newJobId);

            stopPolling();
            pollRef.current = setInterval(async () => {
                try {
                    const statusResp = await api.get(`/diet/generate-day/job/${newJobId}`);
                    if (!statusResp?.data?.success) return;

                    const job = statusResp.data.job;

                    // progreso
                    const done = job?.progress?.done ?? 0;
                    const total = job?.progress?.total ?? 5;
                    const pct = Math.round((done / total) * 100);
                    setGenerationProgress(Number.isFinite(pct) ? pct : 0);

                    // status
                    const pDay = job?.progress?.day;
                    const pMeal = job?.progress?.mealType;
                    if (pDay && pMeal) {
                        setGenerationStatus(`Generando: ${String(pDay).toUpperCase()} - ${pMeal} (${done}/${total})`);
                    } else {
                        setGenerationStatus(`Generando día... (${done}/${total})`);
                    }

                    // pintar parcial: SOLO el día que estamos generando
                    if (job?.dayKey && job?.weeklyPlan?.[job.dayKey]) {
                        const convertedMeals = convertBackendDayToFrontendMeals(job.weeklyPlan[job.dayKey]);
                        setWeeklyDiet((prev) => ({
                            ...prev,
                            [job.dayKey]: {
                                ...prev[job.dayKey],
                                ...convertedMeals,
                            },
                        }));
                    }

                    // fin
                    if (job.status === "done") {
                        stopPolling();
                        setGenerationProgress(100);
                        setGenerationStatus("¡Día generado!");
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 1500);
                        setIsGeneratingDay(false);
                    }

                    if (job.status === "error") {
                        stopPolling();
                        setGenerationStatus(job.error || "Error al generar día.");
                        setIsGeneratingDay(false);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 900);
        } catch (err) {
            stopPolling();
            // ✅ Mejor mensaje para ver details si viene del backend
            const details = err?.response?.data?.details;
            const msg =
                err?.response?.data?.error ||
                err?.message ||
                "Error iniciando generación del día";

            throw new Error(details ? `${msg} | details: ${details}` : msg);
        }
    };

    const handlePrintPdf = () => {
        const hasAnyWeek = Object.values(weeklyDiet).some((dayObj) =>
            Object.values(dayObj).some((m) => m.length > 0)
        );

        if (!hasAnyWeek) {
            alert("No hay datos para imprimir.");
            return;
        }

        printWeeklyDietPlan({
            brand: "NutriVida Pro",
            doctorLabel: "Nutricionista",
            patientName,
            kcal: targetKcal,
            macros: { p: targetProtein, c: targetCarbs, f: targetFats },
            weeklyDiet,
        });
    };

    const handleGenerateCurrentDay = async () => {
        setIsGeneratingDay(true);
        setGenerationProgress(0);
        setGenerationStatus(`Iniciando generación del día: ${currentDay.toUpperCase()}...`);

        try {
            // ✅ 1) Construir usedRecipeNames con TODO lo ya generado en la semana
            // (excluimos el día actual para no “autoprohibir” si estás regenerando el mismo día)
            const usedRecipeNames = [];
            Object.entries(weeklyDiet).forEach(([dayKey, dayMeals]) => {
                if (dayKey === currentDay) return;
                Object.values(dayMeals).forEach((mealRecipes) => {
                    (mealRecipes || []).forEach((r) => {
                        if (r?.nombre) usedRecipeNames.push(String(r.nombre).trim());
                    });
                });
            });

            // ✅ 2) Deduplicar
            const seen = new Set();
            const usedRecipeNamesDeduped = [];
            for (const n of usedRecipeNames) {
                const key = String(n).toLowerCase().replace(/\s+/g, " ").trim();
                if (key && !seen.has(key)) {
                    seen.add(key);
                    usedRecipeNamesDeduped.push(String(n).trim());
                }
            }

            // ✅ 3) Payload + usedRecipeNames
            const payload = {
                dayKey: currentDay,
                targetKcal,
                targetProtein,
                targetCarbs,
                targetFats,
                patientName,
                age: age ?? 30,
                gender: gender ?? "Masculino",
                weight: weight ?? 70,
                activityLevel: activityLevel ?? "Moderada",
                pathologies: pathologies ?? "Ninguna",
                restrictions: restrictions ?? "Ninguna",
                preferences: preferences ?? "Comida ecuatoriana variada y saludable",
                usedRecipeNames: usedRecipeNamesDeduped,
            };

            await startGenerateDayJob(payload);
        } catch (error) {
            console.error("Error generando día:", error);
            setGenerationStatus(error?.message || "Error al generar día.");
            setTimeout(() => setIsGeneratingDay(false), 1200);
        }
    };

    // =========================
    // API: Regenerar una comida
    // =========================
    const handleRegenerateMeal = async (mealType) => {
        const backMealType = FRONT_TO_BACK_MEAL[mealType];
        const key = `${currentDay}_${mealType}`;

        setMealLoading((prev) => ({ ...prev, [key]: true }));

        try {
            const currentMealRecipes = weeklyDiet[currentDay]?.[mealType] || [];
            const currentNames = currentMealRecipes.map(r => r?.nombre).filter(Boolean);

            const usedNames = [...currentNames];
            Object.values(weeklyDiet).forEach(dayMeals => {
                Object.values(dayMeals).forEach(mealRecipes => {
                    mealRecipes.forEach(r => {
                        if (r?.nombre) usedNames.push(r.nombre);
                    });
                });
            });

            const resp = await api.post("/diet/regenerate-meal", {
                day: currentDay,
                mealType: backMealType,
                targetKcal,
                targetProtein,
                targetCarbs,
                targetFats,
                patientContext: {
                    patientName,
                    age: age ?? 30,
                    gender: gender ?? "Masculino",
                    weight: weight ?? 70,
                    activityLevel: activityLevel ?? "Moderada",
                    pathologies: pathologies ?? "Ninguna",
                    restrictions: restrictions ?? "Ninguna",
                    preferences: preferences ?? "Comida ecuatoriana variada y saludable",
                },
                usedRecipeNames: usedNames,
            });

            if (!resp?.data?.success) {
                throw new Error(resp?.data?.error || "No se pudo regenerar la comida");
            }

            const backendRecipes = Array.isArray(resp.data.recipes) ? resp.data.recipes : [];
            const recipes = backendRecipes.map(normalizeRecipeItem).filter(Boolean);

            setWeeklyDiet((prev) => ({
                ...prev,
                [currentDay]: {
                    ...prev[currentDay],
                    [mealType]: recipes,
                },
            }));
        } catch (e) {
            console.error("Regenerate error:", e);
            alert(e?.message || "Error regenerando comida");
        } finally {
            setMealLoading((prev) => ({ ...prev, [key]: false }));
        }
    };

    // =========================
    // Guardar
    // =========================
    const handleSaveDiet = () => {
        const totals = calculateWeekTotals();
        const avgKcal = Math.round((totals.calorias || 0) / 7);

        onSave({
            weeklyDiet,
            targetCalories: targetKcal,
            averageKcal: avgKcal,
        });

        setShowSuccess(true);
        setTimeout(() => onClose(), 1200);
    };

    // =========================
    // UI: RecipeCard
    // =========================
    const RecipeCard = ({ recipe }) => {
        const [expanded, setExpanded] = React.useState(false);

        return (
            <div
                className="recipe-card"
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
            >
                <div className="recipe-header">
                    <h4 className="recipe-name">{recipe.nombre}</h4>
                    <span className="recipe-time">⏱️ {recipe.tiempoPreparacion}</span>
                </div>

                <div className="recipe-nutrition">
                    <div className="nutrition-badge">
                        <span className="nutrition-value">{Math.round(recipe.nutricion?.calorias || 0)}</span>
                        <span className="nutrition-label">kcal</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">{Math.round(recipe.nutricion?.proteinas || 0)}g</span>
                        <span className="nutrition-label">Prot</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">{Math.round(recipe.nutricion?.carbohidratos || 0)}g</span>
                        <span className="nutrition-label">Carb</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">{Math.round(recipe.nutricion?.grasas || 0)}g</span>
                        <span className="nutrition-label">Gra</span>
                    </div>
                </div>

                <div className="recipe-ingredients">
                    <h5>Ingredientes:</h5>
                    <ul>
                        {(expanded ? recipe.ingredientes : recipe.ingredientes?.slice(0, 4))?.map((ing, idx) => (
                            <li key={idx}>
                                {ing.cantidad} {ing.unidad} de {ing.alimento}
                            </li>
                        ))}
                        {!expanded && recipe.ingredientes?.length > 4 && (
                            <li className="more-ingredients">+ {recipe.ingredientes.length - 4} más...</li>
                        )}
                    </ul>
                </div>

                <div className="recipe-preparation">
                    <h5>Preparación:</h5>
                    <ol>
                        {(expanded ? recipe.preparacion : recipe.preparacion?.slice(0, 3))?.map((paso, idx) => (
                            <li key={idx}>{paso}</li>
                        ))}
                    </ol>
                </div>
            </div>
        );
    };

    // =========================
    // UI: MealSection
    // =========================
    const MealSection = ({ mealType, recipes, day }) => {
        const mealInfo = MEAL_TYPES[mealType];
        const isEmpty = recipes.length === 0;

        const loadingKey = `${day}_${mealType}`;
        const isMealLoading = !!mealLoading[loadingKey];

        return (
            <div className="meal-section">
                <div className="meal-header">
                    <div className="meal-title-group">
                        <span className="meal-icon">{mealInfo.icon}</span>
                        <h3 className="meal-title" style={{ color: mealInfo.color }}>
                            {mealInfo.label}
                        </h3>
                    </div>

                    <div className="meal-actions">
                        <button
                            className="btn-regenerate-meal"
                            onClick={() => handleRegenerateMeal(mealType)}
                            title="Regenerar esta comida"
                            disabled={isMealLoading}
                        >
                            {isMealLoading ? <Loader2 size={16} className="spinner" /> : <RotateCcw size={16} />}
                        </button>
                    </div>
                </div>

                {isEmpty ? (
                    <div className="empty-meal">
                        <AlertCircle size={32} color="#94a3b8" />
                        <p>No hay recetas generadas para esta comida</p>
                        <button
                            className="btn-generate-meal"
                            onClick={() => handleRegenerateMeal(mealType)}
                            disabled={isMealLoading}
                        >
                            {isMealLoading ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                            Generar {mealInfo.label}
                        </button>
                    </div>
                ) : (
                    <div className="recipes-grid">
                        {recipes.map((recipe, idx) => (
                            <RecipeCard key={idx} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // =========================
    // Render principal
    // =========================
    const dayTotals = calculateDayTotals(currentDay);
    const hasAnyRecipes = Object.values(weeklyDiet[currentDay]).some((meals) => meals.length > 0);

    return (
        <div className="diet-generator-overlay">
            <div className="diet-generator-container">
                {/* HEADER */}
                <div className="diet-generator-header">
                    <div className="header-title-group">
                        <ChefHat size={28} className="header-icon" />
                        <div>
                            <h2 className="header-title">Generador de Dietas IA</h2>
                            <p className="header-subtitle">
                                Plan Semanal para {patientName} • {targetKcal} kcal/día
                            </p>
                        </div>
                    </div>

                    <div className="header-macros">
                        <div className="header-macro-badge">
                            <div className="macro-fill" style={{
                                height: `${Math.min((dayTotals.calorias / targetKcal) * 100, 100)}%`,
                                backgroundColor: "#fbbf24"
                            }} />
                            <div className="macro-content">
                                <span className="header-macro-label">Objetivo</span>
                                <span className="header-macro-value">{Math.round(dayTotals.calorias)}/{targetKcal}</span>
                            </div>
                        </div>

                        <div className="header-macro-badge">
                            <div className="macro-fill" style={{
                                height: `${Math.min((dayTotals.proteinas / targetProtein) * 100, 100)}%`,
                                backgroundColor: "#f87171"
                            }} />
                            <div className="macro-content">
                                <span className="header-macro-label">Proteína</span>
                                <span className="header-macro-value">{Math.round(dayTotals.proteinas)}/{targetProtein}g</span>
                            </div>
                        </div>

                        <div className="header-macro-badge">
                            <div className="macro-fill" style={{
                                height: `${Math.min((dayTotals.carbohidratos / targetCarbs) * 100, 100)}%`,
                                backgroundColor: "#60a5fa"
                            }} />
                            <div className="macro-content">
                                <span className="header-macro-label">Carbos</span>
                                <span className="header-macro-value">{Math.round(dayTotals.carbohidratos)}/{targetCarbs}g</span>
                            </div>
                        </div>

                        <div className="header-macro-badge">
                            <div className="macro-fill" style={{
                                height: `${Math.min((dayTotals.grasas / targetFats) * 100, 100)}%`,
                                backgroundColor: "#34d399"
                            }} />
                            <div className="macro-content">
                                <span className="header-macro-label">Grasas</span>
                                <span className="header-macro-value">{Math.round(dayTotals.grasas)}/{targetFats}g</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            className="btn-generate-day-header"
                            onClick={handleGenerateCurrentDay}
                            disabled={isGeneratingDay}
                            title="Genera SOLO el día seleccionado"
                        >
                            {isGeneratingDay ? (
                                <>
                                    <Loader2 size={16} className="spinner" />
                                    <span>Generando...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Generar Día {DAYS.find((d) => d.key === currentDay)?.label || ""}</span>
                                </>
                            )}
                        </button>

                        <button
                            className="btn-header-icon btn-print-header"
                            onClick={handlePrintPdf}
                            title="Imprimir PDF"
                        >
                            <Printer size={18} />
                        </button>

                        <button
                            className="btn-header-icon btn-save-header"
                            onClick={handleSaveDiet}
                            disabled={!hasAnyRecipes}
                            title="Guardar Dieta Completa"
                        >
                            <Save size={18} />
                        </button>

                        <button className="btn-close" onClick={onClose} title="Cerrar">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PROGRESO */}
                {isGeneratingDay && (
                    <div className="generation-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${generationProgress}%` }} />
                        </div>
                        <p className="progress-status">{generationStatus}</p>
                        {jobId && (
                            <p className="progress-status" style={{ opacity: 0.7 }}>
                                Job: {jobId}
                            </p>
                        )}
                    </div>
                )}

                {/* TABS DÍAS */}
                <div className="days-tabs">
                    {DAYS.map((day) => {
                        const dayHasRecipes = Object.values(weeklyDiet[day.key]).some((meals) => meals.length > 0);

                        return (
                            <button
                                key={day.key}
                                className={`day-tab ${currentDay === day.key ? "active" : ""}`}
                                onClick={() => setCurrentDay(day.key)}
                            >
                                <Calendar size={16} />
                                <span>{day.label}</span>
                                {dayHasRecipes && <Check size={14} className="day-check" />}
                            </button>
                        );
                    })}
                </div>

                {/* CONTENIDO DÍA */}
                <div className="day-content">
                    <div className="meals-container">
                        {Object.keys(MEAL_TYPES).map((mealType) => (
                            <MealSection
                                key={mealType}
                                mealType={mealType}
                                recipes={weeklyDiet[currentDay][mealType]}
                                day={currentDay}
                            />
                        ))}
                    </div>
                </div>

                {/* TOAST */}
                {showSuccess && (
                    <div className="success-toast">
                        <Check size={24} />
                        <span>¡Listo!</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DietGeneratorWeekly;
