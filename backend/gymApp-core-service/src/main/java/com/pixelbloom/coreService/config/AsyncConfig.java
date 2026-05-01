package com.pixelbloom.coreService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async configuration for the AI attendance engine thread pool.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "attendanceTaskExecutor")
    public Executor attendanceTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("attendance-ai-");
        executor.initialize();
        return executor;
    }
}
