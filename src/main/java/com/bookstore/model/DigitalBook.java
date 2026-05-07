package com.bookstore.model;

/**
 * Demonstrates Inheritance from Book class.
 */
public class DigitalBook extends Book {
    private double fileSizeMb;
    private String downloadLink;

    public DigitalBook() {
        super();
    }

    public DigitalBook(String id, String title, String author, double price, String image, String category, int stock, double fileSizeMb, String downloadLink) {
        super(id, title, author, price, image, category, stock);
        this.fileSizeMb = fileSizeMb;
        this.downloadLink = downloadLink;
    }

    public double getFileSizeMb() {
        return fileSizeMb;
    }

    public void setFileSizeMb(double fileSizeMb) {
        this.fileSizeMb = fileSizeMb;
    }

    public String getDownloadLink() {
        return downloadLink;
    }

    public void setDownloadLink(String downloadLink) {
        this.downloadLink = downloadLink;
    }
}
