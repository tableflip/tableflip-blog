---
title: "Integrating passportjs with keystonejs"
permalink: "integrating-passportjs-with-keystonejs"
date: 2014-03-13 08:01:09 +0000
author: "alanshaw"
---
"This is a simple guide on how to integrate passportjs with keystonejs as an AJAX endpoint using persistent sessions. We found Jed's helpful [post on google groups](https://groups.google.com/forum/#!topic/keystonejs/zfcCWS_WhdU) and decided to write down the steps for this particular use case.

Configure your passport with `serializeUser`, `deserializeUser` and the strategies you want to use. It'll look something like:

```js
var keystone = require("keystone")
var User = keystone.list("User")
var LocalStrategy = require("passport-local").Strategy

passport.serializeUser(function (user, cb) {
  cb(null, user._id)
})

passport.deserializeUser(function (id, cb) {
  User.model.findById(id, function (er, user) {
    cb(er, user)
  })
})

passport.use(new LocalStrategy(/*...*/))
/*...*/
```

Add passport middleware to keystone pre routes:

```js
keystone.pre("routes", passport.initialize())
keystone.pre("routes", passport.session())
```

Create routes for logging in your user with particular strategies:

```js
keystone.set("routes", function (app) {
  app.post(
    "/login",
    passport.authenticate("local"),
    // Only invoked on success
    // passport automatically sends 401 on failure
    function (req, res) {
      return res.send({success: true});
    })
})
```

That's it! Now the logged in user will be available in your other routes as `req.user`."
