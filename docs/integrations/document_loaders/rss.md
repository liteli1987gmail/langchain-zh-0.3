---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/rss.ipynb
---
# RSS 源

这部分介绍如何将来自一系列 RSS 源 URL 的 HTML 新闻文章加载到我们可以在后续使用的文档格式中。


```python
%pip install --upgrade --quiet  feedparser newspaper3k listparser
```


```python
<!--IMPORTS:[{"imported": "RSSFeedLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.rss.RSSFeedLoader.html", "title": "RSS Feeds"}]-->
from langchain_community.document_loaders import RSSFeedLoader
```


```python
urls = ["https://news.ycombinator.com/rss"]
```

传入网址以将其加载到文档中


```python
loader = RSSFeedLoader(urls=urls)
data = loader.load()
print(len(data))
```


```python
print(data[0].page_content)
```
```output
(next Rich)

04 August 2023

Rich Hickey

It is with a mixture of heartache and optimism that I announce today my (long planned) retirement from commercial software development, and my employment at Nubank. It’s been thrilling to see Clojure and Datomic successfully applied at scale.

I look forward to continuing to lead ongoing work maintaining and enhancing Clojure with Alex, Stu, Fogus and many others, as an independent developer once again. We have many useful things planned for 1.12 and beyond. The community remains friendly, mature and productive, and is taking Clojure into many interesting new domains.

I want to highlight and thank Nubank for their ongoing sponsorship of Alex, Fogus and the core team, as well as the Clojure community at large.

Stu will continue to lead the development of Datomic at Nubank, where the Datomic team grows and thrives. I’m particularly excited to see where the new free availability of Datomic will lead.

My time with Cognitect remains the highlight of my career. I have learned from absolutely everyone on our team, and am forever grateful to all for our interactions. There are too many people to thank here, but I must extend my sincerest appreciation and love to Stu and Justin for (repeatedly) taking a risk on me and my ideas, and for being the best of partners and friends, at all times fully embodying the notion of integrity. And of course to Alex Miller - who possesses in abundance many skills I lack, and without whose indomitable spirit, positivity and friendship Clojure would not have become what it did.

I have made many friends through Clojure and Cognitect, and I hope to nurture those friendships moving forward.

Retirement returns me to the freedom and independence I had when originally developing Clojure. The journey continues!
```
您可以向 NewsURLLoader 传递参数，它将用于加载文章。


```python
loader = RSSFeedLoader(urls=urls, nlp=True)
data = loader.load()
print(len(data))
```
```output
Error fetching or processing https://twitter.com/andrewmccalip/status/1687405505604734978, exception: You must `parse()` an article first!
Error processing entry https://twitter.com/andrewmccalip/status/1687405505604734978, exception: list index out of range
``````output
13
```

```python
data[0].metadata["keywords"]
```



```output
['nubank',
 'alex',
 'stu',
 'taking',
 'team',
 'remains',
 'rich',
 'clojure',
 'thank',
 'planned',
 'datomic']
```



```python
data[0].metadata["summary"]
```



```output
'It’s been thrilling to see Clojure and Datomic successfully applied at scale.\nI look forward to continuing to lead ongoing work maintaining and enhancing Clojure with Alex, Stu, Fogus and many others, as an independent developer once again.\nThe community remains friendly, mature and productive, and is taking Clojure into many interesting new domains.\nI want to highlight and thank Nubank for their ongoing sponsorship of Alex, Fogus and the core team, as well as the Clojure community at large.\nStu will continue to lead the development of Datomic at Nubank, where the Datomic team grows and thrives.'
```


您还可以使用OPML文件，例如Feedly导出。传入URL或OPML内容。


```python
with open("example_data/sample_rss_feeds.opml", "r") as f:
    loader = RSSFeedLoader(opml=f.read())
data = loader.load()
print(len(data))
```
```output
Error fetching http://www.engadget.com/rss-full.xml, exception: Error fetching http://www.engadget.com/rss-full.xml, exception: document declared as us-ascii, but parsed as utf-8
``````output
20
```

```python
data[0].page_content
```



```output
'The electric vehicle startup Fisker made a splash in Huntington Beach last night, showing off a range of new EVs it plans to build alongside the Fisker Ocean, which is slowly beginning deliveries in Europe and the US. With shades of Lotus circa 2010, it seems there\'s something for most tastes, with a powerful four-door GT, a versatile pickup truck, and an affordable electric city car.\n\n"We want the world to know that we have big plans and intend to move into several different segments, redefining each with our unique blend of design, innovation, and sustainability," said CEO Henrik Fisker.\n\nStarting with the cheapest, the Fisker PEAR—a cutesy acronym for "Personal Electric Automotive Revolution"—is said to use 35 percent fewer parts than other small EVs. Although it\'s a smaller car, the PEAR seats six thanks to front and rear bench seats. Oh, and it has a frunk, which the company is calling the "froot," something that will satisfy some British English speakers like Ars\' friend and motoring journalist Jonny Smith.\n\nBut most exciting is the price—starting at $29,900 and scheduled for 2025. Fisker plans to contract with Foxconn to build the PEAR in Lordstown, Ohio, meaning it would be eligible for federal tax incentives.\n\nAdvertisement\n\nThe Fisker Alaska is the company\'s pickup truck, built on a modified version of the platform used by the Ocean. It has an extendable cargo bed, which can be as little as 4.5 feet (1,371 mm) or as much as 9.2 feet (2,804 mm) long. Fisker claims it will be both the lightest EV pickup on sale and the most sustainable pickup truck in the world. Range will be an estimated 230–240 miles (370–386 km).\n\nThis, too, is slated for 2025, and also at a relatively affordable price, starting at $45,400. Fisker hopes to build this car in North America as well, although it isn\'t saying where that might take place.\n\nFinally, there\'s the Ronin, a four-door GT that bears more than a passing resemblance to the Fisker Karma, Henrik Fisker\'s 2012 creation. There\'s no price for this one, but Fisker says its all-wheel drive powertrain will boast 1,000 hp (745 kW) and will hit 60 mph from a standing start in two seconds—just about as fast as modern tires will allow. Expect a massive battery in this one, as Fisker says it\'s targeting a 600-mile (956 km) range.\n\n"Innovation and sustainability, along with design, are our three brand values. By 2027, we intend to produce the world’s first climate-neutral vehicle, and as our customers reinvent their relationships with mobility, we want to be a leader in software-defined transportation," Fisker said.'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
