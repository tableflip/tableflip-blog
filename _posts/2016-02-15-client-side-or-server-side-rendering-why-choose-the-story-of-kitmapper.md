---
title: "Client-side or server-side rendering, why choose? The story of KitMapper"
permalink: "/client-side-or-server-side-rendering-why-choose-the-story-of-kitmapper"
date: 2016-02-15 17:27:57 +0000
author: "alanshaw"
---
Last week we officially launched the [KitMapper.com](https://kitmapper.com/) website - a peer to peer AV kit rental service. You own some kit you don't use all the time and would like to make some money from it, or you need some kit for a project you're working on. It's a great idea and we're really proud to be part of it.

What you may not hear much about is the tech behind the site. We're super happy with the way it turned out and the experience you get when you visit it, so we'd love to share with you some of the awesome bits before it gets lost in the sands of time!

From a high level, KitMapper is just a [Node.js](https://nodejs.org/en/) based site using [Hapi](http://hapijs.com/) on the server and [page.js](https://visionmedia.github.io/page.js/) on the client, bundled up with [Browserify](http://browserify.org/). The big idea we had with this site that we've not previously explored was "dual side rendering"...but, what does that even mean?

Well, the app is a big place to search for items of kit. It has a great search function, backed by [Algolia](https://www.algolia.com/) but we wanted search engines to be able to index **all** the kit on the site as well. So hitting _any_ public page on the site should cause the _server to render the page_ as is traditional. We also wanted to build a "modern" single page app, so that once you received the HTML, JS and CSS, the rest of the communication with the server was just raw data, giving it a really snappy and responsive feel. So, the goal became: after the server rendered the first page, the _client would render subsequent pages_.

Server side rendering is a bit of an afterthought for single page app frameworks. We did some homework. React has a solution, and Meteor has some packages you can install to achieve the same thing. Both felt a little clunky and have all sorts of caveats. We wanted something simple, and we wanted to actually, really, properly share code with the client _and_ the server.

It started as a [proof of concept](https://github.com/tableflip/dual-page-app) pulling together express.js and page.js since their API's for defining and handling routes are almost exactly same. The idea was that using the middleware pattern that express.js/page.js exposes, we'd split a route handler into two parts. The first part would be responsible for retrieving the data and rendering the page, and the second would initialise the page, for any client side interactions e.g. attach event listeners etc.

```language-javascript
// Attach to /post/:id
dual('/post/:id', render, init)

// Render the page
function render (ctx, cb) {
  var postId = ctx.params.id
  // Do async IO, eventually call cb with rendered HTML
  cb(null, tpl())
}

// Initialisation for the client
function init (ctx) {
  var link = document.querySelector('a[href="#"]')

  link.addEventListener('click', function (e) {
    e.preventDefault()
    dual.page('/post/138') // move to next page
  })
}
```

The `dual` object would essentially be express.js on the server and page.js on the client. On the server it knows not to run the last function in the middleware chain because that belongs to the client.

That was a nice experiment, but it proved to be a little confusing knowing exactly which code would be running where, and it felt a little too magical for our tastes. So we eventually settled on sharing only modules, libraries and templates on client and server and kept our route definitions and handlers separated.

We ended up with a directory structure like this:

```language-shell
.
├── [page]           # Page resources
│   ├── [page].jade  # Template for page
│   ├── [page].js    # Client side route and scripts
│   ├── [page].less  # Styles
│   └── route.js     # Server route(s)
├── client.js        # Client main
└── server.js        # Server main
```

Each page has a folder. In the folder there are templates, styles, client side routes and server side routes.

At the route level, `client.js`/`server.js` are the entry points and look something like this:

**client.js**

```language-javascript
var page = require('page')

var home = require('./home/home')
var about = require('./about/about')

home(page)
about(page)

page()
```

**server.js**

```language-javascript
var app = require('express')()

var home = require('./home/route')
var about = require('./about/route')

home(app)
about(app)

app.listen(8080)
```

Similar huh!? Each page exports a function which, when called, defines it's route(s) and handlers to retrieve data and render the page with _shared_ templates. There's an API module that _both the client and the server_ use to retrieve the data. It's safe to browserify as it just uses node's http/https modules, for which there are built in shims for the client.

...and that's only one shared module. We have tons of shared modules for things like formatting currency or timestamps and obviously share npm modules like [async](https://www.npmjs.com/package/async), [underscore](https://www.npmjs.com/package/underscore), [markdown-it](https://www.npmjs.com/package/markdown-it), and [moment](https://www.npmjs.com/package/moment) to name but a few. The shared templates are [jade](http://jade-lang.com/) (pug), required directly in Node.js via the (slightly naughty) [require.extensions](https://nodejs.org/api/globals.html#globals_require_extensions) and browserified using [jadeify](https://www.npmjs.com/package/jadeify).

This all makes for a beautiful and glorious union of tech smarts that gives users a great experience on the site, and was a joy to create. We wish KitMapper every success in their journey from here on out, knowing that they have a fantastic foundation on which to build.

---

We're TABLEFLIP, and we like to really think about how _best_ to build your application. We build software we're proud of and excited about. If you'd like this sort of thinking working for you then please get in touch - [hello@tableflip.io](mailto:hello@tableflip.io)
