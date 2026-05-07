package com.bookstore.controller;

import com.bookstore.model.AdminUser;
import com.bookstore.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @GetMapping("/dashboard")
    public String showDashboard(Model model) {
        model.addAttribute("admins", adminRepository.findAll());
        return "adminDashboard";
    }

    @PostMapping("/add")
    public String addAdmin(@ModelAttribute("admin") AdminUser admin) {
        admin.setId(UUID.randomUUID().toString());
        admin.setRole("admin");
        adminRepository.save(admin);
        return "redirect:/admin/dashboard";
    }

    @GetMapping("/delete")
    public String deleteAdmin(@RequestParam String id) {
        adminRepository.deleteById(id);
        return "redirect:/admin/dashboard";
    }
}
