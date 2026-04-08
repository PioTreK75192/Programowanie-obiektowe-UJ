package com.example.demo.service

import com.example.demo.model.User
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
@Lazy
@Qualifier("lazyAuth")
class AuthServiceLazy : AuthServiceInterface {
  private val users = listOf(
    User("lazy", "lazy123")
  )

  override fun authenticate(username: String, password: String): Boolean {
    return users.any { it.username == username && it.password == password }
  }

  override fun getUsers(): List<User> = users
}