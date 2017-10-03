---
title: "TUNE-ing super fast static websites"
permalink: "/tune-ing-super-fast-static-websites"
date: 2017-09-26 12:21:28 +0000
author: "alanshaw"
---
Yep, we did what is generally accepted to be a "bad idea" by many developers and built a static site generator slash CMS for our clients. I don't blame them. Getting it right is really difficult, it's such a mammoth task, and building a concise set of features is dependent on your particular use cases.

We found a number of features that we wanted in existing products, but we wanted a complete solution that actually had far fewer features than any one of the existing products were offering but would still tie all the best bits we needed together.

Our bread and butter is web apps or mobile apps, but we sometimes get requests to build simple marketing/brochure websites or microsites (one or two page sites) for which our most complicated CMS requirement is essentially a blog, where there is a need to generate new pages for each post.

In general though, all a CMS needs to do is, given a template, retrieve some data from the database and smoosh the two together. Traditional content management systems do this for _every_ request. Which is surprising when 99% of the time the result will be the same. Think about it, how often do you update your marketing site? Once a week, once a day, once an hour...even if you updated it once a minute it would still make more sense to do the smooshing once when you make a change and then get Apache/Nginx/whatever to serve the result - a static file, over and over again. Which they're really good at by the way. Like, really good, like, blisteringly fast and frequent good.

So one of our ideas is to optimise for reads, which isn't a new thing, or particularly clever, but one of our other goals is to co-host as many of these sites on one VM as possible, to keep hosting costs down. The less work our server has to do to get a web page to a client means it can do it faster and it'll have more time to service other requests.

Ok, so enough preamble, what do we even want from this thing?

## Server side rendering

We all know this is important for SEO and is of particular importance for the types of sites we're looking to build and manage. The website that markets your thing needs to be discovered by everyone. We get it. We know.

## Co-host as many as possible

I said it already, but it's a big money saving activity for us. We want to be able to host as many of these as possible on a single VM, without any of them effecting each other. I know it's a risk to put all your eggs in one basket but hear us out - one of the goals is to host just the rendered pages for each website, so if one becomes super popular, then we migrate a bunch of files to another server running Nginx, and flick the DNS. It's not complicated or risky.

But what if the server explodes? Well, so what? The server serving the pages for your website is only serving the result of the smooshes. The server doing the smooshing is hidden away from public view along with the templates and data. The server exploded? Ok smoosh everything onto a different server.

## Versioned changes (accountability, backups)

We want to protect ourselves from situations such as "DEAR TABLEFLIP, OMG I DELETED A PAGE HOW DO I GET IT BACK?". We want to know who made changes, when and what they changed so that we can revert to a previous version if necessary and have a form of backup. Wow, this sounds like a VCS doesn't it, like, git, perhaps?

## Our own tech choices

We want to choose which tech we use to build the site, but we don't want to be tied down to one particular set of technologies. When we built this we were sold on Jade and Less, but nowadays we're all about React and Tachyons. We need to be able to switch to using new and exciting technologies easily because it's a important for our personal happiness.

## Preview => publish workflow

We should be able to view changes we make in the CMS before they're published to the live site. However good your WYSIWYG editor is, it doesn't compare to seeing your content in place on the actual web page.

---

The code for the websites we build lives on Github anyway, so we thought it might be cool if clients also had access to this, but in a way that meant they didn't have to be a programmer to contribute and also in a way that exposed them to just the bits of the code they're interested in (the website content). Couple that with the ability to deploy content updates and we have a viable CMS.

We decided to build our CMS around Git and Github. I know ok. I know. But actually we just made three tools that do a single job within the "CMS" and do it well. Github and Git basically take care of the rest of our requirements.

Specifically, we built two robots in pursuit of our goals. [TARS](https://github.com/tableflip-tars) and [TABS](https://github.com/tableflip-tabs).

These are two Node.js processes that are triggered by Github webhooks. They both have access to the TABLEFLIP organisation and are informed when any repo gets pushed to. If a repo has a 🤖 emoji in the description then TARS and TABS know it's something they're in charge of.

TABS (TABLEFLIP Automated Build System) is in charge of building the site and pushing the result to the `gh-pages` branch. The code pushed to `gh-pages` is used to preview changes before they're released to the live site. There's a few restrictions that actually afford us flexibility in our tech choices. These are:

1. Node.js runs the build, i.e. the build must be triggered by `npm run build`
2. The built site must end up in a `/dist` directory in the project root

...and that's all. The means of the build is entirely up to the developers.

TARS (TABLEFLIP Automated Release System) is in charge of releasing the site. TARS listens for semver tag commits, pulls the changes and checks out the `gh-pages` branch. This is what is served by Nginx on the live site.

The remaining piece of the puzzle is the tool for editing content for a website. Our tool is called TUNE, and it's a simple web app that reads the current state of the client's website from Github, pushes content updates as commits and tags releases when the user wants to release.

Our clients are asked to get Github accounts and we give their login write access to the repo(s) relevant to them. TUNE logs our clients in using their Github accounts allowing it to see and edit the repos.

The conventions for TUNE are that each page is in a directory and each directory contains a `schema.json` and a `content.json`. TUNE makes changes to only the `content.json`, but it uses `schema.json` to determine what kind of field it's updating.

TUNE understands a few simple field types:

1. text - plain ol' single line text
2. textarea - multi line for longer text
3. image - an image upload (we currently use uploadcare)
4. url - basically text automatically validated as a URL
5. boolean - a checkbox
6. array - which is always an array of objects with fields and their types, for lists, blog posts etc. etc.

The `schema.json` file also allows us to define custom validations for fields that aren't common to every website.

TUNE simply updates the `content.json` and pushes the commits. Right now most of our sites simply iterate over each page and invoke Jade/Pug with the data in `content.json` to build when `npm run build` is invoked.

---

That is pretty much all that's involved.

I feel at ease writing this now since it's been around a year since the first trials with real clients and we've almost not touched it since then. It just keeps trucking, doing what it does really well.

Let us know if you have any questions about TABS, TARS or TUNE or if you need a website built and like the sound of our approach!

Here's some sites we've TUNE-d:

http://brandnewweddings.co.uk/
http://marmalade-productions.co.uk/
http://rebelandslaughter.com/
