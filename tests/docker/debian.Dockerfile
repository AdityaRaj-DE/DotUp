FROM debian:bookworm
RUN apt-get update && apt-get install -y sudo curl
COPY . /app
WORKDIR /app
CMD ["bash", "bootstrap.sh"]
