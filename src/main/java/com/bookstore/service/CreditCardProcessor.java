package com.bookstore.service;

import org.springframework.stereotype.Service;

@Service
public class CreditCardProcessor implements PaymentProcessor {

    @Override
    public boolean processPayment(double amount) {
        // Implement credit card processing logic
        System.out.println("Processing credit card payment of $" + amount);
        return true;
    }
}
