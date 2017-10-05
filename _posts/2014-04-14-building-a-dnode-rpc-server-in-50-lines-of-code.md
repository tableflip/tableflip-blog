---
title: "Building a dnode rpc server in ~50 lines of code"
permalink: "building-a-dnode-rpc-server-in-50-lines-of-code"
date: 2014-04-15 06:47:24 +0000
author: "alanshaw"
---
"dnode is asynchronous rpc over websockets, using just javascript and callbacks.

This demo shows you how to create a dnode rpc server and use it in the browser in ~50 lines of code.

You're gonna need some things:

```sh
npm install dnode
```

For creating a websocket server, with fallback for older browsers:

```sh
npm install shoe
```

For serving static resources to the client:

```sh
npm install ecstatic
```

For allowing you to use node modules in the browser:

```sh
npm install -g browserify
```

index.html
---
Create a HTML file where all the action will happen. Add the following lines of HTML:

```html
<!doctype html>
<script src="bundle.js"></script>
```

Yep, thats it. `bundle.js` will contain your browserified client code (wait, it's coming later).

server.js
---
Create a js file that'll contain your rpc api code.

Require a few modules:

```js
var http = require("http")
var dnode = require("dnode")
var shoe = require("shoe")
var ecstatic = require("ecstatic")(__dirname)
```

`http` is a built in node module, which we'll use to serve `index.html` and `bundle.js` over plain old HTTP. `ecstatic` is a module that allows us to do this with minimal code. You essentially give `ecstatic` a directory and it then allows you to access all files in it.

`dnode` and `shoe` is where the magic happens, but we'll get to that in a minute.

Next lets grab some data that our server can serve. Create a JSON file with some data in it. In this example we're going to create a map of ship ID's to positions:

```js
{
  "ABC00090": [{
    "latitude": -7.098888888888889,
    "longitude": 112.675
  }, {
    "latitude": 1.0325,
    "longitude": 103.91527777777777
  }],
  "XYZ00001": [{
    "latitude": 1.053611111111111,
    "longitude": 104.94055555555556
  }]
}
```

...and then use it in `client.js`:

```js
var data = require("./data.json")
```

Now design the rpc api. Since we're using node and are meant to be all async, our api will call a callback function when the data has been retrieved. Usually this'll be sometick in the future, but because we have the data readily available, this'll be called immediately.

```js
var api = {
  ships: function (cb) {
    cb(null, Object.keys(data))
  },
  positions: function (ship, cb) {
    if (!data[ship]) return cb(new Error("Ship not found"))
    cb(null, data[ship])
  }
}
```

The convention in node for callbacks is that an error object is passed as the first parameter. So if no error occurred, we pass null for the first parameter and the result as the second.

Now create the HTTP server that'll serve our static assets and listen on `8080` or whatever the `PORT` environment variable tells us to listen on:

```js
var serv = http.createServer(ecstatic)
serv.listen(process.env.PORT || 8080)
```

Finally lets create the socket server and install it at `/api`:

```js
var sock = shoe(function (stream) {
  var d = dnode(api)
  stream.pipe(d).pipe(stream)
})

sock.install(serv, "/api")
```

`shoe` creates a socket server that calls the passed function when a connection comes in. It's passed in a stream that represents the stream of data from/to the websocket. We're creating a new dnode object that transforms incoming data by calling our api and sending the output back down the stream.

`stream.pipe(d).pipe(stream)` reads any incoming data and writes it to dnode, it is then transformed and read from dnode and written back into the stream to be sent to the browser.

client.js
---
Create a js file that'll be used on the browser to interact with the server. You'll need `dnode` and `shoe` again:

```js
var dnode = require("dnode")
var shoe = require("shoe")
```

Since we're going to be using browserify, we don't need to worry about polluting the global namespace so go ahead and define these in the top level of the file - you don't need an anonymous function wrapper. If you want to expose things outside of this file, you just need to export it, node style: `module.exports = "[your exported object]"` or assign it directly to the `window` object.

Connect to the server websocket by passing shoe a string - the URL to connect to:

```js
var sock = shoe("/api")
```

Use dnode to call server methods when it is connected and ready to roll:

```js
var d = dnode()

d.on("remote", function (remote) {
  console.log("Got remote", remote)

  remote.ships(function (er, ships) {
    if (er) return console.error("Failed to get ships", er)
    console.log("Got ships", ships)

    ships.forEach(function (ship) {
      remote.positions(ship, function (er, positions) {
        if (er) return console.error("Failed to get positions for ship", ship, er)
        console.log("Got positions for", ship, positions)
      })
    })
  })
})
```

All that's left to do on the client side is hook up the shoe/dnode pipeline as we did on the server:

```js
sock.pipe(d).pipe(sock)
```

Browserify and run!
---
Finally, we just need to create our browserify bundle:

```sh
browserify client.js -o bundle.js
```

You should now be able to start the socket server:

```sh
node server.js
```

...and visit `http://localhost:8080/` in your browser. If it worked, your console should contain some output that looks like:

```
16:13:18.776 "Got remote" [object Object]
16:13:18.788 "Got ships" [object Array]
16:13:18.803 "Got positions for" "ABC00090" [object Array]
16:13:18.803 "Got positions for" "XYZ00001" [object Array]
```

Why is this useful?
---
Using websockets allows us to reduce the latency of setting up and tearing down http connections by keeping a persistent connection open. It also allows us to circumvent the 6-8 concurrent request limit imposed by default on many browsers.

Using a websockets library like shoe gives us transparent fallback for older browsers without investing any time or resources.

Streaming is a memory efficient way of communicating and transforming data. It allows your application to be more scaleable by decreasing it's memory footprint.

Using browserify allows us to use thousands of modules available on npm, encourages _our_ code to be modular, guards us from polluting the global namespace, reduces the number of requests to the server for individual javascript files and removes the need for us to work out and maintain the order in which js files should be loaded."
