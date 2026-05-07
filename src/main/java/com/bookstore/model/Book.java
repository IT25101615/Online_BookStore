package com.bookstore.model;

/**
 * Base class for Books.
 * Demonstrates Inheritance when extended by PhysicalBook and DigitalBook.
 */
public class Book extends BaseEntity {
    private String title;
    private String author;
    private double price;
    private String image;
    private String category;
    private int stock;

    public Book() {
        super();
    }

    public Book(String id, String title, String author, double price, String image, String category, int stock) {
        super(id);
        this.title = title;
        this.author = author;
        this.price = price;
        this.image = image;
        this.category = category;
        this.stock = stock;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    @Override
    public String toCsvRow() {
        // Use | as separator since image URLs contain commas sometimes
        return String.join("|", 
            safe(getId()), safe(title), safe(author), 
            String.valueOf(price), safe(image), safe(category), 
            String.valueOf(stock));
    }

    @Override
    public void fromCsvRow(String csvRow) {
        String[] parts = csvRow.split("\\|", -1);
        if (parts.length >= 4) {
            setId(parts[0]);
            this.title = parts[1];
            this.author = parts[2];
            this.price = Double.parseDouble(parts[3]);
            this.image = parts.length > 4 ? parts[4] : "";
            this.category = parts.length > 5 ? parts[5] : "Uncategorized";
            this.stock = parts.length > 6 ? parseInt(parts[6]) : 0;
        }
    }

    private String safe(String s) {
        return s != null ? s : "";
    }

    private int parseInt(String s) {
        try { return Integer.parseInt(s); } catch (Exception e) { return 0; }
    }
}
