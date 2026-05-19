package com.bookstore.repository;

import com.bookstore.model.Author;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AuthorRepository extends FileRepository<Author> {
    
    public AuthorRepository() {
        super("authors.txt", Author::new);
    }

    public List<Author> findByGenre(String genre) {
        if (genre == null) return List.of();
        return findAll().stream()
                .filter(author -> genre.equals(author.getGenre()))
                .collect(Collectors.toList());
    }
}
