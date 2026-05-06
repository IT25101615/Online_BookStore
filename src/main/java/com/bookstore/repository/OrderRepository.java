package com.bookstore.repository;

import com.bookstore.model.Order;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class OrderRepository extends FileRepository<Order> {
    
    public OrderRepository() {
        super("orders.txt", Order::new);
    }

    public List<Order> findByUserId(String userId) {
        if (userId == null) return List.of();
        return findAll().stream()
                .filter(order -> userId.equals(order.getUserId()))
                .collect(Collectors.toList());
    }
}
