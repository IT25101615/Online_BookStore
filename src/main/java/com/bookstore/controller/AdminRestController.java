package com.bookstore.controller;

import com.bookstore.model.AdminUser;
import com.bookstore.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminRestController {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminRestController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        List<AdminUser> admins = adminRepository.findAll();
        for (AdminUser admin : admins) {
            if (admin.getUsername() != null && admin.getUsername().equals(username)
                    && admin.getPassword() != null && admin.getPassword().equals(password)) {
                return ResponseEntity.ok(admin);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid admin credentials."));
    }

    @GetMapping
    public List<AdminUser> getAllAdmins() {
        return adminRepository.findAll();
    }
}
