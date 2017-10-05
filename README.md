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
permalink: "/node-streams-are-hard"
date: 2014-01-22 16:16:16 +0000
author: "alanshaw"
---
You post maddness goes in here as *markdown* with images ![pussycat](http://radcats.com/pussy.jpg) or any think else you want to include.
```

Your post will be built out by 'jekyll' into the `_site` folder as static html.
