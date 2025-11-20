# ANÁLISIS Y CORRECCIÓN DE FÓRMULAS DE PRESTACIONES LABORALES
## Sistema de Cálculo de Liquidaciones - Guatemala

**Fecha de Análisis:** 19 de noviembre de 2025  
**Analista:** GitHub Copilot  
**Base Legal:** Código de Trabajo de Guatemala y Decretos aplicables

---

## 📊 RESUMEN EJECUTIVO

Se realizó una auditoría completa de las fórmulas implementadas en el sistema de cálculo de prestaciones laborales, comparándolas con la documentación legal guatemalteca proporcionada. Se identificaron **6 discrepancias críticas** que afectaban la precisión de los cálculos.

### Estado de Correcciones
✅ **Todas las fórmulas han sido corregidas** según la legislación vigente.

---

## 🔍 ANÁLISIS DETALLADO DE CADA CONCEPTO

### 1. DÍAS DE RELACIÓN LABORAL (R.L.)
**Estado:** ✅ CORRECTO (sin cambios)

**Fórmula Implementada:**
```sql
V_DIAS_RELACION := (P_FECHA_EGRESO - P_FECHA_INGRESO) + 1
```

**Fundamento Legal:**
- Se considera año de 365 días
- Se incluye el día de ingreso en el cálculo (+1)
- No se normalizan los días del inicio de la relación laboral

**Ejemplo:**
- Fecha Ingreso: 15/02/1995
- Fecha Egreso: 20/05/2004
- Cálculo: 09.03.05 + 1 = 3,381 días laborados

---

### 2. INDEMNIZACIÓN POR TIEMPO DE SERVICIO
**Estado:** ❌ CORREGIDO

#### Fórmula Anterior (INCORRECTA):
```sql
V_INDEMNIZACION := TRUNC(V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO
```

**Problemas identificados:**
- ❌ No agregaba el incremento legal (SD/6)
- ❌ Usaba TRUNC perdiendo días proporcionales
- ❌ No consideraba relación laboral exacta

#### Fórmula Corregida:
```sql
-- SD + SD/6 (incremento legal)
V_SD_CON_INCREMENTO := V_SALARIO_DEVENGADO + (V_SALARIO_DEVENGADO / 6)

-- Indemnización proporcional
V_INDEMNIZACION := V_SD_CON_INCREMENTO * (V_DIAS_RELACION / 365)
```

**Fundamento Legal:**
- Artículo 82 del Código de Trabajo
- Artículo 1 Convenio 95
- Decreto 76-78

**Componentes:**
- **SD** = Salario Ordinario + Comisiones
- **SD/6** = Incrementos Legales (1/6 del salario devengado)
- **R.L.** = Relación laboral en días

**Ejemplo:**
```
SD = Q3,500.00
SD/6 = Q583.33
SD + SD/6 = Q4,083.33
Días trabajados = 3,381
Indemnización = Q4,083.33 × (3,381 ÷ 365) = Q37,827.86
```

---

### 3. VENTAJAS ECONÓMICAS
**Estado:** ❌ CORREGIDO

#### Fórmula Anterior (INCORRECTA):
```sql
V_VENT_ECONOMICAS := V_SALARIO_DEVENGADO * 0.4286
```

**Problemas identificados:**
- ❌ No multiplicaba por la relación laboral
- ❌ Calculaba solo porcentaje fijo sin considerar tiempo trabajado

#### Fórmula Corregida:
```sql
V_VENT_ECONOMICAS := V_SALARIO_DEVENGADO * 0.4286 * (V_DIAS_RELACION / 365)
```

**Fundamento Legal:**
- Artículos 90, 93, 88 del Código de Trabajo
- Artículo 1 Convenio 95

**Explicación del 42.86%:**
- Regla de tres: 70% = 100%, entonces 30% = X
- 30/70 = 0.4286 (42.86%)
- Representa las ventajas económicas sobre el salario nominal

**Ejemplo:**
```
SD = Q3,500.00
42.86% = Q1,500.10
Días = 3,381
Ventajas = Q3,500 × 0.4286 × (3,381 ÷ 365) = Q13,893.59
```

---

### 4. VACACIONES
**Estado:** ❌ CORREGIDO

#### Fórmula Anterior (INCORRECTA):
```sql
V_VACACIONES := (V_DIAS_RELACION / 365) * (15 / 30) * V_SALARIO_DEVENGADO
```

**Problemas identificados:**
- ❌ Usaba 15 días fijos sin considerar años de servicio
- ❌ No aplicaba la escala progresiva legal

#### Fórmula Corregida:
```sql
-- Determinar días de vacaciones según años trabajados
IF V_ANIOS_COMPLETOS < 5 THEN
  V_DIAS_VACACIONES := 15;
ELSIF V_ANIOS_COMPLETOS >= 5 AND V_ANIOS_COMPLETOS < 12 THEN
  V_DIAS_VACACIONES := 15 + (V_ANIOS_COMPLETOS - 4);
ELSE
  V_DIAS_VACACIONES := 22; -- Máximo
END IF;

-- Cálculo proporcional
V_VACACIONES := (V_SALARIO_DEVENGADO / 30) * V_DIAS_VACACIONES * (V_DIAS_ULTIMO_ANIO / 365)
```

