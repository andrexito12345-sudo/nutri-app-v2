// frontend/src/utils/printWeeklyDietPlan.js

function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(date = new Date()) {
    try {
        return new Intl.DateTimeFormat("es-EC", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    } catch {
        return new Date().toLocaleDateString();
    }
}

// --- PARSERS ---

// 1. Parser Texto Plano (Antiguo)
function parseWeeklyPlanText(planText = "") {
    const lines = String(planText).split(/\r?\n/);
    const days = [];
    let currentDay = null;
    let currentMeal = null;

    const startIndex = lines.findIndex((l) => l.toUpperCase().includes("PLAN NUTRICIONAL SEMANAL"));
    const relevant = startIndex >= 0 ? lines.slice(startIndex) : lines;

    for (const raw of relevant) {
        const line = raw.trim();
        if (!line) continue;
        const dayMatch = line.match(/^===\s*(.+?)\s*===$/i);
        if (dayMatch) {
            currentDay = { name: dayMatch[1].toLowerCase(), meals: [] };
            days.push(currentDay);
            currentMeal = null;
            continue;
        }
        const mealMatch = line.match(/^\*\s*(.+?)\s*:\s*$/);
        if (mealMatch && currentDay) {
            currentMeal = { name: mealMatch[1], items: [] };
            currentDay.meals.push(currentMeal);
            continue;
        }
        if (currentMeal) {
            const itemMatch = line.match(/^-+\s*(.+)$/);
            currentMeal.items.push(itemMatch ? itemMatch[1] : line);
        }
    }
    return days;
}

// 2. Parser JSON (Nuevo - IA) - AHORA CON PREPARACIÓN
function parseWeeklyDietJSON(weeklyDiet) {
    const daysOrder = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const mealLabels = {
        desayuno: "Desayuno",
        media_manana: "Media Mañana",
        almuerzo: "Almuerzo",
        snack: "Media Tarde",
        cena: "Cena"
    };

    return daysOrder.map(dayKey => {
        const dayMeals = weeklyDiet[dayKey] || {};
        const meals = [];

        Object.entries(mealLabels).forEach(([key, label]) => {
            const recipes = dayMeals[key] || [];
            if (recipes.length > 0) {
                const items = recipes.map(r => {
                    // Nombre del plato
                    const name = `<div class="recipe-name">${escapeHtml(r.recetaNombre)}</div>`;
                    let details = "";

                    // Ingredientes
                    if(r.ingredientes && r.ingredientes.length > 0) {
                        // Ponemos los gramos en negrita para resaltar
                        const ingList = r.ingredientes.map(i => `<b>${i.grams}g</b> ${i.alimento}`).join(" • ");
                        details += `<div class="recipe-ing">${ingList}</div>`;
                    }

                    // 🔥 PREPARACIÓN (NUEVO) 🔥
                    if (r.instrucciones && r.instrucciones.length > 0) {
                        // Unimos los pasos (Ej: "1. Hervir. 2. Servir.") para ahorrar espacio vertical
                        const steps = r.instrucciones.map((s, i) => `${i+1}. ${s}`).join("  ");
                        details += `<div class="recipe-prep">👩‍🍳 ${escapeHtml(steps)}</div>`;
                    }

                    return name + details;
                });
                meals.push({ name: label, items: items, isHtml: true });
            }
        });
        return { name: dayKey, meals };
    }).filter(d => d.meals.length > 0);
}

function prettyDayName(day) {
    const map = { lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo" };
    return map[day] || day;
}

function mealIcon(name) {
    const n = name.toLowerCase();
    if (n.includes("desay")) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    if (n.includes("media") || n.includes("snack")) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/></svg>`;
    if (n.includes("almuer")) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    if (n.includes("cena")) return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    return "•";
}

// --- FUNCIÓN PRINCIPAL ---
export function printWeeklyDietPlan({
                                        patientName = "Paciente",
                                        kcal = "",
                                        macros = { p: "", c: "", f: "" },
                                        planText = "",
                                        weeklyDiet = null,
                                        brand = "NutriVida Pro",
                                        doctorLabel = "Nutrición Clínica & Dietética",
                                    } = {}) {

    let days = [];
    if (weeklyDiet && typeof weeklyDiet === 'object') {
        days = parseWeeklyDietJSON(weeklyDiet);
    } else {
        days = parseWeeklyPlanText(planText);
    }

    if (days.length === 0) {
        alert("No hay datos para imprimir.");
        return;
    }

    const today = formatDate(new Date());

    const htmlDays = days.map((d) => {
        const mealsHtml = (d.meals || []).map((m) => {
            const items = (m.items || []).map((it) => {
                const content = m.isHtml ? it : escapeHtml(it);
                return `<li class="item">${content}</li>`;
            }).join("");

            return `
            <div class="meal-row">
                <div class="meal-label">
                    ${mealIcon(m.name)} <span>${escapeHtml(m.name)}</span>
                </div>
                <ul class="meal-items">${items}</ul>
            </div>`;
        }).join("");

        return `
        <article class="day-card">
            <header class="day-header">
                <h3>${escapeHtml(prettyDayName(d.name))}</h3>
            </header>
            <div class="day-body">
                ${mealsHtml}
            </div>
        </article>`;
    }).join("");

    const win = window.open("", "_blank");
    if (!win) { alert("Permite ventanas emergentes."); return; }

    const doc = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Plan Nutricional - ${escapeHtml(patientName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :root {
        --primary: #2563EB;
        --primary-dark: #1e3a8a;
        --secondary: #64748b;
        --accent: #eff6ff;
        --border: #e2e8f0;
        --text: #0f172a;
    }

    body {
        font-family: 'Inter', sans-serif;
        color: var(--text);
        margin: 0;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .page-container { max-width: 210mm; margin: 0 auto; padding: 30px 40px; }

    /* HEADER */
    .header {
        display: flex; justify-content: space-between; align-items: flex-end;
        border-bottom: 3px solid var(--primary); padding-bottom: 15px; margin-bottom: 25px;
    }
    .brand-area h1 { margin: 0; color: var(--primary); font-size: 24px; font-weight: 800; }
    .brand-area p { margin: 4px 0 0; color: var(--secondary); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .patient-area { text-align: right; }
    .patient-name { font-size: 18px; font-weight: 700; color: var(--text); margin: 0; }
    .report-date { font-size: 13px; color: var(--secondary); margin-top: 4px; }

    /* MACROS */
    .macros-grid {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 30px;
    }
    .macro-card {
        background: var(--accent); border: 1px solid #dbeafe; padding: 12px;
        border-radius: 10px; text-align: center;
    }
    .macro-value { display: block; font-size: 18px; font-weight: 800; color: var(--primary-dark); }
    .macro-label { font-size: 10px; text-transform: uppercase; color: var(--secondary); letter-spacing: 0.5px; font-weight: 600; margin-top: 4px; display: block; }

    /* GRID */
    .week-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    }

    /* DAY CARD */
    .day-card {
        border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
        break-inside: avoid; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
    }
    .day-header {
        background: #f8fafc; border-bottom: 1px solid var(--border); padding: 8px 12px;
    }
    .day-header h3 { margin: 0; font-size: 13px; text-transform: uppercase; font-weight: 800; color: var(--primary); }
    .day-body { padding: 4px 0; }

    /* MEAL */
    .meal-row { padding: 8px 12px; border-bottom: 1px dashed var(--border); }
    .meal-row:last-child { border-bottom: none; }
    .meal-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 4px; }
    .meal-label svg { color: var(--primary); }
    .meal-items { list-style: none; padding: 0; margin: 0; }

    /* ITEMS */
    .item { margin-bottom: 8px; }
    .recipe-name { font-size: 12.5px; font-weight: 700; color: #0f172a; }
    .recipe-ing { font-size: 11px; color: #64748b; margin-top: 2px; }
    
    /* ESTILO DE LA PREPARACIÓN */
    .recipe-prep {
        font-size: 10.5px; 
        color: #475569; 
        margin-top: 4px; 
        background: #f1f5f9; 
        padding: 4px 6px; 
        border-radius: 4px; 
        line-height: 1.3;
        font-style: italic;
    }

    /* FOOTER */
    .footer { margin-top: 40px; border-top: 1px solid var(--border); padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }

    @media print {
        body { background: white; }
        .page-container { padding: 0; max-width: 100%; }
        .week-grid { display: grid; grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <header class="header">
        <div class="brand-area">
            <h1>${escapeHtml(brand)}</h1>
            <p>${escapeHtml(doctorLabel)}</p>
        </div>
        <div class="patient-area">
            <h2 class="patient-name">${escapeHtml(patientName)}</h2>
            <div class="report-date">${today}</div>
        </div>
    </header>

    <section class="macros-grid">
        <div class="macro-card"><span class="macro-value">${kcal || "—"}</span><span class="macro-label">Kcal / Día</span></div>
        <div class="macro-card"><span class="macro-value">${macros.p || "—"}g</span><span class="macro-label">Proteína</span></div>
        <div class="macro-card"><span class="macro-value">${macros.c || "—"}g</span><span class="macro-label">Carbos</span></div>
        <div class="macro-card"><span class="macro-value">${macros.f || "—"}g</span><span class="macro-label">Grasas</span></div>
    </section>

    <main class="week-grid">
        ${htmlDays}
    </main>

    <footer class="footer">
        <p>Generado por NutriVida Pro System</p>
    </footer>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    win.document.open();
    win.document.write(doc);
    win.document.close();
}