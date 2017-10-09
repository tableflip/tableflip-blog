---
title: "Function parameters"
permalink: "function-parameters/"
date: 2015-01-06 11:12:37 +0000
author: "alanshaw"
---
If the param is optional, put it in an options object. If it's required, it should be a function param. It's a fairly simple rule to follow and will save you and your API consumers a load of work. I've seen functions that take a bunch of parameters written like this: `function sendMail (options) {}`. Where `options` is an object that contains all the parameters needed to send an email. I've got a few problems with this, and I'll explain why.

Firstly, `options` is no longer optional. You can't send an email without knowing some required things which might include, for example, who to send it to. So you _have_ to pass an options object to `sendMail`.

It's almost obvious in our example what fields in the options object we need to set for sending an email. Although without looking further into the function code or at some (probably) out of date jsdoc comments for the function we don't know whether the recipient address is a property called `recipient`, `to` or something else.

So I can't glance at the function definition and determine what parameters are the minimum required to send an email. That's more work for me, but also for the API creator, since they have to document which ones are actually optional and which ones are required, and the property names in the options object are important - another place for accidental error on behalf of the API consumer.

A more sane signature for the `sendMail` function might look like this:

```js
function sendMail (to, from, subject, body, options, callback) {
  // Optional params might be: cc, bcc, attachments, smtpServer
}
```

Some of those params aren't strictly _required_ but 99.9% of people will want to send an email with a `subject` and `body` text so they've been elevated to required status, because that's sensible.

So please, think about your API when you're coding and you'll save you and people who use your code a bunch of work.
