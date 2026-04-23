package proxy

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

type WeatherData struct {
	City        string  `json:"city"`
	Country     string  `json:"country"`
	CountryCode string  `json:"country_code"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	WindSpeed   float64 `json:"wind_speed"`
	WeatherCode int     `json:"weather_code"`
	ObservedAt  string  `json:"observed_at"`
	Timezone    string  `json:"timezone"`
	Source      string  `json:"source"`
}

type FetchError struct {
	Location string `json:"location"`
	Message  string `json:"message"`
}

type WeatherProvider interface {
	FetchCurrentWeather(ctx context.Context, location string) (WeatherData, error)
	FetchCurrentWeatherForLocations(ctx context.Context, locations []string) ([]WeatherData, []FetchError)
}

type OpenMeteoProxy struct {
	client *http.Client
}

func NewOpenMeteoProxy() *OpenMeteoProxy {
	return &OpenMeteoProxy{
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (p *OpenMeteoProxy) FetchCurrentWeatherForLocations(ctx context.Context, locations []string) ([]WeatherData, []FetchError) {
	results := make([]WeatherData, 0, len(locations))
	errors := make([]FetchError, 0)

	for _, location := range locations {
		weather, err := p.FetchCurrentWeather(ctx, location)
		if err != nil {
			errors = append(errors, FetchError{
				Location: location,
				Message:  err.Error(),
			})
			continue
		}

		results = append(results, weather)
	}

	return results, errors
}

func (p *OpenMeteoProxy) FetchCurrentWeather(ctx context.Context, location string) (WeatherData, error) {
	geocodingResult, err := p.fetchCoordinates(ctx, location)
	if err != nil {
		return WeatherData{}, err
	}

	forecastResult, err := p.fetchForecast(ctx, geocodingResult.Latitude, geocodingResult.Longitude)
	if err != nil {
		return WeatherData{}, err
	}

	return WeatherData{
		City:        geocodingResult.Name,
		Country:     geocodingResult.Country,
		CountryCode: geocodingResult.CountryCode,
		Latitude:    geocodingResult.Latitude,
		Longitude:   geocodingResult.Longitude,
		Temperature: forecastResult.Current.Temperature,
		WindSpeed:   forecastResult.Current.WindSpeed,
		WeatherCode: forecastResult.Current.WeatherCode,
		ObservedAt:  forecastResult.Current.Time,
		Timezone:    forecastResult.Timezone,
		Source:      "open-meteo",
	}, nil
}

func (p *OpenMeteoProxy) fetchCoordinates(ctx context.Context, location string) (geocodingResult, error) {
	endpoint := fmt.Sprintf(
		"https://geocoding-api.open-meteo.com/v1/search?name=%s&count=1&language=en&format=json",
		url.QueryEscape(location),
	)

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return geocodingResult{}, err
	}

	response, err := p.client.Do(request)
	if err != nil {
		return geocodingResult{}, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return geocodingResult{}, fmt.Errorf("geocoding API returned status %d", response.StatusCode)
	}

	var payload geocodingResponse
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return geocodingResult{}, err
	}

	if len(payload.Results) == 0 {
		return geocodingResult{}, fmt.Errorf("location not found")
	}

	return payload.Results[0], nil
}

func (p *OpenMeteoProxy) fetchForecast(ctx context.Context, latitude float64, longitude float64) (forecastResponse, error) {
	endpoint := fmt.Sprintf(
		"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto",
		latitude,
		longitude,
	)

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return forecastResponse{}, err
	}

	response, err := p.client.Do(request)
	if err != nil {
		return forecastResponse{}, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return forecastResponse{}, fmt.Errorf("forecast API returned status %d", response.StatusCode)
	}

	var payload forecastResponse
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		return forecastResponse{}, err
	}

	return payload, nil
}

type geocodingResponse struct {
	Results []geocodingResult `json:"results"`
}

type geocodingResult struct {
	Name        string  `json:"name"`
	Country     string  `json:"country"`
	CountryCode string  `json:"country_code"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

type forecastResponse struct {
	Timezone string          `json:"timezone"`
	Current  currentForecast `json:"current"`
}

type currentForecast struct {
	Time        string  `json:"time"`
	Temperature float64 `json:"temperature_2m"`
	WindSpeed   float64 `json:"wind_speed_10m"`
	WeatherCode int     `json:"weather_code"`
}
