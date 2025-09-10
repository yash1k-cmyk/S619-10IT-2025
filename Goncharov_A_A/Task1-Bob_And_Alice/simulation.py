# simulation.py
# TODO:Better events
import random
import webbrowser

class Simulation:
    def __init__(self, years=5, output_frequency=1, people: list=None):
        if people is None:
            people = []
        self.months = years * 12
        self.output_frequency = output_frequency
        self.people = people
        self.results = []

    def get_random_event(self, person):

        events = [
            ("Cat scratched the sofa", 0.1, -8000),
            ("Unexpected medical bill", 0.08, -12000),
            ("Received bonus", 0.07, 15000),
            ("MR BEAST DONATED U", 0.001, 999999),
            ("Cat got sick", 0.06, -6000),
            ("Found part-time job", 0.04, 7000),
            ("Appliances broke", 0.09, -6000),
            ("Car repair", 0.07, -12000),
            ("Tax refund", 0.03, 8000),
            ("Gift from relative", 0.05, 4500),
            ("Lost wallet", 0.02, -3000)
        ]

        for idx, (event_name, probability, amount) in enumerate(events):
            if random.random() <= probability:
                person.savings += amount
                return f"Event #{idx + 1} - {event_name}: {amount} RUB"

        return "No events"

    def run(self):
        for month in range(1, self.months + 1):
            month_result = {"month": month,
                            "people": []}
            
            if month % 12 == 0:
                for person in self.people:
                    if person.name == "Bob" and "rent" in person.expenses:
                        old_rent = person.expenses["rent"]
                        person.expenses["rent"] = int(old_rent * 1.05)
            if month % 1200 == 0:
                webbrowser.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            else: pass
            
            for person in self.people:
                person.update_savings()
                event_text = self.get_random_event(person)
                
                month_result["people"].append({
                    "name": person.name,
                    "savings": person.savings,
                    "event": event_text
                })
            
            self.results.append(month_result)
            
        return self.results
    
    def print_results(self, people: list):
        current_year = 0
        for i, month in enumerate(self.results):
            year = (month['month'] - 1) // 12 + 1
            if year != current_year:
                print(f"\n=== YEAR {year} ===")
                current_year = year
                
            if (i + 1) % self.output_frequency == 0 or i == len(self.results) - 1:
                print(f"\nMonth {month['month']}:")
                for person in month["people"]:
                    print(f"  {person['name']}: Savings {person['savings']} RUB | {person['event']}")
        print("\n=== FINAL RESULTS ===")

        for person in people:
            print(f"{person.name}: Total savings {person.savings} RUB")