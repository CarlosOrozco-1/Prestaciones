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
  --------------------------------------------------------
  PROCEDURE SP_CALCULAR_LIQ_EMPLEADO (
    P_ID_EMPLEADO  IN EMPLEADOS.ID_EMPLEADO%TYPE,
    P_FECHA_EGRESO IN DATE,
    P_CURSOR       OUT T_CURSOR
  ) IS
    V_EMP EMPLEADOS%ROWTYPE;

    V_DIAS_RELACION      NUMBER;
    V_SALARIO_DEVENGADO  NUMBER(10,2);

    V_INDEMNIZACION      NUMBER(10,2);
    V_VACACIONES         NUMBER(10,2);
    V_AGUINALDO          NUMBER(10,2);
    V_BONO14             NUMBER(10,2);
    V_VENT_ECONOMICAS    NUMBER(10,2);
    V_TOTAL_PAGAR        NUMBER(10,2);

    V_ID_LIQUIDACION     LIQUIDACIONES.ID_LIQUIDACION%TYPE;
  BEGIN
    -- 1) Leer datos del empleado
    SELECT *
      INTO V_EMP
      FROM EMPLEADOS
     WHERE ID_EMPLEADO = P_ID_EMPLEADO;

    -- 2) Días de relación laboral
    V_DIAS_RELACION := FN_DIAS_RELACION(V_EMP.FECHA_INGRESO, P_FECHA_EGRESO);

    -- 3) Salario devengado base (SD)
    V_SALARIO_DEVENGADO :=
        NVL(V_EMP.SALARIO_BASE,0)
      + NVL(V_EMP.PROM_COMISIONES,0)
      + NVL(V_EMP.BONO_INCENTIVO,0);

    ----------------------------------------------------
    -- 4) FÓRMULAS SIMPLIFICADAS (ajustables después)
    ----------------------------------------------------
    -- Indemnización: 1 salario por año completo trabajado
    V_INDEMNIZACION := TRUNC(V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO;

    -- Vacaciones: supuesto 15 días por año (15/30 salarios)
    V_VACACIONES := (V_DIAS_RELACION / 365) * (15 / 30) * V_SALARIO_DEVENGADO;

    -- Aguinaldo: 1 salario por año proporcional
    V_AGUINALDO := (V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO;

    -- Bono 14: 1 salario por año proporcional
    V_BONO14 := (V_DIAS_RELACION / 365) * V_SALARIO_DEVENGADO;

    -- Ventajas económicas: 42.86 % del salario devengado (ejemplo)
    V_VENT_ECONOMICAS := V_SALARIO_DEVENGADO * 0.4286;

    -- Total a pagar
    V_TOTAL_PAGAR :=
        NVL(V_INDEMNIZACION,0)
      + NVL(V_VACACIONES,0)
      + NVL(V_AGUINALDO,0)
      + NVL(V_BONO14,0)
      + NVL(V_VENT_ECONOMICAS,0);

    ----------------------------------------------------
    -- 5) Insertar en LIQUIDACIONES
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
    -- 6) Devolver el registro recién creado
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
