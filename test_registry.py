"""
Unit tests for EmployeeRegistry class.
"""
import unittest
from datetime import date
from registry import EmployeeRegistry


class TestEmployeeRegistry(unittest.TestCase):
    """Test cases for EmployeeRegistry class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.registry = EmployeeRegistry()
    
    def test_registry_initialization(self):
        """Test registry initialization."""
        self.assertEqual(len(self.registry), 0)
        self.assertEqual(self.registry.next_id, 1)
    
    def test_add_employee(self):
        """Test adding an employee."""
        employee = self.registry.add_employee(
            name="John Doe",
            salary=15000.0,
            start_date=date(2020, 1, 1)
        )
        self.assertEqual(employee.employee_id, 1)
        self.assertEqual(employee.name, "John Doe")
        self.assertEqual(len(self.registry), 1)
    
    def test_add_multiple_employees(self):
        """Test adding multiple employees."""
        emp1 = self.registry.add_employee("Employee 1", 10000.0, date(2020, 1, 1))
        emp2 = self.registry.add_employee("Employee 2", 12000.0, date(2021, 1, 1))
        emp3 = self.registry.add_employee("Employee 3", 14000.0, date(2022, 1, 1))
        
        self.assertEqual(emp1.employee_id, 1)
        self.assertEqual(emp2.employee_id, 2)
        self.assertEqual(emp3.employee_id, 3)
        self.assertEqual(len(self.registry), 3)
    
    def test_get_employee(self):
        """Test retrieving an employee."""
        self.registry.add_employee("Test Employee", 10000.0, date(2020, 1, 1))
        employee = self.registry.get_employee(1)
        self.assertIsNotNone(employee)
        self.assertEqual(employee.name, "Test Employee")
    
    def test_get_nonexistent_employee(self):
        """Test retrieving a nonexistent employee."""
        employee = self.registry.get_employee(999)
        self.assertIsNone(employee)
    
    def test_update_employee(self):
        """Test updating an employee."""
        self.registry.add_employee("Original Name", 10000.0, date(2020, 1, 1))
        updated = self.registry.update_employee(1, name="Updated Name", salary=15000.0)
        
        self.assertIsNotNone(updated)
        self.assertEqual(updated.name, "Updated Name")
        self.assertEqual(updated.salary, 15000.0)
    
    def test_update_nonexistent_employee(self):
        """Test updating a nonexistent employee."""
        result = self.registry.update_employee(999, name="Test")
        self.assertIsNone(result)
    
    def test_delete_employee(self):
        """Test deleting an employee."""
        self.registry.add_employee("To Delete", 10000.0, date(2020, 1, 1))
        self.assertEqual(len(self.registry), 1)
        
        result = self.registry.delete_employee(1)
        self.assertTrue(result)
        self.assertEqual(len(self.registry), 0)
    
    def test_delete_nonexistent_employee(self):
        """Test deleting a nonexistent employee."""
        result = self.registry.delete_employee(999)
        self.assertFalse(result)
    
    def test_list_all_employees(self):
        """Test listing all employees."""
        self.registry.add_employee("Employee 1", 10000.0, date(2020, 1, 1))
        self.registry.add_employee("Employee 2", 12000.0, date(2021, 1, 1))
        self.registry.add_employee("Employee 3", 14000.0, date(2022, 1, 1), date(2023, 1, 1))
        
        employees = self.registry.list_employees()
        self.assertEqual(len(employees), 3)
    
    def test_list_active_employees_only(self):
        """Test listing only active employees."""
        self.registry.add_employee("Active 1", 10000.0, date(2020, 1, 1))
        self.registry.add_employee("Active 2", 12000.0, date(2021, 1, 1))
        self.registry.add_employee("Inactive", 14000.0, date(2022, 1, 1), date(2023, 1, 1))
        
        active_employees = self.registry.list_employees(active_only=True)
        self.assertEqual(len(active_employees), 2)
        
        for employee in active_employees:
            self.assertIsNone(employee.end_date)
    
    def test_calculate_settlement(self):
        """Test calculating settlement for an employee."""
        self.registry.add_employee(
            "Settlement Test",
            10000.0,
            date(2020, 1, 1),
            date(2022, 1, 1)
        )
        
        settlement = self.registry.calculate_settlement(1)
        self.assertIsNotNone(settlement)
        self.assertEqual(settlement['employee_id'], 1)
        self.assertIn('total_settlement', settlement)
        self.assertGreater(settlement['total_settlement'], 0)
    
    def test_calculate_settlement_nonexistent_employee(self):
        """Test calculating settlement for nonexistent employee."""
        settlement = self.registry.calculate_settlement(999)
        self.assertIsNone(settlement)


if __name__ == '__main__':
    unittest.main()
