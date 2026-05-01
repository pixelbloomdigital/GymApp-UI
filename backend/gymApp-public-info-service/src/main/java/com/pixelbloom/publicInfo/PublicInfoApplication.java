package com.pixelbloom.publicInfo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PublicInfoApplication {
    public static void main(String[] args) {
        SpringApplication.run(PublicInfoApplication.class, args);
    }
}
