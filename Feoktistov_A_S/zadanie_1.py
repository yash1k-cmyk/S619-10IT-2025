class SimpleCashbox:
    def __init__(self, name):
        self.name = name
        self.money = 100000
        self.history = []
    def add_money(self, amount, reason):
        self.money += amount
        self.history.append(f"{reason}: {amount:+}")
    def __str__(self):
        return f"{self.name}: {self.money:,.0f} руб.".replace(",", " ")
# Использование
print("лет")
years = int(input())
bob_rent = int(input("Боб аренда: "))
bob_other = int(input("Боб другие: "))
alice_mortgage = int(input("Алис с ипотекой: "))
alice_after = int(input("Алис после: "))
bob = SimpleCashbox("Боб")
alice = SimpleCashbox("Алис")
for year in range(years):
    # Боб
    current_rent = bob_rent * (1.05 ** year)
    bob.add_money(960000, "Зарплата")
    bob.add_money(-current_rent * 12, "Аренда")
    bob.add_money(-bob_other * 12, "Траты")
    # Алис
    spending = alice_mortgage if year < 30 else alice_after
    alice.add_money(2400000, "Зарплата")
    alice.add_money(-spending * 12, "Траты")
print(bob)
print(alice)
