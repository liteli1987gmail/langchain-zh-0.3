---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/tavily.ipynb
sidebar_label: TavilySearchAPI
---
# TavilySearchAPIRetriever

>[Tavily的搜索API](https://tavily.com) 是一个专为AI代理（大型语言模型）构建的搜索引擎，能够快速提供实时、准确和事实性的结果。

我们可以将其用作一个 [检索器](/docs/how_to#retrievers)。它将展示与此集成相关的功能。完成后，探索 [相关用例页面](/docs/how_to#qa-with-rag) 可能会有帮助，以了解如何将此向量存储作为更大链的一部分使用。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="external_retrievers" item="TavilySearchAPIRetriever" />

## 设置

如果您希望从单个查询中获取自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

集成位于 `langchain-community` 包中。我们还需要安装 `tavily-python` 包本身。


```python
%pip install -qU langchain-community tavily-python
```

我们还需要设置我们的 Tavily API 密钥。


```python
import getpass
import os

os.environ["TAVILY_API_KEY"] = getpass.getpass()
```

## 实例化

现在我们可以实例化我们的检索器：


```python
<!--IMPORTS:[{"imported": "TavilySearchAPIRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.tavily_search_api.TavilySearchAPIRetriever.html", "title": "TavilySearchAPIRetriever"}]-->
from langchain_community.retrievers import TavilySearchAPIRetriever

retriever = TavilySearchAPIRetriever(k=3)
```

## 使用


```python
query = "what year was breath of the wild released?"

retriever.invoke(query)
```



```output
[Document(metadata={'title': 'The Legend of Zelda: Breath of the Wild - Nintendo Switch Wiki', 'source': 'https://nintendo-switch.fandom.com/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild', 'score': 0.9961155, 'images': []}, page_content='The Legend of Zelda: Breath of the Wild is an open world action-adventure game published by Nintendo for the Wii U and as a launch title for the Nintendo Switch, and was released worldwide on March 3, 2017. It is the nineteenth installment of the The Legend of Zelda series and the first to be developed with a HD resolution. The game features a gigantic open world, with the player being able to ...'),
 Document(metadata={'title': 'The Legend of Zelda: Breath of the Wild - Zelda Wiki', 'source': 'https://zelda.fandom.com/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild', 'score': 0.9804313, 'images': []}, page_content='[]\nReferences\nThe Legend of Zelda \xa0·\nThe Adventure of Link \xa0·\nA Link to the Past (& Four Swords) \xa0·\nLink\'s Awakening (DX; Nintendo Switch) \xa0·\nOcarina of Time (Master Quest; 3D) \xa0·\nMajora\'s Mask (3D) \xa0·\nOracle of Ages \xa0·\nOracle of Seasons \xa0·\nFour Swords (Anniversary Edition) \xa0·\nThe Wind Waker (HD) \xa0·\nFour Swords Adventures \xa0·\nThe Minish Cap \xa0·\nTwilight Princess (HD) \xa0·\nPhantom Hourglass \xa0·\nSpirit Tracks \xa0·\nSkyward Sword (HD) \xa0·\nA Link Between Worlds \xa0·\nTri Force Heroes \xa0·\nBreath of the Wild \xa0·\nTears of the Kingdom\nZelda (Game & Watch) \xa0·\nThe Legend of Zelda Game Watch \xa0·\nLink\'s Crossbow Training \xa0·\nMy Nintendo Picross: Twilight Princess \xa0·\nCadence of Hyrule \xa0·\nGame & Watch: The Legend of Zelda\nCD-i Games\n Listings[]\nCharacters[]\nBosses[]\nEnemies[]\nDungeons[]\nLocations[]\nItems[]\nTranslations[]\nCredits[]\nReception[]\nSales[]\nEiji Aonuma and Hidemaro Fujibayashi accepting the "Game of the Year" award for Breath of the Wild at The Game Awards 2017\nBreath of the Wild was estimated to have sold approximately 1.3 million copies in its first three weeks and around 89% of Switch owners were estimated to have also purchased the game.[52] Sales of the game have remained strong and as of June 30, 2022, the Switch version has sold 27.14 million copies worldwide while the Wii U version has sold 1.69 million copies worldwide as of December 31, 2019,[53][54] giving Breath of the Wild a cumulative total of 28.83 million copies sold.\n It also earned a Metacritic score of 97 from more than 100 critics, placing it among the highest-rated games of all time.[59][60] Notably, the game received the most perfect review scores for any game listed on Metacritic up to that point.[61]\nIn 2022, Breath of the Wild was chosen as the best Legend of Zelda game of all time in their "Top 10 Best Zelda Games" list countdown; but was then placed as the "second" best Zelda game in their new revamped version of their "Top 10 Best Zelda Games" list in 2023, right behind it\'s successor Tears of Video Game Canon ranks Breath of the Wild as one of the best video games of all time.[74] Metacritic ranked Breath of the Wild as the single best game of the 2010s.[75]\nFan Reception[]\nWatchMojo placed Breath of the Wild at the #2 spot in their "Top 10 Legend of Zelda Games of All Time" list countdown, right behind Ocarina of Time.[76] The Faces of Evil \xa0·\nThe Wand of Gamelon \xa0·\nZelda\'s Adventure\nHyrule Warriors Series\nHyrule Warriors (Legends; Definitive Edition) \xa0·\nHyrule Warriors: Age of Calamity\nSatellaview Games\nBS The Legend of Zelda \xa0·\nAncient Stone Tablets\nTingle Series\nFreshly-Picked Tingle\'s Rosy Rupeeland \xa0·\nTingle\'s Balloon Fight DS \xa0·\n'),
 Document(metadata={'title': 'The Legend of Zelda: Breath of the Wild - Zelda Wiki', 'source': 'https://zeldawiki.wiki/wiki/The_Legend_of_Zelda:_Breath_of_the_Wild', 'score': 0.9627432, 'images': []}, page_content='The Legend of Zelda\xa0•\nThe Adventure of Link\xa0•\nA Link to the Past (& Four Swords)\xa0•\nLink\'s Awakening (DX; Nintendo Switch)\xa0•\nOcarina of Time (Master Quest; 3D)\xa0•\nMajora\'s Mask (3D)\xa0•\nOracle of Ages\xa0•\nOracle of Seasons\xa0•\nFour Swords (Anniversary Edition)\xa0•\nThe Wind Waker (HD)\xa0•\nFour Swords Adventures\xa0•\nThe Minish Cap\xa0•\nTwilight Princess (HD)\xa0•\nPhantom Hourglass\xa0•\nSpirit Tracks\xa0•\nSkyward Sword (HD)\xa0•\nA Link Between Worlds\xa0•\nTri Force Heroes\xa0•\nBreath of the Wild\xa0•\nTears of the Kingdom\nZelda (Game & Watch)\xa0•\nThe Legend of Zelda Game Watch\xa0•\nHeroes of Hyrule\xa0•\nLink\'s Crossbow Training\xa0•\nMy Nintendo Picross: Twilight Princess\xa0•\nCadence of Hyrule\xa0•\nVermin\nThe Faces of Evil\xa0•\nThe Wand of Gamelon\xa0•\nZelda\'s Adventure\nHyrule Warriors (Legends; Definitive Edition)\xa0•\nHyrule Warriors: Age of Calamity\nBS The Legend of Zelda\xa0•\nAncient Stone Tablets\nFreshly-Picked Tingle\'s Rosy Rupeeland\xa0•\nTingle\'s Balloon Fight DS\xa0•\nToo Much Tingle Pack\xa0•\nRipened Tingle\'s Balloon Trip of Love\nSoulcalibur II\xa0•\nWarioWare Series\xa0•\nCaptain Rainbow\xa0•\nNintendo Land\xa0•\nScribblenauts Unlimited\xa0•\nMario Kart 8\xa0•\nSplatoon 3\nSuper Smash Bros (Series)\nSuper Smash Bros.\xa0•\nSuper Smash Bros. Melee\xa0•\nSuper Smash Bros. Brawl\xa0•\nSuper Smash Bros. for Nintendo 3DS / Wii U\xa0•\n It also earned a Metacritic score of 97 from more than 100 critics, placing it among the highest-rated games of all time.[60][61] Notably, the game received the most perfect review scores for any game listed on Metacritic up to that point.[62]\nAwards\nThroughout 2016, Breath of the Wild won several awards as a highly anticipated game, including IGN\'s and Destructoid\'s Best of E3,[63][64] at the Game Critic Awards 2016,[65] and at The Game Awards 2016.[66] Following its release, Breath of the Wild received the title of "Game of the Year" from the Japan Game Awards 2017,[67] the Golden Joystick Awards 2017,<ref"Our final award is for the Ultimate Game of the Year. Official website(s)\nOfficial website(s)\nCanonicity\nCanonicity\nCanon[citation needed]\nPredecessor\nPredecessor\nTri Force Heroes\nSuccessor\nSuccessor\nTears of the Kingdom\nThe Legend of Zelda: Breath of the Wild guide at StrategyWiki\nBreath of the Wild Guide at Zelda Universe\nThe Legend of Zelda: Breath of the Wild is the nineteenth main installment of The Legend of Zelda series. Listings\nCharacters\nBosses\nEnemies\nDungeons\nLocations\nItems\nTranslations\nCredits\nReception\nSales\nBreath of the Wild was estimated to have sold approximately 1.3 million copies in its first three weeks and around 89% of Switch owners were estimated to have also purchased the game.[53] Sales of the game have remained strong and as of September 30, 2023, the Switch version has sold 31.15 million copies worldwide while the Wii U version has sold 1.7 million copies worldwide as of December 31, 2021,[54][55] giving Breath of the Wild a cumulative total of 32.85 million copies sold.\n The Legend of Zelda: Breath of the Wild\nThe Legend of Zelda: Breath of the Wild\nThe Legend of Zelda: Breath of the Wild\nDeveloper(s)\nDeveloper(s)\nPublisher(s)\nPublisher(s)\nNintendo\nDesigner(s)\nDesigner(s)\n')]
```


## 在链中使用

我们可以轻松地将这个检索器组合到一个链中。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "TavilySearchAPIRetriever"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "TavilySearchAPIRetriever"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "TavilySearchAPIRetriever"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "TavilySearchAPIRetriever"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

llm = ChatOpenAI(model="gpt-4o-mini")


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```


```python
chain.invoke("how many units did bretch of the wild sell in 2020")
```



```output
'As of August 2020, The Legend of Zelda: Breath of the Wild had sold over 20.1 million copies worldwide on Nintendo Switch and Wii U.'
```


## API 参考

有关所有 `TavilySearchAPIRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.tavily_search_api.TavilySearchAPIRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
