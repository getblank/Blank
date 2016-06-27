# Blank
Microservices platform for rapid CRUD applicaitons developing

## Install

You need [Node.js](https://nodejs.org), npm and [MongoDB](https://www.mongodb.com/) installed on your system. We suggest to use [Docker MongoDB 3.2 image](https://hub.docker.com/_/mongo/)

After setting up MongoDB  run:
```
npm install blank-cli -g
```

## Usage

```
blank init newApp
cd ./newApp
blank server
```
Web server will start on:
```
http://localhost:8080/
```
Default username/password: 
```
root/toor
```

## Services
### blank-sr
https://github.com/getblank/blank-sr

Services registry - central point of all Blank infrastructure.

### blank-router
https://github.com/getblank/blank-router

Component for work with client connections. Handles clients requests and manages workers tasks queue.

### blank-node-worker
https://github.com/getblank/blank-node-worker

Blank application server. Processes tasks from queue.
