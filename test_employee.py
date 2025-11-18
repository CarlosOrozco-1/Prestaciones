"""
Unit tests for Employee class.
"""
import unittest
from datetime import date
from employee import Employee


class TestEmployee(unittest.TestCase):
    """Test cases for Employee class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.employee = Employee(
            employee_id=1,
            name="Test Employee",
            salary=10000.0,
            start_date=date(2020, 1, 1)
        )
    
    def test_employee_creation(self):
        """Test employee creation with basic attributes."""
        self.assertEqual(self.employee.employee_id, 1)
        self.assertEqual(self.employee.name, "Test Employee")
        self.assertEqual(self.employee.salary, 10000.0)
        self.assertEqual(self.employee.start_date, date(2020, 1, 1))
        self.assertIsNone(self.employee.end_date)
    
    def test_employee_with_end_date(self):
        """Test employee creation with end date."""
        employee = Employee(
            employee_id=2,
            name="Former Employee",
            salary=12000.0,
            start_date=date(2019, 1, 1),
            end_date=date(2023, 12, 31)
        )
        self.assertEqual(employee.end_date, date(2023, 12, 31))
    
    def test_calculate_years_of_service(self):
        """Test years of service calculation."""
        # Test with specific reference date
        years = self.employee.calculate_years_of_service(date(2024, 1, 1))
        self.assertAlmostEqual(years, 4.0, places=1)
    
    def test_calculate_years_of_service_with_end_date(self):
        """Test years of service calculation with end date."""
        employee = Employee(
            employee_id=3,
            name="Former Employee",
            salary=15000.0,
            start_date=date(2020, 1, 1),
            end_date=date(2023, 1, 1)
        )
        years = employee.calculate_years_of_service()
        self.assertAlmostEqual(years, 3.0, places=1)
    
    def test_calculate_settlement(self):
        """Test settlement calculation."""
        employee = Employee(
            employee_id=4,
            name="Settlement Test",
            salary=10000.0,
            start_date=date(2020, 1, 1),
            end_date=date(2022, 1, 1)
        )
        settlement = employee.calculate_settlement()
        
        self.assertEqual(settlement['employee_id'], 4)
        self.assertEqual(settlement['name'], "Settlement Test")
        self.assertGreater(settlement['years_of_service'], 1.9)
        self.assertLess(settlement['years_of_service'], 2.1)
        self.assertGreater(settlement['severance'], 0)
        self.assertGreater(settlement['vacation_pay'], 0)
        self.assertGreater(settlement['christmas_bonus'], 0)
        self.assertGreater(settlement['total_settlement'], 0)
    
    def test_to_dict(self):
        """Test conversion to dictionary."""
        employee_dict = self.employee.to_dict()
        self.assertEqual(employee_dict['employee_id'], 1)
        self.assertEqual(employee_dict['name'], "Test Employee")
        self.assertEqual(employee_dict['salary'], 10000.0)
        self.assertEqual(employee_dict['start_date'], "2020-01-01")
        self.assertIsNone(employee_dict['end_date'])
    
    def test_str_representation(self):
        """Test string representation."""
        str_repr = str(self.employee)
        self.assertIn("Test Employee", str_repr)
        self.assertIn("10,000.00", str_repr)
        self.assertIn("Activo", str_repr)


if __name__ == '__main__':
    unittest.main()
