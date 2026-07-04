package com.college.placementportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PlacementportalApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlacementportalApplication.class, args);
	}

}
