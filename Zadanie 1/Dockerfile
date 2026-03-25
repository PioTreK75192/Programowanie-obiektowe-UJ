FROM ubuntu:latest

RUN apt-get update && apt-get install -y fpc

WORKDIR /app

COPY GenerowanieISortowanie.pas .

RUN fpc GenerowanieISortowanie.pas

CMD ["./GenerowanieISortowanie"]