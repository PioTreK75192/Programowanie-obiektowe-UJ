package database

import (
	"errors"

	"myapp/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewSQLite(path string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.Location{}, &models.Weather{}); err != nil {
		return nil, err
	}

	return db, nil
}

func DefaultLocations() []models.Location {
	return []models.Location{
		{Name: "Warsaw", Country: "Poland", CountryCode: "PL"},
		{Name: "Krakow", Country: "Poland", CountryCode: "PL"},
		{Name: "Gdansk", Country: "Poland", CountryCode: "PL"},
		{Name: "Wroclaw", Country: "Poland", CountryCode: "PL"},
	}
}

func SeedLocations(db *gorm.DB, locations []models.Location) error {
	for _, location := range locations {
		var existing models.Location
		err := db.Where("name = ?", location.Name).First(&existing).Error
		if err == nil {
			continue
		}

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		if err := db.Create(&location).Error; err != nil {
			return err
		}
	}

	return nil
}
