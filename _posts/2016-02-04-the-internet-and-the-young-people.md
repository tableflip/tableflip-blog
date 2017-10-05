---
title: "The Internet and The Young People"
permalink: "/the-internet-and-the-young-people"
date: 2016-02-04 17:06:25 +0000
author: "bmordan"
---

Protecting young people from inappropriate content and activity on-line is no easy task. Most schools offer a filtered internet, preventing particular classifications of site from being accessed. Many parents also have this kind of filtering on computers at home, or as part of their internet service. But this still doesn't give you any information about what they can access.

> Many parents I have spoken to are anxious about what their children are accessing online.

I found a simple solution which uses a free service and is easy to setup.

OpenDNS is an online service that can help you monitor your household's online activity. This way you can be aware of your children's online activity. This knowledge can help you skilfully tackle the subject of e-safety with your children, having gained a more accurate picture of their actual online habits.

DNS stands for domain name service. You can see below IP addresses made of numbers. They are the way computers see and think about websites. We have readable names like *facebook.com* or *google.co.uk*. DNS is like a big address book that computers use to look up the number ip address of say *google.co.uk*.

OpenDNS is a DNS service with a difference. Any device connecting to the internet through your router will have all it's requests for websites logged. You can then view these logs online. With the free tier you get two weeks of internet surfing history. You can pay to extend that period.

#### Step 1
Create a Free [openDNS](https://www.opendns.com/home-internet-security/) classic account.

#### Step 2
Now you need to get a bit bold and access your home router. This will be different for everyone depending on your router. [Detailed instructions](https://support.opendns.com/forums/21618374) are avaiable on the openDNS site. The basic flow is this:

1. connect to your wifi
2. visit __192.168.1.1__ or __192.168.0.1__ something like that. It is the IP address of your home router. Look on the back of the router for clues.
3. Enter you user name and password if you haven't changed it try 'admin' and 'password' or google <router model> default settings. Change these settings from the default!
3. Change your DNS settings to
  - primary:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__208.67.222.222__
  - secondary:&nbsp;__208.67.220.220__

Now restart your router.

#### Step 3

Log onto your openDNS account go to your dashboard and click on the settings tab. Here you add your home network.

Next goto Stats and tick the enable stats box.

#### Step 4

You are set up. Leave for an hour or two then your'll start to see data coming in.

### Making Sense of the Data

The best place to start is in stats -> domains
Here is a list of all the sites accessed by all the devices on your network.

Beware that devices access sites without your knowledge. For example your phone might use internet services so you get addresses like:

`www.googleapis.com` - from my Android phone

`time-ios.apple.com` - from my wife's iPhone

You can learn to read these and they will help to give you a sense of what devices are active in the house. You'll recognise lots of the addresses, they will have key words in them like `facebook`, `netflix` or `amazon`. You are looking for the ones that you don't recognise. Then google them - find out what service or site that request is for.

## Conclusion

This method is free. It is not too fiddly to set up and you can see the data online. I would have a go at setting this up if you want to have some answer to what children in your household are accessing.

Remember with great power comes great responsibility. It will be best if your children don not know you are using openDNS. You want to capture their natural online behaviour so you can parent them skilfully, and help them to grow up with a health online life.
