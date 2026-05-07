package com.bookstore.model;

/**
 * Demonstrates Inheritance: AdminUser inherits from User
 */
public class AdminUser extends User {
    private String adminLevel; // e.g., SuperAdmin, Manager

    public AdminUser() {
        super();
    }

    public AdminUser(String id, String username, String password, String email, String adminLevel) {
        super(id, username, password, email, "admin"); // Inherited role set to "admin"
        this.adminLevel = adminLevel;
    }

    public String getAdminLevel() {
        return adminLevel;
    }

    public void setAdminLevel(String adminLevel) {
        this.adminLevel = adminLevel;
    }

    @Override
    public String toCsvRow() {
        return super.toCsvRow() + "," + adminLevel;
    }

    @Override
    public void fromCsvRow(String csvRow) {
        super.fromCsvRow(csvRow);
        String[] parts = csvRow.split(",");
        if (parts.length >= 6) {
            this.adminLevel = parts[5];
        }
    }
}
