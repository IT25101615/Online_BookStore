package com.bookstore.model;

/**
 * User Entity class.
 * Demonstrates Inheritance (from BaseEntity) and Encapsulation (private fields, getters/setters).
 */
public class User extends BaseEntity {
    private String username;
    private String password;
    private String email;
    private String role; // "admin", "customer"

    public User() {
        super();
    }

    public User(String id, String username, String password, String email, String role) {
        super(id);
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toCsvRow() {
        // Simple CSV format: id,username,password,email,role
        return String.join(",", getId(), username, password, email, role);
    }

    @Override
    public void fromCsvRow(String csvRow) {
        String[] parts = csvRow.split(",");
        if (parts.length >= 5) {
            setId(parts[0]);
            this.username = parts[1];
            this.password = parts[2];
            this.email = parts[3];
            this.role = parts[4];
        }
    }
}
