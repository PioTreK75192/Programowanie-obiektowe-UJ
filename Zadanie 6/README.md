**Zadanie 6** Zapaszki

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
