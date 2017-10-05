---
title: "Server Side Rendering with React and Redux"
permalink: "server-side-rendering-with-react-and-redux"
date: 2016-05-23 13:02:59 +0000
author: "alanshaw"
---
We all want it - the Holy Grail of having your app render server side to give your users a quicker initial rendering and to help SEO. The problem is that React doesn't fit with the traditional model for server side rendering, in fact React turns it on it's head.

Let me explain. Traditionally if you're serving a website, a request will come into your server, and your app will gather _all_ the data it needs to render the page and _then_ use Handlebars or Jade or whatever to smoosh the two together and send the resultant HTML down to the browser. If you're using a client side app like react, you get the templates sent to you first, and then you request the data for that page (from your API). Maybe you do an initial render in between, show a nice spinner or something, but when that data finally comes back, you do a re-render to show the page you wanted.

It's awesome because it's lean. After the initial request you're communicating in only the data your web app needs, you're not getting re-sent HTML you had over and over again and the app appears way faster to your users since there's no full page reload...amongst a bunch of other wins.

The fact remains though, server is **getData -> render** whereas client is **render -> getData -> re-render**. Maybe re-render happens more than once because getData requests data from multiple sources. Wow, that sounds likely right?

**HOW MANY RENDERS BEFORE I SEND MY PAGE TO THE CLIENT?**

Is the key question and is hopefully the point where you realise the gravity of the server side rendering situation. The answer is `¯\_(ツ)_/¯`.

If you want to do a React render on the server, you've gotta somehow get all of that data into your components, _before_ the initial render, and then send that to the client.

How do you even do that though? How do you get data into the right places in the component hierarchy? If you're not using [Redux](https://github.com/reactjs/redux) then I don't know. If you _are_ using Redux or thinking of using Redux then awesome, because the rest of this post will tell you how to do that.

I'll probably not do an adequate job of describing Redux so I recommend you [read the docs](http://redux.js.org/). I'll wait, it's cool.

The key point you should know is that in Redux there's a single "store" (read: object with properties) where you keep all your data for your app. This store is awesome because you can **connect** properties from the store to [props](https://facebook.github.io/react/docs/reusable-components.html) in your React components.

> When the store changes, connected props in your components change

Ok, so we tangent, can we get back to the question? Yes, yes, we can. How do we get data into our components before the initial render? You probably figured it out already, we can use the store.

This might sound pretty wild, but what I'm proposing is that each page component has a _static_ function used _only_ for server side rendering that'll update the store with the appropriate data before the initial render.

The server just _knows_ to call this function when it's doing server side rendering, just before the initial render. Having a primed store allows the first render for our page to be complete, since our component's props are all already set.

Since we're getting all this data server side, we'll also send it back with the HTML we render so that when React & Redux come to life on the client the store is already primed with the data the server retrieved, so nothing is wasted. Yay for that.

We're going to name the static function we call on the server `fetchData`, and it returns a promise, that resolves when the store has been updated. Simple.

In Redux, to update a store you need to **dispatch** an action you've setup that'll be handled by a **reducer** to update the store. I appreciate that might not mean much if you don't know Redux, but essentially all `fetchData` needs to do is get the data from your API and dispatch actions to update the store.

**home.jsx**
```js
import React from 'react'
import API from './api'
import { setProfile } from './actions'

const Home = React.createClass({ /* ... */ })

// Returns a Promise!
Home.fetchData = ({ store }) => {
  return API.requestProfile().then((res) => {
    store.dispatch(setProfile(res.profile))
  })
}
```

Where `actions.js` looks something like:

**actions.js**
```js
export const SET_PROFILE = 'SET_PROFILE'
export function setProfile (profile) {
  return { type: SET_PROFILE, profile }
}
```

In the interests of reducing boilerplate and not repeating yourself, you should probably create **async actions** which call your API and update your store.

**home.jsx**
```js
import React from 'react'
import { fetchProfile } from './actions'

const Home = React.createClass({ /* ... */ })

// Returns a Promise!
Home.fetchData = ({ store }) => store.dispatch(fetchProfile())
```

Much nicer! `actions.js` now looks a little more complicated:

