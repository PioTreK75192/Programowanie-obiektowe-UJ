**Zadanie 4** Wzorce strukturalne

Wszystkie punkty na 5.0 zostały zrealizowane.<br><br>

**Kompilacja i uruchomienie**

Kompilacja
```bash
go build
```
Uruchomienie na windowsie:
```bash
myapp.exe
```
Uruchomienie na linuxie:
```bash
./myapp
```


Serwer uruchomi sie na:

```text
http://localhost:8080
```

## Endpoint

### GET

Pobranie jednej lokalizacji:

```bash
curl "http://localhost:8080/weather?location=Warsaw"
```

Pobranie wielu lokalizacji:

```bash
curl "http://localhost:8080/weather?locations=Warsaw,Krakow,Gdansk"
```

Można tez przekazywac wiele parametrów `location`:

```bash
curl "http://localhost:8080/weather?location=Warsaw&location=Wroclaw"
```

Jeśli nie podasz lokalizacji, endpoint zwróci dane dla miast załadowanych przy starcie:

- Warsaw
- Krakow
- Gdansk
- Wroclaw

### POST

```bash
curl -X POST "http://localhost:8080/weather" -H "Content-Type: application/json" -d "{\"locations\":[\"Warsaw\",\"Krakow\",\"Gdansk\"]}"
```

## Przykład odpowiedzi JSON

```json
{
  "requested_locations": ["Warsaw", "Krakow"],
  "results": [
    {
      "city": "Warsaw",
      "country": "Poland",
      "country_code": "PL",
      "latitude": 52.2298,
      "longitude": 21.0118,
      "temperature": 15.6,
      "wind_speed": 8.1,
      "weather_code": 3,
      "observed_at": "2026-04-23T21:15",
      "timezone": "Europe/Warsaw",
      "source": "open-meteo"
    }
  ],
  "errors": []
}
```
