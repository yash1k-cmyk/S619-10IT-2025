import random


# Класс для управления деньгами
class FinanceManager:
    def __init__(self, start_balance):
        self.balance = start_balance
        self.expenses = []
        self.incomes = []

    def add_expense(self, amount):
        self.expenses.append(amount)

    def add_income(self, amount):
        self.incomes.append(amount)

    def update_balance(self):
        total_income = sum(self.incomes)
        total_expenses = sum(self.expenses)
        self.balance += total_income - total_expenses
        return total_income, total_expenses


# Базовый класс человека
class Person:
    def __init__(self, name, money, salary):
        self.name = name
        self.money = money
        self.salary = salary

    def monthly_update(self, month):
        # Добавляем зарплату
        income = self.salary
        expenses = 0

        # Считаем дополнительные доходы и расходы
        extra_income, extra_expenses = self.calculate_extras(month)
        income += extra_income
        expenses += extra_expenses

        # Обновляем баланс
        self.money += income - expenses
        return income, expenses

    def calculate_extras(self, month):
        return 0, 0  # Будет переопределено в детских классах


# Класс Боба (арендует)
class Bob(Person):
    def __init__(self, name, money,salary):
        super().__init__(name, money, salary)
        self.cat_food = 2000
        self.transport = 1500
        self.food = 4000
        self.taxi = 800 * 3
    def calculate_extras(self, month):
        income = 0
        expenses = 0

        # Аренда растет на 5% в год
        rent = 30000 * 1.05 ** (month // 12)
        expenses += rent

        # Постоянные расходы
        expenses += self.food + self.transport + self.cat_food

        # Такси 3 раза в месяц
        expenses += self.taxi

        # Уход за котом раз в 2 месяца
        if month % 2 == 0:
            expenses += 3000

        return income, expenses


# Класс Алисы (ипотека)
class Alice(Person):
    def __init__(self,name, money, salary):
        super().__init__(name, money, salary)
        self.food = 4000
        self.transport = 1500
        self.dog_food = 2000
    def calculate_extras(self, month):
        income = 0
        expenses = 0

        # Ипотека (12% годовых на 15 лет)
        if month < 15 * 12:
            loan = 10000000
            rate = 0.12 / 12
            months = 15 * 12
            mortgage = (loan * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1)
            expenses += mortgage

        # Бизнес доходы и расходы
        income += 150000  # доход от бизнеса
        expenses += 60000  # расходы на бизнес

        # Постоянные расходы
        expenses += self.food + self.transport + self.dog_food

        # Уход за собакой раз в 2 месяца
        if month % 2 == 1:
            expenses += 5000

        # Случайный выигрыш на выставке (25% шанс)
        if random.random() < 0.25:
            income += 100000

        return income, expenses


# Основная программа
def main():
    # Создаем персонажей
    bob = Bob("Боб", 100000, 80000)
    alice = Alice("Алиса", 100000, 200000)

    # Запускаем симуляцию
    years = int(input("Сколько лет симулируем? "))

    for month in range(years * 12):
        # Обновляем финансы за месяц
        bob.monthly_update(month)
        alice.monthly_update(month)

        # Показываем результат каждый год
        if (month + 1) % 12 == 0:
            year = (month + 1) // 12
            print(f"\nГод {year}:")
            print(f"Боб: {bob.money:,.0f} руб.")
            print(f"Алиса: {alice.money:,.0f} руб.")

    # Финальный результат
    print(f"\nИтог за {years} лет:")
    print(f"Боб: {bob.money:,.0f} руб.")
    print(f"Алиса: {alice.money:,.0f} руб.")


# Запуск
if __name__ == "__main__":
    main()
