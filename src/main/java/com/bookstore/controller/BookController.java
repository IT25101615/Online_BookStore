package com.bookstore.controller;

import com.bookstore.model.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository bookRepository;

    @Autowired
    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> getAllBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        if (search != null && !search.isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCase(search);
        }
        if (category != null && !category.isEmpty()) {
            return bookRepository.findByCategory(category);
        }
        return bookRepository.findAll();
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return bookRepository.findAllCategories();
    }

    @PostMapping
    public Book addBook(@RequestBody Book book) {
        if (book.getId() == null || book.getId().isEmpty()) {
            book.setId(UUID.randomUUID().toString());
        }
        return bookRepository.save(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable String id) {
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
