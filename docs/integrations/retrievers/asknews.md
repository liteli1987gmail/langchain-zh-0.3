---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/asknews.ipynb
---
# AskNews

> [AskNews](https://asknews.app) 通过单一自然语言查询为任何大型语言模型注入最新的全球新闻（或历史新闻）。具体来说，AskNews 每天丰富超过 30 万篇文章，通过翻译、总结、提取实体并将其索引到热向量和冷向量数据库中。AskNews 将这些向量数据库放在低延迟的端点上供您使用。当您查询 AskNews 时，您将获得一个经过提示优化的字符串，其中包含所有最相关的丰富信息（例如实体、分类、翻译、总结）。这意味着您不需要管理自己的新闻 RAG，也不需要担心如何以简洁的方式将新闻信息传达给您的大型语言模型。
> AskNews 还致力于透明性，这就是为什么我们的报道在数百个国家、13种语言和 5 万个来源之间进行监控和多样化。如果您想跟踪我们的来源覆盖情况，可以访问我们的 [透明度仪表板](https://asknews.app/en/transparency)。

## 设置

集成位于 `langchain-community` 包中。我们还需要安装 `asknews` 包本身。

```bash
pip install -U langchain-community asknews
```

我们还需要设置我们的 AskNews API 凭据，可以在 [AskNews 控制台](https://my.asknews.app) 生成。


```python
import getpass
import os

os.environ["ASKNEWS_CLIENT_ID"] = getpass.getpass()
os.environ["ASKNEWS_CLIENT_SECRET"] = getpass.getpass()
```

设置 [LangSmith](https://smith.langchain.com/) 以获得最佳的可观察性也是有帮助的（但不是必需的）。


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 用法


```python
<!--IMPORTS:[{"imported": "AskNewsRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.asknews.AskNewsRetriever.html", "title": "AskNews"}]-->
from langchain_community.retrievers import AskNewsRetriever

retriever = AskNewsRetriever(k=3)

retriever.invoke("impact of fed policy on the tech sector")
```



```output
[Document(page_content='[1]:\ntitle: US Stock Market Declines Amid High Interest Rates\nsummary: The US stock market has experienced a significant decline in recent days, with the S&P 500 index falling 9.94 points or 0.2% to 4320.06. The decline was attributed to interest rates, which are expected to remain high for a longer period. The yield on 10-year Treasury notes rose to 4.44%, the highest level since 2007, which has a negative impact on stock prices. The high interest rates have also affected the technology sector, with companies such as Intel and Microsoft experiencing declines. The auto sector is also experiencing fluctuations, with General Motors and Ford experiencing declines. The labor market is also facing challenges, with workers demanding higher wages and benefits, which could lead to increased inflation. The Federal Reserve is expected to keep interest rates high for a longer period, which could have a negative impact on the stock market. Some economists expect the Fed to raise interest rates again this year, which could lead to further declines in the stock market.\nsource: ALYAUM Holding Group for Press\npublished: May 12 2024 13:12\nLocation: US\nTechnology: S&P 500\nQuantity: 9.94 points\nNumber: 4320.06\nProduct: 10-year Treasury notes\nDate: 2007, this year\nOrganization: General Motors, Fed, Intel, Ford, Microsoft, Federal Reserve\nclassification: Finance\nsentiment: -1', metadata={'title': 'الأسهم الأمريكية تتطلع لتعويض خسائرها بعد موجة تراجع كبيرة', 'source': 'https://www.alyaum.com/articles/6529353/%D8%A7%D9%84%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF/%D8%A3%D8%B3%D9%88%D8%A7%D9%82-%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85/%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85-%D8%A7%D9%84%D8%A3%D9%85%D8%B1%D9%8A%D9%83%D9%8A%D8%A9-%D8%AA%D8%AA%D8%B7%D9%84%D8%B9-%D9%84%D8%AA%D8%B9%D9%88%D9%8A%D8%B6-%D8%AE%D8%B3%D8%A7%D8%A6%D8%B1%D9%87%D8%A7-%D8%A8%D8%B9%D8%AF-%D9%85%D9%88%D8%AC%D8%A9-%D8%AA%D8%B1%D8%A7%D8%AC%D8%B9-%D9%83%D8%A8%D9%8A%D8%B1%D8%A9', 'images': 'https://www.alyaum.com/uploads/images/2024/05/12/2312237.jpg'}),
 Document(page_content="[2]:\ntitle: US Federal Reserve's Decision to Limit Stock Market Correction\nsummary: The Federal Reserve of the United States, led by Jerome Powell, has achieved its goal of limiting the correction of the stock market by reducing the balance of the central bank and maintaining massive liquidity injections into the markets to combat various crises that have occurred since the pandemic. Despite April's contraction of around 5%, the stock market has behaved well this week, with most indices showing increases. The Dow Jones and S&P 500 have risen almost 2% after declines of around 5% in April, while the Nasdaq has increased by 1.4% after a decline of over 4% in April. The correction is taking place in an orderly manner, and the market is trying to find a new equilibrium in asset valuations, adapted to a normalized cost of money and a moderate but positive growth framework.\nsource: okdiario.com\npublished: May 12 2024 04:45\nOrganization: Federal Reserve of the United States, Dow Jones, S&P 500, Nasdaq\nPerson: Jerome Powell\nEvent: pandemic\nDate: April\nclassification: Business\nsentiment: 1", metadata={'title': 'Las Bolsas afrontan una corrección ordenada apoyas por la Fed de EEUU', 'source': 'https://okdiario.com/economia/reserva-federal-mantiene-liquidez-asegura-correccion-limitada-bolsas-12798172', 'images': 'https://okdiario.com/img/2023/08/25/bild-powell-subida-de-tipos-interior.jpg'}),
 Document(page_content="[3]:\ntitle: How the Fed's quest for transparency made markets more volatile\nsummary: The Federal Reserve's increased transparency and communication with the public may be contributing to market volatility, according to some experts. The Fed's forecasting strategy and frequent communication may be causing \nsource: NBC4 Washington\npublished: May 11 2024 12:00\nOrganization: Fed, Federal Reserve\nclassification: Business\nsentiment: 0", metadata={'title': "How the Fed's quest for transparency made markets more volatile", 'source': 'https://www.nbcwashington.com/news/business/money-report/how-the-feds-quest-for-transparency-made-markets-more-volatile/3613897', 'images': 'https://media.nbcwashington.com/2024/05/107409380-1714652843711-gettyimages-2151006318-_s2_5018_hwe7dfbl.jpeg?quality=85&strip=all&resize=1200%2C675'})]
```



```python
# you have full control on filtering by category, time, pagination, and even the search method you use.
from datetime import datetime, timedelta

start = (datetime.now() - timedelta(days=7)).timestamp()
end = datetime.now().timestamp()

retriever = AskNewsRetriever(
    k=3,
    categories=["Business", "Technology"],
    start_timestamp=int(start),  # defaults to 48 hours ago
    end_timestamp=int(end),  # defaults to now
    method="kw",  # defaults to "nl", natural language, can also be "kw" for keyword search
    offset=10,  # allows you to paginate results
)

retriever.invoke("federal reserve S&P500")
```



```output
[Document(page_content="[1]:\ntitle: US Stocks End Week with Modest Gains Ahead of Inflation Data\nsummary: US stocks ended the week with modest gains, marking another weekly advance for the three main indices, as investors evaluated comments from Federal Reserve officials and awaited crucial inflation data next week. The S&P 500 and Dow Jones experienced slight increases, while the Nasdaq closed almost unchanged. The Dow Jones recorded its largest weekly percentage gain since mid-December. Federal Reserve officials' comments generated expectations, with market participants awaiting inflation data to be released next week. The data includes the Consumer Price Index (CPI) and Producer Price Index (PPI) from the Department of Labor, which is expected to provide insight into progress towards the 2% inflation target.\nsource: El Cronista\npublished: May 10 2024 23:35\nLocation: US\nOrganization: Dow Jones, Department of Labor, Nasdaq, Federal Reserve\nDate: next week, mid-December\nclassification: Business\nsentiment: 0", metadata={'title': 'Modesta suba en los mercados a la espera de los datos de inflación', 'source': 'http://www.cronista.com/usa/wall-street-dolar/modesta-suba-en-los-mercados-a-la-espera-de-los-datos-de-inflacion', 'images': 'https://www.cronista.com/files/image/141/141554/5ff7985549d06_600_315!.jpg?s=99126c63cc44ed5c15ed2177cb022f55&d=1712540173'}),
 Document(page_content="[2]:\ntitle: US Stocks End Week on a High Note\nsummary: The US stock market ended the week on a positive note, with the Dow Jones Industrial Average closing 0.32% higher at 39,512.84, the S&P 500 rising 0.16% to 5,222.68, and the Nasdaq 100 gaining 0.26% to 18,161.18. The three indices all recorded gains for the week, with the Dow leading the way with a 2.2% increase. The Federal Reserve's stance on interest rates was a key factor, with several Fed members expressing caution about cutting rates in the near future. The University of Michigan's consumer sentiment survey showed a decline in May, and consumer inflation expectations also increased, which tempered expectations for rate cuts. Despite this, the market remained resilient and ended the week on a strong note.\nsource: Investing.com\npublished: May 10 2024 20:19\nLocation: US\nQuantity: 39,512.84\nOrganization: University of Michigan, Fed, Federal Reserve\nDate: May\nclassification: Business\nsentiment: 1", metadata={'title': 'Aktien New York Schluss: Erneut höher zum Ende einer starken Börsenwoche', 'source': 'https://de.investing.com/news/economy/aktien-new-york-schluss-erneut-hoher-zum-ende-einer-starken-borsenwoche-2618612', 'images': 'https://i-invdn-com.investing.com/news/LYNXMPED2T082_L.jpg'}),
 Document(page_content="[3]:\ntitle: US Stocks End Week with Slight Gain Despite Inflation Concerns\nsummary: The US stock market ended the week with a slight gain, despite inflation expectations and skepticism from Federal Reserve members about potential interest rate cuts. The Dow Jones Industrial Average rose 0.24% to 39,480.38, while the S&P 500 gained 0.07% to 5,217.67. The Nasdaq 100 also rose 0.15% to 18,140.02. The week's performance was driven by a number of factors, including the release of inflation expectations and the comments of Federal Reserve members. The University of Michigan's consumer sentiment survey also showed a decline in May, with consumer inflation expectations rising. The stock of 3M, the best-performing Dow stock, rose 2% after analysts at HSBC upgraded it to \nsource: Yahoo\npublished: May 10 2024 18:11\nLocation: US\nOrganization: University of Michigan, 3M, HSBC, Federal Reserve\nQuantity: 39,480.38, 5,217.67\nDate: May\nclassification: Business\nsentiment: 0", metadata={'title': 'Aktien New York: Knapp im Plus gegen Ende einer starken Börsenwoche', 'source': 'https://de.finance.yahoo.com/nachrichten/aktien-new-york-knapp-plus-181143398.html', 'images': 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png'})]
```


## 链接

我们可以轻松地将这个检索器组合成一个链。


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "AskNews"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "AskNews"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "AskNews"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "AskNews"}]-->
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    """The following news articles may come in handy for answering the question:

{context}

Question:

{question}"""
)
chain = (
    RunnablePassthrough.assign(context=(lambda x: x["question"]) | retriever)
    | prompt
    | ChatOpenAI(model="gpt-4-1106-preview")
    | StrOutputParser()
)
```


```python
chain.invoke({"question": "What is the impact of fed policy on the tech sector?"})
```



```output
"According to the information provided in the second news article, the impact of Federal Reserve policy on the technology sector has been negative. The article mentions that due to expectations that interest rates will remain high for a longer period, the US stock market has experienced a significant decline. This rise in interest rates has particularly affected the technology sector, with companies such as Intel and Microsoft experiencing declines. High interest rates can lead to increased borrowing costs for businesses, which can dampen investment and spending. In the technology sector, where companies often rely on borrowing to fund research and development and other growth initiatives, higher rates can be especially challenging.\n\nTherefore, the Federal Reserve's policy of maintaining high interest rates has had a detrimental effect on tech stocks, contributing to a decrease in their market valuations."
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
