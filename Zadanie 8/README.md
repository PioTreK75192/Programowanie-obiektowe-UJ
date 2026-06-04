**Zadanie 8**

Link do commita: https://github.com/PioTreK75192/Programowanie-obiektowe-UJ/commit/7b65315a5efca7a59454aaeb82ee7494f3078dc1

Zrealizowano punkty na ocene 4.5:

- 3.0 Test formularza rejestracji: pola obowiazkowe i niepoprawny format adresu e-mail.
- 3.5 Test XSS w aplikacji React przez probe wstrzykniecia kodu JavaScript.
- 4.0 Test koszyka zakupowego w kilku kartach tej samej przegladarki.
- 4.5 Formularz logowania oraz test CSRF z proba wymuszenia zmiany ustawien konta spreparowanym linkiem.

## Technologie

- React + Vite
- Bootstrap
- Python
- Selenium/WebDriver
- pytest

## Uruchomienie aplikacji

```cmd
npm install
npm run dev
```

Aplikacja startuje domyslnie pod adresem `http://127.0.0.1:8080`.

## Uruchomienie testow Selenium

W drugim terminalu, przy dzialajacej aplikacji.

```bat
python -m venv .venv
.\.venv\Scripts\activate.bat
pip install -r requirements.txt
npm install
npm run test
```
