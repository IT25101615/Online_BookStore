package com.bookstore.service;

/**
 * Interface demonstrating Abstraction for payment calculation methods.
 */
public interface PaymentProcessor {
    boolean processPayment(double amount);
}
