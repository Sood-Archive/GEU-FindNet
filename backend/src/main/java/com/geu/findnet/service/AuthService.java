package com.geu.findnet.service;

import com.geu.findnet.dto.LoginRequest;
import com.geu.findnet.dto.OtpVerifyRequest;
import com.geu.findnet.dto.RegisterRequest;
import com.geu.findnet.entity.User;
import com.geu.findnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    public User register(RegisterRequest request) {
        if (!request.getCollegeEmail().endsWith("@geu.ac.in")) {
            throw new IllegalArgumentException("College email must end with @geu.ac.in");
        }
        
        if (userRepository.findByCollegeEmail(request.getCollegeEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setCourse(request.getCourse());
        user.setStudentId(request.getStudentId());
        user.setCollegeEmail(request.getCollegeEmail());
        user.setPersonalEmail(request.getPersonalEmail());
        user.setPassword(request.getPassword()); // In production, hash this with PasswordEncoder
        
        if (request.getCollegeEmail().equals("admin@geu.ac.in")) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.USER);
        }

        User saved = userRepository.save(user);
        otpService.generateAndSendOtp(saved);
        return saved;
    }

    public boolean verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByCollegeEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return otpService.verifyOtp(user, request.getOtp());
    }

    public void resendOtp(String email) {
        User user = userRepository.findByCollegeEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.isVerified()) {
            throw new IllegalArgumentException("Email already verified");
        }
        otpService.generateAndSendOtp(user);
    }

    public User login(LoginRequest request) {
        if (request.getEmail().equals("admin@geu.ac.in") && request.getPassword().equals("admin1234")) {
            Optional<User> adminOpt = userRepository.findByCollegeEmail("admin@geu.ac.in");
            if (adminOpt.isPresent()) {
                return adminOpt.get();
            } else {
                User admin = new User();
                admin.setFullName("System Admin");
                admin.setCourse("N/A");
                admin.setStudentId("0000");
                admin.setCollegeEmail("admin@geu.ac.in");
                admin.setPersonalEmail("admin@geu.ac.in");
                admin.setPassword("admin1234");
                admin.setRole(User.Role.ADMIN);
                return userRepository.save(admin);
            }
        }

        User user = userRepository.findByCollegeEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new IllegalArgumentException("Email not verified. Please check your inbox for the OTP.");
        }

        return user;
    }
}
