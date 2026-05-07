package com.bookstore.controller;

import com.bookstore.model.User;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Show registration form
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        return "register"; // Resolves to /WEB-INF/views/register.jsp
    }

    // Process registration
    @PostMapping("/register")
    public String registerUser(@ModelAttribute("user") User user, Model model) {
        try {
            // Check if username already exists
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                model.addAttribute("error", "Username already exists.");
                return "register";
            }
            
            user.setId(UUID.randomUUID().toString()); // Generate a unique ID
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("customer"); // default role
            }
            userRepository.save(user);
            return "redirect:/users/login";
        } catch (Exception e) {
            model.addAttribute("error", "Error during registration: " + e.getMessage());
            return "register";
        }
    }

    // Show login form
    @GetMapping("/login")
    public String showLoginForm() {
        return "login"; // Resolves to /WEB-INF/views/login.jsp
    }

    // Handle login submission (basic implementation)
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, Model model) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getPassword().equals(password)) {
                        model.addAttribute("message", "Login successful!");
                        return "redirect:/users/profile?id=" + user.getId();
                    } else {
                        model.addAttribute("error", "Invalid password.");
                        return "login";
                    }
                })
                .orElseGet(() -> {
                    model.addAttribute("error", "User not found.");
                    return "login";
                });
    }

    // Show profile
    @GetMapping("/profile")
    public String showProfile(@RequestParam String id, Model model) {
        return userRepository.findById(id)
                .map(user -> {
                    model.addAttribute("user", user);
                    return "profile";
                })
                .orElseGet(() -> {
                    model.addAttribute("error", "Profile not found.");
                    return "redirect:/users/login";
                });
    }
    
    // Process update
    @PostMapping("/update")
    public String updateUser(@ModelAttribute("user") User user, Model model) {
        try {
            // Keep the original username and password if not changed, for simplicity we assume full object is passed
            userRepository.save(user);
            return "redirect:/users/profile?id=" + user.getId();
        } catch (Exception e) {
            model.addAttribute("error", "Error updating profile: " + e.getMessage());
            model.addAttribute("user", user);
            return "profile";
        }
    }
}
