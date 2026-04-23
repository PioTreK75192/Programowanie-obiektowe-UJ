package main

import (
	"log"

	"github.com/labstack/echo/v5"

	"myapp/internal/controllers"
	"myapp/internal/database"
	"myapp/internal/proxy"
)

func main() {
	db, err := database.NewSQLite("weather.db")
	if err != nil {
		log.Fatalf("cannot open database: %v", err)
	}

	if err := database.SeedLocations(db, database.DefaultLocations()); err != nil {
		log.Fatalf("cannot seed locations: %v", err)
	}

	weatherProxy := proxy.NewOpenMeteoProxy()
	weatherController := controllers.NewWeatherController(db, weatherProxy)

	app := echo.New()

	app.GET("/weather", weatherController.HandleWeather)
	app.POST("/weather", weatherController.HandleWeather)

	log.Println("Server started on http://localhost:8080")
	log.Fatal(app.Start(":8080"))
}
