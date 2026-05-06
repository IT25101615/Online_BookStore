package com.bookstore.controller;

import com.bookstore.model.Order;
import com.bookstore.repository.OrderRepository;
import com.bookstore.service.PaymentProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final PaymentProcessor paymentProcessor;

    @Autowired
    public OrderController(OrderRepository orderRepository, PaymentProcessor paymentProcessor) {
        this.orderRepository = orderRepository;
        this.paymentProcessor = paymentProcessor;
    }

    @PostMapping("/checkout")
    public String checkout(@RequestParam String userId, @RequestParam double totalAmount, Model model) {
        boolean paymentSuccess = paymentProcessor.processPayment(totalAmount);
        
        if (paymentSuccess) {
            Order order = new Order(
                    UUID.randomUUID().toString(),
                    userId,
                    totalAmount,
                    "Pending",
                    LocalDateTime.now().toString()
            );
            orderRepository.save(order);
            return "redirect:/orders/history?userId=" + userId;
        } else {
            model.addAttribute("error", "Payment failed");
            return "cart";
        }
    }

    @GetMapping("/history")
    public String viewHistory(@RequestParam String userId, Model model) {
        model.addAttribute("orders", orderRepository.findByUserId(userId));
        return "orderHistory";
    }

    @PostMapping("/updateStatus")
    public String updateStatus(@RequestParam String id, @RequestParam String status) {
        orderRepository.findById(id).ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
        return "redirect:/orders/history?userId=admin"; // Simple redirect for demo
    }
}
