package com.bookstore.repository;

import com.bookstore.model.AdminUser;
import org.springframework.stereotype.Repository;

@Repository
public class AdminRepository extends FileRepository<AdminUser> {
    
    public AdminRepository() {
        super("admins.txt", AdminUser::new);
    }
}
