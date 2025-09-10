#include <iostream>
#include <iomanip>
#include <cmath>

// боб инит
class Bob {
public:
    double salary_per_month = 80000;      
    double rent_per_month = 30000;       
    double food_expenses = 4000;         
    double transport_expenses = 1500;     
    double cat_food = 2000;                 
    double cat_wash_and_trimming = 3000;     

    double savings = 0;                   
    double rent_value = 30000;            
    int years_passed = 0;            
    int months = 0;                      
    int cat_service_counter = 0;       

    void simulate_month() {

        double total_expenses = rent_per_month + food_expenses + transport_expenses + cat_food;
        if (cat_service_counter == 0) {
            total_expenses += cat_wash_and_trimming;
        }

        double income = salary_per_month;

   
        savings += (income - total_expenses);

      
        cat_service_counter = (cat_service_counter + 1) % 2;
    }

    void simulate_year() {
  
        rent_value *= 1.05;
        rent_per_month = rent_value;
        years_passed++;
    }

    void simulate_monthly() {
        simulate_month();
        months++;
        if (months % 12 == 0) {
            simulate_year();
        }
    }
    // Вывод 
    void print_status() const {
        std::cout << "Bob:\n";
        std::cout << "  Накопления: " << std::fixed << std::setprecision(2) << savings << " руб\n";
        std::cout << "  Стоимость аренды (годовая): " << rent_value << " руб\n";
    }
};


class Alice {
public:
    double salary_per_month = 200000;   
    double property_value = 10000000;     
    double mortgage_rate = 0.12;          
    double rent_per_month;                  
    double food_expenses = 4000;             
    double transport_expenses = 1500;        

    double savings = 0;                 
    double mortgage_balance;                 
    int months_passed = 0;                 

    Alice() {
        mortgage_balance = property_value;

        rent_per_month = transport_expenses;
    }

    void simulate_month() {

        double monthly_interest = mortgage_rate / 12;
        double interest_payment = mortgage_balance * monthly_interest;

        double principal_payment = 0;

        mortgage_balance += interest_payment;

        double total_expenses = food_expenses + transport_expenses;

        double income = salary_per_month;

        savings += (income - total_expenses - interest_payment);
    }

    void simulate_monthly() {
        simulate_month();
        months_passed++;
    }

    void print_status() const {
        std::cout << "Alice:\n";
        std::cout << "  Накопления: " << std::fixed << std::setprecision(2) << savings << " руб\n";
        std::cout << "  Остаток по ипотеке: " << mortgage_balance << " руб\n";
    }
};

int main() {
    // ру локал
    setlocale(LC_ALL, "ru");
    // инстансы
    Bob bob;
    Alice alice;

    int total_months = 12 * 10;
    // итерация по месяцам
    for (int month = 1; month <= total_months; ++month) {
        bob.simulate_monthly();
        alice.simulate_monthly();
        // принтим месяц и статус
        if (month % 12 == 0) {
            std::cout << "=== Год " << month / 12 << " ===\n";
            bob.print_status();
            alice.print_status();
            std::cout << "-----------------------------\n";
        }
    }
    // принты итогов
    std::cout << "Итог за 10 лет:\n";
    bob.print_status();
    alice.print_status();

    return 0;
}