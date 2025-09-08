import random

class Simulation:
    def __init__(self, years=5):
        self.month = years*12
        self.people = []
        self.results = []

    def add_person(self, person):
        self.people.append(person)

    def run(self):
        for month in range(1, self.month + 1):
            month_result = {"month": month, "people": []}

            for person in self.people:
                person.update_savings()
                
                #TODO: more events (not just money: examples:
                #TODO:                           cat's illness, broken car, etc...  ) , complicated callback
                if random.random() < 0.1:
                    events_impact = random.randint(-5000, 10000)
                    person.savings += event_impact
                    event_text = f"Random event: {event_impact}"
                else:
                    event_text = "No events ._."

                month_result["people"].append({
                        "name": person.name,
                        "savings": person.savings,
                        "event": event_text
                    })
            
            self.result.append(month_result)

        return self.results

    def print_results(self):
        for month in self.results:
            print(f"\nMonth {month['month']}:")
            for person in month["people"]:
                print(f"{person['name']}: {person['savings']} rub. ({person['event']})")
