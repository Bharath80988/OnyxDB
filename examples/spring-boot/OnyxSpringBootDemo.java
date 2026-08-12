package com.example.onyxdb;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Map;
import java.util.HashMap;

@SpringBootApplication
public class OnyxSpringBootDemo implements CommandLineRunner {

    private static final String DB_URL = "http://localhost:8080/api/query";

    public static void main(String[] args) {
        SpringApplication.run(OnyxSpringBootDemo.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌱 OnyxDB Spring Boot Integration Test");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer admin-secret-key");

        Map<String, Object> query = new HashMap<>();
        query.put("oqs", "GET users 101");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(query, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(DB_URL, entity, String.class);

        System.out.println("OnyxDB Response: " + response.getBody());
    }
}
