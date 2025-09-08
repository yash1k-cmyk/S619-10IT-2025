class Person:
    def __init__(self, name, salary, expenses, property_value=0, property_type='rent', property_cost=0, interest_rate=0, property_value_increase=0):
        self.name = name
        self.salary = salary
        self.expenses = expenses
        self.property_value = property_value
        self.property_type = property_type
        self.property_cost = property_cost
        self.interest_rate = interest_rate
        self.property_value_increase = property_value_increase
        self.savings = 0
        self.total_spent = 0
        self.annual_income = 0
        self.annual_expenses = 0

    def monthly_income(self):
        return self.salary

    def monthly_expenses(self):
        total = sum(self.expenses.values())
        return total

    def annual_update(self):

        if self.property_type == 'own':
            self.property_value *= (1 + self.property_value_increase)


        if self.property_type == 'own':
            interest = self.property_cost * self.interest_rate
            self.savings -= interest
            self.total_spent += interest

    def simulate_month(self, month):
        income = self.monthly_income()
        expenses = self.monthly_expenses()


        if self.name == 'Bob':

            expenses += self.expenses.get('cat_food', 2000)

            if month % 2 == 0:
                expenses += self.expenses.get('cat_grooming', 3000)


        self.savings += income - expenses
        self.total_spent += expenses
        self.annual_income += income
        self.annual_expenses += expenses

def simulate_year(bob, alice):
    for month in range(1, 13):
        bob.simulate_month(month)
        alice.simulate_month(month)


    bob.annual_update()
    if alice.property_type == 'own':

        alice.property_value *= (1 + alice.property_value_increase)


bob_expenses = {
    'rent': 30000,
    'food': 4000,
    'transport': 1500,
    'cat_food': 2000,
    'cat_grooming': 3000
}
bob = Person(
    name='Bob',
    salary=80000,
    expenses=bob_expenses,
    property_value=0,
    property_type='rent',
    property_cost=0,
    interest_rate=0
)


alice_expenses = {
    'food': 4000,
    'transport': 1500
}
alice = Person(
    name='Alice',
    salary=200000,
    expenses=alice_expenses,
    property_value=10_000_000,
    property_type='own',
    property_cost=10_000_000,
    interest_rate=0.12,
    property_value_increase=0.05  
)


simulate_year(bob, alice)


print(f"{bob.name}:")
print(f"  Общие расходы за год: {bob.total_spent} руб")
print(f"  Остаток сбережений: {bob.savings} руб")
print(f"  Стоимость аренды после года: {bob.expenses['rent']} руб (на следующий год)")

print(f"\n{alice.name}:")
print(f"  Общие расходы за год: {alice.total_spent} руб")
print(f"  Остаток сбережений: {alice.savings} руб")
print(f"  Стоимость квартиры после года: {alice.property_value:.2f} руб")
