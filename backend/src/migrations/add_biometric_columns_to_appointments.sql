-- ================================================================
-- MIGRACIÓN: Agregar columnas biométricas a tabla appointments
-- ================================================================
-- Fecha: 2025-01-02
-- Propósito: Guardar datos de IMC desde calculadora para pre-llenar SOAP
-- ================================================================

-- Agregar columnas para datos biométricos del paciente
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS patient_weight NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS patient_height NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS patient_age INTEGER,
    ADD COLUMN IF NOT EXISTS patient_gender VARCHAR(20),
    ADD COLUMN IF NOT EXISTS patient_bmi NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS patient_bmi_category VARCHAR(50);

-- Comentarios para documentación
COMMENT ON COLUMN appointments.patient_weight IS 'Peso del paciente en kg (desde calculadora IMC)';
COMMENT ON COLUMN appointments.patient_height IS 'Altura del paciente en cm (desde calculadora IMC)';
COMMENT ON COLUMN appointments.patient_age IS 'Edad del paciente en años';
COMMENT ON COLUMN appointments.patient_gender IS 'Género: Masculino/Femenino';
COMMENT ON COLUMN appointments.patient_bmi IS 'Índice de Masa Corporal calculado';
COMMENT ON COLUMN appointments.patient_bmi_category IS 'Categoría: Bajo Peso/Peso Normal/Sobrepeso/Obesidad';

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN (
                      'patient_weight',
                      'patient_height',
                      'patient_age',
                      'patient_gender',
                      'patient_bmi',
                      'patient_bmi_category'
    )
ORDER BY column_name;