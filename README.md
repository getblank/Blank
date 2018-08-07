# Blank

Microservices platform for rapid CRUD applicaitons developing

## Install

You need [Node.js](https://nodejs.org), npm and [MongoDB](https://www.mongodb.com/) installed on your system. We suggest to use [Docker MongoDB 3.2 image](https://hub.docker.com/_/mongo/)

After setting up MongoDB run:

```bash
npm install blank-cli -g
```

## Usage

```bash
blank init newApp
cd ./newApp
blank server
```

Compile with /lib/reactComponents

```bash
blank dist
```

Run server with /lib/reactComponents dev mode

```bash
blank server|one --dist
```

Run server with dist/bundle.js and chunks

```bash
blank server|one --with-dist
```

Web server will be reached on `http://localhost:8080/`;

Default username/password: `root/toor`

## Development

Run Blank from src:

```bash
node /path/to/Blank/index.js server --dir=./
```

Where `./` is a directory with application config.

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
