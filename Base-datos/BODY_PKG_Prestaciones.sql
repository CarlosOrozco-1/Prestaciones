------------------------------------------------------------
-- FASE 1 - PASO 2: PAQUETE PKG_PRESTACIONES (BODY)
------------------------------------------------------------
CREATE OR REPLACE PACKAGE BODY PKG_PRESTACIONES AS

  --------------------------------------------------------
  -- FUNCIÓN AUXILIAR: DÍAS DE RELACIÓN LABORAL
  --------------------------------------------------------
  FUNCTION FN_DIAS_RELACION (
    P_FECHA_INGRESO IN DATE,
    P_FECHA_EGRESO  IN DATE
  ) RETURN NUMBER IS
  BEGIN
    -- +1 para incluir el día de ingreso (ajustable según criterio)
    RETURN (P_FECHA_EGRESO - P_FECHA_INGRESO) + 1;
  END FN_DIAS_RELACION;

  --------------------------------------------------------
  -- 1) CRUD BÁSICO DE EMPLEADOS
  --------------------------------------------------------

  PROCEDURE SP_CREAR_EMPLEADO (
    P_DPI             IN EMPLEADOS.DPI%TYPE,
    P_NOMBRES         IN EMPLEADOS.NOMBRES%TYPE,
    P_APELLIDOS       IN EMPLEADOS.APELLIDOS%TYPE,
    P_FECHA_INGRESO   IN EMPLEADOS.FECHA_INGRESO%TYPE,
    P_SALARIO_BASE    IN EMPLEADOS.SALARIO_BASE%TYPE,
    P_PROM_COMISIONES IN EMPLEADOS.PROM_COMISIONES%TYPE,
    P_BONO_INCENTIVO  IN EMPLEADOS.BONO_INCENTIVO%TYPE,
    P_ID_EMPLEADO_OUT OUT EMPLEADOS.ID_EMPLEADO%TYPE
  ) IS
  BEGIN
    INSERT INTO EMPLEADOS (
      DPI,
      NOMBRES,
      APELLIDOS,
      FECHA_INGRESO,
      SALARIO_BASE,
      PROM_COMISIONES,
      BONO_INCENTIVO
    ) VALUES (
      P_DPI,
      P_NOMBRES,
      P_APELLIDOS,
      P_FECHA_INGRESO,
      P_SALARIO_BASE,
      P_PROM_COMISIONES,
      P_BONO_INCENTIVO
    )
    RETURNING ID_EMPLEADO INTO P_ID_EMPLEADO_OUT;
  END SP_CREAR_EMPLEADO;

  PROCEDURE SP_ACTUALIZAR_EMPLEADO (
    P_ID_EMPLEADO     IN EMPLEADOS.ID_EMPLEADO%TYPE,
    P_DPI             IN EMPLEADOS.DPI%TYPE,
    P_NOMBRES         IN EMPLEADOS.NOMBRES%TYPE,
    P_APELLIDOS       IN EMPLEADOS.APELLIDOS%TYPE,
    P_FECHA_INGRESO   IN EMPLEADOS.FECHA_INGRESO%TYPE,
    P_FECHA_EGRESO    IN EMPLEADOS.FECHA_EGRESO%TYPE,
    P_SALARIO_BASE    IN EMPLEADOS.SALARIO_BASE%TYPE,
    P_PROM_COMISIONES IN EMPLEADOS.PROM_COMISIONES%TYPE,
    P_BONO_INCENTIVO  IN EMPLEADOS.BONO_INCENTIVO%TYPE,
    P_ESTADO          IN EMPLEADOS.ESTADO%TYPE
  ) IS
  BEGIN
    UPDATE EMPLEADOS
       SET DPI             = P_DPI,
           NOMBRES         = P_NOMBRES,
           APELLIDOS       = P_APELLIDOS,
           FECHA_INGRESO   = P_FECHA_INGRESO,
           FECHA_EGRESO    = P_FECHA_EGRESO,
           SALARIO_BASE    = P_SALARIO_BASE,
           PROM_COMISIONES = P_PROM_COMISIONES,
           BONO_INCENTIVO  = P_BONO_INCENTIVO,
           ESTADO          = P_ESTADO
     WHERE ID_EMPLEADO     = P_ID_EMPLEADO;
  END SP_ACTUALIZAR_EMPLEADO;

  PROCEDURE SP_OBTENER_EMPLEADO (
    P_ID_EMPLEADO IN EMPLEADOS.ID_EMPLEADO%TYPE,
    P_CURSOR      OUT T_CURSOR
  ) IS
  BEGIN
    OPEN P_CURSOR FOR
      SELECT *
        FROM EMPLEADOS
       WHERE ID_EMPLEADO = P_ID_EMPLEADO;
  END SP_OBTENER_EMPLEADO;

  PROCEDURE SP_LISTAR_EMPLEADOS (
    P_CURSOR OUT T_CURSOR
  ) IS
  BEGIN
    OPEN P_CURSOR FOR
      SELECT *
        FROM EMPLEADOS
       ORDER BY APELLIDOS, NOMBRES;
  END SP_LISTAR_EMPLEADOS;

  --------------------------------------------------------
  -- 2) CÁLCULO Y REGISTRO DE LIQUIDACIONES
  -- Fórmulas basadas en legislación guatemalteca
  --------------------------------------------------------
  PROCEDURE SP_CALCULAR_LIQ_EMPLEADO (
    P_ID_EMPLEADO  IN EMPLEADOS.ID_EMPLEADO%TYPE,
    P_FECHA_EGRESO IN DATE,
    P_CURSOR       OUT T_CURSOR
  ) IS
    V_EMP EMPLEADOS%ROWTYPE;

    V_DIAS_RELACION      NUMBER;
    V_ANIOS_COMPLETOS    NUMBER;
    V_DIAS_ULTIMO_ANIO   NUMBER;
    V_SALARIO_ORDINARIO  NUMBER(10,2);
    V_SALARIO_DEVENGADO  NUMBER(10,2);
    V_SD_CON_INCREMENTO  NUMBER(10,2); -- SD + (SD/6)

    V_INDEMNIZACION      NUMBER(10,2);
    V_VACACIONES         NUMBER(10,2);
    V_AGUINALDO          NUMBER(10,2);
    V_BONO14             NUMBER(10,2);
    V_VENT_ECONOMICAS    NUMBER(10,2);
    V_TOTAL_PAGAR        NUMBER(10,2);

    V_DIAS_VACACIONES    NUMBER; -- Días de vacaciones según años trabajados
    V_ID_LIQUIDACION     LIQUIDACIONES.ID_LIQUIDACION%TYPE;
  BEGIN
    -- 1) Leer datos del empleado
    SELECT *
      INTO V_EMP
      FROM EMPLEADOS
     WHERE ID_EMPLEADO = P_ID_EMPLEADO;

    -- 2) Días de relación laboral (R.L.)
    -- Incluye el día de ingreso (+1)
    V_DIAS_RELACION := FN_DIAS_RELACION(V_EMP.FECHA_INGRESO, P_FECHA_EGRESO);
    
    -- Años completos trabajados
    V_ANIOS_COMPLETOS := TRUNC(V_DIAS_RELACION / 365);
    
    -- Días trabajados en el último año (para aguinaldo y bono 14)
    V_DIAS_ULTIMO_ANIO := MOD(V_DIAS_RELACION, 365);

    -- 3) Salario Ordinario (SO) - Base sin comisiones ni bonos
    V_SALARIO_ORDINARIO := NVL(V_EMP.SALARIO_BASE, 0);

    -- 4) Salario Devengado (SD) - Incluye comisiones y bonificaciones
    -- SD = Salario Ordinario + Comisiones + Bono Incentivo
    V_SALARIO_DEVENGADO :=
        V_SALARIO_ORDINARIO
      + NVL(V_EMP.PROM_COMISIONES, 0)
      + NVL(V_EMP.BONO_INCENTIVO, 0);

    -- 5) Salario Devengado con incremento legal (SD + SD/6)
    -- Para indemnización se agrega 1/6 del salario devengado
    V_SD_CON_INCREMENTO := V_SALARIO_DEVENGADO + (V_SALARIO_DEVENGADO / 6);

    ----------------------------------------------------
    -- FÓRMULAS SEGÚN LEGISLACIÓN GUATEMALTECA
    ----------------------------------------------------

    -- ==================================================
    -- INDEMNIZACIÓN POR TIEMPO DE SERVICIO
    -- Fórmula: (SD + SD/6) x R.L. ÷ 365 días
    -- Fundamento Legal: Artículo 82 Código de Trabajo
    -- ==================================================
    V_INDEMNIZACION := V_SD_CON_INCREMENTO * (V_DIAS_RELACION / 365);

    -- ==================================================
    -- VACACIONES
    -- Fórmula: SD ÷ 30 x DHC x TPP ÷ 365 días
    -- DHC = Días hábiles que correspondan según años trabajados
    -- Escala de vacaciones en Guatemala:
    --   1-5 años: 15 días
    --   5+ años: 15 días + 1 día por cada año adicional (máximo 22 días)
    -- Fundamento Legal: Artículos 130-137 Código de Trabajo
    -- ==================================================
    IF V_ANIOS_COMPLETOS < 5 THEN
      V_DIAS_VACACIONES := 15;
    ELSIF V_ANIOS_COMPLETOS >= 5 AND V_ANIOS_COMPLETOS < 12 THEN
      V_DIAS_VACACIONES := 15 + (V_ANIOS_COMPLETOS - 4); -- +1 por cada año después de 5
    ELSE
      V_DIAS_VACACIONES := 22; -- Máximo 22 días
    END IF;
    
    -- Cálculo proporcional de vacaciones
    V_VACACIONES := (V_SALARIO_DEVENGADO / 30) * V_DIAS_VACACIONES * (V_DIAS_ULTIMO_ANIO / 365);

    -- ==================================================
    -- AGUINALDO
    -- Fórmula: SD x TPP ÷ 365 días
    -- TPP = Tiempo pendiente de pago en días (del último año)
    -- Fundamento Legal: Artículo 102 Constitución, Decreto 76-78
    -- ==================================================
    V_AGUINALDO := V_SALARIO_DEVENGADO * (V_DIAS_ULTIMO_ANIO / 365);

    -- ==================================================
    -- BONO 14 (BONIFICACIÓN ANUAL DECRETO 42-92)
    -- Fórmula: (Salario mensual ÷ 365) × Días laborados
    -- Es la misma base que aguinaldo (salario devengado)
    -- TPP = Tiempo pendiente de pago en días (del último año)
    -- Fundamento Legal: Decreto 42-92, Artículo 1o. Convenio 95
    -- Ejemplo: (3,625 ÷ 365) × 43 = 9.93 × 43 = Q 426.99
    -- ==================================================
    V_BONO14 := V_SALARIO_DEVENGADO * (V_DIAS_ULTIMO_ANIO / 365);

    -- ==================================================
    -- VENTAJAS ECONÓMICAS
    -- Fórmula: SD x 42.86% x R.L. ÷ 365 días
    -- 42.86% = 30/70 (regla de tres para ventajas económicas)
    -- Fundamento Legal: Artículos 90, 93, 88 Código de Trabajo
    --                   Artículo 1 Convenio 95
    -- ==================================================
    V_VENT_ECONOMICAS := V_SALARIO_DEVENGADO * 0.4286 * (V_DIAS_RELACION / 365);

    -- ==================================================
    -- TOTAL A PAGAR
    -- ==================================================
    V_TOTAL_PAGAR :=
        NVL(V_INDEMNIZACION, 0)
      + NVL(V_VACACIONES, 0)
      + NVL(V_AGUINALDO, 0)
      + NVL(V_BONO14, 0)
      + NVL(V_VENT_ECONOMICAS, 0);

    ----------------------------------------------------
    -- Insertar en LIQUIDACIONES
    ----------------------------------------------------
    INSERT INTO LIQUIDACIONES (
      ID_EMPLEADO,
      FECHA_EGRESO,
      DIAS_RELACION,
      SALARIO_DEVENGADO,
      INDEMNIZACION,
      VACACIONES,
      AGUINALDO,
      BONO14,
      VENT_ECONOMICAS,
      TOTAL_PAGAR
    ) VALUES (
      P_ID_EMPLEADO,
      P_FECHA_EGRESO,
      V_DIAS_RELACION,
      V_SALARIO_DEVENGADO,
      V_INDEMNIZACION,
      V_VACACIONES,
      V_AGUINALDO,
      V_BONO14,
      V_VENT_ECONOMICAS,
      V_TOTAL_PAGAR
    )
    RETURNING ID_LIQUIDACION INTO V_ID_LIQUIDACION;

    ----------------------------------------------------
    -- Devolver el registro recién creado
    ----------------------------------------------------
    OPEN P_CURSOR FOR
      SELECT *
        FROM LIQUIDACIONES
       WHERE ID_LIQUIDACION = V_ID_LIQUIDACION;

  END SP_CALCULAR_LIQ_EMPLEADO;

  --------------------------------------------------------
  -- Historial de liquidaciones por empleado
  --------------------------------------------------------
  PROCEDURE SP_LISTAR_LIQ_POR_EMPLEADO (
    P_ID_EMPLEADO IN EMPLEADOS.ID_EMPLEADO%TYPE,
    P_CURSOR      OUT T_CURSOR
  ) IS
  BEGIN
    OPEN P_CURSOR FOR
      SELECT *
        FROM LIQUIDACIONES
       WHERE ID_EMPLEADO = P_ID_EMPLEADO
       ORDER BY FECHA_CALCULO DESC;
  END SP_LISTAR_LIQ_POR_EMPLEADO;

END PKG_PRESTACIONES;
/
