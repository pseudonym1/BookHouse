package com.gdmu.graduation.bookhouse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.WebApplicationInitializer;

/**
 * The bookhouse application
 * @author kaylisa.
 */
/*@EnableCaching ：开启缓存功能*/
/*@EnableCaching*/
@SpringBootApplication
public class Application extends SpringBootServletInitializer implements WebApplicationInitializer {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }
}