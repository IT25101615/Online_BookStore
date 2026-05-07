package com.bookstore.model;

/**
 * Author Entity
 * Demonstrates Polymorphism through displayProfile method which can be overridden by subclasses.
 */
public class Author extends BaseEntity {
    private String name;
    private String bio;
    private String genre;

    public Author() {
        super();
    }

    public Author(String id, String name, String bio, String genre) {
        super(id);
        this.name = name;
        this.bio = bio;
        this.genre = genre;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    /**
     * Polymorphic method
     */
    public String displayProfile() {
        return "Author: " + name + " | Genre: " + genre + " | Bio: " + bio;
    }

    @Override
    public String toCsvRow() {
        return String.join(",", getId(), name, bio, genre, "REGULAR");
    }

    @Override
    public void fromCsvRow(String csvRow) {
        String[] parts = csvRow.split(",");
        if (parts.length >= 4) {
            setId(parts[0]);
            this.name = parts[1];
            this.bio = parts[2];
            this.genre = parts[3];
        }
    }
}
