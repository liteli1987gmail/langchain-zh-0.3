---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/ddg.ipynb
---
# DuckDuckGo 搜索

本指南展示了如何使用 DuckDuckGo 搜索组件。

## 使用方法


```python
%pip install -qU duckduckgo-search langchain-community
```


```python
<!--IMPORTS:[{"imported": "DuckDuckGoSearchRun", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.ddg_search.tool.DuckDuckGoSearchRun.html", "title": "DuckDuckGo Search"}]-->
from langchain_community.tools import DuckDuckGoSearchRun

search = DuckDuckGoSearchRun()

search.invoke("Obama's first name?")
```



```output
'When Ann Dunham and Barack Obama Sr. tied the knot, they kept the news to themselves. "Nobody was invited," Neil Abercrombie, a college friend of Obama Sr., told Time in 2008. The wedding came as ... As the head of the government of the United States, the president is arguably the most powerful government official in the world. The president is elected to a four-year term via an electoral college system. Since the Twenty-second Amendment was adopted in 1951, the American presidency has been Most common names of U.S. presidents 1789-2021. Published by. Aaron O\'Neill , Jul 4, 2024. The most common first name for a U.S. president is James, followed by John and then William. Six U.S ... Obama\'s personal charisma, stirring oratory, and his campaign promise to bring change to the established political system resonated with many Democrats, especially young and minority voters. On January 3, 2008, Obama won a surprise victory in the first major nominating contest, the Iowa caucus, over Sen. Hillary Clinton, who was the overwhelming favorite to win the nomination. Former President Barack Obama released a letter about President Biden\'s decision to drop out of the 2024 presidential race. Notably, Obama did not name or endorse Vice President Kamala Harris.'
```


要获取更多附加信息（例如链接、来源），请使用 `DuckDuckGoSearchResults()`


```python
<!--IMPORTS:[{"imported": "DuckDuckGoSearchResults", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.ddg_search.tool.DuckDuckGoSearchResults.html", "title": "DuckDuckGo Search"}]-->
from langchain_community.tools import DuckDuckGoSearchResults

search = DuckDuckGoSearchResults()

search.invoke("Obama")
```



```output
"[snippet: Why Obama Hasn't Endorsed Harris. The former president has positioned himself as an impartial elder statesman above intraparty machinations and was neutral during the 2020 Democratic primaries., title: Why Obama Hasn't Endorsed Harris - The New York Times, link: https://www.nytimes.com/2024/07/21/us/politics/why-obama-hasnt-endorsed-harris.html], [snippet: Former President Barack Obama released a letter about President Biden's decision to drop out of the 2024 presidential race. Notably, Obama did not name or endorse Vice President Kamala Harris., title: Read Obama's full statement on Biden dropping out - CBS News, link: https://www.cbsnews.com/news/barack-obama-biden-dropping-out-2024-presidential-race-full-statement/], [snippet: USA TODAY. 0:04. 0:48. Former President Barack Obama recently said, in private, that President Joe Biden's chances at a successful presidential run in 2024 have declined and that he needs to ..., title: Did Obama tell Biden to quit? What the former president said - USA TODAY, link: https://www.usatoday.com/story/news/politics/elections/2024/07/18/did-obama-tell-biden-to-quit-what-the-former-president-said/74458139007/], [snippet: Many of the marquee names in Democratic politics began quickly lining up behind Vice President Kamala Harris on Sunday, but one towering presence in the party held back: Barack Obama. The former president has not yet endorsed Harris; in fact, he did not mention her once in an affectionate — if tautly written — tribute to President Joe Biden that was posted on Medium shortly after Biden ..., title: Why Obama Hasn't Endorsed Harris - Yahoo News, link: https://news.yahoo.com/news/why-obama-hasn-t-endorsed-114259092.html]"
```


您也可以直接搜索新闻文章。使用关键字 `backend="news"`


```python
search = DuckDuckGoSearchResults(backend="news")

search.invoke("Obama")
```



