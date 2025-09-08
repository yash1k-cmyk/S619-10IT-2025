# simulation.py
#
#TODO:More events (and not boring as current ones)

import random

class Simulation:
    def __init__(self, years=5, output_frequency=1):
        self.months = years * 12
        self.output_frequency = output_frequency
        self.people = []
        self.results = []
        
    def add_person(self, person):
        self.people.append(person)
        
    def get_random_event(self, person):
        events = [
            ("Cat scratched the sofa", 0.1, -8000),
            ("Bad investment", 0.08, -15000),
            ("Successful investment", 0.05, 10000),
            ("Mr. Beast DONATED MONEY YEEEES", 0.01, 99999),
            ("Received bonus", 0.07, 15000),
            ("Cat got sick", 0.06, -5000),
            ("Found part-time job", 0.04, 7000),
            ("Appliances broke", 0.09, -6000),
            ("Car repair", 0.07, -12000),
            ("Tax refund", 0.03, 8000),
            ("Medical emergency", 0.05, -20000)
        ]
        
        for event_name, probability, amount in events:
            if random.random() < probability:
                person.savings += amount
                return f"{event_name}: {amount} RUB"
        
        return "No events"
    
    def handle_investments(self, person):
        if person.name == "Alice" and random.random() < 0.3:
            investment_return = random.uniform(0.9, 1.15)
            person.investments = int(person.investments * investment_return)
            return f"Investment update: {investment_return:.2f}x return"
        return ""
        
    def run(self):
        for month in range(1, self.months + 1):
            month_result = {"month": month, "people": []}
            
            if month % 12 == 0:
                for person in self.people:
                    if person.name == "Bob" and "rent" in person.expenses:
                        old_rent = person.expenses["rent"]
                        person.expenses["rent"] = int(old_rent * 1.05)
            
            for person in self.people:
                person.update_savings()
                event_text = self.get_random_event(person)
                investment_text = self.handle_investments(person)
                
                if investment_text:
                    event_text += f" | {investment_text}"
                
                month_result["people"].append({
                    "name": person.name,
                    "savings": person.savings,
                    "investments": person.investments,
                    "event": event_text
                })
            
            self.results.append(month_result)
            
        return self.results
    
    def print_results(self):
        current_year = 0
        for i, month in enumerate(self.results):
            year = (month['month'] - 1) // 12 + 1
            if year != current_year:
                print(f"\n=== YEAR {year} ===")
                current_year = year
                
            if (i + 1) % self.output_frequency == 0 or i == len(self.results) - 1:
                print(f"\nMonth {month['month']}:")
                for person in month["people"]:
                    print(f"  {person['name']}: Savings {person['savings']} RUB | "
                          f"Investments {person['investments']} RUB | {person['event']}")
