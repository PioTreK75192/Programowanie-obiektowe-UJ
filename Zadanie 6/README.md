**Zadanie 6** Zapaszki

Link do commita: https://github.com/PioTreK75192/Programowanie-obiektowe-UJ/commit/88de3db95605011949a65629de0b8a4db3824459

Zostały zrealizowane punkty na 3.0:

- skonfigurowano `husky`,
- skonfigurowano `lint-staged`,
- hook `pre-commit` uruchamia ESLint tylko dla dodanych do commita plikow JS/TS projektu z `Zadanie 5`.

**Instalacja**

Z katalogu `Zadanie 5`:

```bash
npm install
```

Instalacja uruchamia skrypt `prepare`, ktory aktywuje hooki `husky`.

**Sprawdzenie lintowania**

```bash
npm run lint:js
```