```output
'[snippet: Users on X have been widely comparing the boost of support felt for Kamala Harris\' campaign to Barack Obama\'s in 2008., title: Surging Support For Kamala Harris Compared To Obama-Era Energy, link: https://www.msn.com/en-us/news/politics/surging-support-for-kamala-harris-compared-to-obama-era-energy/ar-BB1qzdC0, date: 2024-07-24T18:27:01+00:00, source: Newsweek on MSN.com], [snippet: Harris tried to emulate Obama\'s coalition in 2020 and failed. She may have a better shot at reaching young, Black, and Latino voters this time around., title: Harris May Follow Obama\'s Path to the White House After All, link: https://www.msn.com/en-us/news/politics/harris-may-follow-obama-s-path-to-the-white-house-after-all/ar-BB1qv9d4, date: 2024-07-23T22:42:00+00:00, source: Intelligencer on MSN.com], [snippet: The Republican presidential candidate said in an interview on Fox News that he "wouldn\'t be worried" about Michelle Obama running., title: Donald Trump Responds to Michelle Obama Threat, link: https://www.msn.com/en-us/news/politics/donald-trump-responds-to-michelle-obama-threat/ar-BB1qqtu5, date: 2024-07-22T18:26:00+00:00, source: Newsweek on MSN.com], [snippet: H eading into the weekend at his vacation home in Rehoboth Beach, Del., President Biden was reportedly stewing over Barack Obama\'s role in the orchestrated campaign to force him, title: Opinion | Barack Obama Strikes Again, link: https://www.msn.com/en-us/news/politics/opinion-barack-obama-strikes-again/ar-BB1qrfiy, date: 2024-07-22T21:28:00+00:00, source: The Wall Street Journal on MSN.com]'
```


您还可以直接将自定义的 `DuckDuckGoSearchAPIWrapper` 传递给 `DuckDuckGoSearchResults` 以提供对搜索结果的更多控制。


```python
<!--IMPORTS:[{"imported": "DuckDuckGoSearchAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.duckduckgo_search.DuckDuckGoSearchAPIWrapper.html", "title": "DuckDuckGo Search"}]-->
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

wrapper = DuckDuckGoSearchAPIWrapper(region="de-de", time="d", max_results=2)

search = DuckDuckGoSearchResults(api_wrapper=wrapper, source="news")

search.invoke("Obama")
```



```output
'[snippet: So war das zum Beispiel bei Barack Obama, als er sich für Joe Biden als Kandidat für die Vizepräsidentschaft entschied. USA-Expertin Rachel Tausendfreund erklärt, wie sich Kamala Harris als ..., title: Interview: „Kamala Harris sieht die Welt eher wie Barack Obama - nicht ..., link: https://www.handelsblatt.com/politik/interview-kamala-harris-sieht-die-welt-eher-wie-barack-obama-nicht-wie-joe-biden/100054923.html], [snippet: Disput um Klimapolitik Der seltsame Moment, als Kamala Harris sogar Obama vor Gericht zerrte. Teilen. 0. Chip Somodevilla/Getty Images US-Vizepräsidentin Kamala Harris (links) und Ex-Präsident ..., title: Der seltsame Moment, als Kamala Harris sogar Obama vor Gericht zerrte, link: https://www.focus.de/earth/analyse/disput-um-klimapolitik-der-seltsame-moment-als-kamala-harris-sogar-obama-vor-gericht-zerrte_id_260165157.html], [snippet: Kamala Harris «Auf den Spuren von Obama»: Harris\' erste Rede überzeugt Experten. Kamala Harris hat ihre erste Rede als Präsidentschaftskandidatin gehalten. Zwei Experten sind sich einig: Sie ..., title: Kamala Harris\' erste Wahlkampfrede überzeugt Experten, link: https://www.20min.ch/story/kamala-harris-auf-den-spuren-von-obama-harris-erste-rede-ueberzeugt-experten-103154550], [snippet: Harris hat ihre erste Rede als Präsidentschaftskandidatin gehalten. Experten sind sich einig: Sie hat das Potenzial, ein Feuer zu entfachen wie Obama., title: "Auf Spuren von Obama": Harris-Rede überzeugt Experten, link: https://www.heute.at/s/auf-spuren-von-obama-harris-rede-ueberzeugt-experten-120049557]'
```


## 相关

- [如何使用聊天模型调用工具](https://python.langchain.com/docs/how_to/tool_calling/)


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
