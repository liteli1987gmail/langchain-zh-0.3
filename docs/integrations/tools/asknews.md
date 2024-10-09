---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/asknews.ipynb
---
# AskNews

> [AskNews](https://asknews.app) 通过单一自然语言查询为任何大型语言模型注入最新的全球新闻（或历史新闻）。具体来说，AskNews 每天通过翻译、总结、提取实体并将其索引到热向量和冷向量数据库中，丰富超过 30 万篇文章。AskNews 将这些向量数据库放在低延迟的端点上供您使用。当您查询 AskNews 时，您将获得一个经过提示优化的字符串，其中包含所有最相关的丰富信息（例如实体、分类、翻译、总结）。这意味着您不需要管理自己的新闻 RAG，也不需要担心如何以简洁的方式将新闻信息传达给您的大型语言模型。
> AskNews 还致力于透明性，这就是为什么我们的报道覆盖范围在数百个国家、13种语言和 5 万个来源之间进行监控和多样化。如果您想跟踪我们的来源覆盖情况，可以访问我们的 [透明度仪表板](https://asknews.app/en/transparency)。

## 设置

集成位于 `langchain-community` 包中。我们还需要安装 `asknews` 包本身。

```bash
pip install -U langchain-community asknews
```

我们还需要设置我们的 AskNews API 凭据，可以在 [AskNews 控制台](https://my.asknews.app) 获取。


```python
import getpass
import os

os.environ["ASKNEWS_CLIENT_ID"] = getpass.getpass()
os.environ["ASKNEWS_CLIENT_SECRET"] = getpass.getpass()
```

## 使用

在这里我们展示如何单独使用该工具。


```python
<!--IMPORTS:[{"imported": "AskNewsSearch", "source": "langchain_community.tools.asknews", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.asknews.tool.AskNewsSearch.html", "title": "AskNews"}]-->
from langchain_community.tools.asknews import AskNewsSearch

tool = AskNewsSearch(max_results=2)
tool.invoke({"query": "Effect of fed policy on tech sector"})
```



```output
"\n<doc>\n[1]:\ntitle: Market Awaits Comments From Key Fed Official\nsummary: The market is awaiting comments from Fed Governor Christopher Waller, but it's not expected to move markets significantly. The recent Consumer Price Index (CPI) report showed slimming inflation figures, leading to a conclusion that inflation is being curbed. This has led to a 'soft landing' narrative, causing bullish sentiment in the stock market, with the Dow, S&P 500, Nasdaq, and Russell 2000 indices near all-time highs. NVIDIA is set to report earnings next week, and despite its 95% year-to-date growth, it remains a Zacks Rank #1 (Strong Buy) stock. The article also mentions upcoming economic data releases, including New and Existing Home Sales, S&P flash PMI Services and Manufacturing, Durable Goods, and Weekly Jobless Claims.\nsource: Yahoo\npublished: May 17 2024 14:53\nOrganization: Nasdaq, Fed, NVIDIA, Zacks\nPerson: Christopher Waller\nEvent: Weekly Jobless Claims\nclassification: Business\nsentiment: 0\n</doc>\n\n<doc>\n[2]:\ntitle: US futures flat as Fed comments cool rate cut optimism\nsummary: US stock index futures remained flat on Thursday evening, following a weak finish on Wall Street, as Federal Reserve officials warned that bets on interest rate cuts were potentially premature. The Fed officials, including Atlanta Fed President Raphael Bostic, New York Fed President John Williams, and Cleveland Fed President Loretta Mester, stated that the central bank still needed more confidence to cut interest rates, and that the timing of the move remained uncertain. As a result, investors slightly trimmed their expectations for a September rate cut, and the S&P 500 and Nasdaq 100 indexes fell 0.2% and 0.3%, respectively. Meanwhile, Reddit surged 11% after announcing a partnership with OpenAI, while Take-Two Interactive and DXC Technology fell after issuing disappointing earnings guidance.\nsource: Yahoo\npublished: May 16 2024 20:08\nLocation: US, Wall Street\nDate: September, Thursday\nOrganization: Atlanta Fed, Cleveland Fed, New York Fed, Fed, Reddit, Take-Two Interactive, DXC Technology, OpenAI, Federal Reserve\nTitle: President\nPerson: Loretta Mester, Raphael Bostic, John Williams\nclassification: Business\nsentiment: 0\n</doc>\n"
```


## 链接
我们在这里展示如何将其作为代理的一部分使用。我们使用 OpenAI 函数代理，因此我们需要设置和安装所需的依赖项。我们还将使用 [LangSmith Hub](https://smith.langchain.com/hub) 来提取提示，因此我们需要安装它。

```bash
pip install -U langchain-openai langchainhub
```


```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "AskNews"}, {"imported": "create_openai_functions_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_functions_agent.base.create_openai_functions_agent.html", "title": "AskNews"}, {"imported": "AskNewsSearch", "source": "langchain_community.tools.asknews", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.asknews.tool.AskNewsSearch.html", "title": "AskNews"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "AskNews"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools.asknews import AskNewsSearch
from langchain_openai import ChatOpenAI

prompt = hub.pull("hwchase17/openai-functions-agent")
llm = ChatOpenAI(temperature=0)
asknews_tool = AskNewsSearch()
tools = [asknews_tool]
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)
agent_executor.invoke({"input": "How is the tech sector being affected by fed policy?"})
```



```output
{'input': 'How is the tech sector being affected by fed policy?',
 'output': 'The tech sector is being affected by federal policy in various ways, particularly in relation to artificial intelligence (AI) regulation and investment. Here are some recent news articles related to the tech sector and federal policy:\n\n1. The US Senate has released a bipartisan AI policy roadmap, addressing areas of consensus and disagreement on AI use and development. The roadmap includes recommendations for intellectual property reforms, funding for AI research, sector-specific rules, and transparency requirements. It also emphasizes the need for increased funding for AI innovation and investments in national defense. [Source: The National Law Review]\n\n2. A bipartisan group of US senators, led by Senate Majority Leader Chuck Schumer, has proposed allocating at least $32 billion over the next three years to develop AI and establish safeguards around it. The proposal aims to regulate and promote AI development to maintain US competitiveness and improve quality of life. [Source: Cointelegraph]\n\n3. The US administration is planning to restrict the export of advanced AI models to prevent China and Russia from accessing the technology. This move is part of efforts to protect national security and prevent the misuse of AI by foreign powers. [Source: O Cafezinho]\n\n4. The US and China have discussed the risks of AI technologies, with the US taking the lead in the AI arms race. The US has proposed a $32 billion increase in federal spending on AI to maintain its lead, despite concerns about stifling innovation. [Source: AOL]\n\nThese articles highlight the ongoing discussions and actions related to AI regulation, investment, and export restrictions that are impacting the tech sector in response to federal policy decisions.'}
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
