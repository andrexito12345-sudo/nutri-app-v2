/**
 * ============================================================================
 * DIET GENERATOR WEEKLY - (Nuevo enfoque) Generación por DÍA + Regeneración por comida
 * ============================================================================
 */
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Card,
    CardHeader,
    CardContent,
    IconButton,
    Typography,
    Stack,
    Chip,
    Divider,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    CircularProgress,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
    ListChecks,
} from "lucide-react";
import api from "../services/api";
import "./DietGeneratorWeekly.css";

import { printWeeklyDietPlan } from "../utils/printWeeklyDietPlan";
import { printShoppingList } from "../utils/printShoppingList";

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

    // Loading por comida
    const [mealLoading, setMealLoading] = useState(() => ({})); // key: `${day}_${mealType}` -> boolean

    // JOB + POLLING
    const [jobId, setJobId] = useState(null);
    const pollRef = useRef(null);

    // Lista de compras (por día)
    const [shoppingList, setShoppingList] = useState({});
    const [isShoppingOpen, setIsShoppingOpen] = useState(false);

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
    // Tema MUI
    // =========================
    const muiTheme = createTheme({
        shape: { borderRadius: 18 },
        typography: {
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        },
        palette: {
            mode: "light",
            primary: { main: "#6366f1" },
            background: { default: "#f6f7fb", paper: "#ffffff" },
            text: { primary: "#0f172a", secondary: "#475569" },
            divider: "rgba(15, 23, 42, 0.08)",
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: "#f6f7fb",
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
                        overflow: "hidden",
                    },
                },
            },
            MuiCardHeader: {
                styleOverrides: {
                    root: {
                        paddingTop: 14,
                        paddingBottom: 10,
                    },
                    title: {
                        fontWeight: 900,
                    },
                },
            },
            MuiCardContent: {
                styleOverrides: {
                    root: {
                        paddingTop: 12,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 999,
                        fontWeight: 800,
                    },
                    label: {
                        paddingLeft: 10,
                        paddingRight: 10,
                    },
                },
            },
            MuiAccordion: {
                defaultProps: {
                    disableGutters: true,
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "rgba(15, 23, 42, 0.02)",
                        overflow: "hidden",
                        margin: 0,
                    },
                },
            },
            MuiAccordionSummary: {
                styleOverrides: {
                    root: {
                        minHeight: 44,
                        paddingLeft: 12,
                        paddingRight: 10,
                    },
                    content: {
                        margin: "10px 0",
                    },
                },
            },
            MuiAccordionDetails: {
                styleOverrides: {
                    root: {
                        paddingTop: 10,
                        paddingBottom: 12,
                        paddingLeft: 12,
                        paddingRight: 12,
                        background: "#fff",
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                        fontWeight: 900,
                    },
                },
            },
        },
    });

    // =========================
    // Helpers
    // =========================
    const normalizeRecipeItem = (item) => {
        if (!item) return null;
        if (item.receta && typeof item.receta === "object") return item.receta;
        return item;
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
        document.body.classList.add("body--diet-open");
        return () => {
            document.body.classList.remove("body--diet-open");
            stopPolling();
        };
    }, []);

    useEffect(() => {
        if (!aiGeneratedMenu) return;
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
    // Lista de compras: ingredientes únicos POR DÍA
    // =========================
    const aggregateWeeklyIngredientsByDay = (diet) => {
        const result = {};

        Object.entries(diet).forEach(([dayKey, dayMeals]) => {
            const ingredientSet = new Set();

            Object.values(dayMeals).forEach((mealRecipes) => {
                (mealRecipes || []).forEach((recipe) => {
                    (recipe?.ingredientes || []).forEach((ing) => {
                        if (!ing || !ing.alimento) return;
                        const nombre = String(ing.alimento).trim();
                        if (!nombre) return;
                        ingredientSet.add(nombre);
                    });
                });
            });

            result[dayKey] = Array.from(ingredientSet).sort((a, b) =>
                a.localeCompare(b, "es")
            );
        });

        return result;
    };

    // =========================
    // API: generar día
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

                    const done = job?.progress?.done ?? 0;
                    const total = job?.progress?.total ?? 5;
                    const pct = Math.round((done / total) * 100);
                    setGenerationProgress(Number.isFinite(pct) ? pct : 0);

                    const pDay = job?.progress?.day;
                    const pMeal = job?.progress?.mealType;
                    if (pDay && pMeal) {
                        setGenerationStatus(
                            `Generando: ${String(pDay).toUpperCase()} - ${pMeal} (${done}/${total})`
                        );
                    } else {
                        setGenerationStatus(`Generando día... (${done}/${total})`);
                    }

                    if (job?.dayKey && job?.weeklyPlan?.[job.dayKey]) {
                        const convertedMeals = convertBackendDayToFrontendMeals(
                            job.weeklyPlan[job.dayKey]
                        );
                        setWeeklyDiet((prev) => ({
                            ...prev,
                            [job.dayKey]: {
                                ...prev[job.dayKey],
                                ...convertedMeals,
                            },
                        }));
                    }

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
            const details = err?.response?.data?.details;
            const msg =
                err?.response?.data?.error ||
                err?.message ||
                "Error iniciando generación del día";

            throw new Error(details ? `${msg} | details: ${details}` : msg);
        }
    };

    const handleGenerateCurrentDay = async () => {
        setIsGeneratingDay(true);
        setGenerationProgress(0);
        setGenerationStatus(`Iniciando generación del día: ${currentDay.toUpperCase()}...`);

        try {
            const usedRecipeNames = [];
            Object.entries(weeklyDiet).forEach(([dayKey, dayMeals]) => {
                if (dayKey === currentDay) return;
                Object.values(dayMeals).forEach((mealRecipes) => {
                    (mealRecipes || []).forEach((r) => {
                        if (r?.nombre) usedRecipeNames.push(String(r.nombre).trim());
                    });
                });
            });

            const seen = new Set();
            const usedRecipeNamesDeduped = [];
            for (const n of usedRecipeNames) {
                const key = String(n).toLowerCase().replace(/\s+/g, " ").trim();
                if (key && !seen.has(key)) {
                    seen.add(key);
                    usedRecipeNamesDeduped.push(String(n).trim());
                }
            }

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
    // API: Regenerar comida
    // =========================
    const handleRegenerateMeal = async (mealType) => {
        const backMealType = FRONT_TO_BACK_MEAL[mealType];
        const key = `${currentDay}_${mealType}`;

        setMealLoading((prev) => ({ ...prev, [key]: true }));

        try {
            const currentMealRecipes = weeklyDiet[currentDay]?.[mealType] || [];
            const currentNames = currentMealRecipes.map((r) => r?.nombre).filter(Boolean);

            const usedNames = [...currentNames];
            Object.values(weeklyDiet).forEach((dayMeals) => {
                Object.values(dayMeals).forEach((mealRecipes) => {
                    mealRecipes.forEach((r) => {
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
            shoppingList,
        });

        setShowSuccess(true);
        setTimeout(() => onClose(), 1200);
    };

    // =========================
    // Imprimir PDF de la dieta
    // =========================
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

    // =========================
    // Lista de ingredientes (abrir modal + imprimir)
    // =========================
    const handleOpenShoppingList = () => {
        const listByDay = aggregateWeeklyIngredientsByDay(weeklyDiet);

        const hasAny = Object.values(listByDay).some(
            (arr) => Array.isArray(arr) && arr.length > 0
        );
        if (!hasAny) {
            alert("No hay ingredientes porque aún no hay recetas generadas en la semana.");
            return;
        }

        setShoppingList(listByDay);
        setIsShoppingOpen(true);
    };

    const handlePrintShoppingList = () => {
        const hasAny = Object.values(shoppingList || {}).some(
            (arr) => Array.isArray(arr) && arr.length > 0
        );
        if (!hasAny) {
            alert("No hay ingredientes para imprimir.");
            return;
        }

        printShoppingList({
            brand: "NutriVida Pro",
            patientName: patientName || "",
            shoppingListByDay: shoppingList,
        });
    };

    // =========================
    // UI: RecipeCard (no se usa en la vista actual, pero lo dejo)
    // =========================
    const RecipeCard = ({ recipe }) => {
        const [expanded, setExpanded] = React.useState(false);

        const ingredientes = recipe.ingredientes || [];
        const preparacion = recipe.preparacion || [];

        return (
            <div
                className={`recipe-card ${expanded ? "is-expanded" : ""}`}
                onClick={() => setExpanded((v) => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
                }}
                title="Click para ver más/menos"
            >
                <div className="recipe-header">
                    <h4 className="recipe-name">{recipe.nombre}</h4>
                    <span className="recipe-time">⏱️ {recipe.tiempoPreparacion}</span>
                </div>

                <div className="recipe-nutrition">
                    <div className="nutrition-badge">
                        <span className="nutrition-value">
                            {Math.round(recipe.nutricion?.calorias || 0)}
                        </span>
                        <span className="nutrition-label">kcal</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">
                            {Math.round(recipe.nutricion?.proteinas || 0)}g
                        </span>
                        <span className="nutrition-label">Prot</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">
                            {Math.round(recipe.nutricion?.carbohidratos || 0)}g
                        </span>
                        <span className="nutrition-label">Carb</span>
                    </div>
                    <div className="nutrition-badge">
                        <span className="nutrition-value">
                            {Math.round(recipe.nutricion?.grasas || 0)}g
                        </span>
                        <span className="nutrition-label">Gra</span>
                    </div>
                </div>

                <div className="recipe-ingredients">
                    <h5>Ingredientes:</h5>
                    <ul>
                        {(expanded ? ingredientes : ingredientes.slice(0, 4)).map((ing, idx) => (
                            <li key={idx}>
                                {ing.cantidad} {ing.unidad} de {ing.alimento}
                            </li>
                        ))}
                        {!expanded && ingredientes.length > 4 && (
                            <li className="more-ingredients">+ {ingredientes.length - 4} más...</li>
                        )}
                    </ul>
                </div>

                <div className="recipe-preparation">
                    <h5>Preparación:</h5>
                    <ol>
                        {(expanded ? preparacion : preparacion.slice(0, 3)).map((paso, idx) => (
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

        const renderIngredients = (recipe) => {
            const list = Array.isArray(recipe?.ingredientes) ? recipe.ingredientes : [];
            if (!list.length)
                return (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        Sin ingredientes.
                    </Typography>
                );

            return (
                <Box component="ul" className="meal-detail-list" sx={{ m: 0, pl: 2 }}>
                    {list.map((ing, i) => (
                        <li key={i}>
                            <Typography variant="body2">
                                {ing?.cantidad} {ing?.unidad} de {ing?.alimento}
                            </Typography>
                        </li>
                    ))}
                </Box>
            );
        };

        const renderPreparation = (recipe) => {
            const steps = Array.isArray(recipe?.preparacion) ? recipe.preparacion : [];
            if (!steps.length)
                return (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        Sin preparación.
                    </Typography>
                );

            return (
                <Box component="ol" className="meal-detail-list" sx={{ m: 0, pl: 2 }}>
                    {steps.map((paso, i) => (
                        <li key={i}>
                            <Typography variant="body2">{paso}</Typography>
                        </li>
                    ))}
                </Box>
            );
        };

        return (
            <Card
                className="meal-card"
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardHeader
                    className="meal-card-header"
                    sx={{ pb: 1 }}
                    title={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <span style={{ fontSize: 18 }}>{mealInfo.icon}</span>
                            <Typography
                                variant="h6"
                                sx={{ color: mealInfo.color, fontWeight: 900 }}
                            >
                                {mealInfo.label}
                            </Typography>
                            {!isEmpty && (
                                <span className="meal-count-pill">
                                    {Array.isArray(recipes) ? recipes.length : 0}
                                </span>
                            )}
                        </Stack>
                    }
                    action={
                        <Tooltip title="Regenerar esta comida">
                            <span>
                                <IconButton
                                    className="meal-regenerate-btn"
                                    onClick={() => handleRegenerateMeal(mealType)}
                                    disabled={isMealLoading}
                                    size="small"
                                >
                                    {isMealLoading ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <RotateCcw size={18} />
                                    )}
                                </IconButton>
                            </span>
                        </Tooltip>
                    }
                />

                <CardContent
                    className="meal-card-content"
                    sx={{
                        pt: 0,
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {isEmpty ? (
                        <Stack
                            spacing={1.5}
                            alignItems="center"
                            sx={{ py: 2, flex: 1, justifyContent: "center" }}
                        >
                            <AlertCircle size={30} color="#94a3b8" />
                            <Typography
                                variant="body2"
                                sx={{ opacity: 0.8, textAlign: "center" }}
                            >
                                No hay recetas generadas para esta comida
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => handleRegenerateMeal(mealType)}
                                disabled={isMealLoading}
                                startIcon={
                                    isMealLoading ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <Sparkles size={16} />
                                    )
                                }
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 900,
                                    borderRadius: 3,
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                Generar {mealInfo.label}
                            </Button>
                        </Stack>
                    ) : (
                        <Stack className="meal-scroll" spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                            {(Array.isArray(recipes) ? recipes : []).map((recipe, idx) => (
                                <Box
                                    key={idx}
                                    className="meal-recipe-box"
                                    sx={{ display: "grid", gap: 1.1 }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        gap={1}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            className="meal-recipe-title"
                                            sx={{ fontWeight: 950, lineHeight: 1.15 }}
                                        >
                                            {recipe?.nombre}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="meal-recipe-time"
                                            sx={{ opacity: 0.8, fontWeight: 800 }}
                                        >
                                            ⏱️ {recipe?.tiempoPreparacion}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        className="meal-macros-row"
                                    >
                                        <Chip
                                            size="small"
                                            className="macro-chip"
                                            label={`${Math.round(
                                                recipe?.nutricion?.calorias || 0
                                            )} kcal`}
                                        />
                                        <Chip
                                            size="small"
                                            className="macro-chip"
                                            label={`${Math.round(
                                                recipe?.nutricion?.proteinas || 0
                                            )} g Prot`}
                                        />
                                        <Chip
                                            size="small"
                                            className="macro-chip"
                                            label={`${Math.round(
                                                recipe?.nutricion?.carbohidratos || 0
                                            )} g Carb`}
                                        />
                                        <Chip
                                            size="small"
                                            className="macro-chip"
                                            label={`${Math.round(
                                                recipe?.nutricion?.grasas || 0
                                            )} g Gras`}
                                        />
                                    </Stack>

                                    <Divider />

                                    <Accordion className="meal-accordion">
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            className="meal-accordion-summary"
                                        >
                                            <Typography
                                                className="meal-accordion-title"
                                                sx={{ fontWeight: 950 }}
                                            >
                                                Ingredientes
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails className="meal-accordion-details">
                                            {renderIngredients(recipe)}
                                        </AccordionDetails>
                                    </Accordion>

                                    <Accordion className="meal-accordion">
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            className="meal-accordion-summary"
                                        >
                                            <Typography
                                                className="meal-accordion-title"
                                                sx={{ fontWeight: 950 }}
                                            >
                                                Preparación
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails className="meal-accordion-details">
                                            {renderPreparation(recipe)}
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        );
    };

    // =========================
    // Render principal
    // =========================
    const dayTotals = calculateDayTotals(currentDay);
    const hasAnyRecipes = Object.values(weeklyDiet[currentDay]).some(
        (meals) => meals.length > 0
    );

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
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
                                <div
                                    className="macro-fill"
                                    style={{
                                        height: `${Math.min(
                                            (dayTotals.calorias / targetKcal) * 100,
                                            100
                                        )}%`,
                                        backgroundColor: "#fbbf24",
                                    }}
                                />
                                <div className="macro-content">
                                    <span className="header-macro-label">Objetivo</span>
                                    <span className="header-macro-value">
                                        {Math.round(dayTotals.calorias)}/{targetKcal}
                                    </span>
                                </div>
                            </div>

                            <div className="header-macro-badge">
                                <div
                                    className="macro-fill"
                                    style={{
                                        height: `${Math.min(
                                            (dayTotals.proteinas / targetProtein) * 100,
                                            100
                                        )}%`,
                                        backgroundColor: "#f87171",
                                    }}
                                />
                                <div className="macro-content">
                                    <span className="header-macro-label">Proteína</span>
                                    <span className="header-macro-value">
                                        {Math.round(dayTotals.proteinas)}/{targetProtein}g
                                    </span>
                                </div>
                            </div>

                            <div className="header-macro-badge">
                                <div
                                    className="macro-fill"
                                    style={{
                                        height: `${Math.min(
                                            (dayTotals.carbohidratos / targetCarbs) * 100,
                                            100
                                        )}%`,
                                        backgroundColor: "#60a5fa",
                                    }}
                                />
                                <div className="macro-content">
                                    <span className="header-macro-label">Carbos</span>
                                    <span className="header-macro-value">
                                        {Math.round(dayTotals.carbohidratos)}/{targetCarbs}g
                                    </span>
                                </div>
                            </div>

                            <div className="header-macro-badge">
                                <div
                                    className="macro-fill"
                                    style={{
                                        height: `${Math.min(
                                            (dayTotals.grasas / targetFats) * 100,
                                            100
                                        )}%`,
                                        backgroundColor: "#34d399",
                                    }}
                                />
                                <div className="macro-content">
                                    <span className="header-macro-label">Grasas</span>
                                    <span className="header-macro-value">
                                        {Math.round(dayTotals.grasas)}/{targetFats}g
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="header-actions">
                            {/* Generar día */}
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
                                        <span>
                                            Generar Día{" "}
                                            {DAYS.find((d) => d.key === currentDay)?.label || ""}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Abrir lista de ingredientes */}
                            <button
                                className="btn-header-icon btn-shopping-header"
                                onClick={handleOpenShoppingList}
                                title="Lista de ingredientes de la semana"
                            >
                                <ListChecks size={18} />
                            </button>

                            {/* Imprimir PDF de la dieta semanal */}
                            <button
                                className="btn-header-icon btn-print-header"
                                onClick={handlePrintPdf}
                                title="Imprimir PDF"
                            >
                                <Printer size={18} />
                            </button>

                            {/* Guardar dieta */}
                            <button
                                className="btn-header-icon btn-save-header"
                                onClick={handleSaveDiet}
                                disabled={!hasAnyRecipes}
                                title="Guardar Dieta Completa"
                            >
                                <Save size={18} />
                            </button>

                            {/* Cerrar */}
                            <button className="btn-close" onClick={onClose} title="Cerrar">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* PROGRESO */}
                    {isGeneratingDay && (
                        <div className="generation-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${generationProgress}%` }}
                                />
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
                            const dayHasRecipes = Object.values(weeklyDiet[day.key]).some(
                                (meals) => meals.length > 0
                            );

                            return (
                                <button
                                    key={day.key}
                                    className={`day-tab ${
                                        currentDay === day.key ? "active" : ""
                                    }`}
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

            {/* MODAL LISTA DE INGREDIENTES */}
            <Dialog
                open={isShoppingOpen}
                onClose={() => setIsShoppingOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Lista de ingredientes – Semana completa</DialogTitle>

                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                        Ingredientes únicos por día. Úsalo como checklist para las compras.
                    </Typography>

                    {Object.entries(shoppingList).map(([dayKey, items]) => {
                        if (!Array.isArray(items) || items.length === 0) return null;

                        const dayLabels = {
                            lunes: "Lunes",
                            martes: "Martes",
                            miercoles: "Miércoles",
                            jueves: "Jueves",
                            viernes: "Viernes",
                            sabado: "Sábado",
                            domingo: "Domingo",
                        };

                        const dayName = dayLabels[dayKey] || dayKey;

                        return (
                            <Box key={dayKey} sx={{ mb: 2.5 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 800,
                                        color: "primary.main",
                                        mb: 0.5,
                                    }}
                                >
                                    {dayName}
                                </Typography>

                                <Box
                                    component="ul"
                                    sx={{
                                        listStyle: "none",
                                        m: 0,
                                        p: 0,
                                        borderRadius: 2,
                                        border: "1px solid #e5e7eb",
                                        overflow: "hidden",
                                    }}
                                >
                                    {items.map((name, idx) => (
                                        <Box
                                            key={idx}
                                            component="li"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                px: 1.5,
                                                py: 0.5,
                                                borderBottom:
                                                    idx === items.length - 1
                                                        ? "none"
                                                        : "1px solid #f3f4f6",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: 1,
                                                    border: "1px solid #9ca3af",
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Typography variant="body2">{name}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setIsShoppingOpen(false)}>Cerrar</Button>
                    <Button
                        variant="contained"
                        onClick={handlePrintShoppingList}
                        startIcon={<Printer size={16} />}
                    >
                        Imprimir lista
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default DietGeneratorWeekly;
