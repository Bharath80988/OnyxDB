package com.onyxdb.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class OnyxDbApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnyxDbApplication.class, args);
    }
}
