#!/bin/bash

FILE="GenerowanieISortowanie.pas"

if [ ! -f "$FILE" ]; then
  echo "Błąd: plik $FILE nie istnieje."
  exit 1
fi

if [ ! -f Dockerfile ]; then
  echo "Błąd: brak DockerFile."
  exit 1
fi

# Budowanie obrazu
echo "Budowanie obrazu Docker..."
docker build -t pascal_app .

if [ $? -ne 0 ]; then
  echo "Błąd podczas budowania obrazu."
  exit 1
fi

# Uruchamianie kontenera
echo "Uruchamianie programu..."
docker run --rm pascal_app