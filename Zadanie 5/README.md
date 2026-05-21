**Zadanie 5** Wzorce behawioralne

Projekt sklada sie z aplikacji klienckiej React TypeScript oraz aplikacji serwerowej Express.

Link do commita: https://github.com/PioTreK75192/Programowanie-obiektowe-UJ/commit/9b5d2df51939da862d737519c873d17e7b110417

Zrealizowane elementy:

- komponent Produkty pobiera liste produktow z backendu,
- komponent Koszyk dziala jako osobny widok,
- komponent Platnosci wysyla dane platnosci do backendu,
- przechodzenie miedzy widokami dziala przez routing,
- dane koszyka sa wspoldzielone przez React hooks i context,
- komunikacja z serwerem odbywa sie przez axios,
- backend ma skonfigurowana obsluge CORS,
- aplikacje mozna uruchomic w kontenerach Docker przez docker-compose.

**Struktura projektu**

```text
client/   aplikacja React TypeScript
server/   aplikacja serwerowa Express
```

**Uruchomienie lokalne**

Instalacja zaleznosci:

```bash
npm run install:all
```

Uruchomienie frontendu i backendu:

```bash
npm run dev
```

Adresy aplikacji:

```text
Frontend: http://localhost:8000
Backend:  http://localhost:5000
```

**Uruchomienie przez Docker**

```bash
docker compose up --build
```

**Endpointy backendu**

```text
GET  /api/products   lista produktow
POST /api/payments   wyslanie danych platnosci
```
