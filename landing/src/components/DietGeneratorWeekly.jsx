import React, { useState, useEffect } from "react";
import "./DietGenerator.css";

// --- ICONOS SVG ---
const Icons = {
    ChevronDown: () => (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    Clock: () => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Fire: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
            <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-5.23 3.5-8.5.93-1.3 2-2.65 3.17-4.05.35-.42.98-.42 1.33 0 1.17 1.4 2.24 2.75 3.17 4.05C16.83 9.77 18 12.48 18 15c0 4.42-4.03 8-6 8z" />
        </svg>
    ),
    Calendar: () => (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Print: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
    ),
    Save: () => (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    Lightbulb: () => (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
};

const MEAL_TIMES = {
    desayuno: { label: "Desayuno", color: "#f59e0b", icon: "☀️" },
    media_manana: { label: "Media Mañana", color: "#eab308", icon: "🍎" },
    almuerzo: { label: "Almuerzo", color: "#10b981", icon: "🍽️" },
    snack: { label: "Media Tarde", color: "#ef4444", icon: "🥤" },
    cena: { label: "Cena", color: "#6366f1", icon: "🌙" },
};

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

const sumTotals = (items) =>
    items.reduce(
        (acc, it) => ({
            kcal: acc.kcal + (Number(it.kcal) || 0),
            proteina: acc.proteina + (Number(it.proteina) || 0),
            carbohidratos: acc.carbohidratos + (Number(it.carbohidratos) || 0),
            grasas: acc.grasas + (Number(it.grasas) || 0),
        }),
        { kcal: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
    );

const roundTotals = (t) => ({
    kcal: Number((t.kcal || 0).toFixed(0)),
    proteina: Number((t.proteina || 0).toFixed(1)),
    carbohidratos: Number((t.carbohidratos || 0).toFixed(1)),
    grasas: Number((t.grasas || 0).toFixed(1)),
});

const MacroPill = ({ label, value, color, icon }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "#1f2937",
        padding: "6px 12px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        border: `1px solid ${color}60`,
        color: "white"
    }}>
        <span style={{ color }}>{icon}</span>
        <span>{label}:</span>
        <strong>{value}</strong>
    </div>
);

const RecipeCard = ({ receta, mealColor }) => {
    const [expanded, setExpanded] = useState(false);
    const totales = receta.totales || roundTotals(sumTotals(receta.ingredientes || []));
    return (
        <div style={{
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            marginBottom: "12px",
            border: `1px solid ${mealColor}30`,
            overflow: "hidden"
        }}>
            <div onClick={() => setExpanded(!expanded)}
                 style={{
                     cursor: "pointer",
                     padding: "14px 18px",
                     display: "flex",
                     justifyContent: "space-between",
                     alignItems: "center",
                     background: `${mealColor}15`
                 }}>
                <h4 style={{ margin: 0, fontWeight: "700", color: "#1e293b" }}>{receta.recetaNombre}</h4>
                <div style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <Icons.ChevronDown />
                </div>
            </div>
            {expanded && (
                <div style={{ padding: "14px 18px", borderTop: `1px solid ${mealColor}20` }}>
                    <strong>Ingredientes:</strong>
                    <ul>
                        {receta.ingredientes?.map((i, idx) => <li key={idx}>{i.alimento} - {i.grams}g</li>)}
                    </ul>
                    {receta.instrucciones && <>
                        <strong>Preparación:</strong>
                        <ol>
                            {receta.instrucciones.map((paso, idx) => <li key={idx}>{paso}</li>)}
                        </ol>
                    </>}
                    {receta.tips && (
                        <div style={{ background: "#fef3c7", borderLeft: "3px solid #f59e0b", padding: "8px 12px", borderRadius: "6px", marginTop: "8px" }}>
                            <strong>Tip:</strong> {receta.tips}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const DietGeneratorWeekly = ({ onClose, onSave, initialData = {}, aiGeneratedMenu = {} }) => {
    const { targetKcal = 0, targetProtein = 0, targetCarbs = 0, targetFats = 0, patientName = "Paciente" } = initialData;
    const [currentDay, setCurrentDay] = useState("lunes");
    const [weeklyDiet, setWeeklyDiet] = useState({});
    const [expandedMeals, setExpandedMeals] = useState({});

    useEffect(() => {
        if (aiGeneratedMenu && Object.keys(aiGeneratedMenu).length > 0) setWeeklyDiet(aiGeneratedMenu);
    }, [aiGeneratedMenu]);

    const toggleMeal = (day, mealKey) => {
        const key = `${day}-${mealKey}`;
        setExpandedMeals(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getMealTotals = (day, mealKey) => {
        const recetas = weeklyDiet[day]?.[mealKey] || [];
        return roundTotals(sumTotals(recetas.flatMap(r => r.ingredientes || [])));
    };

    const getDayTotals = (day) => {
        const allIngredients = Object.keys(MEAL_TIMES).flatMap(mealKey =>
            (weeklyDiet[day]?.[mealKey] || []).flatMap(r => r.ingredientes || [])
        );
        return roundTotals(sumTotals(allIngredients));
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "#1e293b", color: "white", boxShadow: "0 4px 12px -2px rgba(0,0,0,0.15)" }}>
                <h2 style={{ margin: 0 }}>{patientName} - Plan Semanal</h2>
                <div style={{ display: "flex", gap: "12px" }}>
                    <MacroPill label="Calorías" value={`${targetKcal} kcal`} color="#fb923c" icon={<Icons.Fire />} />
                    <MacroPill label="Proteína" value={`${targetProtein}g`} color="#f87171" icon="🥩" />
                    <MacroPill label="Carbos" value={`${targetCarbs}g`} color="#fbbf24" icon="🍞" />
                    <MacroPill label="Grasas" value={`${targetFats}g`} color="#a3e635" icon="🥑" />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: "6px", background: "#ef4444", color: "white", fontWeight: 600 }}>Cancelar</button>
                    <button onClick={() => onSave({ weeklyDiet, targetCalories: targetKcal })} style={{ padding: "8px 14px", borderRadius: "6px", background: "#3b82f6", color: "white", fontWeight: 600 }}>Guardar</button>
                </div>
            </div>

            {/* BARRA DÍAS */}
            <div style={{ display: "flex", background: "white", padding: "10px 20px", gap: "6px", overflowX: "auto", borderBottom: "1px solid #e2e8f0" }}>
                {DAYS.map(day => {
                    const dt = getDayTotals(day);
                    const active = currentDay === day;
                    return (
                        <button key={day} onClick={() => setCurrentDay(day)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    fontWeight: active ? 700 : 500,
                                    background: active ? "#3b82f6" : "#f1f5f9",
                                    color: active ? "white" : "#64748b",
                                    cursor: "pointer"
                                }}>
                            {day.charAt(0).toUpperCase() + day.slice(1)} ({dt.kcal} kcal)
                        </button>
                    )
                })}
            </div>

            {/* CONTENIDO */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                {Object.entries(MEAL_TIMES).map(([mealKey, meal]) => {
                    const recetas = weeklyDiet[currentDay]?.[mealKey] || [];
                    const mt = getMealTotals(currentDay, mealKey);
                    const expanded = expandedMeals[`${currentDay}-${mealKey}`];
                    return (
                        <div key={mealKey} style={{ marginBottom: "16px", borderRadius: "10px", background: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                            {/* HEADER COMIDA */}
                            <div onClick={() => toggleMeal(currentDay, mealKey)}
                                 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", background: `${meal.color}15` }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <span style={{ fontSize: "1.5rem" }}>{meal.icon}</span>
                                    <h3 style={{ margin: 0, fontWeight: 700, color: "#1e293b" }}>{meal.label}</h3>
                                </div>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <span>{mt.kcal} kcal</span>
                                    <span style={{ color: "#ef4444" }}>P {mt.proteina}g</span>
                                    <span style={{ color: "#f59e0b" }}>C {mt.carbohidratos}g</span>
                                    <span style={{ color: "#10b981" }}>G {mt.grasas}g</span>
                                    <div style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                                        <Icons.ChevronDown />
                                    </div>
                                </div>
                            </div>

                            {expanded && (
                                <div style={{ padding: "14px 18px" }}>
                                    {recetas.length > 0 ? recetas.map((receta, idx) => <RecipeCard key={idx} receta={receta} mealColor={meal.color} />) :
                                        <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>Sin recetas</div>}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DietGeneratorWeekly;
