# Prestaciones

Sistema de registro de empleados y cálculo de liquidaciones laborales.

## Descripción

Este sistema permite:
- Registrar empleados con sus datos básicos (nombre, salario, fechas de trabajo)
- Realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los empleados
- Calcular liquidaciones de empleados incluyendo:
  - Cesantía (1 mes de salario por año de servicio)
  - Vacaciones proporcionales (15 días por año)
  - Aguinaldo proporcional (1 mes de salario por año)

## Requisitos

- Python 3.7 o superior

## Estructura del Proyecto

```
Prestaciones/
├── employee.py         # Clase Employee con lógica de empleados
├── registry.py         # Clase EmployeeRegistry para gestionar empleados
├── main.py            # Programa principal de demostración
├── test_employee.py   # Pruebas unitarias para Employee
├── test_registry.py   # Pruebas unitarias para EmployeeRegistry
└── README.md          # Este archivo
```

## Uso

### Ejecutar el programa de demostración

```bash
python3 main.py
```

Este programa de demostración:
1. Crea un registro de empleados
2. Agrega empleados de ejemplo
3. Lista todos los empleados
4. Calcula liquidaciones
5. Filtra empleados activos

### Ejecutar las pruebas

```bash
python3 -m unittest test_employee.py test_registry.py -v
```

### Uso como biblioteca

```python
from datetime import date
from registry import EmployeeRegistry

# Crear registro
registry = EmployeeRegistry()

# Agregar empleado
employee = registry.add_employee(
    name="Juan Pérez",
    salary=15000.00,
    start_date=date(2020, 1, 15)
)

# Listar empleados
employees = registry.list_employees()
for emp in employees:
    print(emp)

# Calcular liquidación
settlement = registry.calculate_settlement(1)
print(f"Total liquidación: ${settlement['total_settlement']:,.2f}")

# Actualizar empleado
registry.update_employee(1, salary=18000.00)

# Eliminar empleado
registry.delete_employee(1)
```

## Características Principales

### Clase Employee
- Almacena información básica del empleado
- Calcula años de servicio
- Calcula liquidación completa con desglose

### Clase EmployeeRegistry
- Gestión completa de empleados (CRUD)
- Filtrado de empleados activos/inactivos
- Cálculo de liquidaciones

## Cálculo de Liquidaciones

La liquidación se calcula considerando:

1. **Cesantía**: 1 mes de salario por año trabajado
2. **Vacaciones**: 15 días proporcionales por año trabajado
3. **Aguinaldo**: 1 mes de salario proporcional por año trabajado

**Ejemplo**: Un empleado con salario de $10,000 y 2 años de servicio recibiría:
- Cesantía: $20,000
- Vacaciones: $10,000
- Aguinaldo: $20,000
- **Total**: $50,000

## Licencia

Este proyecto es de código abierto.
