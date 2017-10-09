---
title: "Make your collections roar!"
permalink: "making-your-collections-roar/"
date: 2016-08-02 13:18:00 +0000
author: "richsilv"
---
More than a year ago, in March 2015, Meteor version 1.0.4 was released.  Amongst the most interesting new features were an upgrade to MongoDB 2.6 and access to the underlying Mongo database and collection objects  via the `rawDatabase()` and `rawCollection()` methods.

With the recently released version 1.4 of Meteor seeing an upgrade to version 2.2.4 of the MongoJS database driver as well as MongoDB 3.2 shipping with the development server, now seems like a good time to investigate the features that these objects provide beyond Meteor's built-in suite of database methods.

If you're already familiar with the intricacies of using Node libraries in Meteor, skip the top section and head straight to the examples to see how advanced features of MongoDB can be used to turbo-charge your app.

## What's in the box?

> *Mongo.Collection#rawCollection()*

> Returns the Collection object corresponding to this collection from the [npm mongodb driver module](https://github.com/mafintosh/mongojs) which is wrapped by Mongo.Collection.

Calling `rawCollection()` on one of our Meteor collections will give us access to the methods listed in the *mongojs* [readme](https://github.com/mafintosh/mongojs).  The docs are a little terse, but that's because the module is designed to follow the well-documented [Mongo shell API](https://docs.mongodb.com/manual/mongo/) as closely as possible, so we can largely stick to referring to that.

A little investigation of either document reveals an interface with all of Meteor's Mongo operations supported, along with some intriguing additions.  However, in the case of *mongojs*, there's also a major difference.

### Node rules OK

As with the vast majority of Node packages, *mongojs* uses a callback style to handle asynchronous events (i.e. database reads and writes).  What that means is the following:

```js
const Posts = new Mongo.Collection('posts')
Posts.insert({ name: 'My Post' })

const rawPosts = Posts.rawCollection()
const myPost = rawPosts.findOne({ name: 'My Post' })

// ERROR!!!!
```

Unlike Meteor's native `findOne`, the `findOne` method in *mongojs* runs a callback function (which must be passed into the function call) with an error and a result as its arguments.  In most cases in Node, running code like the above would simple leave `myPost` undefined, but because of Meteor's internals the lack of callback actually results in an error.  We need to do the following instead:

```
const Posts = new Mongo.Collection('posts')
Posts.insert({ name: 'My Post' })

const rawPosts = Posts.rawCollection()
const myPost = rawPosts.findOne({ name: 'My Post' }, (err, myPost) => {
  if (err) return console.error('Oh no!', err)
  console.log(myPost)
})

// { _id: 'DjbLxocf2dJaHxKXE', name: 'My Post' }
```

### A note of caution

Whilst callback-style code works fantastically well in Node with the help of libraries like [async](https://github.com/caolan/async), it has some drawbacks when applied to Meteor:

1. Meteor's own style is synchronous, and mixing the two can make code less readable.
2. Any callback will lack the environment required to execute some of Meteor's built-in functions (like `Meteor.userId()`, for example).

The second of these is pretty nuanced, and can be resolved with `Meteor.bindEnvironment`, but that can lead to a lot of boilerplate and requires very careful error handling.  In fact, there's a much better way.

### The solution

Fortunately, Meteor provides a method called [`wrapAsync()`](https://docs.meteor.com/api/core.html#Meteor-wrapAsync) for dealing with exactly this scenario.  It converts a function which expects a callback as the last argument (that in turn passes the standard `(err, res)` arguments) into one which throws when an error is passed and returns the result when it isn't.  This means we can wrap our `rawCollection` methods and use them like we would a normal Meteor method:

```js
const Posts = new Mongo.Collection('posts')
Posts.insert({ name: 'My Post' })

const rawPosts = Posts.rawCollection()
rawPosts.findOneSync = Meteor.wrapAsync(rawPosts.findOne)
const myPost = rawPosts.findOneSync({ name: 'My Post' })

console.log(myPost)

// { _id: 'DjbLxocf2dJaHxKXE', name: 'My Post' }
```

Hooray! Okay, so this is hardly ground-breaking: we've simply rebuilt Meteor's own `findOne()` method in a round-about way.  However, the same logic can be applied to operations that Meteor **doesn't** expose by default.

## Examples

The code and data used in the examples below can all be found at [https://github.com/tableflip/raw-collections-example](https://github.com/tableflip/raw-collections-example).  The easiest way to run the code is to start up a Meteor server as normal, open *localhost:3000* in your browser, and call the provided methods with `Meteor.call` from the browser console.

### Bulk operations

There are many scenarios under which a large volume of database operations need to be processed in a short space of time: migrations, database seeding or cron-driven updates, for example.  Meteor's native methods will request these be completed one-by-one, which certainly isn't the most efficient way to communicate them to the database.

As an alternative, we can use MongoDB's [bulk operations](https://docs.mongodb.com/manual/reference/method/Bulk/) to tee up a large number of writes that we'd like to make, and only instruct the database to execute them when they've all been specified.  That way, the resulting (and relatively time-consuming) write operations can be natively streamlined as much as possible.

Using a dataset of New York restaurants provided as an example by MongoDB (available [here](https://github.com/mongodb/docs-assets/blob/primer-dataset/primer-dataset.json), although that file has been transformed into valid json for our use), we can see how this looks when inserting ~25,000 records, or ~11MB of data.

```js
import restaurantData from '../../data/restaurant-data'

const restaurantsRaw = Restaurants.rawCollection()
const bulkRestaurantOp = restaurantsRaw.initializeUnorderedBulkOp()
bulkRestaurantOp.executeAsync = Meteor.wrapAsync(bulkRestaurantOp.execute)

restaurantData.forEach((restaurant) => {
  bulkRestaurantOp.insert(restaurant)
    })
bulkRestaurantOp.executeSync()
```

Repeatedly running this code on an empty local MongoDB instance takes approximately 5-6 seconds per run on my laptop, as opposed to 18-20 seconds for a naive `Restaurants.insert()` approach - an improvement of approximately 3x.  This can be particularly useful if it's likely to be repeated regularly or extended to a much larger dataset, and the factor of improvement may well be greater if the writes in question are more complex.

### Aggregations

It's tempting to automatically fall back to the power of Javascript when we're looking to analyse our data, but MongoDB has some really powerful tools to help us to do this already built in.

One example is [aggregation](https://docs.mongodb.com/manual/aggregation/), which is effectively a pipeline of operations through which you can pass your data, transforming, grouping and filtering it as required over a series of steps.  Let's see an example.

Suppose I want to visit one of the ten highest rated restaurants in New York City, as determined by the dataset.  My only criteria is that they've had at least three reviews, so that we don't get the owner's parents skewing our decision and we can be reasonably confident of its quality.

Using Meteor's built-in DB methods doesn't give us much help here.  Since each restaurant has an array of *grades* and the [`$size`](https://docs.mongodb.com/manual/reference/operator/query/size/) operator doesn't accept a range of values, we can't even limit the result set to include only restaurants with at least three reviews.  Thankfully, the functional capabilities of modern Javascript make this less ugly than it could be, but we're still left with something like the following:

```js
const topRestaurants = Restaurants.find({})
  .map((r) => {
    const numGrades = r.grades.length
    return {
      _id: r.restaurant_id,
      name: r.name,
      numGrades,
      averageScore: r.grades.reduce((sum, g) => sum + g.score, 0) / numGrades
    }
  })
  .filter((r) => r.numGrades >= 3)
  .sort((a, b) => b.averageScore - a.averageScore)
  .slice(0, 10)
```

Wouldn't it be nice if we could do all of that stuff in the database before Meteor even received a response?

```js
restaurantsRaw.aggregateSync = Meteor.wrapAsync(restaurantsRaw.aggregate)

const topRestaurants = restaurantsRaw.aggregateSync([
  { $unwind: '$grades' },
  { $group: { _id: '$restaurant_id', name: { $first: '$name' }, averageScore: { $avg: '$grades.score' }, numGrades: { $sum: 1 } } },
  { $match: { numGrades: { $gte: 3 } } },
  { $sort: { averageScore: -1 } },
  { $limit: 10 }
])
```

Okay, there's still plenty of code in there, but I think the semantics are fairly clear, and it delivers an identical result.  Here's a quick breakdown of what each of the steps in the aggregation pipeline are doing, although much more detail can be found in the [MongoDB docs](https://docs.mongodb.com/manual/aggregation/)

* `$unwind` - this operation explodes documents which contain a subarray into multiple docs, one for each element of the array.  So, for example

        {
          company: 'TABLEFLIP',
          locations: ['London', 'New York', 'Mars']
        }
would become

        { company: 'TABLEFLIP', locations: 'London' },
        { company: 'TABLEFLIP', locations: 'New York' },
        { company: 'TABLEFLIP', locations: 'Mars' }
if we `$unwound` the locations.  In our example, we're unwinding the `grades` array so that every resulting doc has exactly one review on the `grades` field.

* `$group` - this is doing the heavy lifting: aggregating the exploded documents by `restaurant_id` again, but now adding 1 to the created `numGrades` field every time a matching doc is found, and ultimately taking an average of the `score` within each `grade` for the whole group.
* `$match` - this step is like a normal Mongo query on the data it receives, and simply removes all the docs with `numGrades` less than 3.

* `$sort` - exactly what it sounds like.

* `$limit` - ditto.

Running the two queries on my local host gave a speed increase of around 10x using the latter (~200ms vs ~2s), and that with a locally-located database.

There are a variety of advantages to this approach:
1. A vast reduction in the volume of data transmitted from your database to your Meteor server, which may not be in the same data-centre/city/continent.
2. Reducing the computational demands on your Meteor process, which might be doing many other things (like serving your site) on a single thread, and leaving them to your database server instead.
3. Speeding things right up!

## Conclusion

That's far from a comprehensive summary of the MongoDB capabilities exposed via `rawCollections`, but hopefully it indicates what's possible when you have some heavy-duty database work to do in Meteor.  We'd love to hear what you've been using `rawCollections` for!
