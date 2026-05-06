package com.bookstore.model;

import java.io.Serializable;

/**
 * Base class for all entities in the system.
 * Demonstrates Abstraction and Inheritance.
 */
public abstract class BaseEntity implements Serializable {
    private String id;

    public BaseEntity() {
    }

    public BaseEntity(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    /**
     * Convert entity to a comma-separated string for file storage
     */
    public abstract String toCsvRow();

    /**
     * Load entity properties from a comma-separated string
     */
    public abstract void fromCsvRow(String csvRow);
}
