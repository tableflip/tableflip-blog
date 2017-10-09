---
title: "tableflip.io now on Dat"
permalink: "tableflip-io-now-on-dat/"
date: 2017-09-26 12:21:28 +0000
author: "alanshaw"
---
Earlier this week we put the TABLEFLIP website on [Dat](https://datproject.org/) so it's now available p2p. If you're using the [Beaker Browser](https://beakerbrowser.com/) you can put [dat://tableflip.io](dat://tableflip.io) in your URL bar and a peer should serve you our website.

["Vanity Dats"](https://github.com/beakerbrowser/beaker/wiki/Authenticated-Dat-URLs-and-HTTPS-to-Dat-Discovery) (I totally just made that name up) are a feature of Beaker rather than Dat but are nevertheless very cool. The current website at the time of writing is [dat://b5f226..33/](dat://b5f2265cca5d5f1c7a2fcec32e8310e8ac41151c9f026afba26cd82f02cdba33/)).

When I said "a peer should serve you our website", that's the important point. If my laptop is the only peer serving that dat hash then you're going to have a bad time viewing it when I'm offline. Luckily there's a service called [hashbase](https://hashbase.io/) which will become a peer for your content in return for some $$$ (You can store up to 100MB for free!), so even if no-one else is peer-ing it, hashbase will be so it'll always be available, which is great!

We learned that putting your website on Dat is stupidly easy thanks to [this article](https://handbook.protozoa.nz/experiments/p2p_github_pages.html) written by our friends at [Protozoa](https://protozoa.nz/) ([dat://protozoa.nz](dat://protozoa.nz)).

---

If you like this decentralised p2p awesomeness then you might also like to [listen to our podcast on IPFS](https://blog.tableflip.io/ipfs/).
