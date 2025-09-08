from person import Person
from simulation import Simulation

def main():
    #i use arch btw
    bob = Person(
        'Bob', 80000, {
        'rent': 30000,
        'products': 4000,
        'transport': 1500,
        'cat`s food': 2000,
        'cat`s haircut': 1500,
            })

    alice = Person(
        'Alice', 200000, {
        'ipoteka': 100000,
        'products': 4000,
        'transport': 1500
            })

    simulation = Simulation(years=3)
    simulation.add_person(bob)
    simulation.add_person(alice)

    results = simulation.run()
    simulation.print_results()

    print("\n=== RESULTS ===")
    for person in [bob, alice]:
        print(f"{person.name} saved: {person.savings} rub.")

if __name__ == "__main__":
    main()
