package com.example.demo.service

import com.example.demo.model.User

interface AuthServiceInterface {
  fun authenticate(username: String, password: String): Boolean
  fun getUsers(): List<User>
}