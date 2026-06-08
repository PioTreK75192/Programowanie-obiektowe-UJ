# Zadanie 9 - Chmura

Zrealizowano punkty na ocene 3.0:

- Należy stworzyć odpowiednie instancje po stronie chmury na dockerze


## Wariant chmurowy

Render uruchamia aplikacje z obrazu budowanego przez `Dockerfile.render`.

W jednym kontenerze dzialaja:

- nginx serwujacy zbudowany frontend React,
- backend Express uruchomiony na porcie `5000`,
- proxy nginx, ktore przekazuje ruch `/api` do backendu.

Publicznie wystawiany jest jeden adres HTTP generowany przez Render. Backend nie wymaga osobnego publicznego portu, bo frontend komunikuje sie z nim przez sciezke `/api`.


## Uruchomienie lokalne przez Docker Compose

```bash
docker compose up --build
```

```text
Frontend: http://localhost:8000
Backend:  http://localhost:5000/api/health
```

## Test obrazu produkcyjnego

```bash
docker build -f Dockerfile.render -t zadanie-9-render .
docker run --rm -p 10000:10000 -e PORT=10000 zadanie-9-render
```

```text
Frontend: http://localhost:10000
Health:   http://localhost:10000/api/health
```

## Endpointy backendu

```text
GET  /api/products   lista produktow
POST /api/payments   wyslanie danych platnosci
GET  /api/health     healthcheck dla Dockera i Render
```
