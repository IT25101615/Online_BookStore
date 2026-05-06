package com.bookstore.model;

import java.time.LocalDateTime;

public class Order extends BaseEntity {
    private String userId;
    private double totalAmount;
    private String status; // Pending, Shipped
    private String timestamp;

    public Order() {
        super();
    }

    public Order(String id, String userId, double totalAmount, String status, String timestamp) {
        super(id);
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.timestamp = timestamp;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    @Override
    public String toCsvRow() {
        return String.join(",", getId(), userId, String.valueOf(totalAmount), status, timestamp);
    }

    @Override
    public void fromCsvRow(String csvRow) {
        String[] parts = csvRow.split(",");
        if (parts.length >= 5) {
            setId(parts[0]);
            this.userId = parts[1];
            this.totalAmount = Double.parseDouble(parts[2]);
            this.status = parts[3];
            this.timestamp = parts[4];
        }
    }
}
