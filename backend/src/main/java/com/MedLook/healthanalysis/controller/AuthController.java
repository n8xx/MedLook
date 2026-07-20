package com.MedLook.healthanalysis.controller;

import com.MedLook.healthanalysis.dto.RegistrationRequest;
import com.MedLook.healthanalysis.dto.RegistrationResponse;
import com.MedLook.healthanalysis.entity.User;
import com.MedLook.healthanalysis.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    // Тестовый endpoint для проверки соединения
    @GetMapping("/test")
    public String test() {
        return "Backend is working! Users in memory: " + userService.getAllUsers().size();
    }

    // Регистрация
    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> registerUser(
            @Valid @RequestBody RegistrationRequest registrationRequest) {

        System.out.println("Received registration request: " + registrationRequest.getEmail());

        RegistrationResponse response = userService.registerUser(registrationRequest);

        if (response.getMessage().equals("User registered successfully")) {
            System.out.println("User registered successfully: " + response.getEmail());
            return ResponseEntity.ok(response);
        } else {
            System.out.println("Registration failed: " + response.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Endpoint для просмотра всех пользователей (для отладки)
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}