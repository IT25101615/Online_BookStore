package com.bookstore.model;

/**
 * Review Entity
 * Demonstrates Encapsulation to secure review data.
 */
public class Review extends BaseEntity {
    private String bookId;
    private String customerId;
    private int rating; // 1-5
    private String comment;

    public Review() {
        super();
    }

    public Review(String id, String bookId, String customerId, int rating, String comment) {
        super(id);
        this.bookId = bookId;
        this.customerId = customerId;
        setRating(rating); // use setter to enforce encapsulation logic
        this.comment = comment;
    }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public int getRating() { return rating; }
    
    public void setRating(int rating) { 
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating; 
    }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    @Override
    public String toCsvRow() {
        // Enclosing comment in quotes in case it contains commas
        return String.join(",", getId(), bookId, customerId, String.valueOf(rating), "\"" + comment + "\"");
    }

    @Override
    public void fromCsvRow(String csvRow) {
        // Simple split, proper CSV parsing would handle quotes better
        String[] parts = csvRow.split(",");
        if (parts.length >= 5) {
            setId(parts[0]);
            this.bookId = parts[1];
            this.customerId = parts[2];
            this.rating = Integer.parseInt(parts[3]);
            this.comment = parts[4].replaceAll("\"", "");
        }
    }
}
