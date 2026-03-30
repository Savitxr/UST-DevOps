package com.ust_proj.chriss_proj.service;

import com.ust_proj.chriss_proj.entity.Order;
import com.ust_proj.chriss_proj.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    public Order createOrder(Order order) {
        // Validate user exists by calling user service
        validateUser(order.getUserId());
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        orderRepository.delete(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        // Validate user exists
        validateUser(userId);
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        // Validate new user if userId is being changed
        if (orderDetails.getUserId() != null && !orderDetails.getUserId().equals(order.getUserId())) {
            validateUser(orderDetails.getUserId());
            order.setUserId(orderDetails.getUserId());
        }

        if (orderDetails.getProduct() != null) {
            order.setProduct(orderDetails.getProduct());
        }
        
        if (orderDetails.getQuantity() != 0) {
            order.setQuantity(orderDetails.getQuantity());
        }

        return orderRepository.save(order);
    }

    private void validateUser(Long userId) {
        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }

        try {
            String url = userServiceUrl + "/api/users/" + userId;
            restTemplate.getForObject(url, Object.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("User not found with id: " + userId);
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Unable to connect to User Service. Please try again later.");
        } catch (Exception e) {
            throw new RuntimeException("Error validating user: " + e.getMessage());
        }
    }
}