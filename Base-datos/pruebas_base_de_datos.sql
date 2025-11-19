-- Pruebas para la base de datos

-- Prueba 1 ( insertar datos )
SET SERVEROUTPUT ON;

DECLARE
  v_id_emp1 EMPLEADOS.ID_EMPLEADO%TYPE;
  v_id_emp2 EMPLEADOS.ID_EMPLEADO%TYPE;
BEGIN
  -- ==========================================
  -- EMPLEADO 1
  -- ==========================================
  PKG_PRESTACIONES.SP_CREAR_EMPLEADO(
    P_DPI             => '1010101010101',            -- cambia si ya existe
    P_NOMBRES         => 'JUAN',
    P_APELLIDOS       => 'PEREZ LOPEZ',
    P_FECHA_INGRESO   => DATE '2023-02-02',
    P_SALARIO_BASE    => 7000,                       -- Q 7,000
    P_PROM_COMISIONES => 0,                          -- sin comisiones
    P_BONO_INCENTIVO  => 0,                          -- sin bono
    P_ID_EMPLEADO_OUT => v_id_emp1
  );

  DBMS_OUTPUT.PUT_LINE('Empleado 1 creado con ID = ' || v_id_emp1);

  -- ==========================================
  -- EMPLEADO 2
  -- ==========================================
  PKG_PRESTACIONES.SP_CREAR_EMPLEADO(
    P_DPI             => '2020202020202',            -- cambia si ya existe
    P_NOMBRES         => 'MARIA',
    P_APELLIDOS       => 'GARCIA RAMIREZ',
    P_FECHA_INGRESO   => DATE '2024-01-15',
    P_SALARIO_BASE    => 5000,                       -- Q 5,000
    P_PROM_COMISIONES => 800,                        -- Q 800 promedio comisiones
    P_BONO_INCENTIVO  => 250,                        -- Q 250 bono incentivo
    P_ID_EMPLEADO_OUT => v_id_emp2
  );

  DBMS_OUTPUT.PUT_LINE('Empleado 2 creado con ID = ' || v_id_emp2);

END;
/



-- Visualizar datos

SELECT * FROM EMPLEADOS;

-- --------------------------------------------------
-- Realizar pruebas de calculo
-- ---------------------------------------------------

SET SERVEROUTPUT ON;

DECLARE
  v_id_emp1 EMPLEADOS.ID_EMPLEADO%TYPE;
  v_id_emp2 EMPLEADOS.ID_EMPLEADO%TYPE;

  v_cur   PKG_PRESTACIONES.T_CURSOR;
  v_liq   LIQUIDACIONES%ROWTYPE;
BEGIN
  ------------------------------------------------------
  -- Buscar IDs por DPI
  ------------------------------------------------------
  SELECT ID_EMPLEADO
    INTO v_id_emp1
    FROM EMPLEADOS
   WHERE DPI = '1010101010101';

  SELECT ID_EMPLEADO
    INTO v_id_emp2
    FROM EMPLEADOS
   WHERE DPI = '2020202020202';

  ------------------------------------------------------
  -- Calculo para EMPLEADO 1 (JUAN)
  ------------------------------------------------------
  PKG_PRESTACIONES.SP_CALCULAR_LIQ_EMPLEADO(
    P_ID_EMPLEADO  => v_id_emp1,
    P_FECHA_EGRESO => DATE '2025-12-31',
    P_CURSOR       => v_cur
  );

  FETCH v_cur INTO v_liq;

  DBMS_OUTPUT.PUT_LINE('========= LIQUIDACIï¿½N EMPLEADO 1 (JUAN) =========');
  DBMS_OUTPUT.PUT_LINE('ID_LIQUIDACION: ' || v_liq.ID_LIQUIDACION);
  DBMS_OUTPUT.PUT_LINE('DIAS_RELACION : ' || v_liq.DIAS_RELACION);
  DBMS_OUTPUT.PUT_LINE('SALARIO_DEVENGADO: ' || v_liq.SALARIO_DEVENGADO);
  DBMS_OUTPUT.PUT_LINE('INDEMNIZACIï¿½N   : ' || v_liq.INDEMNIZACION);
  DBMS_OUTPUT.PUT_LINE('VACACIONES      : ' || v_liq.VACACIONES);
  DBMS_OUTPUT.PUT_LINE('AGUINALDO       : ' || v_liq.AGUINALDO);
  DBMS_OUTPUT.PUT_LINE('BONO 14         : ' || v_liq.BONO14);
  DBMS_OUTPUT.PUT_LINE('VENT. ECONï¿½MICAS: ' || v_liq.VENT_ECONOMICAS);
  DBMS_OUTPUT.PUT_LINE('TOTAL A PAGAR   : ' || v_liq.TOTAL_PAGAR);
  DBMS_OUTPUT.PUT_LINE('-------------------------------------------------');

  CLOSE v_cur;

  ------------------------------------------------------
  -- Cï¿½lculo para EMPLEADO 2 (MARIA)
  ------------------------------------------------------
  PKG_PRESTACIONES.SP_CALCULAR_LIQ_EMPLEADO(
    P_ID_EMPLEADO  => v_id_emp2,
    P_FECHA_EGRESO => DATE '2025-06-30',
    P_CURSOR       => v_cur
  );

  FETCH v_cur INTO v_liq;

  DBMS_OUTPUT.PUT_LINE('========= LIQUIDACIï¿½N EMPLEADO 2 (MARIA) =========');
  DBMS_OUTPUT.PUT_LINE('ID_LIQUIDACION: ' || v_liq.ID_LIQUIDACION);
  DBMS_OUTPUT.PUT_LINE('DIAS_RELACION : ' || v_liq.DIAS_RELACION);
  DBMS_OUTPUT.PUT_LINE('SALARIO_DEVENGADO: ' || v_liq.SALARIO_DEVENGADO);
  DBMS_OUTPUT.PUT_LINE('INDEMNIZACIï¿½N   : ' || v_liq.INDEMNIZACION);
  DBMS_OUTPUT.PUT_LINE('VACACIONES      : ' || v_liq.VACACIONES);
  DBMS_OUTPUT.PUT_LINE('AGUINALDO       : ' || v_liq.AGUINALDO);
  DBMS_OUTPUT.PUT_LINE('BONO 14         : ' || v_liq.BONO14);
  DBMS_OUTPUT.PUT_LINE('VENT. ECONï¿½MICAS: ' || v_liq.VENT_ECONOMICAS);
  DBMS_OUTPUT.PUT_LINE('TOTAL A PAGAR   : ' || v_liq.TOTAL_PAGAR);
  DBMS_OUTPUT.PUT_LINE('-------------------------------------------------');

  CLOSE v_cur;
  
  
  END;
/

-- Visualizar todas las liquidaciones registradas


SELECT * FROM LIQUIDACIONES ORDER BY FECHA_CALCULO DESC;
