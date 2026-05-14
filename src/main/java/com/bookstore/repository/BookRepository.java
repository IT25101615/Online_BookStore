package com.bookstore.repository;

import com.bookstore.model.Book;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class BookRepository extends FileRepository<Book> {
    
    public BookRepository() {
        super("books.txt", Book::new);
    }

    public List<Book> findByTitleContainingIgnoreCase(String title) {
        if (title == null) return List.of();
        String lowerTitle = title.toLowerCase();
        return findAll().stream()
                .filter(book -> book.getTitle() != null && book.getTitle().toLowerCase().contains(lowerTitle))
                .collect(Collectors.toList());
    }

    public List<Book> findByCategory(String category) {
        if (category == null || category.isEmpty()) return findAll();
        String lowerCat = category.toLowerCase();
        return findAll().stream()
                .filter(book -> book.getCategory() != null && book.getCategory().toLowerCase().equals(lowerCat))
                .collect(Collectors.toList());
    }

    public List<String> findAllCategories() {
        return findAll().stream()
                .map(Book::getCategory)
                .filter(cat -> cat != null && !cat.isEmpty() && !cat.equals("Uncategorized"))
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
