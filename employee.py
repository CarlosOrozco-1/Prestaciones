"""
Employee class for managing employee records.
"""
from datetime import date, datetime
from typing import Optional


class Employee:
    """Represents an employee with their basic information."""
    
    def __init__(
        self,
        employee_id: int,
        name: str,
        salary: float,
        start_date: date,
        end_date: Optional[date] = None
    ):
        """
        Initialize an employee.
        
        Args:
            employee_id: Unique identifier for the employee
            name: Full name of the employee
            salary: Monthly salary
            start_date: Date when employee started working
            end_date: Date when employee stopped working (None if still active)
        """
        self.employee_id = employee_id
        self.name = name
        self.salary = salary
        self.start_date = start_date
        self.end_date = end_date
    
    def calculate_years_of_service(self, reference_date: Optional[date] = None) -> float:
        """
        Calculate years of service.
        
        Args:
            reference_date: Date to calculate until (defaults to end_date or today)
            
        Returns:
            Years of service as a decimal number
        """
        if reference_date is None:
            reference_date = self.end_date if self.end_date else date.today()
        
        days = (reference_date - self.start_date).days
        return days / 365.25
    
    def calculate_settlement(self) -> dict:
        """
        Calculate employee settlement (liquidación).
        
        This includes:
        - Severance pay (cesantía): 1 month salary per year of service
        - Vacation pay (vacaciones): Proportional unused vacation days
        - Christmas bonus (aguinaldo): Proportional amount
        
        Returns:
            Dictionary with settlement breakdown
        """
        years_of_service = self.calculate_years_of_service()
        
        # Severance pay: 1 month salary per year worked
        severance = self.salary * years_of_service
        
        # Vacation pay: Assuming 15 days per year, proportional
        vacation_days = years_of_service * 15
        vacation_pay = (self.salary / 30) * vacation_days
        
        # Christmas bonus: Assuming 1 month salary per year, proportional
        christmas_bonus = self.salary * years_of_service
        
        # Total settlement
        total = severance + vacation_pay + christmas_bonus
        
        return {
            'employee_id': self.employee_id,
            'name': self.name,
            'years_of_service': round(years_of_service, 2),
            'severance': round(severance, 2),
            'vacation_pay': round(vacation_pay, 2),
            'christmas_bonus': round(christmas_bonus, 2),
            'total_settlement': round(total, 2)
        }
    
    def to_dict(self) -> dict:
        """Convert employee to dictionary representation."""
        return {
            'employee_id': self.employee_id,
            'name': self.name,
            'salary': self.salary,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None
        }
    
    def __str__(self) -> str:
        """String representation of employee."""
        status = "Activo" if self.end_date is None else "Inactivo"
        return f"Employee {self.employee_id}: {self.name} - Salary: ${self.salary:,.2f} - Status: {status}"
