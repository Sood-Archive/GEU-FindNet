package com.geu.findnet.controller;

import com.geu.findnet.entity.ActivityLog;
import com.geu.findnet.entity.User;
import com.geu.findnet.repository.ActivityLogRepository;
import com.geu.findnet.repository.ItemRepository;
import com.geu.findnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/accounts")
    public ResponseEntity<List<User>> getAllAccounts() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/accounts")
    public ResponseEntity<?> addAccount(@RequestBody User user) {
        // Validation could go here
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        activityLogRepository.deleteAll(activityLogRepository.findByUserId(id));
        itemRepository.deleteAll(itemRepository.findByOwnerIdOrderByTimestampDesc(id));
        userRepository.deleteById(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLog>> getAllLogs(@RequestParam(name = "category", required = false) String category) {
        if (category == null || category.isEmpty() || category.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(activityLogRepository.findAllByOrderByTimestampDesc());
        }
        return ResponseEntity.ok(activityLogRepository.findByFilterCategoryOrderByTimestampDesc(category.toUpperCase()));
    }
}
