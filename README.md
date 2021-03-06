# Tableflip Blog

## Usage

- Install jekyll

```sh
gem install bundler
bundle install
```

https://jekyllrb.com/docs/quickstart/


- Run the dev server to watch for changes

```sh
bundle exec jekyll serve --watch
# Server now running on http://localhost:4000
```

## Create a new blog post

Make a new `markdown` file in the `_posts` folder and add the following 'frontmatter' at the head of the file.

```md
---
title: "Node streams are hard"
permalink: "node-streams-are-hard"
date: 2014-01-22 16:16:16 +0000
author: "alanshaw"
---
You post maddness goes in here as *markdown*
```

|property|description|
|:---|:---|
`title`|the title of your post this is included in the open graph tagging
`permalink`|a slug version of your post title, or any url friendly string
`date`|please stick to this format to benefit from Jekyll's built-in ordering of posts and template date formatter helpers
`author`|must be your github username to benefit from auto avatar fetching and links to your github account

The first paragraph of a post is extracted as your 'summary'. This will appear in the index of the posts on the home page and your author page.

Each post has a set of basic meta data populating the `<head>` drawn from your post's frontmatter:

```html
<meta property="og:title" content="TUNE-ing super fast static websites" />
<meta property="og:site_name" content="TABLEFLIP Blog" />
<meta property="og:url" content="https://blog.tableflip.io/tableflip-blog/tune-ing-super-fast-static-websites" />
<meta property="og:image" content="https://github.com/tableflip.png" />
<meta property="og:type" content="article" />
<meta property="og:description" content="Yep, we did what is generally accepted to be a “bad idea” by many developers and built a static site generator slash CMS for our clients. I don’t blame them. Getting it right is really difficult, it’s such a mammoth task, and building a concise set of features is dependent on your particular use cases.

" />
<meta property="article:published_time" content="2017-09-26T12:21:28+00:00" />
<meta property="article:author" content="https://github.com/alanshaw" />
<meta property="article:section" content="Javascript" />
<meta name="description" content="Yep, we did what is generally accepted to be a “bad idea” by many developers and built a static site generator slash CMS for our clients. I don’t blame them. Getting it right is really difficult, it’s such a mammoth task, and building a concise set of features is dependent on your particular use cases.

" />
<meta name="author" content="https://github.com/alanshaw" />
<meta name="copyright" content="2017-09-26T12:21:28+00:00" />
<meta name="application-name" content="TABLEFLIP Blog" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="TUNE-ing super fast static websites" />
<meta name="twitter:description" content="Yep, we did what is generally accepted to be a “bad idea” by many developers and built a static site generator slash CMS for our clients. I don’t blame them. Getting it right is really difficult, it’s such a mammoth task, and building a concise set of features is dependent on your particular use cases.

" />
<meta name="twitter:image" content="https://github.com/tableflip.png" />
```

Your post will be built out by 'jekyll' into the `_site` folder as static html. The current `master` branch of the repo is set to server the site at `tableflip.github.io/tableflip-blog` pushing to master will publish changes.

Be mindful to use the `relative_url` template helper to make sure links work on `localhost:4000`, on `tableflip.github.io/tableflip-blog` and for `blog.tableflip.io`:

```html
<a href="{{"/images/cats.jpg" | relative_url}}">Cats</a>
```

## Deploy https

A 2 step process. Push to now.sh, then update the alias.

```sh
npm run deploy

> Deploying ~/Code/tableflip/tableflip-blog/_site under tableflip
> Ready! https://tableflip-blog-xufavphepp.now.sh (copied to clipboard) [2s]
```

Take a look at the new deployment and check it looks like you thought it would, Then update the alias to make it live.

```sh
now alias https://tableflip-blog-xufavphepp.now.sh blog.tablelip.io
```

This works because we've already updated the dns records to cname blog to `alias.now.sh`.

## Deploy dat

Update either update the existing dat repo, or create a new one and update the hash in `.well-known/dat`

See: https://handbook.protozoa.nz/experiments/p2p_github_pages.html

This works because dat is magic.
