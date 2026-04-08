package com.example.demo.controller

import com.example.demo.model.User
import com.example.demo.service.AuthServiceInterface
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class AuthController(
  // constructor injection
  @Qualifier("eagerAuth")
  private val eagerService: AuthServiceInterface,

  @Qualifier("lazyAuth")
  private val lazyService: AuthServiceInterface
){
  @GetMapping("/users/eager")
  fun getUsersEager(): List<User> {
    return eagerService.getUsers()
  }

  @GetMapping("/users/lazy")
  fun getUserslazy(): List<User> {
    return lazyService.getUsers()
  }

  @PostMapping("/login/eager")
  fun loginEager(@RequestBody request: User): String {
    return if (eagerService.authenticate(request.username, request.password)) {
      "Login successful"
    } else {
      "Invalid credentials"
    }
  }

  @PostMapping("/login/lazy")
  fun loginLazy(@RequestBody request: User): String {
    return if (lazyService.authenticate(request.username, request.password)) {
      "Login successful"
    } else {
      "Invalid credentials"
    }
  }
}