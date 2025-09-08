# main.py
# TODO:Better input
# FIXME:pls add input checking
from person import Person
from simulation import Simulation

def main():
    print("=== Bob and Alice Life Simulation ===")
    
    years = int(input("Enter simulation duration in years: "))
    output_frequency = int(input("Enter output frequency (1-12 months): "))
    
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
