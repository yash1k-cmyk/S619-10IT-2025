import random
# Запрашиваем количество лет
while True:
    try:
        h = int(input('Введите количество лет от 1 до 100: '))
        if 1 <= h <= 100:
            break
        else:
            print('Ошибка! Введено число вне диапазона. Попробуйте снова.')
    except ValueError:
        print('Ошибка! Необходимо ввести целое число.')
# Запрашиваем номер месяца
while True:
    try:
        j = int(input('Введите номер месяца (от 1 до 12): '))
        if 1 <= j <= 12:
            break
        else:
            print('Ошибка! Введён неверный месяц. Попробуйте снова.')
    except ValueError:
        print('Ошибка! Необходимо ввести целое число.')
# Класс Person
class Person:
    def __init__(self, name, salary, rent=0, food=0, transport=0, loan=0, dep=0, cat_food=0, cat_str=0):
        # Сохраняем переданные параметры
        self.name = name  # Имя
        self.salary = salary  # Заработная плата
        self.rent = rent  # Платежи за аренду
        self.food = food  # Затраты на продукты питания
        self.transport = transport  # Затраты на транспорт
        self.loan = loan  # Выплаты по кредиту
        self.dep = dep  # Выплаты по депозиту
        self.cat_food = cat_food  # Стоимость корма для кота
        self.cat_str = cat_str  # Дополнительные выплаты (неопределённые строки расходов)
    def income(self, months):
        total = 0
        for _ in range(months):
            # Случайная вывод
            vivod_iz_depa = random.randint(1, 100000) if random.randint(1, 100000) > 5000 else 0
            # Сумма постоянных расходов
            expenses = self.rent + self.food + self.transport + self.loan + self.dep + self.cat_food + self.cat_str
            # Прибыль за месяц = зарплата - расходы + случайная доплата
            total += self.salary - expenses + vivod_iz_depa
        return total
    # Метод для вычисления ежемесячной чистой прибыли
    def calculate_monthly_income(self):
        # Случайная дополнительная выплата, если условие выполнено
        vivod_iz_depa = random.randint(1, 100000) if random.randint(1, 100000) > 5000 else 0
        # Постоянные расходы
        expenses = self.rent + self.food + self.transport + self.loan + self.dep + self.cat_food + self.cat_str
        # Чистый заработок за месяц
        return self.salary - expenses + vivod_iz_depa
# Создаём объекты персонажей
bob = Person(name="Bob",
salary=80_000,
rent=30_000,
food=4_000,
transport=1_500,
dep=5000,
cat_food=2000,
cat_str=3000)

alice = Person(
name="Alice",
salary=200_000,
loan=(100_000 * 0.12) / 12,
food=4_000,
transport=1_500,
dep=10000)
# Всего месяцев для расчётов
months_total = h * 12 + j
# Выведем общие доходы за указанный период
print(f'\\Доход за {months_total} месяцев:\\n'
      f'- Боб ({bob.name}): {bob.income(months_total):,.2f}\\n'
      f'- Алиса ({alice.name}): {alice.income(months_total):,.2f}')
# Детализация по каждому месяцу
for m in range(1, months_total + 1):
    print(f'\\{m}-й месяц:')
    print(f'- Боб ({bob.name}) получает чистой прибыли: {bob.calculate_monthly_income():,.2f} рублей')
    print(f'- Алиса ({alice.name}) получает чистой прибыли: {alice.calculate_monthly_income():,.2f} рублей')