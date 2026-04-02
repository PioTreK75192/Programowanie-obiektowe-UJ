docker build --no-cache -t symfony_app .
docker run --rm -it -p 8000:8000 --name my_symfony_app symfony_app