**actions.js**
```js
import API from './api'

// Split SET_PROFILE into 2 actions for request/response

export const REQUEST_PROFILE = 'REQUEST_PROFILE'
export function requestProfile () {
  return { type: REQUEST_PROFILE }
}

export const RECEIVE_PROFILE = 'RECEIVE_PROFILE'
export function receiveProfile (profile) {
  return { type: RECEIVE_PROFILE, profile }
}

export function fetchProfile () {
  // NOTE: instead of returning an object, we return a function that can
  // dispatch actions and return a Promise for when it's all complete!
  return (dispatch, getState) => {
    dispatch(requestProfile())
    return API.requestProfile()
      .then((res) => dispatch(receiveProfile(res.profile)))
  }
}
```

We use the [redux-thunk](https://github.com/gaearon/redux-thunk) store middleware to allow our dispatch functions to return a promise. We just need to remember to add this middleware when we create the store, but you'll see this later.

The final thing we need to do is **connect** up the `profile` property to our `props`:

```js
import React from 'react'
import { connect } from 'react-redux'
import { fetchProfile } from './actions'

const Home = React.createClass({
  propTypes: {
    profile: React.PropTypes.object
  },

  render () {
    /* ... use this.props.profile ... */
  }
})

Home.fetchData = ({ store }) => store.dispatch(fetchProfile())

// Extract the props we want to connect from the current store state
const mapStateToProps = (state) => ({ profile: state.profile })

// Connect this component to the redux store
export default connect(mapStateToProps)(Home)
```

So, lets review. A request comes in to the server, the server calls `fetchData`, which populates the store `profile` property, which is connected to `this.props.profile`. The server then renders the home component and the page is sent to the client! AMAZE.

But wait! What if the first page is a page that isn't the homepage? `fetchData` on that other page might not populate the `profile` property. Thats ok! When you navigate from that page to the homepage on the client, your just need to dispatch another `fetchProfile` action if the profile isn't set. We can use the `componentDidMount` lifecycle hook to dispatch this _same_ action on the client side, if our props aren't already primed or if they're stale.

```js
import React from 'react'
import { connect } from 'react-redux'
import { fetchProfile } from './actions'

const Home = React.createClass({
  propTypes: {
    profile: React.PropTypes.object,
    fetchProfile: React.PropTypes.func
  },

  // When the component gets added to the DOM, fetch any data we need
  componentDidMount () {
    if (!this.props.profile) this.props.fetchProfile()
  },

  render () {
    /* ... use this.props.profile ... */
  }
})

Home.fetchData = ({ store }) => store.dispatch(fetchProfile())

// Extract the props we want to connect from the current store state
const mapStateToProps = (state) => ({ profile: state.profile })

// Add dispatchers to the component props for fetching the data _client side_
const mapDispatchToProps = (dispatch) => {
  return { fetchProfile: () => dispatch(fetchProfile()) }
}

// Connect this component to the redux store
export default connect(mapStateToProps, mapDispatchToProps)(Home)
```

We put our _client side_ dispatch in `componentDidMount` because on the server this lifecycle hook isn't called, since on the server we'll be rendering to a string, not to the DOM, so the component will never "mount". You might want to optimise the `fetchProfile` action to only re-request the profile when it is stale, but that's another story.

So what are we missing? Oh wait, the whole of the server side. Ok, lets do this.

We're going to use express, but not a lot. We use [react-router](https://github.com/reactjs/react-router) for routing so we don't have to re-declare our routes twice on the client _and_ the server. Reduce, reuse, recycle FTW.

For full disclosure, here's our routes file:

**routes.jsx**
```js
import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Home, Error404 } from './pages'
import Layout from './layout.jsx'

export default function (props = {}) {
  let history = browserHistory

  if (props.store) {
    history = syncHistoryWithStore(browserHistory, props.store)
  }

  return (
    <Router history={history}>
      <Route path='/' component={Layout}>
        <IndexRoute component={Home} />
        <Route path='*' component={Error404} />
      </Route>
    </Router>
  )
}
```

This is fairly standard, but the interesting bit here is really [react-router-redux](https://github.com/reactjs/react-router-redux) which is used to sync our store with the browser history API. It just works, you should totally use it.

Onward to the server!

We can use react-router's `match` method to map URLs to our routes:

**server.jsx**
```js
import express from 'express'
import { match } from 'react-router'
import routes from './routes'

app.get('*', (req, res, next) => {
  match({ routes: routes(), location: req.url }, (err, redirectLocation, renderProps) => {
    /* ... */
  })
})

const server = app.listen(port, () => console.log('Server started', server.address()))
```

In express terms, we're creating a route handler for _all_ routes, which we delegate to `match` passing it our react routes to match against.

`renderProps` is an object we can pass to react-router's `RouterContext` for rendering our page. The key thing here is that `renderProps` has a `components` property, which is a list of the components classes that will be rendered.

Why do we need this? Well, we need to pick out the leaf page component so that we can call our `fetchData` static function to get the store data before render:

**server.jsx**
```js
/* ... */

// Get the component tree
const components = renderProps.components

// Extract our page component
const Comp = components[components.length - 1].WrappedComponent

// Extract `fetchData` if exists
const fetchData = (Comp && Comp.fetchData) || (() => Promise.resolve())

/* ... */
```

We just need to create an empty store, call `fetchData` to populate it, and then render to string:

**server.jsx**
```js
/* ... */

const initialState = {}
// Note our thunk middleware for async actions
const store = createStore(reducers, initialState, applyMiddleware(thunkMiddleware))
const { location, params, history } = renderProps

// Call fetchData, passing it some useful things it might need
fetchData({ store, location, params, history })
  .then(() => {
    // Store all populated, do the render!
    const body = renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>
    )

    // Grab the state, for inflating on the client side
    const state = store.getState()

    // Wrap the body in your HTMLs
    res.send(`<!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="/bundle.css">
        </head>
        <body>
          <div id="root">${body}</div>
          <script>window.__REDUX_STATE__ = ${JSON.stringify(state)}</script>
          <script src="/bundle.js"></script>
        </body>
      </html>`)
  })
  .catch((err) => next(err))

/* ... */
```

Note that we're serializing the store state into `window.__REDUX_STATE__`! On the client entry point we pick this up:

**client.jsx**
```js
import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import Routes from './routes'

// Pick up any initial state sent by the server
const initialState = window.__REDUX_STATE__
const store = createStore(reducers, initialState, applyMiddleware(thunkMiddleware))

syncHistoryWithStore(browserHistory, store)

render((
  <Provider store={store}>
    <Routes store={store} />
  </Provider>
), document.getElementById('root'))
```

For completeness, here's the full **server.jsx** module:

```js
import express from 'express'
import { match } from 'react-router'
import { renderToString } from 'react-dom/server'
import { RouterContext } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'
import routes from './routes'
import reducers from './reducers'

const app = express()

app.get('*', (req, res, next) => {
  match({ routes: routes(), location: req.url }, (err, redirectLocation, renderProps) => {
    if (err) return next(err)

    if (redirectLocation) {
      return res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    }

    if (!renderProps) {
      return next(new Error('Missing render props'))
    }

    const components = renderProps.components

    // If the component being shown is our 404 component, then set appropriate status
    if (components.some((c) => c && c.displayName === 'error-404')) {
      res.status(404)
    }

    const Comp = components[components.length - 1].WrappedComponent
    const fetchData = (Comp && Comp.fetchData) || (() => Promise.resolve())

    const initialState = {}
    const store = createStore(reducers, initialState, applyMiddleware(thunkMiddleware))
    const { location, params, history } = renderProps

    fetchData({ store, location, params, history })
      .then(() => {
        const body = renderToString(
          <Provider store={store}>
            <RouterContext {...renderProps} />
          </Provider>
        )

        const state = store.getState()

        res.send(`<!DOCTYPE html>
          <html>
            <head>
              <link rel="stylesheet" href="/bundle.css">
            </head>
            <body>
              <div id="root">${body}</div>
              <script>window.__REDUX_STATE__ = ${JSON.stringify(state)}</script>
              <script src="/bundle.js"></script>
            </body>
          </html>`)
      })
      .catch((err) => next(err))
  })
})

const server = app.listen(port, () => console.log('Server started', server.address()))
```

Thats it! Good luck!
