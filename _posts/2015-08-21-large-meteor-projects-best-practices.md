---
title: "Large Meteor projects - best practices"
permalink: "large-meteor-projects-best-practices"
date: 2015-08-21 15:49:25 +0000
author: "richsilv"
---
A list of best practices learnt from [2 years building large-scale JavaScript apps](https://tableflip.io) in [Meteor](https://meteor.com). None of this is gospel - it works for us, it may work for you.

## Which Router?

Evented Mind's [**Iron Router**](https://atmospherejs.com/iron/router) has been around for a long time and done a great deal to inform Meteor project structure in a positive way. It is inherently reactive in that the vast majority of its hooks/callbacks will rerun when any of the data they reference changes; whilst this is great in a small project as it saves you building your own [`autorun`](http://docs.meteor.com/#/full/tracker_autorun) blocks, the lack of control over this reactivity can leave larger apps re-rendering parts of the page far more frequently than necessary, leading to poor app performance, and potentially more serious issues like infinite-invalidation loops and inadvertently stopped computations.

As a result, we recommend MeteorHacks [**Flow Router**](https://github.com/meteorhacks/flow-router), due to its emphasis on keeping reactivity at a template level and out of route functions. Simply put, if your URL changes in Flow Router, then a new route will be run, if it doesn't then your router will do nothing. The result is a small increase in required boilerplate code in the short term, but the ability to "opt-in" to reactivity where and when it is required at the template level, rather than having entire sections of pages re-render redundantly.

## Directory structure

Put the Meteor app itself in a subdirectory of the project root; Meteor's propensity to include everything `.js` within the Meteor project directory in app bundles makes life very easy, but the lack of a `.meteorignore` file or similar means that if you're ever likely to end up with things that you don't want to include, it's nice to have sibling directories in your repo in which to put them. Plus, this allows you to have [**mup**](https://github.com/arunoda/meteor-up) configs, multiple settings files and other assets sensibly organised without polluting your Meteor directory.

On the client side, the structure probably depends to some extent on the rendering engine you're using.

It's also sensible to create a global app object (probably called `App`) within the **lib** directory root (eg.`app.js`), to which you can attach isomorphic methods or properties that can be accessed on either client or server. Whilst throwing things into the global namespace has its drawbacks, until Meteor has some kind of module system, this is by far the best way to avoid repeating yourself or building apps with enormous individual `.js` files.

You can then extend the `App` object in the client and server directories with client- or server-specific methods and properties as required.

#### Why is the global code directory called `lib` and not `both`?

To avoid having to nest code within it that needs to run before being used on the client or server. The global `App` object is a good example - it will be available on the client/server in files which are arbitrarily deep in the directory structure if it's declared in **lib**, whereas otherwise you would have to match the equivalent directory structure to declare it in **both** (note that this does _not_ apply if any of the client/server directories subdirectories are also called **lib**). Of course, you could have a **lib** directory for global code that needs to be executed prior to client/server code and another **both** directory for more general global code, but this distinction seems unnecessary.

#### Why `collections-client`, `collections-server` and not just `collections`?

Because in our experience, one of the few drawbacks of isomorphic javascript is that it makes it very easy for developers to put the right piece of code in the wrong place, so any clues you can give them are helpful.

## Good Meteor packages

### From Meteor Core

*   [**reactive-var**](https://atmospherejs.com/meteor/reactive-var)
*   [**reactive-dict**](https://atmospherejs.com/meteor/reactive-dict)
*   [**browser-policy**](https://atmospherejs.com/meteor/browser-policy)

### From Atmosphere

*   [**meteorhacks:flow-router**](https://atmospherejs.com/meteorhacks/flow-router)
*   [**meteorhacks:fast-render**](https://atmospherejs.com/meteorhacks/fast-render)
*   [**meteorhacks:subs-manager**](https://atmospherejs.com/meteorhacks/subs-manager)
*   [**meteorhacks:npm**](https://atmospherejs.com/meteorhacks/npm)
*   [**alanning:roles**](https://atmospherejs.com/alanning/roles)
*   [**aldeed:collection2**](https://atmospherejs.com/aldeed/collection2)
*   [**matb33:collection-hooks**](https://atmospherejs.com/matb33/collection-hooks)
*   [**london:body-class**](https://atmospherejs.com/london/body-class)

### Other packages you should know

*   [**meteorhacks:flow-layout**](https://atmospherejs.com/meteorhacks/flow-layout) - for using Blaze rendering with Flow Router.
*   [**momentjs:moment**](https://atmospherejs.com/momentjs/moment) - canonical solution for manipulating and displaying date-time information
*   [**underscorestring:underscore.string**](https://atmospherejs.com/underscorestring/underscore.string) - canonical solution for string manipulation
*   [**fortawesome:fontawesome**](https://atmospherejs.com/fortawesome/fontawesome) - ubiquitous scalable vector fonts
*   [**digilord:faker**](https://atmospherejs.com/digilord/faker) - extremely useful utility for populating DB with fake data
*   [**percolate:synced-cron**](https://atmospherejs.com/percolate/synced-cron) - the most flexible and reliable cron scheduler for Meteor
*   [**splendido:accounts-meld**](https://atmospherejs.com/splendido/accounts-meld) - automatically join several social accounts for the same user (allowing them to log in to the same account via multiple OAuth services)
*   [**aldeed:template-extension**](https://github.com/aldeed/meteor-template-extension) - a set of template helper functions which make achieving MVVM-type behaviour much easier
*   [**mystor:device-detection**](https://atmospherejs.com/mystor/device-detection) - programmatically determine client hardware
*   [**anti:modals**](https://atmospherejs.com/anti/modals) - the best framework-agnostic modal package for Meteor
*   [**simple:rest**](https://atmospherejs.com/simple/rest) - easily set up REST APIs for your collections and endpoints for calling methods
*   [**simple:json-routes**](https://atmospherejs.com/simple/json-routes) - easily define more generic server-side routes
*   [**lookback:tooltips**](https://atmospherejs.com/lookback/tooltips) - a nicely Meteoric tooltips package (although see [fork](https://github.com/richsilv/meteor-tooltips) with several useful extensions)
*   [**useraccounts:XXXXXX**](https://atmospherejs.com/useraccounts) - a suite of styled (or unstyled), fully-customisable user accounts templates
*   [**jagi:astronomy**](https://github.com/jagi/meteor-astronomy) - a really comprehensive model-layer package, which provides essentially all of the functionality of [**aldeed:collection2**](https://atmospherejs.com/aldeed/collection2), [**matb33:collection-hooks**](https://atmospherejs.com/matb33/collection-hooks) and other features such as reactive joins. We have yet to test this package in production, but it looks very promising.

## Never use Session variables

The only reason Session variables seem to have been included in the examples is because they persist across hot code reloads. This remains their sole useful function, which is only occasionally relevant in development and never in production. They also all sit in the global namespace, which goes against many years of JS design practices for obvious reasons of privacy and potential conflict. There are hardly any situations in which a [**ReactiveVar**](https://atmospherejs.com/meteor/reactive-var), an entry in a [**ReactiveDict**](https://atmospherejs.com/meteor/reactive-dict) (the prototype for which is used to construct the `Session` object) or a document in a DB collection would not be more appropriate. Note that [**ReactiveVars**](https://atmospherejs.com/meteor/reactive-var) can be particularly useful because they aren't limited to EJSON-able data types; any JS object can be stored in a [**ReactiveVar**](https://atmospherejs.com/meteor/reactive-var).

## Easily publish data to all clients without needing a subscription

A publication with `null` as the publication name will be sent to any connected client on connection, regardless of whether you have [**autopublish**](https://atmospherejs.com/meteor/autopublish) removed. This makes it trivial to seed the client's minimongo with (limited!) data that they'll need regardless of route/template.

## Be very wary of putting anything in `user.profile`

[Read this](https://meteor.hackpad.com/Proposal-for-deprecating-user-profile-3UljX1VayvV) if you're wondering why.

## Don't allow the client to modify documents

Unless they're in a client-only collection, obviously. As useful as Meteor's allow/deny rules can be, the total flexibility and lack of assumed security that method calls provide offer a much better way of guaranteeing that clients will only be able to do what you intend them to. The [**alanning:roles**](https://atmospherejs.com/alanning/roles) package is helpful for checking that the calling client has the necessary privileges here here.

## Publish as little as possible

This is fairly self-explanatory, but the performance of your app will be _heavily_ dependent on not publishing too much information, particularly at startup. So:

*   Always paginate large collections. Even if it works fine as things stand, most apps are built to grow, which means that a collection of 100 documents could become 10,000, at which point your app will have become unusable if you're not slicing them up adequately.
*   Consider explicitly specifying which fields are to be published rather than simply excluding certain fields or publishing entire documents, as changes to your schema or the gradual build-up of data could render a performant app sluggish when the quantity of data you're unwittingly sending over the wire expands. As a minimum, exclude fields which aren't strictly required.
*   Get to know the [low-level publications API](http://docs.meteor.com/#/full/meteor_publish), which gives you far more flexibility over exactly what you publish than just the result-set of a query. Understanding this can often obviate significant publication problems; [read this](http://richsilv.github.io/meteor/meteor-low-level-publications/) for a summary.
*   Do you really need live data? There are many instances in which a single set of data from the server will be adequate for the entire client session, so this can be gathered via a method call and then loaded into a client-side sessional collection for manipulation, leaving server unencumbered. If you're interested in this approach, consider [**richsilv:dumb-collections**](https://github.com/richsilv/meteor-dumb-collections).

## Reactive joins are hard work

MongoDB is not a relational database, which means that joins are not built-in the way they are in SQL. Combine with that the complications of reactivity, which imply that not only could a query's result set change, but the result set(s) on which the result set depends could change, and we have a lot of potential overhead in our Meteor app.

So, how can we avoid ruining the user experience? Some ideas:

#### Denormalise as if your life depended on it

Space in the DB is cheap. Space _on the wire_ is very expensive, which is why you need to be careful what you send to the client (see above), but there's nothing wrong with having large documents with repeated data in your MongoDB if it makes life easier. Which it does.

Consider a collection of users and a collection of movies. Many users can review a movie, and a single user can review many movies. So where do you store the review information, in the user doc or the movie doc?

The answer is neither; you store them in a separate Reviews collection, and use some simple hooks courtesy of [**matb33:collection-hooks**](https://atmospherejs.com/matb33/collection-hooks) to update the relevant user/movie docs with the review data and associated details (like the reviewer's username and avatar) upon insertion, amendment or deletion. Sure, you're going to end up with big docs, but you don't need to publish the review data when you don't need to, and your collection hooks make it easy to add a field for review metadata, which might be all you need anyway. But where you need that data, you can get it for free by subscribing to the full user object (for the "My Reviews" page) or the full movie object (for the "Movie Details" page).

```language-javascript
Reviews = new Mongo.Collection('reviews');

function addOtherData(userId, review) {  
  var movie = Movies.findOne(review.movieId),
      user = Meteor.users.findOne(review.userId);

  // add other denormalised data here
  review.username = user && user.username;
  review.useravatar = user && user.profile && user.profile.avatar;
  review.movieGenre = movie && movie.genre;  
}
```

This defines the Reviews collection and a function to annotate new reviews with further data from the Users and Movies collections which we'd rather not have to look up later.

```language-javascript
function propagateReview(userId, review, fieldNames) {  
  var updateUser = {},
      updateMovie = {},
      user = Meteor.users.findOne(review.userId),
      movie = Movies.findOne(review.movieId);

  updateUser['reviews.' + review.movieId] = review;
  Meteor.users.update(review.userId, {$set: updateUser});
  updateMovie['reviews.' + review.userId] = review;
  Movies.update(review.movieId, {$set: updateMovie});

  updateMetadata(review.movieId);
}  

function removeReview(userId, review) {  
  var updateUser = {},
      updateMovie = {};
  updateUser['reviews.' + review.movieId] = true;
  updateMovie['reviews.' + review.userId] = true;
  Meteor.users.update(review.userId, {$unset: updateUser});
  Movies.update(review.movieId, {$unset: updateMovie});

  updateMetadata(review.movieId);
}
```

These functions propagate changes made to the Reviews collection to the appropriate documents in the Users and Reviews collections so that these are available without the client requiring a subscription on the Reviews collection at all.

```language-javascript
function updateMetadata(movieId) {  
  // this would be better added as a method on documents in the Movies
  // collection via a transform when the collection is declared, but this works
  var movie = Movies.findOne(movieId),
      reviews = _.values(movie.reviews),
      averageRating = _.reduce(reviews, function(total, review) {
        return total + review.rating;
      }, 0) / reviews.length;
  Movies.update(movie, {$set: {averageRating: averageRating}});
}
```

This function, called by the previous two, attaches further metadata based on information from the Reviews collection - in this case, the average review rating.

```language-javascript
Reviews.before.insert(addOtherData);  
Reviews.after.insert(propagateReview);  
Reviews.after.update(propagateReview);  
Reviews.after.remove(removeReview);  
```

Finally, we attach the declared functions as review hooks: the original attachment of extra data from the Users and Movies collections is done before the review is even inserted*, with the rest of the hooks called after inserting, update or removal.

*In this example, it is assumed that a given review will never have its author or movie changed, so we only need to gather the associated data before insertion.

**_Aside:_** _you may be about to point out that there is no way to paginate entries within a document's properties, so if a movie has 10,000 reviews, you either publish all of them or none this way. If that's a problem, you can always fall back to paginated subscriptions to the Reviews collection, and you can still have plenty of important metadata (review count, average rating) stored in a separate field._

#### There's nothing wrong with "setInterval"

Do you _really_ need something to run reactively? Will it make any meaningful difference to a user if the data in question is updated by a batch process every minute or when the page reloads rather than as soon as the field upon which it depends changes? Sometimes, the answer to these questions is "yes", but if it's not, you can save yourself a lot of typing, processing power and potential debugging by just using batch processes.

#### If you _really_ need reactive publications

Try either [peerlibrary:related](https://github.com/peerlibrary/meteor-related) or [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite).

## Be ruthless with client-side exceptions

Be ruthless with all exceptions, really, but there is a temptation to ignore the stuff in the client console if your app kind of seems to still be working. The thing is, _something_ is throwing, somewhere, and that means that subsequent code in the relevant file will not be executed, or that a computation is not going to reactively rerun in future. So, whilst the consequences might not be immediately obvious, there will almost certainly be some at some stage, and they're probably not going to be good.

#### ...although a large proportion can be solved by checking things exist before using them

Many, many, many client-side exceptions are the consequence of `findOne` calls in helpers returning `undefined` and the client then trying to access one of its properties (e.g. `_id`). Needless to say, Javascript doesn't like this, and given that your app will start running on the client before the collection has been populated, it's going to happen a lot if you don't check that your query returns a result before you try to use it.

## Use of components in Blaze

Whilst the world seems to be falling in love with React, Blaze remains a great rendering engine which is built to perform symbiotically with Meteor. Its biggest drawback is the lack of infrastructure for easily sharing state when building an app with reuseable components.

One excellent attempt to solve this problem is [**peerlibrary:blaze-components**](https://github.com/peerlibrary/meteor-blaze-components), but the API deviates significantly from what those familiar with Blaze may be expecting.

For those looking for a simpler alternative, most MVVM-style behaviour can be achieved by harnessing the `get` method from [**aldeed:template-extension**](https://github.com/aldeed/meteor-template-extension) and observing that events still bubble in Blaze.

For example, consider the following component:

&#123;&#123;get myComponentMessage&#125;&#125;

You can render this with

&#123;&#123;> myComponent primaryLabel="foo" secondaryLabel="bar"&#125;&#125;

But what will the buttons do, and where does it get the component message from?

The answer is in the parent template instance (or its parent, etc...). Declaring reactive variables and event handlers at the top level means that the same component can be used for different purposes without the need for a complex structure of bindings or data/callbacks to be passed through the template heirarchy. All we need is the following:

```language-javascript
Template.PageOne.onCreated(function() {  
    this.myComponentMessage = new ReactiveVar("Page One Component");
});

Template.PageOne.events(function() {  
    'click [data-action="myComponent-primary"]': pageOnePrimaryCallback,
    'click [data-action="myComponent-secondary"]': pageOneSecondaryCallback
});

Template.PageTwo.onCreated(function() {  
    this.myComponentMessage = new ReactiveVar("Page Two Component");
});

// ...similar for page two events
```

The events will automatically bubble upwards until they find a handler in the page-level template, but the missing piece of the jigsaw is using one of **aldeed:template-extension**'s helpers to grab that template's properties as well.

This package contains a [variety of methods](https://github.com/aldeed/meteor-template-extension) for working with template instances, the most useful of which is `get`, which searches the current instance and then its parents in turn until it find the property in question. That's exactly the behaviour we're looking for, but we still need to put it into a global template helper to allow us to use it from within the template.

```language-javascript
Template.registerHelper('get', function(key) {  
    var valObj = Template.instance().get(key);
    return valObj instanceof ReactiveVar ? valObj.get() : valObj;
});
```

We can now update the value of variables at the top level (like `myComponentMessage`) and see the child template reactively update.

**Note** - this is not to suggest that you shouldn't be storing information in child component template instances where it relates to those components specifically.

## Using Collection2 and schemas

Collection2 has become the defacto solution for adding a schema to a collection, and comes highly recommended. Schemas can be added after collections have already been populated without the need for SQL-like migrations, and they can avoid exceptions resulting from documents with missing or wrongly specified properties. Plus, the powerful _autovalue_ setting offers useful possibilities similar to the _before_ hooks in **matb33:collection-hooks**.

### Optional or missing fields

If you have a field in your schema which may not be provided when you insert a document, you have three options. _Failure to adhere to one of these will result in an error being thrown as fields are not optional by default_.

*   Specify `optional: true`, in which case the field will be unset.
*   Specify a `defaultValue` key, in which case this will be used where no value is provided.
*   Specify an `autoValue` key, in which case the supplied function will be used to determine what to save (more below).

### Object fields must also be fully specified

Like primitive-valued fields, object-valued fields need to be fully specified unless you say so. If you set `blackbox: true` on an object-valued field, it will not be validated and you can supply anything. Otherwise, all subfields must be specified in the schema, or else a child Schema be provided for the object (which amounts to the same thing).

### Useful autovalues

#### last updated (including created)

```language-javascript
autoValue: function() {  
  return new Date();
}
```

#### notes (update "note" to populate the "notes" field)

```language-javascript
note: {  
  type: String,
  optional: true
},
notes: {  
  type: [Object],
  blackbox: true,
  optional: true,
  autoValue: function(doc) {
    var note = this.field('note');
    if (note.isSet) {
      var authorObj = Meteor.users.findOne(this.userId),
          noteObj =  {
            text: note.value,
            author: this.userId,
            authorName: authorObj ? authorObj.username : 'system',
            admin: Roles.userIsInRole(this.userId, 'admin'),
            dateTime: new Date()
          };
      if (this.isInsert) {
        return [noteObj];
      } else {
        return {$push: noteObj};
      }
    } else {
      this.unset();
    }
  }
}
```

#### Convert Markdown to HTML

```language-javascript
var converter = new Showdown.converter();

mySchema = new SimpleSchema({  
  ...
  html: {
    type: String,
    optional: true,
    autoValue: function(doc) {
      var markdownContent = this.field("markdown");
      if (markdownContent.isSet) return converter.makeHtml(markdownContent.value);
    }
  },
  ...
})
```

## Conclusion

Meteor is a young and deliberately unopinionated technology. As a result, consensus over best practice will develop and evolve over time, in response to which this article will be updated. None of it should be assumed to be optimal or immutable, simply as a collection of paradigms which could prove helpful. Suggestions for improvements will be gratefully received.
