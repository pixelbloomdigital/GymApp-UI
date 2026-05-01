package com.pixelbloom.payment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI paymentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Payment Service API")
                        .description("PhonePe payment gateway integration — order creation, callbacks, refunds")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Pixelbloom")
                                .email("dev@pixelbloom.com")))
                .servers(List.of(
                        new Server().url("http://localhost:9096").description("Local")));
    }
}
