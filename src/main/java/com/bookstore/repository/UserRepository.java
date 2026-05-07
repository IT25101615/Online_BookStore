package com.bookstore.repository;

import com.bookstore.model.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository extends FileRepository<User> {
    
    public UserRepository() {
        super("users.txt", User::new);
    }

    public Optional<User> findByUsername(String username) {
        if (username == null) return Optional.empty();
        return findAll().stream()
                .filter(user -> username.equals(user.getUsername()))
                .findFirst();
    }
}
