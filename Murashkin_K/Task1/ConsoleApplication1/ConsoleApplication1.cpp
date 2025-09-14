#include <iostream>
#include <cstdio>
#include <iomanip>
#include <cmath>


class Person
{
public:
    double salary_per_month;
    const double food_expenses = 4000;
    const double transport_expenses = 1500;

    virtual void print_status() {}
    virtual void simulate_month() {}
    virtual void simulate_year() {}
};

class Bob : Person {
public:      
    double rent_per_month = 30000;     
    double rent_per_year = 0;
    double cat_food = 2000;                 
    double cat_wash_and_trimming = 3000;     
    double refueling_a_car = 6000;

    double savings = 0;                                                          
    int cat_service_counter = 0;


    Bob()
    {
        salary_per_month = 80000;
    }

    void simulate_month() override
    {

        double total_expenses = rent_per_month + food_expenses + transport_expenses + cat_food + refueling_a_car;
        if (cat_service_counter == 0 || cat_service_counter % 2 == 0) {
            total_expenses += cat_wash_and_trimming;
        }
   
        savings += (salary_per_month - total_expenses);

        cat_service_counter++;
    }

    void simulate_year() override
    {
        for (int i = 0; i < 12; i++)
        {
            simulate_month();
        }

        rent_per_month += ((rent_per_month * 5) / 100);
        rent_per_year = rent_per_month * 12;
    }


    void print_status() override
    {
        simulate_year();
        std::cout << "Bob:\n";
        std::cout << "  Накопления: " << std::fixed << std::setprecision(2) << savings << " руб\n";
        std::cout << "  Стоимость аренды (годовая): " << rent_per_year << " руб\n";
    }
};


class Alice : Person {
public:      
    double mortgage_balance = 10000000;
    double mortgage_rate = 0.12;                          

    double savings = 0;                                                 

    Alice() {
        salary_per_month = 200000;
    }

    void simulate_month() override
    {

        double monthly_interest = mortgage_rate / 12;
        double interest_payment = mortgage_balance * monthly_interest;

        mortgage_balance += interest_payment;

        double total_expenses = food_expenses + transport_expenses;

        savings += (salary_per_month - total_expenses - interest_payment);
    }

    void simulate_year() override
    {
        for (int i = 0; i < 12; i++)
        {
            simulate_month();
        }
    }

    void print_status() override
    {
        simulate_year();
        std::cout << "Alice:\n";
        std::cout << "  Накопления: " << std::fixed << std::setprecision(2) << savings << " руб\n";
        std::cout << "  Остаток по ипотеке: " << mortgage_balance << " руб\n";
    }
};

int parseArgs()
{
    int l;
    printf("Введите кол-во лет: ");
    std::cin >> l;
    return l;
}

int main() {

    setlocale(LC_ALL, "ru");

    int len = parseArgs();

    Bob bob;
    Alice alice;

    printf("\n\n");

    for (int i = 1; i <= len; i++)
    {
        printf("Год: %d\n", i);
        bob.print_status();
        alice.print_status();
        printf("===================================\n\n");
    }

    return 0;
}