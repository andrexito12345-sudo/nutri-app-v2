import React, { useState, useEffect, useMemo } from "react";
import { foodDatabase } from "../data/foodDatabase";
import { toast } from "react-toastify";
import "./DietGenerator.css";

// --- ICONOS SVG PROFESIONALES ---
const Icons = {
    Search: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Save: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Plus: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Calendar: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Filter: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Print: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    MacroFire: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400"><path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-5.23 3.5-8.5.93-1.3 2-2.65 3.17-4.05.35-.42.98-.42 1.33 0 1.17 1.4 2.24 2.75 3.17 4.05C16.83 9.77 18 12.48 18 15c0 4.42-4.03 8-6 8z"/></svg>,
};

const MEAL_TIMES = {
    BREAKFAST: { id: "breakfast", label: "Desayuno", color: "#f59e0b" },
    MID_MORNING: { id: "mid_morning", label: "Media Mañana", color: "#eab308" },
    LUNCH: { id: "lunch", label: "Almuerzo", color: "#10b981" },
    SNACK: { id: "snack", label: "Media Tarde", color: "#ef4444" },
    DINNER: { id: "dinner", label: "Cena", color: "#6366f1" },
};

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

const DietGeneratorWeekly = ({ onClose, onSave, initialData = {}, aiGeneratedMenu = {} }) => {
    // RECIBIMOS LOS NUEVOS DATOS DE MACROS
    const {
        targetKcal = 0,
        targetProtein = 0,
        targetCarbs = 0,
        targetFats = 0,
        patientName = "Paciente"
    } = initialData;

    const [currentDay, setCurrentDay] = useState("lunes");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("Todos");
    const [openMenuId, setOpenMenuId] = useState(null);

    const categories = useMemo(() => {
        const groups = new Set(foodDatabase.map(f => f.grupo));
        return ["Todos", ...Array.from(groups).sort()];
    }, []);

    const [weeklyDiet, setWeeklyDiet] = useState(() => {
        const initialWeek = {};
        DAYS.forEach(day => {
            initialWeek[day] = { BREAKFAST: [], MID_MORNING: [], LUNCH: [], SNACK: [], DINNER: [] };
        });
        return initialWeek;
    });

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // --- PROCESADOR DE IA ---
    useEffect(() => {
        if (aiGeneratedMenu && Object.keys(aiGeneratedMenu).length > 0) {
            const newDiet = { ...weeklyDiet };
            Object.keys(aiGeneratedMenu).forEach(key => {
                const normalizedDay = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (DAYS.includes(normalizedDay)) {
                    const meals = aiGeneratedMenu[key];
                    const parseMeal = (item, k) => item ? {
                        uniqueId: Math.random().toString(36),
                        alimento: typeof item === 'string' ? item : (item.comida || item.alimento || "Opción"),
                        cantidad: 1,
                        kcal: Number(item.calorias || item.kcal || k),
                        isAI: true
                    } : null;

                    if (meals.desayuno) newDiet[normalizedDay].BREAKFAST = [parseMeal(meals.desayuno, 400)];
                    if (meals.media_manana) newDiet[normalizedDay].MID_MORNING = [parseMeal(meals.media_manana, 150)];
                    if (meals.almuerzo) newDiet[normalizedDay].LUNCH = [parseMeal(meals.almuerzo, 700)];
                    if (meals.snack) newDiet[normalizedDay].SNACK = [parseMeal(meals.snack, 200)];
                    if (meals.cena) newDiet[normalizedDay].DINNER = [parseMeal(meals.cena, 500)];
                }
            });
            setWeeklyDiet(newDiet);
        }
    }, [aiGeneratedMenu]);

    const filteredFoods = useMemo(() => {
        return foodDatabase.filter(food => {
            const matchesSearch = food.alimento.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup = selectedGroup === "Todos" || food.grupo === selectedGroup;
            return matchesSearch && matchesGroup;
        }).slice(0, 100);
    }, [searchTerm, selectedGroup]);

    const addFoodManual = (mealKey, food) => {
        const newItem = { ...food, uniqueId: Math.random().toString(), cantidad: 100, isAI: false };
        setWeeklyDiet(prev => ({
            ...prev,
            [currentDay]: { ...prev[currentDay], [mealKey]: [...prev[currentDay][mealKey], newItem] }
        }));
        toast.info(`Agregado a ${MEAL_TIMES[mealKey].label}`);
        setOpenMenuId(null);
    };

    const removeFood = (mealKey, id) => {
        setWeeklyDiet(prev => ({
            ...prev,
            [currentDay]: { ...prev[currentDay], [mealKey]: prev[currentDay][mealKey].filter(i => i.uniqueId !== id) }
        }));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        let htmlContent = `
        <html><head><title>Plan Nutricional - ${patientName}</title>
        <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
            .header h1 { margin: 0; color: #1e3a8a; }
            .meta { margin-top: 10px; font-size: 0.9rem; }
            .day-box { break-inside: avoid; margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .day-title { background: #f8fafc; padding: 8px 15px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; color: #475569; }
            .meal-row { display: flex; padding: 10px 15px; border-bottom: 1px solid #f1f5f9; }
            .meal-row:last-child { border-bottom: none; }
            .meal-name { width: 130px; font-weight: 600; color: #64748b; font-size: 0.85rem; }
            .meal-items { flex: 1; font-size: 0.9rem; }
        </style></head><body>
        <div class="header">
            <h1>Plan Nutricional Semanal</h1>
            <div class="meta">Paciente: <strong>${patientName}</strong> | Meta: <strong>${targetKcal} kcal</strong> (P:${targetProtein}g, C:${targetCarbs}g, G:${targetFats}g)</div>
        </div>`;
        DAYS.forEach(day => {
            const dayData = weeklyDiet[day];
            if (Object.values(dayData).some(arr => arr.length > 0)) {
                htmlContent += `<div class="day-box"><div class="day-title">${day}</div>`;
                Object.entries(MEAL_TIMES).forEach(([key, meal]) => {
                    if (dayData[key].length > 0) {
                        htmlContent += `<div class="meal-row"><div class="meal-name">${meal.label}</div><div class="meal-items">${dayData[key].map(i => typeof i.alimento === 'string' ? i.alimento : 'Opción').join(', ')}</div></div>`;
                    }
                });
                htmlContent += `</div>`;
            }
        });
        htmlContent += `<script>window.print();</script></body></html>`;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // --- COMPONENTE DE PÍLDORA DE MACRO (ELEGANTE) ---
    const MacroPill = ({ label, value, color, icon }) => (
        <div style={{display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'500', border:`1px solid ${color}40`}}>
            <span style={{color: color}}>{icon}</span>
            <span style={{opacity:0.8}}>{label}:</span>
            <strong style={{color:'white'}}>{value}</strong>
        </div>
    );

    return (
        <div className="diet-generator weekly-mode" style={{display:'flex', flexDirection:'column', height:'100%', background:'#f8fafc', fontFamily:'Inter, sans-serif'}}>

            {/* HEADER SUPERIOR ELEGANTE */}
            <div style={{background:'#1e293b', color:'white', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 12px -2px rgba(0,0,0,0.15)', position:'relative', zIndex:10}}>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <Icons.Calendar/>
                        <h2 style={{margin:0, fontSize:'1.25rem', fontWeight:'700', letterSpacing:'0.3px'}}>Plan Semanal: {patientName}</h2>
                    </div>
                    {/* NUEVA BARRA DE METAS (MACROS) */}
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                        <MacroPill label="Calorías" value={`${targetKcal} kcal`} color="#fb923c" icon={<Icons.MacroFire/>}/>
                        <MacroPill label="Proteína" value={`${targetProtein}g`} color="#f87171" icon="🥩"/>
                        <MacroPill label="Carbos" value={`${targetCarbs}g`} color="#fbbf24" icon="🍞"/>
                        <MacroPill label="Grasas" value={`${targetFats}g`} color="#a3e635" icon="🥑"/>
                    </div>
                </div>

                <div style={{display:'flex', gap:'12px'}}>
                    <button onClick={handlePrint} style={{background:'white', border:'none', color:'#1e293b', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', transition:'all 0.2s'}}>
                        <Icons.Print/> Imprimir
                    </button>
                    <button onClick={onClose} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'0.9rem', transition:'all 0.2s'}}>Cancelar</button>
                    <button onClick={() => onSave({ weeklyDiet, targetKcal })} style={{background:'#3b82f6', border:'none', color:'white', padding:'8px 24px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.95rem', boxShadow:'0 4px 6px -1px rgba(59, 130, 246, 0.5)', transition:'all 0.2s'}}>
                        <Icons.Save/> Guardar Plan
                    </button>
                </div>
            </div>

            {/* BARRA DE DÍAS (MEJORADA) */}
            <div style={{background:'white', padding:'12px 24px', borderBottom:'1px solid #e2e8f0', overflowX:'auto', display:'flex', gap:'8px', boxShadow:'inset 0 -2px 4px rgba(0,0,0,0.02)'}}>
                {DAYS.map(day => {
                    const isActive = currentDay === day;
                    return (
                        <button
                            key={day}
                            onClick={() => setCurrentDay(day)}
                            style={{
                                padding: '8px 20px', border: 'none', borderRadius: '8px',
                                background: isActive ? '#3b82f6' : 'transparent',
                                color: isActive ? 'white' : '#64748b',
                                cursor: 'pointer', textTransform: 'capitalize', fontWeight: isActive ? '700' : '600',
                                fontSize: '0.9rem', transition: 'all 0.2s',
                                borderBottom: isActive ? 'none' : '2px solid transparent',
                                boxShadow: isActive ? '0 2px 4px rgba(59,130,246,0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => !isActive && (e.target.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => !isActive && (e.target.style.background = 'transparent')}
                        >
                            {day}
                        </button>
                    )})}
            </div>

            {/* WORKSPACE */}
            <div style={{display:'flex', flex:1, overflow:'hidden', padding:'24px', gap:'24px', background:'#f1f5f9'}}>

                {/* SIDEBAR */}
                <div style={{width:'340px', background:'white', borderRadius:'16px', display:'flex', flexDirection:'column', border:'1px solid #e2e8f0', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)', overflow:'hidden'}}>
                    <div style={{padding:'20px', borderBottom:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'12px'}}>
                        <div style={{position:'relative'}}>
                            <input type="text" placeholder="Buscar alimento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{padding:'12px 12px 12px 40px', borderRadius:'10px', border:'1px solid #cbd5e1', width:'100%', fontSize:'0.95rem', outline:'none'}} />
                            <span style={{position:'absolute', left:'12px', top:'12px', color:'#94a3b8'}}><Icons.Search/></span>
                        </div>
                        <div style={{position:'relative'}}>
                            <span style={{position:'absolute', left:'12px', top:'12px', color:'#64748b'}}><Icons.Filter/></span>
                            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} style={{width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontSize:'0.9rem', cursor:'pointer', appearance:'none', fontWeight:'500'}}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <span style={{position:'absolute', right:'12px', top:'14px', pointerEvents:'none', fontSize:'0.7rem', color:'#64748b'}}>▼</span>
                        </div>
                    </div>
                    <div style={{flex:1, overflowY:'auto', padding:'0'}}>
                        {filteredFoods.map(food => (
                            <div key={food.id} style={{padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative'}}>
                                <div style={{paddingRight:'10px'}}>
                                    <div style={{fontWeight:'600', fontSize:'0.9rem', color:'#1e293b', marginBottom:'2px'}}>{food.alimento}</div>
                                    <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{food.grupo} • <span style={{color:'#10b981', fontWeight:'bold'}}>{food.kcal} kcal</span></div>
                                </div>
                                <div style={{position:'relative'}}>
                                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === food.id ? null : food.id); }} style={{width:'32px', height:'32px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', color:'#3b82f6', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <Icons.Plus/>
                                    </button>
                                    {openMenuId === food.id && (
                                        <div style={{position:'absolute', right:'110%', top:'-50%', zIndex:50, background:'white', border:'1px solid #e2e8f0', borderRadius:'12px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)', width:'180px', padding:'8px'}} onClick={(e) => e.stopPropagation()}>
                                            <div style={{fontSize:'0.7rem', color:'#94a3b8', padding:'4px 8px', textTransform:'uppercase', fontWeight:'bold'}}>Agregar a:</div>
                                            {Object.entries(MEAL_TIMES).map(([key, meal]) => (
                                                <button key={key} onClick={() => addFoodManual(key, food)} style={{width:'100%', textAlign:'left', padding:'8px 10px', border:'none', background:'transparent', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontSize:'0.85rem', color:'#475569'}} onMouseEnter={(e) => e.target.style.background = '#f1f5f9'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                                                    <span style={{width:'8px', height:'8px', borderRadius:'50%', background: meal.color}}></span>{meal.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMNAS DEL DÍA */}
                <div style={{flex:1, display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'5px'}}>
                    {Object.entries(MEAL_TIMES).map(([key, meal]) => {
                        const items = weeklyDiet[currentDay][key];
                        const totalMealKcal = items.reduce((sum, item) => sum + (Number(item.kcal) || 0), 0);
                        return (
                            <div key={key} style={{flex:1, minWidth:'240px', background:'white', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', flexDirection:'column', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.02)'}}>
                                <div style={{padding:'16px', borderBottom:`3px solid ${meal.color}`, background:'#f8fafc', borderTopLeftRadius:'16px', borderTopRightRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span style={{fontWeight:'700', color:'#334155', fontSize:'0.95rem'}}>{meal.label}</span>
                                    <span style={{fontSize:'0.75rem', background:'white', padding:'4px 8px', borderRadius:'6px', border:'1px solid #e2e8f0', color:'#64748b', fontWeight:'600'}}>{totalMealKcal} kcal</span>
                                </div>
                                <div style={{flex:1, padding:'12px', display:'flex', flexDirection:'column', gap:'12px', overflowY:'auto'}}>
                                    {items.map(item => (
                                        <div key={item.uniqueId} style={{background:'white', padding:'12px', borderRadius:'10px', boxShadow:'0 2px 4px rgba(0,0,0,0.04)', border:'1px solid #f1f5f9', position:'relative'}}>
                                            <div style={{fontSize:'0.9rem', fontWeight:'500', color:'#1e293b', marginBottom:'6px', paddingRight:'20px', lineHeight:'1.3'}}>{typeof item.alimento === 'string' ? item.alimento : 'Opción'}</div>
                                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                <span style={{fontSize:'0.75rem', color:'#94a3b8', background:'#f8fafc', padding:'2px 6px', borderRadius:'4px'}}>{item.cantidad > 1 ? `${item.cantidad}g` : '1 porción'}</span>
                                                <span style={{fontSize:'0.75rem', color:'#10b981', fontWeight:'600'}}>{item.kcal} kcal</span>
                                            </div>
                                            <button onClick={() => removeFood(key, item.uniqueId)} style={{position:'absolute', top:'8px', right:'8px', background:'transparent', border:'none', color:'#cbd5e1', cursor:'pointer', padding:'2px'}}><Icons.Trash/></button>
                                        </div>
                                    ))}
                                    {items.length === 0 && (<div style={{textAlign:'center', padding:'40px 10px', color:'#cbd5e1', fontSize:'0.85rem', border:'2px dashed #f1f5f9', borderRadius:'10px', margin:'10px'}}>Vacío</div>)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default DietGeneratorWeekly;