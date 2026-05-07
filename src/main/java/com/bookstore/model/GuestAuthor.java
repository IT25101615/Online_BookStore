package com.bookstore.model;

/**
 * Subclass of Author demonstrating Polymorphism.
 */
public class GuestAuthor extends Author {
    
    private String guestPeriod;

    public GuestAuthor() {
        super();
    }

    public GuestAuthor(String id, String name, String bio, String genre, String guestPeriod) {
        super(id, name, bio, genre);
        this.guestPeriod = guestPeriod;
    }

    public String getGuestPeriod() {
        return guestPeriod;
    }

    public void setGuestPeriod(String guestPeriod) {
        this.guestPeriod = guestPeriod;
    }

    @Override
    public String displayProfile() {
        // Polymorphic behavior: overrides base method
        return "GUEST Author: " + getName() + " (Guest Period: " + guestPeriod + ") | Genre: " + getGenre();
    }

    @Override
    public String toCsvRow() {
        return super.toCsvRow() + "," + guestPeriod;
    }
}
