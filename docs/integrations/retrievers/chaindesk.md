---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/chaindesk.ipynb
---
# Chaindesk

>[Chaindesk平台](https://docs.chaindesk.ai/introduction) 将来自任何地方的数据（数据源：文本、PDF、Word、PowerPoint、Excel、Notion、Airtable、Google Sheets等）引入数据存储（多个数据源的容器）。
然后，您的数据存储可以通过插件或任何其他大型语言模型（LLM）通过`Chaindesk API`连接到ChatGPT。

本笔记本展示了如何使用[Chaindesk的](https://www.chaindesk.ai/)检索器。

首先，您需要注册Chaindesk，创建一个数据存储，添加一些数据并获取您的数据存储API端点URL。您需要[API密钥](https://docs.chaindesk.ai/api-reference/authentication)。

## 查询

现在我们的索引已设置好，我们可以设置一个检索器并开始查询。


```python
<!--IMPORTS:[{"imported": "ChaindeskRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.chaindesk.ChaindeskRetriever.html", "title": "Chaindesk"}]-->
from langchain_community.retrievers import ChaindeskRetriever
```


```python
retriever = ChaindeskRetriever(
    datastore_url="https://clg1xg2h80000l708dymr0fxc.chaindesk.ai/query",
    # api_key="CHAINDESK_API_KEY", # optional if datastore is public
    # top_k=10 # optional
)
```


```python
retriever.invoke("What is Daftpage?")
```



```output
[Document(page_content='✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramGetting StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!DaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord', metadata={'source': 'https:/daftpage.com/help/getting-started', 'score': 0.8697265}),
 Document(page_content="✨ Made with DaftpageOpen main menuPricingTemplatesLoginSearchHelpGetting StartedFeaturesAffiliate ProgramHelp CenterWelcome to Daftpage’s help center—the one-stop shop for learning everything about building websites with Daftpage.Daftpage is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.86570895}),
 Document(page_content=" is the simplest way to create websites for all purposes in seconds. Without knowing how to code, and for free!Get StartedDaftpage is a new type of website builder that works like a doc.It makes website building easy, fun and offers tons of powerful features for free. Just type / in your page to get started!Start here✨ Create your first site🧱 Add blocks🚀 PublishGuides🔖 Add a custom domainFeatures🔥 Drops🎨 Drawings👻 Ghost mode💀 Skeleton modeCant find the answer you're looking for?mail us at support@daftpage.comJoin the awesome Daftpage community on: 👾 DiscordDaftpageCopyright © 2022 Daftpage, Inc.All rights reserved.ProductPricingTemplatesHelp & SupportHelp CenterGetting startedBlogCompanyAboutRoadmapTwitterAffiliate Program👾 Discord", metadata={'source': 'https:/daftpage.com/help', 'score': 0.8645384})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
