"""
Main program for Employee Registry and Settlements System.
"""
from datetime import date, datetime
from registry import EmployeeRegistry


def print_separator():
    """Print a line separator."""
    print("-" * 80)


def format_currency(amount: float) -> str:
    """Format amount as currency."""
    return f"${amount:,.2f}"


def print_employee(employee):
    """Print employee details."""
    print(f"\nID: {employee.employee_id}")
    print(f"Nombre: {employee.name}")
    print(f"Salario: {format_currency(employee.salary)}")
    print(f"Fecha de inicio: {employee.start_date}")
    if employee.end_date:
        print(f"Fecha de fin: {employee.end_date}")
    else:
        print("Estado: Activo")


def print_settlement(settlement):
    """Print settlement details."""
    print_separator()
    print("LIQUIDACIÓN DE EMPLEADO")
    print_separator()
    print(f"ID: {settlement['employee_id']}")
    print(f"Nombre: {settlement['name']}")
    print(f"Años de servicio: {settlement['years_of_service']}")
    print(f"\nDesglose:")
    print(f"  Cesantía: {format_currency(settlement['severance'])}")
    print(f"  Vacaciones: {format_currency(settlement['vacation_pay'])}")
    print(f"  Aguinaldo: {format_currency(settlement['christmas_bonus'])}")
    print_separator()
    print(f"TOTAL LIQUIDACIÓN: {format_currency(settlement['total_settlement'])}")
    print_separator()


def main():
    """Main program entry point."""
    print("=" * 80)
    print("SISTEMA DE REGISTRO DE EMPLEADOS Y CÁLCULO DE LIQUIDACIONES")
    print("=" * 80)
    
    # Create registry
    registry = EmployeeRegistry()
    
    # Add sample employees
    print("\n1. Agregando empleados al sistema...")
    
    emp1 = registry.add_employee(
        name="Juan Pérez",
        salary=15000.00,
        start_date=date(2020, 1, 15)
    )
    print(f"   ✓ Empleado agregado: {emp1.name}")
    
    emp2 = registry.add_employee(
        name="María González",
        salary=18000.00,
        start_date=date(2019, 6, 1),
        end_date=date(2024, 10, 31)
    )
    print(f"   ✓ Empleado agregado: {emp2.name}")
    
    emp3 = registry.add_employee(
        name="Carlos Rodríguez",
        salary=20000.00,
        start_date=date(2021, 3, 10)
    )
    print(f"   ✓ Empleado agregado: {emp3.name}")
    
    # List all employees
    print("\n2. Listado de empleados:")
    print_separator()
    for employee in registry.list_employees():
        print_employee(employee)
    print_separator()
    
    # Calculate settlement for an employee
    print("\n3. Calculando liquidación para María González (ID: 2)...")
    settlement = registry.calculate_settlement(2)
    if settlement:
        print_settlement(settlement)
    
    # List active employees only
    print("\n4. Listado de empleados activos:")
    print_separator()
    active_employees = registry.list_employees(active_only=True)
    for employee in active_employees:
        print_employee(employee)
    print_separator()
    
    # Calculate settlement for active employee
    print("\n5. Calculando liquidación para Juan Pérez (ID: 1)...")
    settlement = registry.calculate_settlement(1)
    if settlement:
        print_settlement(settlement)
    
    # Summary
    print("\n6. Resumen:")
    print(f"   Total de empleados: {len(registry)}")
    print(f"   Empleados activos: {len(active_employees)}")
    print(f"   Empleados inactivos: {len(registry) - len(active_employees)}")
    
    print("\n" + "=" * 80)
    print("Programa finalizado correctamente")
    print("=" * 80)


if __name__ == "__main__":
    main()
