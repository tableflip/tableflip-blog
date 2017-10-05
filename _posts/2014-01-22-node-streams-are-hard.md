---
title: "Node streams are hard"
permalink: "node-streams-are-hard"
date: 2014-01-22 16:16:16 +0000
author: "alanshaw"
---
"Node streams are hard. So I decided to learn them. Then I found out they weren't hard, I just didn't know about them yet. I updated `markdown-pdf` to have a streaming interface. It's a farse really, because marked doesn't have a streaming interface so `markdown-pdf` has to buffer all the markdown into memory before it is converted to HTML. That's pretty dull, but I'm working on the assumption that in the future there'll be a streaming markdown to HTML parser I can pipe the markdown into.

Likewise with converting the HTML to a PDF. Currenty `markdown-pdf` uses [phantomjs](http://phantomjs.org/) to render the PDF. The HTML is piped into a temporary file, but then phantomjs reads the entire file and renders the page. Phantomjs _isn't_ node and doesn't have a stream API so when it's done it saves the PDF file to disk and node then creates a read stream for piping it to wherever.

It's complex because there are two streams involved - an input stream and an output stream, the two are related, but disconnected by the need for a child phantomjs process to be spawned and do some processing in the middle of the pipe. Luckily there's a module for composing these two streams into one readable/writeable stream (or duplex stream if you will), which pipes _in_ to the first stream and _out_ from the second. It's called [duplexer](https://npmjs.org/package/duplexer) and is awesome.

Anyway, the point is that streams aren't hard, and actually there are a whole bunch of modules out there to help you work with them [more easily](https://npmjs.org/package/through). They seemed hard because I hadn't taken the time to use them and get to know them. If you still feel like they are hard, then stop that and build something that uses them. I guess what pushed me into taking the plunge was hearing that "if you have a module that's doing any kind of IO in node and you're not using streams, then you're doing it wrong"."
