---
title: "Promises in Meteor"
permalink: "promises-in-meteor"
date: 2015-11-23 22:05:17 +0000
author: "richsilv"
---
### TL;DR

As a result of [this commit by Ben Newman](https://github.com/meteor/meteor/commit/f5821c88eee587706eb8107f74de2f60c267807f), you can return a Promise directly from a Meteor method, which provides an easy way to deal with asynchronous code using native ES2015.

### The details

If your Meteor method returns a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), the server will wait for the promise to resolve before returning its resolved value to the client.  However, errors will still require some special handling as [Meteor only returns sanitized errors from methods](http://docs.meteor.com/#/full/meteor_error).

### The advantages

1. This provides a simple *native ES2015* API for dealing with the common requirement for asynchronous code within a Meteor method.  Using `Meteor.wrapAsync` or Futures are both great options, but neither is native Javascript.
2. Increasing numbers of Node libraries have methods which can return Promises as an alternative to providing a callback.  These can be returned directly from Meteor methods, which will be even easier when we can import NPM packages straight into Meteor 1.3.
3. The native methods [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) and [`Promise.race`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) provide powerful tools for dealing with arrays of Promises related to concurrent asynchronous function calls whilst keeping code concise and readable.
4. Plus, Ben Newman's [*promise*](https://github.com/meteor/promise) package even provides server-side polyfills for ES2016 methods `Promise.await` and `Promise.async`.  Read about them [here](https://jakearchibald.com/2014/es7-async-functions/).

### The caveat

Error handling in Promise chains is something that [has been known](http://javascriptplayground.com/blog/2015/02/promises/) [to catch](http://www.hacksrus.net/blog/2015/08/a-solution-to-swallowed-exceptions-in-es6s-promises/) [people out](http://jamesknelson.com/are-es6-promises-swallowing-your-errors/)*****, so it's wise to remember that every chain should probably finish with its own `catch` method to make sure unexpected responses from your asynchronous function calls aren't being swallowed without being handled.

More specifically, any time you return a Promise from a Meteor method, you should probably use `catch` method to make sure you're throwing an appropriate error in a sanitized format that will be communicated to the client. An error will still be returned if you don't, but the contents will be a generic *500* in all cases. For example:

```js
Meteor.methods({
  promiseExample () {
    var myPromise = awesomeNodeLibrary.method(params)
    return myPromise
      .catch(err => {
        throw new Meteor.Error(err)
      })
  }
})
```

### A reductive example

This is not a good use of Promises for anything other than demonstration:

```js
function timesByTwo(n, delay) {
  return new Promise((resolve, reject) => {
    Meteor.setTimeout(() => {
      if (typeof n !== 'number') reject('Not-a-number')
      resolve(n * 2)
    }, delay)
  })
}

Meteor.methods({
  timesBySixteen (n) {
    return timesByTwo(n, 1000)
      .then(n => {
        console.log('bear with us')
        return timesByTwo(n, 2000)
      })
      .then(n => {
        console.log('this is harder than it sounds')
        return timesByTwo(n, 3000)
      })
      .then(n => {
        console.log('nearly there!')
        return timesByTwo(n, 4000)
      })
      .catch(e => { throw new Meteor.Error(e) })
  }
})
```
**\*** The last example refers to the [bluebird Promise library](https://www.npmjs.com/package/bluebird), which provides methods in addition to the standard ES2015 specification (like `done`).
