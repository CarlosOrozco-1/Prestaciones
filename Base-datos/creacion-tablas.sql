------------------------------------------------------------
-- FASE 1 - PASO 1: CREACIÓN DE TABLAS BÁSICAS
-- Esquema para cálculo de prestaciones laborales
------------------------------------------------------------

-------------------------------
-- 1) TABLA EMPLEADOS
-------------------------------
CREATE TABLE EMPLEADOS (
  ID_EMPLEADO        NUMBER GENERATED ALWAYS AS IDENTITY
                     PRIMARY KEY,

  DPI                VARCHAR2(20)           NOT NULL,  -- DPI guatemalteco
  NOMBRES            VARCHAR2(100)          NOT NULL,
  APELLIDOS          VARCHAR2(100)          NOT NULL,
  FECHA_INGRESO      DATE                   NOT NULL,
  FECHA_EGRESO       DATE,                          -- se llena al egreso

  SALARIO_BASE       NUMBER(10,2)           NOT NULL, -- salario ordinario mensual
  PROM_COMISIONES    NUMBER(10,2),                   -- promedio mensual de comisiones
  BONO_INCENTIVO     NUMBER(10,2),                   -- bonificación incentivo u otros
  ESTADO             VARCHAR2(20) DEFAULT 'ACTIVO',  -- ACTIVO / INACTIVO

  -- DPI único por persona
  CONSTRAINT UQ_EMP_DPI UNIQUE (DPI)
);

-- Comentarios descriptivos (opcionales, pero útiles)
COMMENT ON TABLE EMPLEADOS IS 'Catálogo de empleados para cálculo de prestaciones';
COMMENT ON COLUMN EMPLEADOS.ID_EMPLEADO       IS 'Identificador interno del empleado';
COMMENT ON COLUMN EMPLEADOS.DPI               IS 'Documento Personal de Identificación (único por empleado)';
COMMENT ON COLUMN EMPLEADOS.NOMBRES           IS 'Nombres del empleado';
COMMENT ON COLUMN EMPLEADOS.APELLIDOS         IS 'Apellidos del empleado';
COMMENT ON COLUMN EMPLEADOS.FECHA_INGRESO     IS 'Fecha de inicio de la relación laboral';
COMMENT ON COLUMN EMPLEADOS.FECHA_EGRESO      IS 'Fecha de finalización de la relación laboral';
COMMENT ON COLUMN EMPLEADOS.SALARIO_BASE      IS 'Salario ordinario mensual (base)';
COMMENT ON COLUMN EMPLEADOS.PROM_COMISIONES   IS 'Promedio mensual de comisiones';
COMMENT ON COLUMN EMPLEADOS.BONO_INCENTIVO    IS 'Monto de bonificación incentivo u otros bonos fijos';
COMMENT ON COLUMN EMPLEADOS.ESTADO            IS 'Estado del empleado: ACTIVO / INACTIVO';

-------------------------------
-- 2) TABLA LIQUIDACIONES
-------------------------------
CREATE TABLE LIQUIDACIONES (
  ID_LIQUIDACION     NUMBER GENERATED ALWAYS AS IDENTITY
                     PRIMARY KEY,
  ID_EMPLEADO        NUMBER NOT NULL,
  FECHA_CALCULO      DATE   DEFAULT SYSDATE,
  FECHA_EGRESO       DATE   NOT NULL,

  DIAS_RELACION      NUMBER,       -- días de relación laboral (R.L.)
  SALARIO_DEVENGADO  NUMBER(10,2), -- SD usado como base de cálculo

  INDEMNIZACION      NUMBER(10,2),
  VACACIONES         NUMBER(10,2),
  AGUINALDO          NUMBER(10,2),
  BONO14             NUMBER(10,2), -- Bonificación anual Decreto 42-92
  VENT_ECONOMICAS    NUMBER(10,2),

  TOTAL_PAGAR        NUMBER(10,2),

  CONSTRAINT FK_LIQ_EMP
    FOREIGN KEY (ID_EMPLEADO)
    REFERENCES EMPLEADOS(ID_EMPLEADO)
);

COMMENT ON TABLE LIQUIDACIONES IS 'Historial de cálculos de prestaciones por empleado';
COMMENT ON COLUMN LIQUIDACIONES.ID_LIQUIDACION    IS 'Identificador de la liquidación';
COMMENT ON COLUMN LIQUIDACIONES.ID_EMPLEADO       IS 'Empleado al que corresponde la liquidación';
COMMENT ON COLUMN LIQUIDACIONES.FECHA_CALCULO     IS 'Fecha en que se realizó el cálculo';
COMMENT ON COLUMN LIQUIDACIONES.FECHA_EGRESO      IS 'Fecha de egreso usada para el cálculo';
COMMENT ON COLUMN LIQUIDACIONES.DIAS_RELACION     IS 'Total de días de relación laboral';
COMMENT ON COLUMN LIQUIDACIONES.SALARIO_DEVENGADO IS 'Salario base usado en las fórmulas';
COMMENT ON COLUMN LIQUIDACIONES.INDEMNIZACION     IS 'Monto calculado por indemnización';
COMMENT ON COLUMN LIQUIDACIONES.VACACIONES        IS 'Monto por vacaciones proporcionales';
COMMENT ON COLUMN LIQUIDACIONES.AGUINALDO         IS 'Monto por aguinaldo proporcional';
COMMENT ON COLUMN LIQUIDACIONES.BONO14            IS 'Monto por Bono 14 (Decreto 42-92)';
COMMENT ON COLUMN LIQUIDACIONES.VENT_ECONOMICAS   IS 'Monto por ventajas económicas';
COMMENT ON COLUMN LIQUIDACIONES.TOTAL_PAGAR       IS 'Total a pagar en la liquidación';

------------------------------------------------------------
-- FIN FASE 1 - PASO 1
------------------------------------------------------------
