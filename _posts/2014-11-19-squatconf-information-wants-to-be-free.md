---
title: "SquatConf -  Information wants to be free."
permalink: "squatconf-information-wants-to-be-free/"
date: 2014-11-19 19:35:47 +0000
author: "olizilla"
---
A free conference of ideas on de-centralisation of services, transparency, crypto and open-source.

[![](https://ucarecdn.com/f69cc929-068b-4ad0-8a58-3e1d29e0fc19/Screenshot20141119193902.png)](http://squatconf.eu/)

Held in Hanger 56 in Paris, it was a tech conference without the ceremony or constraints that a big budget show inevitably presents.

Pitched as: _"a zero-cost conference made with love, but a little rougher around the edges."_ it emerged from conversations and spirit of [LXJS](http://2014.lxjs.org/), but choosing a different set of trade-offs.

[![](https://ucarecdn.com/7106eba0-799a-4f88-b986-ca9c08cb41ac/squatconfhanger56paris.jpg)](https://www.facebook.com/hangar56paris/photos/a.1399789370289400.1073741827.1399092357025768/1435799166688420/?type=1&permPage=1)

A couple of issues were alluded to by multiple speakers:

1. Transparency, trust & federation can work better than absolute privacy, isolation & full de-centralisation.
2. Expose core problems with good tools rather than masking them with opinionated solutions (UDT over TCP, forksdb over general purpose db, squatconf over megaconf).

And many other individual points:

- Talk more, change opinions, hack later.
- Protect users from everyone, including future you.
- Fix local problems with open solutions; document and teach others how to do the same.
- Build for offline / almost zero network scenarios. A tiny slice of the planet has reliable hi-bandwith internet.

The conference itself was both radical, compared to the current conference norms, and one of the oldest ideas out there. It was free. No tickets ment _free to attend_; no sponsors ment _free to discuss what we liked._

**What follows is a flavour, a super-reduced gravy, of the topics presented.**

## [@dhigit9](https://twitter.com/dhigit9) - Try out UDT

**An application layer TCP you can tune**: [UDP-based Data Transfer Protocol](http://en.wikipedia.org/wiki/UDP-based_Data_Transfer_Protocol)

TCP is an opinionated / general purpose solution to the transport layer. UDT is a faster TCP (maybe 4x faster depending on usecase) where you can choose the transport layer tradeoffs.

You can try it out today in the [instantWebP2P](https://github.com/InstantWebP2P/node-httpp) fork of node. **Let's get it into node!**

## [@substack](https://twitter.com/substack) - the appcache.manifesto

Use the manifest file + far future expires + cache headers to make web pages permanent.

**Build web tools**: Really offline apps that work forever - appcache + cache headers let us build apps that don't need the server.

**Protect users from future us.**
We might run out of time/money/inclination to keep a service running, or worse - we might _"go Oracle"_.

No server hits means no leaking user info back to central; opt-in updates give protection from apps that go bad or go away.

> The default mechanics of the web are highly skewed toward service providers and away from users. To correct this imbalance, we developers should irrevocably limit our own ability to exert control. A manifesto means nothing without a mechanism.

- [`hyperboot`](https://github.com/substack/hyperboot) - offline webapp bootloader
- [`keyboot`](https://github.com/substack/keyboot) - for offlineable auth
- [`page-bus`](https://github.com/substack/page-bus) - for offline-realtime

New adventures in database write merging:

> "if we get rid of this terrible idea that has plagued databases for ever that ...there shoud be one, canonical value for each key ..which is a lie"

[`forkdb`](https://github.com/substack/forkdb) is the "no-canonical-truth, multi-head, 1 key: many values, merging is up to you" db


## [@cjdelisle](https://twitter.com/cjdelisle) - United as one, divide by zero

We could go web-crypto...

- [https://ezcrypt.it/](https://ezcrypt.it/)
- [`cryptpad`](https://github.com/cjdelisle/cryptpad) -  realtime, collaborative, encrypted editor.

...but absolute individual privacy is isolating and tends to fail.

> "you can be completely anonymous on the net... if you don't piss off the FBI."

**Transparency works better than secrecy**. If everyone knows everything there is no value in targeting individuals.

**Federation works better than pure P2P**. Bittorrent beats gnutella. Clusters of trackers beats full peer-to-peer broadcast.

> "Scope creep in security is paranoia"

Full transcript is available here: [https://ezcrypt.it/NeAn#XQ9adFRopErvZW1joW1leSaP](https://ezcrypt.it/NeAn#XQ9adFRopErvZW1joW1leSaP)

## [@hpk](https://twitter.com/hpk42) - Talk first, hack later.

A really beautiful talk. Holger is an interesting chap and a wonderful speaker. On being nervous about public speaking he said:
> "If you're alone, in front of a group of people you don't know, it's natural to assume they want to kill you."

But, we must all talk to as many people as possible. Nothing changes without communication. Share ideas as widely as possible to effect change. It's not enough to just hack on things.

> "We can't get to the problem because we can't get to each other. Communicate with as many people as possible."

He strongly recommends: Adam Ierymenko - [Decentralization: I Want to Believe](http://adamierymenko.com/decentralization-i-want-to-believe/), that discusses:

**Efficient, secure, de-centralised: pick two.** Given the trade off, some **transparent** centralisation is needed. Rather than full de-centralisation we need **multiple federated ownership** of platforms.

> People are having decentralised conversations. youtube / gmail / facebook, all de-central in terms of the conversation. We can all publish and view, it's just the wiring, the platform, that is centralised.

If you take nothing else from this talk, read: Gene Youngblood - [Secession from the broadcast - the internet and the crisis of social control](http://www.secessionfromthebroadcast.org/2013/10/29/secession-broadcast-internet-crisis-social-control/)

_"how can we create on the same scale as we can destroy?"_

> "Summon the breathtaking image of the multitude pouring into streets and plazas around the world in millions to demonstrate against tyranny. Now imagine instead they’re demanding a free and open internet. The likelihood of that is almost zero, we would agree. But why is that?"

## [@programmarchy](https://twitter.com/Programmarchy) - Bluetooth Low Energy

BLE is super approachable for hackers. Low energy & low cost.

Be warned: the security is broken, so you have to handle it at the app layer if it's critical, which can be tricky if your on a super low power device.

See [`bleano`](https://github.com/sandeepmistry/bleno) & [`noble`](https://github.com/sandeepmistry/noble) for working with BLE and from node.

See: nordic semiconductor NRF51, Intel Edison, RFduino for prototyping.

<blockquote class="twitter-tweet" lang="en"><p>A note on Beacons. <a href="https://twitter.com/hashtag/squatconf?src=hash">#squatconf</a> <a href="http://t.co/k94i7UgvEe">pic.twitter.com/k94i7UgvEe</a></p>&mdash; Stefan van Hooft (@hooftio) <a href="https://twitter.com/hooftio/status/533614291170394112">November 15, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Slides and full transcript here: [http://www.slideshare.net/programmarchy/ble-talk](http://www.slideshare.net/programmarchy/ble-talk)

## [Layer Zero Labs](http://l0l.org.uk) - Incredible Edible / Aqua Garden.

**Make it, break it, fix it, hack it, own it.**

They're working on an open-source aquaponics automation system, but really they're working on sharing knowledge and ideas by building things for local communities.

**Your help wanted!**

Ended with a fantastic poem, a javascript re-imagining of the heart sutra: [http://l0l.org.uk/2014/11/squatconf-presentation/](http://l0l.org.uk/2014/11/squatconf-presentation/)

## [@harryhalpin](https://twitter.com/harryhalpin) - W3C web crypto standard.

The first time I've seen a talk from by active W3C participant about a current spec, plus Harry is super animated and interested in the subject. A+ would listen again.

The first rule of crypto is: **don't roll your own.**

> "We know there is good crypto somewhere in your OS, we just want to expose it."

Take home: **GET INVOLVED WITH WEB STANDARDS.**

> "There's probably orgs out there that'd like to subvert the crypto api, so we're calling for open review. Read the code!"

http://www.w3.org/TR/WebCryptoAPI/

As Substack pointed out earlier:_"the best docs for `window.crypto` are the [IE 11 docs](http://msdn.microsoft.com/en-gb/library/ie/dn302321%28v=vs.85%29.aspx). I shit you not"_

And finally, W3C needs your input, energy and ideas.

> W3C is like the katechon, the binding force that prevents the coming of the apocalypse.

<blockquote class="twitter-tweet" lang="en"><p>I don&#39;t always tweet. <a href="https://twitter.com/hashtag/squatconf?src=hash">#squatconf</a> <a href="http://t.co/J4vfqumtan">pic.twitter.com/J4vfqumtan</a></p>&mdash; Stefan van Hooft (@hooftio) <a href="https://twitter.com/hooftio/status/533649817671852032">November 15, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## [LEAP](https://leap.se/en) - encrypted comms for mortals

Crypto should be simple to provide and easy to use. Running your own email server is typically a nightmare. We don't have any excuse for still having unencrypted communications. LEAP is a non-profit, building tools make encryption more approachable. [https://leap.se/en/docs/tech/infosec](https://leap.se/en/docs/tech/infosec)

Some open projects they're working on:

- [`soledad`](https://github.com/leapcode/soledad) wins best acronym award: **Synchronization Of Locally Encrypted Data Among Devices**
- [`nickname`](https://leap.se/en/docs/design/nicknym#Introduction) - hide complexity of keyserver.
- [`bitmask`](https://github.com/leapcode/bitmask_client) - encryption for mortals


## [@dominictarr](https://twitter.com/dominictarr) - Viva la crypto

Building secure, de-centralised platforms is the easy part...

We don't get people using de-centralised systems by winning them over with ideology, we have to build things people want to use that happen to be de-centralised.

> "From a user perspective goog / face are already socially decentralised. Let's map the software on to that."

Bitcoin & BitTorrent demonstrate two fundamental distributed data-structures:

```
  BitTorrent <-----------> Bitcoin
                   ^
       Giant       |       Global
     hashmap       |       linked-list
                *ideas*
```

> "bt and btc are opposite ends of a spectrum and there is a lot of room in the middle for other designs."

Both systems are stuck at the worst (zero trust) scenario. Trust is efficient and trust networks are apparent in all human activities.

> "so how do I get the other computers not to lie to me? How do you get distibuters to trust each other."

[`secure-scuttlebutt`](https://github.com/dominictarr/secure-scuttlebutt) let's us build a scaleable trust network.

---

<blockquote class="twitter-tweet" lang="en"><p>RT <a href="https://twitter.com/timaschew">@timaschew</a>: Hacking <a href="https://twitter.com/Le_Loop">@Le_Loop</a> with <a href="https://twitter.com/substack">@substack</a> <a href="https://twitter.com/elfpavlik">@elfpavlik</a> <a href="http://t.co/jWqOCyMEmj">pic.twitter.com/jWqOCyMEmj</a> <a href="https://twitter.com/hashtag/squatconf?src=hash">#squatconf</a></p>&mdash; ☮ elf Pavlik ☮ (@elfpavlik) <a href="https://twitter.com/elfpavlik/status/534191714165346305">November 17, 2014</a></blockquote>

## Caveats

That's what I recall...

**Concepts may have been corrupted, talk titles transposed, and arguments augmented.**

The talk proposals are over here:
https://github.com/squatconf/talks/tree/master/confirmed

Raw, unprocessed notes from the event here:
https://gist.github.com/olizilla/988314a414203803419e

**All innacuracies are, most likely, honest errors, and should be blamed on the [author](https://twitter.com/olizilla). All disagreements are the HEADs of other truthy trees, and should be explored.**
