---
title: "The difference between module.exports and exports"
permalink: "the-difference-between-module-exports-and-exports"
date: 2014-08-02 16:00:34 +0000
author: "alanshaw"
---
There is no magic. Your module code is sandwiched between the two items in this array, and eval'd:
```js
NativeModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
'\n});'
];
```
[https://github.com/joyent](https://github.com/joyent/node/blob/832ec1cd507ed344badd2ed97d3da92975650a95/src/node.js#L792-L795)

The magic variables you can use in modules - `exports`, `require`, `module`, `__filename`, and `__dirname` are not magic, they are just parameters to the function that is invoked when your module is loaded.

Initially, `exports` and `module.exports` point at the **same _empty_ object**.

![](https://ucarecdn.com/af1c810c-72f4-43cb-a0da-fcd67bed2a80/initial.svg)

You can add properties to this object using either `module.exports` or `exports` since they both point to the same object, _it doesn't matter_ which you use.

If you add `exports.foo = "bar"` and `module.exports.baz = "boz"` then your module's exported object will look like:

```ruby
{foo: "bar", baz: "boz"}
```

...but, what if you want to export a _function_, or a _string_, or a _unicorn_?

This is when the difference between `exports` and `module.exports` _is important_.

If you remember nothing else from this article, remember this:

> **`module.exports` wins**

What this means is that whatever object `module.exports` is assigned to is the object that is exported from your module.

If you want to export a function from your module and you assign it to `exports` and not `module.exports` then this happens:

![](https://ucarecdn.com/afcf068c-7d36-4ccd-a51c-a4ef6a9d8c1e/badexport.svg)

Ruh roh! Your module will export an empty object, not the function that you probably intended it to export!

If you want to export something other than an empty object and you want to use `exports` elsewhere in your module, you'll need to reassign them both:

```js
exports = module.exports = function () {/* ... */}
exports.foo = "bar"
```

...and that's it. Simple.
