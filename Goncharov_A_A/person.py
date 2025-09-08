class Person:
    def __init__(self, name, salary, expenses):
        self.name = name
        self.salary = salary
        self.expenses = expenses

    def calculate_monthly_balance(self):
        total_expenses = sum(self.expenses.values()
        return self.salary - total_expenses

    def update_savings(self):
        self.savings += self.calculate_monthly_balance()

    def __str__(self):
        return f"{self.name}: salary {self.salary} \n savings {self.savings}"
