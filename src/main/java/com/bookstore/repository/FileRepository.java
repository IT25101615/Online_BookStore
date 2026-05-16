package com.bookstore.repository;

import com.bookstore.model.BaseEntity;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

public abstract class FileRepository<T extends BaseEntity> {
    private final String filePath;
    private final Supplier<T> entitySupplier;

    public FileRepository(String fileName, Supplier<T> entitySupplier) {
        this.filePath = "data/" + fileName;
        this.entitySupplier = entitySupplier;
        ensureFileExists();
    }

    private void ensureFileExists() {
        File file = new File(filePath);
        file.getParentFile().mkdirs();
        try {
            if (file.createNewFile()) {
                System.out.println("Created file: " + filePath);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<T> findAll() {
        List<T> entities = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                T entity = entitySupplier.get();
                entity.fromCsvRow(line);
                entities.add(entity);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return entities;
    }

    public Optional<T> findById(String id) {
        if (id == null) return Optional.empty();
        return findAll().stream()
                .filter(entity -> id.equals(entity.getId()))
                .findFirst();
    }

    public T save(T entity) {
        List<T> entities = findAll();
        boolean found = false;
        if (entity.getId() == null) {
            entity.setId(java.util.UUID.randomUUID().toString());
        } else {
            for (int i = 0; i < entities.size(); i++) {
                if (entities.get(i).getId() != null && entities.get(i).getId().equals(entity.getId())) {
                    entities.set(i, entity);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            entities.add(entity);
        }
        writeToFile(entities);
        return entity;
    }

    public void deleteById(String id) {
        if (id == null) return;
        List<T> entities = findAll();
        entities.removeIf(entity -> id.equals(entity.getId()));
        writeToFile(entities);
    }

    private void writeToFile(List<T> entities) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            for (T entity : entities) {
                writer.write(entity.toCsvRow());
                writer.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
