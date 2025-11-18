"""
Employee Registry for managing employee records.
"""
from datetime import date
from typing import List, Optional
from employee import Employee


class EmployeeRegistry:
    """Manages a collection of employees and provides CRUD operations."""
    
    def __init__(self):
        """Initialize empty employee registry."""
        self.employees: dict[int, Employee] = {}
        self.next_id = 1
    
    def add_employee(
        self,
        name: str,
        salary: float,
        start_date: date,
        end_date: Optional[date] = None
    ) -> Employee:
        """
        Add a new employee to the registry.
        
        Args:
            name: Full name of the employee
            salary: Monthly salary
            start_date: Date when employee started working
            end_date: Date when employee stopped working (None if still active)
            
        Returns:
            The created Employee object
        """
        employee = Employee(
            employee_id=self.next_id,
            name=name,
            salary=salary,
            start_date=start_date,
            end_date=end_date
        )
        self.employees[self.next_id] = employee
        self.next_id += 1
        return employee
    
    def get_employee(self, employee_id: int) -> Optional[Employee]:
        """
        Get an employee by ID.
        
        Args:
            employee_id: ID of the employee to retrieve
            
        Returns:
            Employee object if found, None otherwise
        """
        return self.employees.get(employee_id)
    
    def update_employee(
        self,
        employee_id: int,
        name: Optional[str] = None,
        salary: Optional[float] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Optional[Employee]:
        """
        Update an existing employee.
        
        Args:
            employee_id: ID of the employee to update
            name: New name (if provided)
            salary: New salary (if provided)
            start_date: New start date (if provided)
            end_date: New end date (if provided)
            
        Returns:
            Updated Employee object if found, None otherwise
        """
        employee = self.employees.get(employee_id)
        if employee is None:
            return None
        
        if name is not None:
            employee.name = name
        if salary is not None:
            employee.salary = salary
        if start_date is not None:
            employee.start_date = start_date
        if end_date is not None:
            employee.end_date = end_date
        
        return employee
    
    def delete_employee(self, employee_id: int) -> bool:
        """
        Delete an employee from the registry.
        
        Args:
            employee_id: ID of the employee to delete
            
        Returns:
            True if employee was deleted, False if not found
        """
        if employee_id in self.employees:
            del self.employees[employee_id]
            return True
        return False
    
    def list_employees(self, active_only: bool = False) -> List[Employee]:
        """
        List all employees.
        
        Args:
            active_only: If True, only return active employees
            
        Returns:
            List of Employee objects
        """
        employees = list(self.employees.values())
        if active_only:
            employees = [e for e in employees if e.end_date is None]
        return employees
    
    def calculate_settlement(self, employee_id: int) -> Optional[dict]:
        """
        Calculate settlement for a specific employee.
        
        Args:
            employee_id: ID of the employee
            
        Returns:
            Settlement details dictionary if employee found, None otherwise
        """
        employee = self.employees.get(employee_id)
        if employee is None:
            return None
        
        return employee.calculate_settlement()
    
    def __len__(self) -> int:
        """Return number of employees in registry."""
        return len(self.employees)
