package com.MedLook.healthanalysis.service;

import com.MedLook.healthanalysis.dto.RegistrationRequest;
import com.MedLook.healthanalysis.dto.RegistrationResponse;
import com.MedLook.healthanalysis.entity.User;
import com.MedLook.healthanalysis.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public RegistrationResponse registerUser(RegistrationRequest request) {
        // Проверяем, существует ли пользователь с таким email
        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegistrationResponse(null, null, null, null, "User with this email already exists");
        }

        // Создаем нового пользователя
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // В будущем нужно хэшировать
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setLocation(request.getLocation());

        // Сохраняем пользователя
        User savedUser = userRepository.save(user);

        // Возвращаем ответ
        return new RegistrationResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                "User registered successfully"
        );
    }

    // Метод для тестирования - получить всех пользователей
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}