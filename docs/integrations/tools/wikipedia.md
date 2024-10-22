---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/wikipedia.ipynb
---
# 维基百科

>[维基百科](https://wikipedia.org/) 是一个由志愿者社区（称为维基人）编写和维护的多语言免费在线百科全书，通过开放协作和使用名为MediaWiki的基于维基的编辑系统。`维基百科` 是历史上最大和阅读量最多的参考书籍。

首先，您需要安装 `wikipedia` python 包。


```python
%pip install --upgrade --quiet  wikipedia
```


```python
<!--IMPORTS:[{"imported": "WikipediaQueryRun", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.wikipedia.tool.WikipediaQueryRun.html", "title": "Wikipedia"}, {"imported": "WikipediaAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikipedia.WikipediaAPIWrapper.html", "title": "Wikipedia"}]-->
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```


```python
wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
```


```python
wikipedia.run("HUNTER X HUNTER")
```



```output
'Page: Hunter × Hunter\nSummary: Hunter × Hunter (stylized as HUNTER×HUNTER and pronounced "hunter hunter") is a Japanese manga series written and illustrated by Yoshihiro Togashi. It has been serialized in Shueisha\'s shōnen manga magazine Weekly Shōnen Jump since March 1998, although the manga has frequently gone on extended hiatuses since 2006. Its chapters have been collected in 37 tankōbon volumes as of November 2022. The story focuses on a young boy named Gon Freecss who discovers that his father, who left him at a young age, is actually a world-renowned Hunter, a licensed professional who specializes in fantastical pursuits such as locating rare or unidentified animal species, treasure hunting, surveying unexplored enclaves, or hunting down lawless individuals. Gon departs on a journey to become a Hunter and eventually find his father. Along the way, Gon meets various other Hunters and encounters the paranormal.\nHunter × Hunter was adapted into a 62-episode anime television series produced by Nippon Animation and directed by Kazuhiro Furuhashi, which ran on Fuji Television from October 1999 to March 2001. Three separate original video animations (OVAs) totaling 30 episodes were subsequently produced by Nippon Animation and released in Japan from 2002 to 2004. A second anime television series by Madhouse aired on Nippon Television from October 2011 to September 2014, totaling 148 episodes, with two animated theatrical films released in 2013. There are also numerous audio albums, video games, musicals, and other media based on Hunter × Hunter.\nThe manga has been translated into English and released in North America by Viz Media since April 2005. Both television series have been also licensed by Viz Media, with the first series having aired on the Funimation Channel in 2009 and the second series broadcast on Adult Swim\'s Toonami programming block from April 2016 to June 2019.\nHunter × Hunter has been a huge critical and financial success and has become one of the best-selling manga series of all time, having over 84 million copies in circulation by July 2022.\n\nPage: Hunter × Hunter (2011 TV series)\nSummary: Hunter × Hunter is an anime television series that aired from 2011 to 2014 based on Yoshihiro Togashi\'s manga series Hunter × Hunter. The story begins with a young boy named Gon Freecss, who one day discovers that the father who he thought was dead, is in fact alive and well. He learns that his father, Ging, is a legendary "Hunter", an individual who has proven themselves an elite member of humanity. Despite the fact that Ging left his son with his relatives in order to pursue his own dreams, Gon becomes determined to follow in his father\'s footsteps, pass the rigorous "Hunter Examination", and eventually find his father to become a Hunter in his own right.\nThis new Hunter × Hunter anime was announced on July 24, 2011. It is a complete reboot starting from the beginning of the original manga, with no connection to the first anime television series from 1999. Produced by Nippon TV, VAP, Shueisha and Madhouse, the series is directed by Hiroshi Kōjina, with Atsushi Maekawa and Tsutomu Kamishiro handling series composition, Takahiro Yoshimatsu designing the characters and Yoshihisa Hirano composing the music. Instead of having the old cast reprise their roles for the new adaptation, the series features an entirely new cast to voice the characters. The new series premiered airing weekly on Nippon TV and the nationwide Nippon News Network from October 2, 2011.  The series started to be collected in both DVD and Blu-ray format on January 25, 2012. Viz Media has licensed the anime for a DVD/Blu-ray release in North America with an English dub. On television, the series began airing on Adult Swim\'s Toonami programming block on April 17, 2016, and ended on June 23, 2019.The anime series\' opening theme is alternated between the song "Departure!" and an alternate version titled "Departure! -Second Version-" both sung by Galneryus\' voc'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
