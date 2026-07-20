package com.MedLook.healthanalysis.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Server is running on port 8080!";
    }

    @PostMapping("/test-post")
    public String testPost(@RequestBody String testData) {
        return "Received: " + testData;
    }
}