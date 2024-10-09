---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/embedchain.ipynb
---
# Embedchain

>[Embedchain](https://github.com/embedchain/embedchain) 是一个用于创建数据管道的RAG框架。它加载、索引、检索和同步所有数据。
>
>它作为一个[开源包](https://github.com/embedchain/embedchain)和一个[托管平台解决方案](https://app.embedchain.ai/)可用。

本笔记本展示了如何使用一个使用`Embedchain`的检索器。

# 安装

首先，您需要安装[`embedchain`包](https://pypi.org/project/embedchain/)。

您可以通过运行以下命令安装该包


```python
%pip install --upgrade --quiet  embedchain
```

# 创建新检索器

`EmbedchainRetriever` 有一个静态的 `.create()` 工厂方法，接受以下参数：

* `yaml_path: string` 可选 -- YAML 配置文件的路径。如果未提供，将使用默认配置。您可以浏览我们的 [文档](https://docs.embedchain.ai/) 以探索各种自定义选项。


```python
# Setup API Key

import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```
```output
 ········
```

```python
<!--IMPORTS:[{"imported": "EmbedchainRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.embedchain.EmbedchainRetriever.html", "title": "Embedchain"}]-->
from langchain_community.retrievers import EmbedchainRetriever

# create a retriever with default options
retriever = EmbedchainRetriever.create()

# or if you want to customize, pass the yaml config path
# retriever = EmbedchainRetiever.create(yaml_path="config.yaml")
```

# 添加数据

在 embedchain 中，您可以添加尽可能多的支持的数据类型。您可以浏览我们的 [文档](https://docs.embedchain.ai/) 以查看支持的数据类型。

Embedchain 会自动推断数据的类型。因此，您可以添加字符串、URL 或本地文件路径。


```python
retriever.add_texts(
    [
        "https://en.wikipedia.org/wiki/Elon_Musk",
        "https://www.forbes.com/profile/elon-musk",
        "https://www.youtube.com/watch?v=RcYjXbSJBN8",
    ]
)
```
```output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:08<00:00,  2.22s/it]
``````output
Successfully saved https://en.wikipedia.org/wiki/Elon_Musk (DataType.WEB_PAGE). New chunks count: 378
``````output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:01<00:00,  1.17s/it]
``````output
Successfully saved https://www.forbes.com/profile/elon-musk (DataType.WEB_PAGE). New chunks count: 13
``````output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:02<00:00,  2.25s/it]
``````output
Successfully saved https://www.youtube.com/watch?v=RcYjXbSJBN8 (DataType.YOUTUBE_VIDEO). New chunks count: 53
```


```output
['1eab8dd1ffa92906f7fc839862871ca5',
 '8cf46026cabf9b05394a2658bd1fe890',
 'da3227cdbcedb018e05c47b774d625f6']
```


# 使用检索器

您现在可以使用检索器根据查询查找相关文档


```python
result = retriever.invoke("How many companies does Elon Musk run and name those?")
```


```python
result
```



```output
[Document(page_content='Views Filmography Companies Zip2 X.com PayPal SpaceX Starlink Tesla, Inc. Energycriticismlitigation OpenAI Neuralink The Boring Company Thud X Corp. Twitteracquisitiontenure as CEO xAI In popular culture Elon Musk (Isaacson) Elon Musk (Vance) Ludicrous Power Play "Members Only" "The Platonic Permutation" "The Musk Who Fell to Earth" "One Crew over the Crewcoo\'s Morty" Elon Musk\'s Crash Course Related Boring Test Tunnel Hyperloop Musk family Musk vs. Zuckerberg SolarCity Tesla Roadster in space', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'}),
 Document(page_content='Elon Musk PROFILEElon MuskCEO, Tesla$241.2B$508M (0.21%)Real Time Net Worthas of 11/18/23Reflects change since 5 pm ET of prior trading day. 1 in the world todayPhoto by Martin Schoeller for ForbesAbout Elon MuskElon Musk cofounded six companies, including electric car maker Tesla, rocket producer SpaceX and tunneling startup Boring Company.He owns about 21% of Tesla between stock and options, but has pledged more than half his shares as collateral for personal loans of up to $3.5', metadata={'source': 'https://www.forbes.com/profile/elon-musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3c8573134c575fafc025e9211413723e1f7a725b5936e8ee297fb7fb63bdd01a'}),
 Document(page_content='to form PayPal. In October 2002, eBay acquired PayPal for $1.5 billion, and that same year, with $100 million of the money he made, Musk founded SpaceX, a spaceflight services company. In 2004, he became an early investor in electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.). He became its chairman and product architect, assuming the position of CEO in 2008. In 2006, Musk helped create SolarCity, a solar-energy company that was acquired by Tesla in 2016 and became Tesla Energy.', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
