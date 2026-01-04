import React, { useState, useEffect } from "react";
import "./DietGeneratorWeekly.css";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Flame,
    Beef,
    Wheat,
    Droplet,
    Calendar,
    Printer,
    Save,
    X,
    Lightbulb,
    User,       // <--- ESTE ERA EL QUE FALTABA Y CAUSABA EL ERROR
    CheckCircle
} from 'lucide-react';

import { printWeeklyDietPlan } from "../utils/printWeeklyDietPlan";

// --- CONFIGURACIÓN E ICONOS ---
const MEAL_CONFIG = {
    desayuno: { label: "Desayuno", icon: User, colorVar: "--meal-breakfast" }, // Usamos User temporalmente si no hay icono de sol
    media_manana: { label: "Media Mañana", icon: Clock, colorVar: "--meal-snack1" },
    almuerzo: { label: "Almuerzo", icon: Flame, colorVar: "--meal-lunch" },
    snack: { label: "Media Tarde", icon: Clock, colorVar: "--meal-snack2" },
    cena: { label: "Cena", icon: User, colorVar: "--meal-dinner" },
};

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// --- FUNCIONES AUXILIARES ---
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

// --- SUB-COMPONENTE: TARJETA DE RECETA ---
const RecipeCardItem = ({ receta }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="dg-recipe-item">
            <div className="dg-recipe-head" onClick={() => setIsOpen(!isOpen)}>
                <span>{receta.recetaNombre}</span>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    {receta.tiempoPrep && (
                        <span style={{fontSize:'0.8rem', color:'#64748B', display:'flex', alignItems:'center', gap:'4px'}}>
                            <Clock size={14}/> {receta.tiempoPrep}
                        </span>
                    )}
                    {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
            </div>
            {isOpen && (
                <div className="dg-recipe-content animate-slide-down">
                    <div className="dg-grid-recipe">
                        <div className="dg-ingredients">
                            <h5 style={{fontSize:'0.8rem', textTransform:'uppercase', color:'#94A3B8', marginBottom:'10px'}}>Ingredientes</h5>
                            <ul>
                                {receta.ingredientes?.map((i, k) => (
                                    <li key={k}><b>{i.grams}g</b> {i.alimento}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="dg-prep">
                            <h5 style={{fontSize:'0.8rem', textTransform:'uppercase', color:'#94A3B8', marginBottom:'10px'}}>Preparación</h5>
                            <ol>
                                {receta.instrucciones?.map((ins, k) => <li key={k}>{ins}</li>)}
                            </ol>
                        </div>
                    </div>
                    {receta.tips && (
                        <div className="dg-tip-box">
                            <Lightbulb size={20} color="#D97706" style={{flexShrink:0}} />
                            <p className="dg-tip-text">{receta.tips}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// --- COMPONENTE PRINCIPAL ---
const DietGeneratorWeekly = ({ onClose, onSave, initialData = {}, aiGeneratedMenu = {} }) => {
    const { targetKcal = 0, targetProtein = 0, targetCarbs = 0, targetFats = 0, patientName = "Paciente" } = initialData;
    const [currentDay, setCurrentDay] = useState("lunes");
    const [weeklyDiet, setWeeklyDiet] = useState({});
    const [expandedMealsState, setExpandedMealsState] = useState({});

    useEffect(() => {
        if (aiGeneratedMenu && Object.keys(aiGeneratedMenu).length > 0) {
            setWeeklyDiet(aiGeneratedMenu);
            // Expandir todas las comidas por defecto
            const initialState = {};
            DAYS.forEach(day => {
                Object.keys(MEAL_CONFIG).forEach(mealKey => {
                    initialState[`${day}-${mealKey}`] = true;
                });
            });
            setExpandedMealsState(initialState);
        }
    }, [aiGeneratedMenu]);

    const toggleMeal = (day, mealKey) => {
        setExpandedMealsState(prev => ({
            ...prev,
            [`${day}-${mealKey}`]: !prev[`${day}-${mealKey}`]
        }));
    };

    const getMealTotals = (day, mealKey) => {
        const recetas = weeklyDiet[day]?.[mealKey] || [];
        return roundTotals(sumTotals(recetas.flatMap(r => r.ingredientes || [])));
    };

    const getDayTotals = (day) => {
        const allIngredients = Object.keys(MEAL_CONFIG).flatMap(mealKey =>
            (weeklyDiet[day]?.[mealKey] || []).flatMap(r => r.ingredientes || [])
        );
        return roundTotals(sumTotals(allIngredients));
    };

    const handlePrint = () => {
        // Por ahora probaremos que los datos llegan bien
        console.log("Datos para imprimir:", weeklyDiet);

        // Cuando me pases el archivo, conectaremos esto:
        printWeeklyDietPlan({
            patientName,
            kcal: targetKcal,
            macros: { p: targetProtein, c: targetCarbs, f: targetFats },
            weeklyDiet: weeklyDiet, // Pasamos el menú nuevo
            brand: "NutriVida Pro"
        });
    };

    return (
        <div className="dg-container">
            {/* 1. HEADER SUPERIOR ESTÁTICO */}
            <header className="dg-header">
                <div className="dg-header-left">
                    <div className="dg-patient-avatar">
                        <User size={24} />
                    </div>
                    <div className="dg-titles">
                        <h2>Plan Nutricional: {patientName}</h2>
                        <span>Generador Inteligente de Menús</span>
                    </div>
                </div>
                <div className="dg-actions">
                    {/* 1. BOTÓN IMPRIMIR NUEVO */}
                    <button onClick={handlePrint} className="dg-btn dg-btn-outline" style={{marginRight:'auto'}}>
                        <Printer size={18} /> Imprimir
                    </button>

                    <button onClick={onClose} className="dg-btn dg-btn-outline">
                        <X size={18} /> Cerrar
                    </button>
                    <button onClick={() => onSave({ weeklyDiet, targetCalories: targetKcal })} className="dg-btn dg-btn-primary">
                        <Save size={18} /> Guardar Plan
                    </button>
                </div>
            </header>

            {/* 2. BARRA DE MACROS */}
            <div className="dg-macro-strip">
                <div className="dg-macro-stat">
                    <div className="dg-macro-icon" style={{background: '#FEF3C7', color:'#D97706'}}><Flame size={18}/></div>
                    <div className="dg-macro-info">
                        <span className="dg-macro-label">Calorías</span>
                        <span className="dg-macro-value">{targetKcal}</span>
                    </div>
                </div>
                <div className="dg-macro-stat">
                    <div className="dg-macro-icon" style={{background: '#FEE2E2', color:'#DC2626'}}><Beef size={18}/></div>
                    <div className="dg-macro-info">
                        <span className="dg-macro-label">Proteína</span>
                        <span className="dg-macro-value">{targetProtein}g</span>
                    </div>
                </div>
                <div className="dg-macro-stat">
                    <div className="dg-macro-icon" style={{background: '#FEF9C3', color:'#CA8A04'}}><Wheat size={18}/></div>
                    <div className="dg-macro-info">
                        <span className="dg-macro-label">Carbos</span>
                        <span className="dg-macro-value">{targetCarbs}g</span>
                    </div>
                </div>
                <div className="dg-macro-stat">
                    <div className="dg-macro-icon" style={{background: '#DCFCE7', color:'#16A34A'}}><Droplet size={18}/></div>
                    <div className="dg-macro-info">
                        <span className="dg-macro-label">Grasas</span>
                        <span className="dg-macro-value">{targetFats}g</span>
                    </div>
                </div>
            </div>

            {/* 3. WORKSPACE (SIDEBAR + MAIN) */}
            <div className="dg-workspace">

                {/* SIDEBAR DÍAS */}
                <aside className="dg-sidebar">
                    <div className="dg-sidebar-title">Calendario Semanal</div>
                    {DAYS.map(day => {
                        const dt = getDayTotals(day);
                        return (
                            <button
                                key={day}
                                onClick={() => setCurrentDay(day)}
                                className={`dg-day-btn ${currentDay === day ? 'active' : ''}`}
                            >
                                <span className="dg-day-name">{day}</span>
                                <span className="dg-day-calories">{dt.kcal} kcal</span>
                            </button>
                        )
                    })}
                </aside>

                {/* AREA PRINCIPAL DE COMIDAS */}
                <main className="dg-main-area">
                    <div className="dg-content-width">
                        <h3 style={{marginBottom: '24px', textTransform:'capitalize', fontSize:'1.5rem'}}>
                            Menú del {currentDay}
                        </h3>

                        {Object.entries(MEAL_CONFIG).map(([mealKey, config]) => {
                            const recetas = weeklyDiet[currentDay]?.[mealKey] || [];
                            const mt = getMealTotals(currentDay, mealKey);
                            const isExpanded = expandedMealsState[`${currentDay}-${mealKey}`];
                            const Icon = config.icon;

                            return (
                                <div key={mealKey} className={`dg-meal-card ${isExpanded ? 'expanded' : ''}`}>
                                    <div className="dg-meal-header-row" onClick={() => toggleMeal(currentDay, mealKey)}>
                                        <div className="dg-meal-left">
                                            <div className="dg-icon-box" style={{color: `var(${config.colorVar})`, background: `color-mix(in srgb, var(${config.colorVar}) 10%, white)`}}>
                                                <Icon size={22} />
                                            </div>
                                            <span className="dg-meal-title">{config.label}</span>
                                        </div>
                                        <div className="dg-meal-right">
                                            {mt.kcal > 0 && (
                                                <div className="dg-pill-group">
                                                    <span className="dg-pill kcal">{mt.kcal} kcal</span>
                                                    <span className="dg-pill">P {mt.proteina}</span>
                                                    <span className="dg-pill">C {mt.carbohidratos}</span>
                                                    <span className="dg-pill">G {mt.grasas}</span>
                                                </div>
                                            )}
                                            {isExpanded ? <ChevronUp size={20} color="#94A3B8"/> : <ChevronDown size={20} color="#94A3B8"/>}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="dg-meal-body-content">
                                            {recetas.length > 0 ? recetas.map((receta, idx) => (
                                                <RecipeCardItem key={idx} receta={receta} />
                                            )) : (
                                                <div style={{padding:'20px', textAlign:'center', color:'#94A3B8', fontStyle:'italic'}}>
                                                    No hay recetas asignadas
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DietGeneratorWeekly;