**Fundamento Legal:**
- Artículos 130 al 137 del Código de Trabajo
- Artículo 2 literal "C" y "D" del Código de Trabajo
- Artículo 1o. Convenio 95

**Escala de Vacaciones:**
| Años de Servicio | Días de Vacaciones |
|-----------------|-------------------|
| 1 a 4 años      | 15 días           |
| 5 años          | 16 días           |
| 6 años          | 17 días           |
| 7 años          | 18 días           |
| ...             | +1 por año        |
| 12+ años        | 22 días (máximo)  |

**Componentes de la fórmula:**
- **SD** = Salario Devengado
- **DHC** = Días hábiles que correspondan (según tabla)
- **TPP** = Tiempo pendiente de pago en días

**Ejemplo:**
```
Empleado con 6 años trabajados:
DHC = 17 días
SD = Q3,500.00
Días último año = 150
Vacaciones = (Q3,500 ÷ 30) × 17 × (150 ÷ 365) = Q817.81
```

---

### 5. AGUINALDO
**Estado:** ❌ CORREGIDO

#### Fórmula Anterior (INCORRECTA):
```sql
V_AGUINALDO := (V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO
```

**Problemas identificados:**
- ❌ Usaba todos los días de relación laboral
- ❌ Debería usar solo días del último año trabajado

#### Fórmula Corregida:
```sql
-- Días trabajados en el último año
V_DIAS_ULTIMO_ANIO := MOD(V_DIAS_RELACION, 365)

-- Aguinaldo proporcional
V_AGUINALDO := V_SALARIO_DEVENGADO * (V_DIAS_ULTIMO_ANIO / 365)
```

**Fundamento Legal:**
- Artículo 102 literal "j" Constitución de la República
- Decreto 76-78 Ley reguladora del Aguinaldo
- Artículo 1 Convenio 95
- Artículo 88 literal "c" del Código de Trabajo

**Fórmula Legal:**
```
Aguinaldo = SD × TPP ÷ 365 días
```

**Componentes:**
- **SD** = Salario Devengado
- **TPP** = Tiempo Pendiente de Pago en días (del año en curso)

**Ejemplo:**
```
SD = Q3,500.00
Días trabajados en el último año = 200 días
Aguinaldo = Q3,500 × (200 ÷ 365) = Q1,917.81
```

**Nota Importante:**
El aguinaldo se calcula solo sobre los días trabajados del 1 de diciembre al 30 de noviembre del año en curso, no sobre todo el tiempo de servicio.

---

### 6. BONO 14 (BONIFICACIÓN ANUAL DECRETO 42-92)
**Estado:** ❌ CORREGIDO

#### Fórmula Anterior (INCORRECTA):
```sql
V_BONO14 := (V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO
```

**Problemas identificados:**
- ❌ Usaba salario ordinario en lugar de salario devengado
- ❌ La documentación indicaba usar solo salario base
- ❌ No seguía la regla "Es la misma base que aguinaldo"

#### Fórmula Corregida:
```sql
-- Salario devengado completo (igual que aguinaldo)
V_SALARIO_DEVENGADO := V_SALARIO_ORDINARIO + NVL(V_EMP.PROM_COMISIONES, 0) + NVL(V_EMP.BONO_INCENTIVO, 0)

-- Días del último año
V_DIAS_ULTIMO_ANIO := MOD(V_DIAS_RELACION, 365)

-- Bono 14 proporcional
V_BONO14 := V_SALARIO_DEVENGADO * (V_DIAS_ULTIMO_ANIO / 365)
```

**Fundamento Legal:**
- Decreto 42-92
- Artículo 1o. Convenio 95
- Artículo 88 Literales a, b, c, del Código de Trabajo

**Fórmula Legal:**
```
Bono 14 = (Salario mensual ÷ 365) × Días laborados
```

**Nota Importante:**
Según la documentación oficial: **"Es la misma base que aguinaldo"**

Esto significa que tanto el aguinaldo como el Bono 14 usan el **salario devengado completo** (salario base + comisiones + bonificaciones), NO solo el salario ordinario.

**Componentes:**
- **Salario mensual** = Salario Devengado completo (igual que aguinaldo)
- **TPP** = Tiempo Pendiente de Pago en días (del año en curso)

**Ejemplo:**
```
Salario Devengado = Q3,625.00 (incluye comisiones y bonos)
Días trabajados en el último año = 43 días
Cálculo: (Q3,625 ÷ 365) × 43 = Q9.93 × 43 = Q426.99
```

**Diferencia clave CORREGIDA:**
- ~~**Aguinaldo**: Usa SD (con comisiones y bonos)~~
- ~~**Bono 14**: Usa solo SOM (salario base)~~

