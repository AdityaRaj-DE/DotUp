FROM ubuntu:24.04
RUN apt-get update && apt-get install -y sudo curl
COPY . /app
WORKDIR /app
CMD ["bash", "install.sh"]
