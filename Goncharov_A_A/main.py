# main.py
# TODO:Better input
# FIXME:pls add input checking
from person import Person
from simulation import Simulation

def main():
    print("=== Bob and Alice Life Simulation ===")

 # вывел проверку в отдельную функцию, чтобы изолировать и переиспользовать логику проверок
 # (все как гласят великие праила на notion 10it :) )   

    def read_int(prompt, min_value=None, max_value=None):
        while True:
            try:
                raw = input(prompt)
                value = int(raw)
                if min_value is not None and value < min_value:
                    print(f"Value must be >= {min_value}. Try again.")
                    continue
                if max_value is not None and value > max_value:
                    print(f"Value must be <= {max_value}. Try again.")
                    continue
                return value
            except ValueError:
                print("Please enter a valid integer.")

    years = read_int("Enter simulation duration in years: ", min_value=1)
    output_frequency = read_int("Enter output frequency (1-12 months): ", min_value=1, max_value=12)
    
    bob = Person("Bob", 80000, {
        "rent": 30000,
        "food": 4000,
        "transport": 1500,
        "cat_food": 2000,
        "cat_care": 1500
    })
    
    alice = Person("Alice", 200000, {
        "mortgage": 100000,
        "food": 4000,
        "transport": 1500
    })
    
    simulation = Simulation(years=years, output_frequency=output_frequency)
    simulation.add_person(bob)
    simulation.add_person(alice)
    
    results = simulation.run()
    simulation.print_results()
    
    print("\n=== FINAL RESULTS ===")
    for person in [bob, alice]:
        print(f"{person.name}: Total savings {person.savings} RUB")

if __name__ == "__main__":
    main()
