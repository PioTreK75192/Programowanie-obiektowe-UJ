package com.example.demo.service

import com.example.demo.model.User
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
@Qualifier("eagerAuth")
class AuthService : AuthServiceInterface {
  private val users = listOf(
    User("admin", "admin123"),
    User("user", "password"),
    User("test", "test123")
  )

  override fun authenticate(username: String, password: String): Boolean {
    return users.any { it.username == username && it.password == password }
  }

  override fun getUsers(): List<User> = users
}