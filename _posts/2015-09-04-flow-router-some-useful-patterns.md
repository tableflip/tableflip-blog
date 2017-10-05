---
title: "Flow Router - some useful patterns"
permalink: "flow-router-some-useful-patterns"
date: 2015-09-04 15:51:55 +0000
author: "richsilv"
---
At TABLEFLIP, we've been building all of our Meteor projects using [Flow Router](https://github.com/kadirahq/flow-router) since the start of the year.  We love the way it focuses solely on routing, keeping reactivity in the template layer, which obviates many potential problems related to predictability and performance.

However, refining simple patterns for the kind of common tasks most apps will require in this new world has taken a few months, so we thought we'd share some of our ideas with you in case you'd like to use them in your own projects.

Examples of all of the following patterns can be found in this [simple example](https://github.com/tableflip/flow-router-patterns).

## Redirecting logged in and logged out users

Often, our apps will have some routes which are publicly accessible, and others which require the user to be logged in.  This means that we'll need to redirect visitors who try to access a private route back to the public section of the site if they're not authenticated, but it could also mean that when a user with stored login credentials arrives at our homepage, we'd like them to be forwarded automatically to some private page (a dashboard, for example), rather than expecting them to navigate there from the homepage on their own.

Flow Router **enter triggers** are exactly what we need to accomplish this.  The following pair of helper functions will allow us to automatically redirect as described above when a visitor first loads our app:

```javascript
function checkLoggedIn (ctx, redirect) {
  if (!Meteor.userId()) {
    redirect('/')
  }
}

function redirectIfLoggedIn (ctx, redirect) {
  if (Meteor.userId()) {
    redirect('/dashboard')
  }
}
```

We can now pass these trigger functions to our routes as required:

```javascript
FlowRouter.route('/dashboard', {
  name: 'dashboard',
  triggersEnter: [checkLoggedIn],
  action: function () {
    BlazeLayout.render('layout', {template: 'dashboard'})
  }
})
```

### Reactive redirects

As well as redirecting on page load, any sensible app would want to redirect the user to an appropriate route when they log in or out.  With Flow Router, this is something that we need to take care of ourselves as routes will not rerun reactively (and thus redirect us) by design.

However, this is easily achieved:

```javascript
Accounts.onLogin(function () {
  FlowRouter.go('dashboard')
  // Seems a bit too simple? more on this later!
})

Tracker.autorun(function () {
  if (!Meteor.userId()) {
    FlowRouter.go('home')
  }
})
```

The first of these blocks provides a callback to run on login and redirect the user to the dashboard, whilst the latter reactively redirects to the homepage when the user logs out.  Note that the autorun will only rerun when the *userId* changes, so we can set it running and forget about it, safe in the knowledge that it will never bother a logged-in user.

(In general, *autorun* blocks without a defined life-cycle trouble us, as they can easily cause memory leaks or unintended consequences for long-running apps.  We generally prefer to attach ours to templates so that they're automatically torn down, or at the very least supply a `stop()` instruction somewhere else in our code.)

## Using Groups

Use of generic trigger functions like the ones above can be made even easier by arranging your routes into groups.

```javascript
var privateRoutes = FlowRouter.group({
  name: 'private',
  triggersEnter: [
    checkLoggedIn
  ]
})

privateRoutes.route('/dashboard', {
  name: 'dashboard',
  action: function () {
    BlazeLayout.render('layout', {template: 'dashboard'})
  }
})
...
```

This is probably the simplest way of specifying entry and exit triggers for a given set of sensibly grouped routes.


### Groups++

We recently had a [pull request](https://github.com/kadirahq/flow-router/pull/290) accepted that allows the use of a *name* parameter when creating groups of routes.  Whilst using groups to specify triggers or add prefixes to your routes can be useful, the *name* parameter allows you to do much more in addition.

Sharp-eyed readers will have spotted a problem with our login callback above.  If the user navigates directly to a private route *other than* the dashboard with valid credentials stored locally, they'll still get redirected as soon as their automatic login process finishes.  That could be irritating if they were trying to visit a specific page.

We can resolve this as follows:

```javascript
Accounts.onLogin(function () {
  if (FlowRouter.current().route.group.name === 'public') {
    FlowRouter.go('dashboard')
  }
})
```

Voila! This limits the redirect to routes which are part of the *public* group, so if the user in question navigates to a different *private* route (*profile*, for example), they'll be unaffected.

### An automatic nav bar

A final use for groups is to make providing a list of links very easy.  Let's declare a global helper function:

```javascript
Template.registerHelper('groupRoutes', function () {
  FlowRouter.watchPathChange()
  var groupName = FlowRouter.current().route.group.name
  return _.filter(FlowRouter._routes, function (route) {
    return route.group.name === groupName
  })
})
```

It may look a little ominous at first, but all we're doing here is pulling out an array of available routes which have the same group name as the one we're currently looking at.  For those less familiar with Flow Router, the `FlowRouter.watchPathChange()` instruction simply tells our helper function to rerun when the route changes, which could mean a change to the current group.

Having declared our helper, making a list of links in the current group (which could be *public*, *admin*, ...) is as simple as:

```html
&#123;&#123;#each groupRoutes&#125;&#125;
  <a href="&#123;&#123;path&#125;&#125;">&#123;&#123;name&#125;&#125;</a>
&#123;&#123;/each&#125;&#125;
```

We can put this in our layout template, or in selected sub-templates, but wherever we use it, it will give us a list of links to the routes in our current group.

## Template-level subscriptions

Flow Router allows the use of route level subscriptions, but the Kadira team [have been vocal](https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management) in encouraging developers to avoid subscribing in the router, and instead leave it to the template layer.  This pattern has been made significantly easier since the release of Meteor v1.0.4 and the built-in template instance subscriptions that it allows.

### Router level vs Template level

For the sake of comparison, here's a publication, the data from which will be displayed in one of our routes.  As you can see, it expects an `opts` object, with an optional `type` key.

(NB - we find this `opts` pattern useful, both to avoid large numbers of parameters being passed to methods or publication functions, and because `Match.Optional` somewhat bizarrely [doesn't accept `null`](https://github.com/meteor/meteor/issues/3876))

```javascript
Meteor.publish('test', function (opts) {
  var match = {
    type: Match.Optional(String)
  }
  if (!Match.test(opts, match)) return this.ready()
  return Test.find()
})
```

#### Router-level subscription

We could pass the required parameter in a query-string and subscribe at the router level.  This would work perfectly well:

```javascript
FlowRouter.route('/data', {
  name: 'data',
  action: function () {
    BlazeLayout.render('layout', {template: 'data'})
  },
  subscriptions: function (params, queryParams) {
    var opts = {}
    if (queryParams.type) opts.type = queryParams.type
    this.register('test', Meteor.subscribe('test', opts))
  }
})
```

This is mostly fine, aside from the concerns raised [by Kadira academy](https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management), and retaining our filter in the URL is actually a fairly sensible practice.

However, we can do just the same at the template level:

#### Template level subscription

```javascript
Template.data.onCreated(function () {
  var tpl = this
  tpl.autorun(function () {
    FlowRouter.watchPathChange()
    var opts = {}
    var type = FlowRouter.getQueryParam('type')
    if (type) opts.type = type
    tpl.subscribe('test', opts)
  })
})
```

This would work in exactly the same way.

#### The Kicker

Now, what if our subscription also depends on some other unpredictable parameter?  After all, Meteor is designed for real-time data.  It could be the result of user input, a response from a streaming API, an IoT application, changes propagated by another collection, etc...

In the latter case this is just as straightforward, we simply need to set up a new [*Reactive-Var*](http://docs.meteor.com/#/full/reactivevar_pkg) to store the current limit:

```javascript
var param = new ReactiveVar('foobar')
```

Then we can `get` the value in our subscribing `autorun`, which will take care of passing it to the publication function whenever we change its value as a result of whatever event we like.

However, the alternative in the former case is significantly uglier.  Most importantly, we'd need to rerun the route as Flow Router is not reactive by design.  So, that means using `FlowRouter.reload()` in our callback, which is already throwing away one of the benefits of using Flow Router over Iron Router.

Then, you'd have to make the value of `param` available to the router somehow, which means either putting it in the query-string or else storing it in a globally-namespaced object, either of which could feel unsatisfactory depending on the data in question.

Of course router-level subscriptions can be made to work fine, as can repeating the same subscription across different routes to render the same template, or relying on a single loading template at the layout level for whenever any of your subscriptions are loading.  However, I hope I've convinced you that it's unnecessary and, in the long-run, more complex than subscribing at the template level.

*******************
If you found that interesting, follow [@_tableflip](https://twitter.com/_tableflip) for more on Meteor, Node.js and Rapid Prototyping.
