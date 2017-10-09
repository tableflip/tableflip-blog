---
title: "P2P DDP using PeerJS WebRTC"
permalink: "p2p-ddp-using-peerjs-webrtc/"
date: 2015-10-11 13:26:13 +0000
author: "alanshaw"
---
Saturday and Sunday was the Meteor 2015 worldwide hackathon. I had a great time and so did everyone who attended. In between running around helping with code and distributing tea and coffee I managed to put together a cool little proof of concept: P2P DDP.

The idea was simply to do some DDP over a WebRTC P2P connection. I didn't know if it was impossible or what it really involved, but I thought it would be cool for a browser to act as a Meteor server and have other Meteor clients connect to it and use it, cutting out the middle man!

I started with [`ddp-client`](https://www.npmjs.com/package/ddp-client) as a base and [PeerJS](http://peerjs.com/) to help with the P2P connection. I quickly realised that the interface PeerJS provides is very similar to what SockJS provides (the websocket library used by Meteor and ddp-client) so it was quite easy to modify it to use PeerJS instead.

The way PeerJS works is that you need a "Peer Server" to register with initially, but after initial connection with the peer server the traffic is between you and your peer. I had time to create a p2p ddp client called [`pdiddy`](https://github.com/alanshaw/pdiddy-client) which allows you to connect to a specific peer and communicate using DDP.

`pdiddy` allows you to call meteor methods, subscribe to publications and observe changes on collections in a very similar way to `ddp-client`.

About half way through implementing `pdiddy` I realised meteor _clients_ can't publish subscriptions or respond to meteor method calls so I really needed a client side "Meteor server" to allow this to happen!

Given the time constraint, I decided that rather than build a meteor server that worked in a browser it might be a better idea to just proxy to a running meteor server. Allowing me to finish on time and also develop an example app using the tech!

![](https://ucarecdn.com/74057827-c747-4eab-bbe3-df037547ab6f/1.svg)

The [proxy](https://github.com/alanshaw/pdiddy-test/blob/gh-pages/proxy.js) is a simple static HTML and JS app built with React. It uses sockjs and peerjs and will open a socket connection with a meteor server when a p2p connection to it is opened. When the p2p connection is closed, the socket connection is closed. In between, all it does it ferry EJSON traffic between the p2p connection and the websocket connection.

The example app I created is a standard todo list, where anyone can add or remove items from the list. Server side it looks like this:

```js
Todos = new Mongo.Collection('todos')

Meteor.methods({
  addTodo: text => Todos.insert({text: text}),
  removeTodo: id => Todos.remove({_id: id})
})

Meteor.publish('todos', () => Todos.find())
```

Simple huh! The [example app](https://github.com/alanshaw/pdiddy-test/blob/gh-pages/index.js) is again some static HTML and JS (React) which uses `pdiddy` to connect to the proxy. When the user has specified the ID of the peer to connect to, the connection is made and it uses `pdiddy` to subscribe to the "todos" publication and observe changes on the collection.

```js
var diddy = new PDiddy({key: process.env.PEER_KEY})

// Connect to the peer
diddy.connect(this.refs.peerId.value, err => {
  if (err) {
    return console.error('Failed to connect to peer', this.refs.peerId.value, err)
  }

  diddy.subscribe('todos', [], err => {
    if (err) return console.error('Failed to subscribe to todos', err)
  })

  diddy.observe('todos', this.onTodoChange, this.onTodoChange, this.onTodoChange)
})
```

[Adding](https://github.com/alanshaw/pdiddy-test/blob/gh-pages/index.js#L90-L93) and [removing](https://github.com/alanshaw/pdiddy-test/blob/gh-pages/index.js#L99-L101) todos is done by calling the corresponding meteor methods. When [todos change](https://github.com/alanshaw/pdiddy-test/blob/gh-pages/index.js#L104-L108) React automatically re-renders the list.

```js
onAddTodoSubmit (e) {
  this.diddy.call('addTodo', [this.refs.todoText.value], err => {
    if (err) console.error('Failed to add todo', err)
  })
},

onRemoveTodoClick (e) {
  this.diddy.call('removeTodo', [e.target.getAttribute('data-id')], err => {
    if (err) console.error('Failed to remove todo', err)
  })
},

onTodoChange () {
  var todos = this.diddy.collections.todos
  this.setState({todos: Object.keys(todos).map(id => todos[id])})
}
```

That's basically it, a really simple proof of concept using Meteor technologies. Hope you like it!
