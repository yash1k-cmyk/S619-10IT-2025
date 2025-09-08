import math



class Person:
    def __init__(self, name, balance, salary, expenses=None):
        self.name = name
        self.balance = balance
        self.salary = salary
        self.expenses = expenses if expenses else []

    def monthly_update(self, month):
        total_expenses = sum(exp(month) if callable(exp) else exp for exp in self.expenses)
        self.balance += self.salary - total_expenses

    def __str__(self):
        return f"{self.name} накопит: {self.balance:,.0f} руб."





def annuity_payment(loan_amount, loan_rate, loan_years):
    months = loan_years * 12
    monthly_rate = loan_rate / 12
    return loan_amount * (monthly_rate * (1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)


def simulate(years):
    months = math.floor(years * 12)
    # Bob
    bob_rent_start = 30_000

    def rent_with_indexation(month):
        year = month // 12
        return bob_rent_start * (1.05 ** year)

    def cat_grooming(month):
        return 3000 if month % 2 == 0 else 0

    bob = Person(
        name="Боб",
        balance=100_000,
        salary=80_000,
        expenses=[
            rent_with_indexation,
            4000,   # продукты
            1500,   # транспорт
            2000,   # кот еда
            cat_grooming
        ]
    )

    #  Alice
    loan_amount = 10_000_000
    loan_rate = 0.12
    loan_years = 15

    monthly_mortgage = annuity_payment(loan_amount, loan_rate, loan_years)

    def mortgage(month):
        return monthly_mortgage if month < loan_years * 12 else 0

    alice = Person(
        name="Алиса",
        balance=100_000,
        salary=200_000,
        expenses=[
            mortgage,
            4000,   # продукты
            1500    # транспорт
        ]
    )

    #  Симуляция
    for month in range(months):
        bob.monthly_update(month)
        alice.monthly_update(month)

    print(f"\nЧерез {years} лет:")
    print(bob)
    print(alice)






if __name__ == "__main__":
    years_to_simulate = float(input("Введите количество лет для симуляции: "))
    simulate(years_to_simulate)

# Исправленно с учетом правок 07.09.2025