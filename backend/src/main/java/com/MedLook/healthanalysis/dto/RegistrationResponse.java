package com.MedLook.healthanalysis.dto;

public class RegistrationResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String message;

    // Конструкторы
    public RegistrationResponse() {}

    public RegistrationResponse(Long id, String email, String firstName, String lastName, String message) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.message = message;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}