Bob_zp = 80_000
Alice_zp = 200_000

class Person:
    def __init__(self, name, zp, rent=None, other=None):
        self.name = name
        self.start_money = 100_000
        self.zp = zp
        self.rent = rent
        self.other = other
        self.history = []
    
    def add_income(self, amount, reason):
        self.start_money += amount
        self.history.append(f"{reason}: +{amount:,} руб.")
    
    def add_expense(self, amount, reason):
        self.start_money -= amount
        self.history.append(f"{reason}: -{amount:,} руб.")
    
    def __str__(self):
        return f"{self.name}: {self.start_money:,.0f} руб.".replace(",", " ")

    def month_update(self, year, month, bob_rent, bob_other):
        if self.name == "Боб":
            current_rent = bob_rent * (1.05 ** year)
            self.add_income(self.zp, f"Зарплата {month}/{year+1}")
            self.add_expense(current_rent, f"Аренда {month}/{year+1}")
            self.add_expense(bob_other, f"Траты {month}/{year+1}")
            return current_rent
        else:
            self.add_income(self.zp, f"Зарплата {month}/{year+1}")
            return None

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

bob = Person("Боб", Bob_zp, bob_rent, bob_other)
alice = Person("Алис", Alice_zp)

for year in range(years):
    for month in range(1, 13):
        current_rent = bob.month_update(year, month, bob_rent, bob_other)
        print(f"Год {year+1}, Месяц {month}: Боб - +{Bob_zp:,} -{current_rent:,} -{bob_other:,} = {bob.start_money:,} руб.")
    
    spending = alice_mortgage if year < 30 else alice_after
    for month in range(1, 13):
        alice.month_update(year, month, None, None)
        alice.add_expense(spending, f"Траты {month}/{year+1}")
        print(f"Год {year+1}, Месяц {month}: Алис - +{Alice_zp:,} -{spending:,} = {alice.start_money:,} руб.")
    
print("--- Год {year+1} завершен ---","\n","Боб: {bob.start_money:,} руб.","\n","Алис: {alice.start_money:,} руб.","\n","")

print(bob)
print(alice)
