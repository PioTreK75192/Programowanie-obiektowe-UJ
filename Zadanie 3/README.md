**Zadanie 3** Wzorce kreacyjne

Wszystkie punkty na 5.0 zostały zrealizowane.

**API (JSON):**
- `GET http://localhost:8080/api/users/eager` — lista użytkowników z hasłami na wersji eager
- `GET http://localhost:8080/api/users/lazy` — lista użytkowników z hasłami na wersji lazy

- `POST http://localhost:8080/api/login/eager` — logowanie się na wersji eager, należy podać username i password w żądaniu POST
- `POST http://localhost:8080/api/login/lazy` — logowanie się na wersji lazy, należy podać username i password w żądaniu POST

Uruchamia się serwis za pomocą:

Linux/MacOS: ./gradlew bootRun
Windows: .\gradlew.bat bootRun