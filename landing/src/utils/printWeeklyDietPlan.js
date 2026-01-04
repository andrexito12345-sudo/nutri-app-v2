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

// 1) Parser Texto Plano (Legacy)
function parseWeeklyPlanText(planText = "") {
    const lines = String(planText).split(/\r?\n/);
    const days = [];
    let currentDay = null;
    let currentMeal = null;

    const startIndex = lines.findIndex((l) =>
        String(l).toUpperCase().includes("PLAN NUTRICIONAL SEMANAL")
    );
    const relevant = startIndex >= 0 ? lines.slice(startIndex) : lines;

    for (const raw of relevant) {
        const line = String(raw || "").trim();
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
            currentMeal = { name: mealMatch[1], items: [], isHtml: false };
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

// 2) Parser JSON (IA) - con preparación
function parseWeeklyDietJSON(weeklyDiet) {
    const daysOrder = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

    const mealDefs = [
        { label: "Desayuno", keys: ["desayuno", "BREAKFAST", "DESAYUNO"] },
        { label: "Colación 1", keys: ["media_manana", "MID_MORNING", "MEDIA_MAÑANA", "MEDIA_MANANA"] },
        { label: "Almuerzo", keys: ["almuerzo", "LUNCH", "ALMUERZO"] },
        { label: "Colación 2", keys: ["snack", "SNACK", "MEDIA_TARDE", "MEDIA TARDE"] },
        { label: "Merienda/Cena", keys: ["cena", "DINNER", "CENA"] },
    ];

    const normIngredient = (i) => {
        if (!i) return "";

        // formato viejo: { grams, alimento }
        if (i.grams != null && i.alimento) {
            return `<b>${escapeHtml(i.grams)}g</b> ${escapeHtml(i.alimento)}`;
        }

        // formato nuevo: { cantidad, unidad, alimento }
        const cantidad = i.cantidad ?? "";
        const unidad = i.unidad ?? "";
        const alimento = i.alimento ?? i.nombre ?? "";
        const parts = [cantidad, unidad, "de", alimento].filter(Boolean).join(" ");
        return escapeHtml(parts);
    };

    const normRecipe = (r) => {
        // a veces viene como { receta: {...} }
        const obj = r?.receta ? r.receta : r;

        const nombre = obj?.recetaNombre ?? obj?.nombre ?? obj?.name ?? "Receta";

        const ingredientes = Array.isArray(obj?.ingredientes) ? obj.ingredientes : [];
        const preparacion = Array.isArray(obj?.preparacion) ? obj.preparacion : [];
        const instrucciones = Array.isArray(obj?.instrucciones) ? obj.instrucciones : [];

        // acepta preparacion (nuevo) o instrucciones (viejo)
        const steps = preparacion.length ? preparacion : instrucciones;

        return { nombre, ingredientes, steps };
    };

    return daysOrder.map((dayKey) => {
        const dayMeals = weeklyDiet?.[dayKey] || {};

        const meals = mealDefs.map((md) => {
            let recipes = [];
            for (const k of md.keys) {
                if (Array.isArray(dayMeals?.[k]) && dayMeals[k].length) {
                    recipes = dayMeals[k];
                    break;
                }
            }

            const items = (recipes || []).map((r) => {
                const rr = normRecipe(r);

                const title = `<div class="recipe-name">${escapeHtml(rr.nombre)}</div>`;

                const ingList = rr.ingredientes.length
                    ? `<div class="recipe-ing">${rr.ingredientes.map(normIngredient).join(" • ")}</div>`
                    : "";

                // compacto (2 pasos máx)
                const prep = rr.steps.length
                    ? `<div class="recipe-prep">${escapeHtml(
                        rr.steps
                            .slice(0, 2)
                            .map((s, i) => `${i + 1}. ${String(s || "").trim()}`)
                            .join(" ")
                    )}</div>`
                    : "";

                return title + ingList + prep;
            });

            return { name: md.label, items, isHtml: true };
        });

        return { name: dayKey, meals };
    });
}

function prettyDayName(day) {
    const map = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
    };
    return map[day] || day;
}

function normKey(s) {
    return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function findMealByLabel(day, mealLabel) {
    const meals = day?.meals || [];
    const label = normKey(mealLabel);

    const aliases = {
        desayuno: ["desayuno"],
        "colacion 1": ["colacion 1", "media manana", "media man", "colacion1"],
        almuerzo: ["almuerzo"],
        "colacion 2": ["colacion 2", "media tarde", "snack", "colacion2", "merienda"],
        "merienda cena": ["merienda cena", "cena", "merienda"],
    };

    let wanted = [];
    if (label === "desayuno") wanted = aliases.desayuno;
    else if (label === "colacion 1") wanted = aliases["colacion 1"];
    else if (label === "almuerzo") wanted = aliases.almuerzo;
    else if (label === "colacion 2") wanted = aliases["colacion 2"];
    else if (label === "merienda cena" || label === "merienda/cena") wanted = aliases["merienda cena"];
    else wanted = [label];

    for (const m of meals) {
        const mn = normKey(m?.name);
        if (wanted.some((w) => mn === w || mn.startsWith(w) || mn.includes(w))) return m;
    }
    return null;
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
    const daysData =
        weeklyDiet && typeof weeklyDiet === "object"
            ? parseWeeklyDietJSON(weeklyDiet)
            : parseWeeklyPlanText(planText);

    if (!Array.isArray(daysData) || daysData.length === 0) {
        alert("No hay datos para imprimir.");
        return;
    }

    const today = formatDate(new Date());
    const dayKeys = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const dayMap = new Map(daysData.map((d) => [d.name, d]));

    const mealOrder = ["Desayuno", "Colación 1", "Almuerzo", "Colación 2", "Merienda/Cena"];

    const htmlTable = `
    <table class="weekly-table">
      <thead>
        <tr>
          <th class="col-meal">Comida</th>
          ${dayKeys.map((d) => `<th class="col-day">${escapeHtml(prettyDayName(d))}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${mealOrder
        .map((mealLabel) => {
            return `
              <tr>
                <th class="row-meal">${escapeHtml(mealLabel)}</th>
                ${dayKeys
                .map((dayKey) => {
                    const day = dayMap.get(dayKey);
                    const meal = findMealByLabel(day, mealLabel);
                    const isHtml = !!meal?.isHtml;

                    const cell = (meal?.items || [])
                        .map((x) => {
                            const content = isHtml ? String(x || "") : escapeHtml(String(x || ""));
                            return `<div class="cell-item">${content}</div>`;
                        })
                        .join("");

                    return `<td>${cell || `<span class="cell-empty">—</span>`}</td>`;
                })
                .join("")}
              </tr>
            `;
        })
        .join("")}
      </tbody>
    </table>
  `;

    const win = window.open("", "_blank");
    if (!win) {
        alert("Permite ventanas emergentes.");
        return;
    }

    const kcalTxt = kcal ? escapeHtml(String(kcal)) : "—";
    const pTxt = macros?.p ? `${escapeHtml(String(macros.p))}g` : "—";
    const cTxt = macros?.c ? `${escapeHtml(String(macros.c))}g` : "—";
    const fTxt = macros?.f ? `${escapeHtml(String(macros.f))}g` : "—";

    const doc = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Plan Nutricional - ${escapeHtml(patientName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @page { size: A4 landscape; margin: 10mm; }

    :root{
      --primary:#2563EB;
      --primary-dark:#1e3a8a;
      --secondary:#64748b;
      --accent:#eff6ff;
      --border:#e2e8f0;
      --text:#0f172a;
      --head:#f8fafc;
    }

    body{
      font-family:'Inter',sans-serif;
      color:var(--text);
      margin:0;
      background:#fff;
      -webkit-print-color-adjust:exact;
      print-color-adjust:exact;
    }

    .page-container{ max-width: 297mm; margin:0 auto; padding:10mm; }

    /* HEADER */
    .header{
      display:flex;
      justify-content:space-between;
      align-items:flex-end;
      border-bottom:3px solid var(--primary);
      padding-bottom:15px;
      margin-bottom:18px;
    }
    .brand-area h1{ margin:0; color:var(--primary); font-size:24px; font-weight:800; }
    .brand-area p{ margin:4px 0 0; color:var(--secondary); font-size:13px; font-weight:500; text-transform:uppercase; letter-spacing:1px; }
    .patient-area{ text-align:right; }
    .patient-name{ font-size:18px; font-weight:700; color:var(--text); margin:0; }
    .report-date{ font-size:13px; color:var(--secondary); margin-top:4px; }

    /* MACROS */
    .macros-grid{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:12px;
      margin: 14px 0 16px;
    }
    .macro-card{
      background:var(--accent);
      border:1px solid #dbeafe;
      padding:12px;
      border-radius:10px;
      text-align:center;
    }
    .macro-value{ display:block; font-size:18px; font-weight:800; color:var(--primary-dark); }
    .macro-label{
      font-size:10px;
      text-transform:uppercase;
      color:var(--secondary);
      letter-spacing:.5px;
      font-weight:600;
      margin-top:4px;
      display:block;
    }

    /* TABLE */
    .weekly-table{
      width:100%;
      border-collapse:separate;
      border-spacing:0;
      table-layout:fixed;
      border:1px solid var(--border);
      border-radius:12px;
      overflow:hidden;
      font-size:11px;
    }

    .weekly-table thead th{
      background:var(--head);
      color:#0f172a;
      font-weight:800;
      text-transform:uppercase;
      letter-spacing:.4px;
      font-size:10px;
      border-bottom:1px solid var(--border);
      padding:10px 8px;
    }

    .weekly-table th, .weekly-table td{
      border-right:1px solid var(--border);
      vertical-align:top;
    }
    .weekly-table th:last-child, .weekly-table td:last-child{ border-right:none; }

    .col-meal{ width: 12%; text-align:left; }
    .col-day{ width: calc(88% / 7); text-align:center; }

    .row-meal{
      background:#ffffff;
      font-weight:800;
      color:#334155;
      padding:10px 8px;
      border-bottom:1px solid var(--border);
      text-transform:uppercase;
      font-size:10px;
      letter-spacing:.3px;
    }

    .weekly-table tbody td{
      padding:8px 8px;
      border-bottom:1px solid var(--border);
      background:#fff;
    }
    .weekly-table tbody tr:last-child td,
    .weekly-table tbody tr:last-child th{
      border-bottom:none;
    }

    .cell-item{
      margin:0 0 8px 0;
      padding:8px;
      border:1px solid #eef2ff;
      background:#fbfdff;
      border-radius:10px;
      box-shadow: 0 1px 0 rgba(15,23,42,.03);
      line-height:1.25;
      word-wrap:break-word;
      overflow-wrap:anywhere;
    }
    .cell-item:last-child{ margin-bottom:0; }

    .cell-empty{ color:#94a3b8; font-weight:700; }

    .recipe-name{ font-size:12px; font-weight:800; color:#0f172a; }
    .recipe-ing{ font-size:10.5px; color:#64748b; margin-top:3px; }
    .recipe-prep{
      font-size:10.2px;
      color:#475569;
      margin-top:6px;
      background:#f1f5f9;
      padding:5px 7px;
      border-radius:8px;
      line-height:1.3;
      font-style:italic;
    }

    /* FOOTER */
    .footer{
      margin-top:16px;
      border-top:1px solid var(--border);
      padding-top:10px;
      text-align:center;
      font-size:10px;
      color:#94a3b8;
    }

    @media print{
      body{ background:#fff; }
      .page-container{ padding:0; max-width:100%; }
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
        <div class="report-date">${escapeHtml(today)}</div>
      </div>
    </header>

    <section class="macros-grid">
      <div class="macro-card"><span class="macro-value">${kcalTxt}</span><span class="macro-label">Kcal / Día</span></div>
      <div class="macro-card"><span class="macro-value">${pTxt}</span><span class="macro-label">Proteína</span></div>
      <div class="macro-card"><span class="macro-value">${cTxt}</span><span class="macro-label">Carbos</span></div>
      <div class="macro-card"><span class="macro-value">${fTxt}</span><span class="macro-label">Grasas</span></div>
    </section>

    <main class="print-area">
      ${htmlTable}
    </main>

    <footer class="footer">
      <p>Generado por NutriVida Pro System</p>
    </footer>
  </div>

  <script>
    window.print();
  </script>
</body>
</html>`;

    win.document.open();
    win.document.write(doc);
    win.document.close();
}
