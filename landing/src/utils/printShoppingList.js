// frontend/src/utils/printShoppingList.js

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
        return date.toLocaleDateString("es-EC");
    }
}

/**
 * shoppingListByDay debe ser un objeto así:
 * {
 *   lunes: ["Aguacate", "Aceite de oliva", ...],
 *   martes: ["Yogurt griego", ...],
 *   ...
 * }
 */
export function printShoppingList({ brand = "", patientName = "", shoppingListByDay = {} }) {
    const dayLabels = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
    };

    const sectionsHtml = Object.entries(shoppingListByDay)
        .filter(([, items]) => Array.isArray(items) && items.length > 0)
        .map(([dayKey, items]) => {
            const dayName = dayLabels[dayKey] || dayKey;

            const itemsHtml = items
                .map((name) => {
                    const safeName = escapeHtml(name || "");
                    return `
                        <li class="ingredient-item">
                            <span class="checkbox"></span>
                            <span class="ingredient-name">${safeName}</span>
                        </li>
                    `;
                })
                .join("");

            return `
                <section class="day-section">
                    <h2>${dayName}</h2>
                    <ul class="ingredient-list">
                        ${itemsHtml}
                    </ul>
                </section>
            `;
        })
        .join("");

    if (!sectionsHtml) {
        alert("No hay ingredientes para imprimir.");
        return;
    }

    const today = formatDate();

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Lista de ingredientes – ${escapeHtml(patientName)}</title>
  <style>
    @page {
        margin: 18mm;
    }
    body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111827;
        font-size: 12px;
    }
    h1 {
        font-size: 20px;
        margin: 0 0 4px 0;
    }
    h2 {
        font-size: 15px;
        margin: 18px 0 6px 0;
        color: #4f46e5;
    }
    .meta {
        font-size: 11px;
        color: #6b7280;
        margin: 0 0 4px 0;
    }
    hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 10px 0 12px 0;
    }
    .day-section {
        page-break-inside: avoid;
    }
    .ingredient-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .ingredient-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 0;
        border-bottom: 1px solid #f3f4f6;
    }
    .checkbox {
        width: 14px;
        height: 14px;
        border: 1px solid #9ca3af;
        border-radius: 3px;
        flex-shrink: 0;
    }
    .ingredient-name {
        flex: 1;
    }
  </style>
</head>
<body>
  <h1>Lista de ingredientes – Semana completa</h1>
  <p class="meta">
    ${brand ? escapeHtml(brand) + " • " : ""}Paciente: ${escapeHtml(patientName)}
  </p>
  <p class="meta">Fecha: ${escapeHtml(today)}</p>
  <hr />
  ${sectionsHtml}
</body>
</html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
