package models

import "time"

type Weather struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	LocationID  uint      `gorm:"index" json:"location_id"`
	Location    Location  `json:"-"`
	City        string    `gorm:"index;size:100;not null" json:"city"`
	Country     string    `gorm:"size:100" json:"country"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	Temperature float64   `json:"temperature"`
	WindSpeed   float64   `json:"wind_speed"`
	WeatherCode int       `json:"weather_code"`
	ObservedAt  string    `gorm:"size:40" json:"observed_at"`
	Source      string    `gorm:"size:50;not null" json:"source"`
	FetchedAt   time.Time `gorm:"index" json:"fetched_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
