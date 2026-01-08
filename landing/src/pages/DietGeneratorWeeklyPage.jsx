import React from "react";
import { useNavigate } from "react-router-dom";

// ⚠️ CAMBIA ESTA RUTA según dónde esté tu archivo real:
import DietGeneratorWeekly from "../components/DietGeneratorWeekly";

function DietGeneratorWeeklyPage() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(15,23,42,0.12)",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 700,
                    }}
                >
                    ← Volver
                </button>

                <div>
                    <h2 style={{ margin: 0 }}>Generador IA (Semanal)</h2>
                    <p style={{ margin: "4px 0 0", color: "rgba(15,23,42,0.6)", fontSize: 13 }}>
                        DietGeneratorWeekly
                    </p>
                </div>
            </div>

            <DietGeneratorWeekly
                initialData={{}}
                onClose={() => navigate("/doctora/dashboard")}   // o navigate(-1)
            />

        </div>
    );
}

export default DietGeneratorWeeklyPage;
