// frontend/src/utils/printWeeklyDietPlan.js
// ============================================
// Imprime un plan semanal (texto) con diseño profesional.
// Entrada esperada: el texto que guardas en education_provided.
// ============================================

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
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    } catch {
        const d = new Date(date);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
    }
}

/**
 * Parsea el texto generado por tu handleSaveDietFromGenerator
 * Ejemplo:
 * PLAN NUTRICIONAL SEMANAL (2069 kcal/día aprox):
 *
 * === LUNES ===
 *   * Desayuno:
 *     - Tigrillo...
 */
function parseWeeklyPlanText(planText = "") {
    const lines = String(planText).split(/\r?\n/);

    const days = [];
    let currentDay = null;
    let currentMeal = null;

    // Detecta el bloque desde "PLAN NUTRICIONAL SEMANAL"
    const startIndex = lines.findIndex((l) =>
        l.toUpperCase().includes("PLAN NUTRICIONAL SEMANAL")
    );
    const relevant = startIndex >= 0 ? lines.slice(startIndex) : lines;

    for (const raw of relevant) {
        const line = raw.trim();
        if (!line) continue;

        // === LUNES ===
        const dayMatch = line.match(/^===\s*(.+?)\s*===$/i);
        if (dayMatch) {
            currentDay = {
                name: dayMatch[1].toLowerCase(),
                meals: [],
            };
            days.push(currentDay);
            currentMeal = null;
            continue;
        }

        // * Desayuno:
        const mealMatch = line.match(/^\*\s*(.+?)\s*:\s*$/);
        if (mealMatch && currentDay) {
            currentMeal = {
                name: mealMatch[1],
                items: [],
            };
            currentDay.meals.push(currentMeal);
            continue;
        }

        // - item
        const itemMatch = line.match(/^-+\s*(.+)$/);
        if (itemMatch && currentMeal) {
            currentMeal.items.push(itemMatch[1]);
            continue;
        }

        // Si viene texto raro, lo pegamos como item para no perderlo
        if (currentMeal) {
            currentMeal.items.push(line);
        }
    }

    return days;
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

function mealBadge(name) {
    const n = name.toLowerCase();
    if (n.includes("desay")) return "🥣";
    if (n.includes("media") && n.includes("mañ")) return "🍎";
    if (n.includes("almuer")) return "🍲";
    if (n.includes("tarde") || n.includes("snack")) return "🥜";
    if (n.includes("cena")) return "🌙";
    return "🍽️";
}

export function printWeeklyDietPlan({
                                        patientName = "Paciente",
                                        kcal = "",
                                        macros = { p: "", c: "", f: "" },
                                        planText = "",
                                        brand = "NutriVida Pro",
                                        doctorLabel = "Consulta de Nutrición",
                                    } = {}) {
    const days = parseWeeklyPlanText(planText);

    if (!planText || days.length === 0) {
        alert("No se encontró una dieta semanal para imprimir.");
        return;
    }

    const today = formatDate(new Date());

    const htmlDays = days
        .map((d) => {
            const mealsHtml = (d.meals || [])
                .map((m) => {
                    const items = (m.items || [])
                        .map(
                            (it) => `<li class="item">${escapeHtml(it)}</li>`
                        )
                        .join("");

                    return `
            <section class="meal">
              <div class="meal-head">
                <div class="meal-title">
                  <span class="meal-emoji">${mealBadge(m.name)}</span>
                  <span>${escapeHtml(m.name)}</span>
                </div>
                <div class="meal-hint">✅ Cumple tu objetivo</div>
              </div>
              <ul class="items">
                ${items}
              </ul>
            </section>
          `;
                })
                .join("");

            return `
        <article class="day-card">
          <div class="day-top">
            <div class="day-name">${escapeHtml(prettyDayName(d.name))}</div>
            <div class="day-tag">Plan semanal</div>
          </div>
          ${mealsHtml}
          <div class="day-footer">
            <div class="footer-chip">💧 Agua: 6–8 vasos</div>
            <div class="footer-chip">🚶‍♂️ Movimiento: 20–30 min</div>
            <div class="footer-chip">🛌 Sueño: 7–8 h</div>
          </div>
        </article>
      `;
        })
        .join("");

    const win = window.open("", "_blank");
    if (!win) {
        alert("Tu navegador bloqueó la ventana de impresión. Permite pop-ups para este sitio.");
        return;
    }

    const safePatient = escapeHtml(patientName);
    const safeBrand = escapeHtml(brand);
    const safeDoctor = escapeHtml(doctorLabel);

    const kcalText = kcal ? `${escapeHtml(kcal)} kcal/día` : "—";
    const pText = macros?.p ? `${escapeHtml(macros.p)}g` : "—";
    const cText = macros?.c ? `${escapeHtml(macros.c)}g` : "—";
    const fText = macros?.f ? `${escapeHtml(macros.f)}g` : "—";

    const doc = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Dieta Semanal - ${safePatient}</title>

  <style>
    :root{
      --bg: #0b1220;
      --card: #0f1b33;
      --paper: #ffffff;
      --muted: #6b7280;
      --text: #0f172a;
      --accent: #4f46e5;
      --accent2: #a855f7;
      --soft: #f1f5f9;
      --border: #e5e7eb;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans";
      background: #f3f4f6;
      color: var(--text);
    }

    .page {
      max-width: 980px;
      margin: 24px auto;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(2,6,23,.08);
    }

    .hero {
      padding: 22px 26px;
      color: #fff;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
      position: relative;
    }

    .brand {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .brand-left h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: .2px;
    }

    .brand-left .sub {
      margin-top: 6px;
      opacity: .95;
      font-size: 13px;
    }

    .brand-right {
      text-align: right;
      font-size: 12px;
      opacity: .95;
      line-height: 1.5;
    }

    .chips {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .chip {
      background: rgba(255,255,255,.14);
      border: 1px solid rgba(255,255,255,.22);
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 12px;
      display: inline-flex;
      gap: 8px;
      align-items: center;
      backdrop-filter: blur(8px);
    }

    .chip b { color: #fff; font-weight: 800; }

    .content {
      padding: 18px 18px 24px;
    }

    .message {
      background: var(--soft);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 14px;
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }

    .message .title {
      font-weight: 800;
      font-size: 13px;
      color: #111827;
    }
    .message .text {
      color: #334155;
      font-size: 12.5px;
      line-height: 1.45;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .day-card {
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 10px 20px rgba(2,6,23,.05);
    }

    .day-top {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border-bottom: 1px solid var(--border);
    }

    .day-name {
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: #0f172a;
    }

    .day-tag {
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #eef2ff;
      border: 1px solid #e0e7ff;
      color: #3730a3;
      font-weight: 700;
    }

    .meal {
      padding: 12px 14px;
      border-bottom: 1px dashed #e5e7eb;
    }
    .meal:last-of-type { border-bottom: none; }

    .meal-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .meal-title {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      font-weight: 800;
      font-size: 13px;
      color: #111827;
    }

    .meal-emoji { font-size: 14px; }

    .meal-hint {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
    }

    .items {
      margin: 0;
      padding-left: 18px;
      color: #0f172a;
      font-size: 12.5px;
      line-height: 1.55;
    }

    .item { margin: 3px 0; }

    .day-footer {
      padding: 10px 12px 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: #fafafa;
      border-top: 1px solid var(--border);
    }

    .footer-chip {
      font-size: 11px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: #fff;
      color: #334155;
      font-weight: 700;
    }

    .footer-note {
      margin-top: 14px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.45;
      padding: 0 4px;
    }

    /* PRINT */
    @media print {
      body { background: #fff; }
      .page {
        margin: 0;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }
      .day-card { break-inside: avoid; }
    }
  </style>
</head>

<body>
  <div class="page">
    <header class="hero">
      <div class="brand">
        <div class="brand-left">
          <h1>${safeBrand} • Dieta Semanal</h1>
          <div class="sub">${safeDoctor}</div>
        </div>
        <div class="brand-right">
          <div><b>Paciente:</b> ${safePatient}</div>
          <div><b>Fecha:</b> ${escapeHtml(today)}</div>
        </div>
      </div>

      <div class="chips">
        <div class="chip">🔥 Meta: <b>${kcalText}</b></div>
        <div class="chip">🥩 Proteína: <b>${pText}</b></div>
        <div class="chip">🍞 Carbohidratos: <b>${cText}</b></div>
        <div class="chip">🥑 Grasas: <b>${fText}</b></div>
      </div>
    </header>

    <main class="content">
      <div class="message">
        <div class="title">Tu plan está diseñado para hacerlo fácil y constante</div>
        <div class="text">
          Sigue el orden del día, mantén horarios parecidos y prioriza lo “suficientemente bien”.
          La constancia gana. ✅
        </div>
      </div>

      <section class="grid">
        ${htmlDays}
      </section>

      <div class="footer-note">
        Nota: Este plan es una guía nutricional. Si algo no te gusta o no consigues un alimento, pide una alternativa equivalente.
      </div>
    </main>
  </div>

  <script>
    // Auto-abrir impresión (puedes comentar si prefieres que el usuario presione Ctrl+P)
    window.focus();
    window.print();
  </script>
</body>
</html>
  `;

    win.document.open();
    win.document.write(doc);
    win.document.close();
}
