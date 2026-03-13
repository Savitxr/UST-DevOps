package com.ustspring.retailingg.user;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User create(User u) { return repo.save(u); }
    public List<User> getAll() { return repo.findAll(); }
    public User getById(Long id) { return repo.findById(id).orElse(null); }
    public User update(Long id, User updated) {
        User u = repo.findById(id).orElse(null);
        if (u == null) return null;
        u.setName(updated.getName());
        u.setEmail(updated.getEmail());
        return repo.save(u);
    }
    public void delete(Long id) { repo.deleteById(id); }
}