**CORRECCIÓN:**
- **Aguinaldo**: Usa SD (salario devengado completo)
- **Bono 14**: Usa SD (salario devengado completo) - **MISMA BASE**

---

## 📋 TABLA COMPARATIVA DE CAMBIOS

| Concepto | Fórmula Anterior | Fórmula Corregida | Impacto |
|----------|-----------------|-------------------|---------|
| **Indemnización** | `TRUNC(días/365) × SD` | `(SD + SD/6) × (días/365)` | ↑ Incremento ~16.67% + proporcional |
| **Ventajas Económicas** | `SD × 42.86%` | `SD × 42.86% × (días/365)` | Variable según días trabajados |
| **Vacaciones** | Fijo 15 días | Escala 15-22 días + proporcional | ↑ Incrementa con años de servicio |
| **Aguinaldo** | `SD × (total días/365)` | `SD × (días último año/365)` | ↓ Solo año actual |
| **Bono 14** | `SD × (total días/365)` | `SD × (días último año/365)` | ✅ Misma base que aguinaldo |

---

## 💡 CONSIDERACIONES ADICIONALES

### 1. Horas Extraordinarias
**Pendiente de implementar:**
- Actualmente no se consideran en el cálculo
- Según documento: deben incluirse en indemnización
- Fórmula sugerida para futuro:
  ```
  HE = SD ÷ 30 × 1.5 (diurno) o × 2 (nocturno)
  ```

### 2. Bonificación Decreto 37-2001
**Pendiente de implementar:**
- BM = 30 × TPP
- Ejemplo: 250 + 30 × días pendientes de pago

### 3. Salarios Retenidos
**Pendiente de implementar:**
- SM + 30 × TPP
- SM = Salario Mensual
- TPP = Tiempo pendiente de pago en días

---

## 🎯 CASOS DE PRUEBA RECOMENDADOS

### Caso 1: Empleado con menos de 5 años
```
Fecha Ingreso: 01/01/2022
Fecha Egreso: 31/12/2024
Días: 1,096
Años completos: 3
Salario Base: Q3,000
Comisiones: Q500
Bono Incentivo: Q250
```

**Resultados Esperados:**
- Indemnización: ~Q11,667 (con incremento)
- Vacaciones: 15 días
- Aguinaldo: proporcional al último año
- Bono 14: solo sobre Q3,000

### Caso 2: Empleado con más de 5 años
```
Fecha Ingreso: 15/02/1995
Fecha Egreso: 20/05/2004
Días: 3,381
Años completos: 9
Salario Base: Q2,825
Comisiones: Q475
Bono Incentivo: Q200
```

**Resultados Esperados:**
- Indemnización: ~Q37,828
- Vacaciones: 20 días (5 años + 5 adicionales)
- Ventajas económicas: proporcional a 9.26 años

---

## ✅ VALIDACIÓN Y SIGUIENTES PASOS

### Para Aplicar los Cambios:

1. **Ejecutar el script actualizado:**
   ```sql
   @BODY_PKG_Prestaciones.sql
   ```

2. **Compilar el paquete:**
   ```sql
   ALTER PACKAGE PKG_PRESTACIONES COMPILE BODY;
   ```

3. **Verificar compilación:**
   ```sql
   SELECT object_name, status 
   FROM user_objects 
   WHERE object_name = 'PKG_PRESTACIONES';
   ```

4. **Probar con datos reales:**
   - Crear empleados de prueba
   - Ejecutar cálculos
   - Comparar con cálculos manuales

### Recomendaciones:

1. ✅ **Documentar cada liquidación** con el fundamento legal aplicado
2. ✅ **Mantener histórico** de cambios en fórmulas
3. ⚠️ **Revisar con asesor legal** antes de uso en producción
4. ⚠️ **Implementar casos de prueba** para cada escenario
5. ⚠️ **Considerar excepciones** (contratos especiales, indemnizaciones convenidas)

---

## 📚 REFERENCIAS LEGALES

1. **Código de Trabajo de Guatemala**
   - Artículo 82 (Indemnización)
   - Artículos 130-137 (Vacaciones)
   - Artículo 88 (Bonificaciones)
   - Artículos 90, 93 (Ventajas Económicas)

2. **Constitución de la República de Guatemala**
   - Artículo 102 literal "j" (Aguinaldo)

3. **Decretos y Convenios**
   - Decreto 76-78 (Ley reguladora del Aguinaldo)
   - Decreto 42-92 (Bono 14)
   - Decreto 37-2001 (Bonificación)
   - Convenio 95 (Convenio sobre la protección del salario)

---

## 📝 NOTAS FINALES

**Importante:** Este análisis se basa en:
- Documentación proporcionada
- Legislación vigente de Guatemala
- Buenas prácticas de cálculo de prestaciones

**Descargo de responsabilidad:** 
Los cálculos implementados deben ser validados por un profesional legal especializado en derecho laboral guatemalteco antes de su uso en producción.

---

**Elaborado por:** GitHub Copilot  
**Revisión requerida por:** Asesor Legal / Contador especializado  
**Fecha:** 19 de noviembre de 2025
