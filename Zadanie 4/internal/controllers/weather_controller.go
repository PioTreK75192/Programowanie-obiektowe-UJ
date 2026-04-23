package controllers

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"

	"myapp/internal/models"
	"myapp/internal/proxy"
)

type WeatherController struct {
	db            *gorm.DB
	weatherClient proxy.WeatherProvider
}

type weatherRequest struct {
	Locations []string `json:"locations"`
}

type weatherResponse struct {
	RequestedLocations []string            `json:"requested_locations"`
	Results            []proxy.WeatherData `json:"results"`
	Errors             []proxy.FetchError  `json:"errors"`
}

func NewWeatherController(db *gorm.DB, weatherClient proxy.WeatherProvider) *WeatherController {
	return &WeatherController{
		db:            db,
		weatherClient: weatherClient,
	}
}

func (wc *WeatherController) HandleWeather(c *echo.Context) error {
	locations, err := wc.resolveLocations(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	results, fetchErrors := wc.weatherClient.FetchCurrentWeatherForLocations(c.Request().Context(), locations)

	for _, weather := range results {
		if err := wc.saveWeather(weather); err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": err.Error(),
			})
		}
	}

	statusCode := http.StatusOK
	if len(results) == 0 && len(fetchErrors) > 0 {
		statusCode = http.StatusBadGateway
	}

	return c.JSON(statusCode, weatherResponse{
		RequestedLocations: locations,
		Results:            results,
		Errors:             fetchErrors,
	})
}

func (wc *WeatherController) resolveLocations(c *echo.Context) ([]string, error) {
	locations := extractLocationsFromQuery(c)

	if c.Request().Method == http.MethodPost && c.Request().ContentLength != 0 {
		var request weatherRequest
		if err := c.Bind(&request); err != nil {
			return nil, errors.New("invalid request body")
		}

		locations = append(locations, request.Locations...)
	}

	locations = normalizeLocations(locations)
	if len(locations) > 0 {
		return locations, nil
	}

	var seededLocations []models.Location
	if err := wc.db.Order("name asc").Find(&seededLocations).Error; err != nil {
		return nil, err
	}

	for _, location := range seededLocations {
		locations = append(locations, location.Name)
	}

	if len(locations) == 0 {
		return nil, errors.New("no locations available")
	}

	return locations, nil
}

func extractLocationsFromQuery(c *echo.Context) []string {
	locations := make([]string, 0)

	queryLocations := c.QueryParams()["location"]
	locations = append(locations, queryLocations...)

	if combined := c.QueryParam("locations"); combined != "" {
		locations = append(locations, strings.Split(combined, ",")...)
	}

	return locations
}

func normalizeLocations(locations []string) []string {
	normalized := make([]string, 0, len(locations))
	seen := make(map[string]struct{})

	for _, location := range locations {
		trimmed := strings.TrimSpace(location)
		if trimmed == "" {
			continue
		}

		key := strings.ToLower(trimmed)
		if _, exists := seen[key]; exists {
			continue
		}

		seen[key] = struct{}{}
		normalized = append(normalized, trimmed)
	}

	return normalized
}

func (wc *WeatherController) saveWeather(data proxy.WeatherData) error {
	location := models.Location{
		Name:        data.City,
		Country:     data.Country,
		CountryCode: data.CountryCode,
	}

	if err := wc.db.Where("lower(name) = lower(?)", data.City).Assign(location).FirstOrCreate(&location).Error; err != nil {
		return err
	}

	weather := models.Weather{
		LocationID:  location.ID,
		City:        data.City,
		Country:     data.Country,
		Latitude:    data.Latitude,
		Longitude:   data.Longitude,
		Temperature: data.Temperature,
		WindSpeed:   data.WindSpeed,
		WeatherCode: data.WeatherCode,
		ObservedAt:  data.ObservedAt,
		Source:      data.Source,
		FetchedAt:   time.Now(),
	}

	return wc.db.Create(&weather).Error
}
