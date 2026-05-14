package com.bookstore.repository;

import com.bookstore.model.Review;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ReviewRepository extends FileRepository<Review> {
    
    public ReviewRepository() {
        super("reviews.txt", Review::new);
    }

    public List<Review> findByBookId(String bookId) {
        if (bookId == null) return List.of();
        return findAll().stream()
                .filter(review -> bookId.equals(review.getBookId()))
                .collect(Collectors.toList());
    }
}
