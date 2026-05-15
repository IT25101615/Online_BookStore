package com.bookstore.controller;

import com.bookstore.model.Review;
import com.bookstore.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @PostMapping("/add")
    public String addReview(@ModelAttribute("review") Review review) {
        review.setId(UUID.randomUUID().toString());
        reviewRepository.save(review);
        return "redirect:/books/catalog"; // In a real app, redirect to the specific book details page
    }

    @GetMapping("/book")
    public String viewReviewsForBook(@RequestParam String bookId, Model model) {
        model.addAttribute("reviews", reviewRepository.findByBookId(bookId));
        return "bookReviews";
    }

    @GetMapping("/delete")
    public String deleteReview(@RequestParam String id) {
        reviewRepository.deleteById(id);
        return "redirect:/reviews/list";
    }
}
