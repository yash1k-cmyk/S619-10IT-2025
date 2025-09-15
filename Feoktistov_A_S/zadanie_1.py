class Person:
    def __init__(self, name):
        self.name = name
        self.money = 100000
        self.history = []
    
    def add_income(self, amount, reason):
        self.money += amount
        self.history.append(f"{reason}: +{amount:,} руб.")
    
    def add_expense(self, amount, reason):
        self.money -= amount
        self.history.append(f"{reason}: -{amount:,} руб.")
    
    def __str__(self):
        return f"{self.name}: {self.money:,.0f} руб.".replace(",", " ")

def get_numeric_input(prompt):

    while True:
        try:
            value = input(prompt)
            return int(value)
        except ValueError:
            print("Введите цифрами")

years = get_numeric_input("Количество лет: ")
bob_rent = get_numeric_input("Боб аренда: ")
bob_other = get_numeric_input("Боб другие: ")
alice_mortgage = get_numeric_input("Алис с ипотекой: ")
alice_after = get_numeric_input("Алис после: ")

bob = Person("Боб")
alice = Person("Алис")

for year in range(years):
    current_rent = bob_rent * (1.05 ** year)
    bob.add_income(960000, "Зарплата")
    bob.add_expense(current_rent * 12, "Аренда")
    bob.add_expense(bob_other * 12, "Траты")
    
    spending = alice_mortgage if year < 30 else alice_after
    alice.add_income(2400000, "Зарплата")
    alice.add_expense(spending * 12, "Траты")

print(bob)
print(alice)
