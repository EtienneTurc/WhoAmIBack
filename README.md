# KITE Back


## Setup

Copier le fichier config.template.json en config.js
Mettre les credentials que vous pouvez trouvez-ici: https://console.developers.google.com/apis/credentials
run `npm i` to install the dependances

run server with `nodemon`

## Installation

Installing nodeJs

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Installing pm2
```
npm install -g pm2
```


Run the server
```
pm2 start index.js --name back
```

Install mongo
```
http://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/
```

Installing docker
```
https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-debian-9
```

Run redis
```
docker run -p 6379:6379 --restart unless-stopped --name redis-redisjson redislabs/rejson:latest
```

Run RabbitMQ
```
docker run -it --restart unless-stopped --name rabbitmq -p 1883:1883 --name broker rabbitmq:3-management
docker exec -it broker rabbitmq-plugins enable rabbitmq_mqtt
```
