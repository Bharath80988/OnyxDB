package com.forgeql.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ForgeDbApplication {
    public static void main(String[] args) {
        SpringApplication.run(ForgeDbApplication.class, args);
    }
}
