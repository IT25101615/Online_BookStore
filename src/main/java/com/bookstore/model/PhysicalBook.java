package com.bookstore.model;

/**
 * Demonstrates Inheritance from Book class.
 */
public class PhysicalBook extends Book {
    private double weightKg;

    public PhysicalBook() {
        super();
    }

    public PhysicalBook(String id, String title, String author, double price, String image, String category, int stock, double weightKg) {
        super(id, title, author, price, image, category, stock);
        this.weightKg = weightKg;
    }

    public double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(double weightKg) {
        this.weightKg = weightKg;
    }
}
