package com.bookstore.controller;

import com.bookstore.model.Author;
import com.bookstore.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/authors")
public class AuthorController {

    private final AuthorRepository authorRepository;

    @Autowired
    public AuthorController(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @GetMapping("/add")
    public String showAddAuthorForm(Model model) {
        model.addAttribute("author", new Author());
        return "addAuthor";
    }

    @PostMapping("/add")
    public String addAuthor(@ModelAttribute("author") Author author) {
        author.setId(UUID.randomUUID().toString());
        authorRepository.save(author);
        return "redirect:/authors/list";
    }

    @GetMapping("/list")
    public String listAuthors(@RequestParam(required = false) String genre, Model model) {
        if (genre != null && !genre.isEmpty()) {
            model.addAttribute("authors", authorRepository.findByGenre(genre));
        } else {
            model.addAttribute("authors", authorRepository.findAll());
        }
        return "authorList";
    }

    @PostMapping("/update")
    public String updateAuthor(@ModelAttribute("author") Author author) {
        authorRepository.save(author);
        return "redirect:/authors/list";
    }
}
