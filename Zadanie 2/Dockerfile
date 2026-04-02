FROM kprzystalski/projobj-php:latest

WORKDIR /app

# Kopiujemy wszystkie pliki projektu do kontenera
COPY . .

# Instalujemy zależności od zera w kontenerze
USER root
RUN rm -rf vendor composer.lock
RUN composer update --no-interaction --optimize-autoloader

# Tworzymy bazę danych SQLite i schemat
RUN php bin/console doctrine:schema:create --no-interaction || true
RUN php bin/console cache:clear --no-interaction

# Otwieramy port
EXPOSE 8000

# Odpalamy serwer Symfony
ENTRYPOINT []
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public/"]