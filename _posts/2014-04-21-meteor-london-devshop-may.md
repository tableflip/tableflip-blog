---
title: "Meteor London Devshop - May"
permalink: "/meteor-london-devshop-may"
date: 2014-05-21 09:09:48 +0000
author: "olizilla"
---
Meteor London pushes the limits of the possible by demonstrating how to build a selfie sharing service (think Snapchat) in 2 hours. 59 young entrepreneur developers recently packed out the [uSwitch](http://www.uswitch.com/) office to discover how blazingly fast and simple it is to get an app built using Meteor.

![](https://ucarecdn.com/a02f6d12-cf6c-4e19-97b6-60f79cd7a0e1/highres_365501132.jpg)

We ([Oli Evans](http://twitter.com/olizilla) and [Alan Shaw](http://twitter.com/_alanshaw)) took to the stage to power pair program the application from scratch, with help, advice and heckles from the audience.

The app is called "snapcat" and was built in four 25 minute sessions.

The first session was designed primarily to show beginners how to get started building an app with Meteor and how to deploy it to Meteor servers. With that being such a massive piece of cake, we had plenty of time to sneak in some simple code to grab hold of the webcam (using WebRTC getUserMedia instead of Flash), snap a picture and draw it to a HTML5 canvas. Hidden amongst the excitement for canvas and video, it made for a great introduction to Meteor templates, template events and handlebars style syntax.

![](https://ucarecdn.com/1aca1f8d-489b-43f4-afbf-8970ca70bb98/highres_365501082.jpg)

Like true mavericks of the internet, we decided that the quickest and easiest way to store selfie pics was in the database. The audience were informed under no uncertain terms that this is not the best dumping ground for image data. We were forgiven for our untoward choices and the second session continued as follows:

Image data was gleaned from the canvas using it's toDataURL method and shoved in a Meteor collection for syndication up to the server. A input field for adding an email address was added so that the selfie snaps could be sent to people. We demonstrated how to remove the "autopublish" and "insecure" packages and explained the consequences of that change by running the app and seeing a once promiscuous and care free app become a locked down and battle hardened turtle. To rectify the situation we explained and added pub/sub calls to access our data and access control rules to allow/deny changes.

The third session was spent mostly on the refactor tractor. The app required routes so that users could view a list of snaps they had received and view a single snap for a certain amount of time (as per Snapchat). We discussed "atmosphere" - the package repository for Meteor packages, and "meteorite" - the tool to install said packages, and proceeded to install "iron-router" - a package to help do URL routing in Meteor.

The fourth session involved fleshing out the code for the routes. `/view/[email]` shows a list of new snaps and `/snap/[id]` displays a single snap. The final step for the evening was to add the Meteor "accounts" package - a drop in user login, registration and forgot password package allowing the application to restrict access to snaps appropriately.

The evening was a great success and the audience was patient and understanding given the ad-lib nature of the event. Many [great comments](http://www.meetup.com/Meteor-London/events/181765882/#event-comments-section) were received and much rejoice was expressed.

All code is available in a [public repo](https://github.com/tableflip/snapcat) for your viewing pleasure and videos from the sessions are available as well:

Session 1: [http://youtu.be/SXZDxKIA-m0](http://youtu.be/SXZDxKIA-m0)
Session 2: [http://youtu.be/oHXHBzsVIKw](http://youtu.be/oHXHBzsVIKw)
Session 3: [http://youtu.be/tgJ6xCtcEJc](http://youtu.be/tgJ6xCtcEJc)
Session 4: [http://youtu.be/QGA3nMGkxhU](http://youtu.be/QGA3nMGkxhU)
