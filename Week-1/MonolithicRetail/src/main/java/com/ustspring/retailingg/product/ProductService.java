package com.ustspring.retailingg.product;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product create(Product p) { return repo.save(p); }
    public List<Product> getAll() { return repo.findAll(); }
    public Product getById(Long id) { return repo.findById(id).orElse(null); }
    public Product update(Long id, Product updated) {
        Product p = repo.findById(id).orElse(null);
        if (p == null) return null;
        p.setName(updated.getName());
        p.setPrice(updated.getPrice());
        p.setQuantity(updated.getQuantity());
        return repo.save(p);
    }
    public void delete(Long id) { repo.deleteById(id); }
}
