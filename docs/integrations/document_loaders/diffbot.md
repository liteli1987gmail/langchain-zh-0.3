---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/diffbot.ipynb
---
# Diffbot

> [Diffbot](https://docs.diffbot.com/docs/getting-started-with-diffbot) 是一套基于机器学习的产品，旨在简化网页数据的结构化处理。

> Diffbot 的 [Extract API](https://docs.diffbot.com/reference/extract-introduction) 是一个从网页中结构化和标准化数据的服务。

> 与传统的网页抓取工具不同，`Diffbot Extract` 不需要任何规则来读取页面内容。它使用计算机视觉模型将页面分类为20种可能的类型之一，然后将原始HTML标记转换为JSON。生成的结构化JSON遵循一致的 [基于类型的本体](https://docs.diffbot.com/docs/ontology)，这使得从多个不同的网页源中提取具有相同模式的数据变得简单。

[![在Colab中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/document_loaders/diffbot.ipynb)


## 概述
本指南介绍如何使用 [Diffbot Extract API](https://www.diffbot.com/products/extract/) 从URL列表中提取数据，并将其转换为我们可以在后续使用的结构化JSON。

## 设置

首先安装所需的包。


```python
%pip install --upgrade --quiet langchain-community
```

Diffbot的提取API需要一个API令牌。按照这些说明[获取免费的API令牌](/docs/integrations/providers/diffbot#installation-and-setup)，然后设置一个环境变量。


```python
%env DIFFBOT_API_TOKEN REPLACE_WITH_YOUR_TOKEN
```

## 使用文档加载器

导入DiffbotLoader模块，并使用URL列表和您的Diffbot令牌实例化它。


```python
<!--IMPORTS:[{"imported": "DiffbotLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.diffbot.DiffbotLoader.html", "title": "Diffbot"}]-->
import os

from langchain_community.document_loaders import DiffbotLoader

urls = [
    "https://python.langchain.com/",
]

loader = DiffbotLoader(urls=urls, api_token=os.environ.get("DIFFBOT_API_TOKEN"))
```

使用`.load()`方法，您可以查看加载的文档


```python
loader.load()
```



```output
[Document(page_content="LangChain is a framework for developing applications powered by large language models (LLMs).\nLangChain simplifies every stage of the LLM application lifecycle:\nDevelopment: Build your applications using LangChain's open-source building blocks and components. Hit the ground running using third-party integrations and Templates.\nProductionization: Use LangSmith to inspect, monitor and evaluate your chains, so that you can continuously optimize and deploy with confidence.\nDeployment: Turn any chain into an API with LangServe.\nlangchain-core: Base abstractions and LangChain Expression Language.\nlangchain-community: Third party integrations.\nPartner packages (e.g. langchain-openai, langchain-anthropic, etc.): Some integrations have been further split into their own lightweight packages that only depend on langchain-core.\nlangchain: Chains, agents, and retrieval strategies that make up an application's cognitive architecture.\nlanggraph: Build robust and stateful multi-actor applications with LLMs by modeling steps as edges and nodes in a graph.\nlangserve: Deploy LangChain chains as REST APIs.\nThe broader ecosystem includes:\nLangSmith: A developer platform that lets you debug, test, evaluate, and monitor LLM applications and seamlessly integrates with LangChain.\nGet started\nWe recommend following our Quickstart guide to familiarize yourself with the framework by building your first LangChain application.\nSee here for instructions on how to install LangChain, set up your environment, and start building.\nnote\nThese docs focus on the Python LangChain library. Head here for docs on the JavaScript LangChain library.\nUse cases\nIf you're looking to build something specific or are more of a hands-on learner, check out our use-cases. They're walkthroughs and techniques for common end-to-end tasks, such as:\nQuestion answering with RAG\nExtracting structured output\nChatbots\nand more!\nExpression Language\nLangChain Expression Language (LCEL) is the foundation of many of LangChain's components, and is a declarative way to compose chains. LCEL was designed from day 1 to support putting prototypes in production, with no code changes, from the simplest “prompt + LLM” chain to the most complex chains.\nGet started: LCEL and its benefits\nRunnable interface: The standard interface for LCEL objects\nPrimitives: More on the primitives LCEL includes\nand more!\nEcosystem\n🦜🛠️ LangSmith\nTrace and evaluate your language model applications and intelligent agents to help you move from prototype to production.\n🦜🕸️ LangGraph\nBuild stateful, multi-actor applications with LLMs, built on top of (and intended to be used with) LangChain primitives.\n🦜🏓 LangServe\nDeploy LangChain runnables and chains as REST APIs.\nSecurity\nRead up on our Security best practices to make sure you're developing safely with LangChain.\nAdditional resources\nComponents\nLangChain provides standard, extendable interfaces and integrations for many different components, including:\nIntegrations\nLangChain is part of a rich ecosystem of tools that integrate with our framework and build on top of it. Check out our growing list of integrations.\nGuides\nBest practices for developing with LangChain.\nAPI reference\nHead to the reference section for full documentation of all classes and methods in the LangChain and LangChain Experimental Python packages.\nContributing\nCheck out the developer's guide for guidelines on contributing and help getting your dev environment set up.\nHelp us out by providing feedback on this documentation page:", metadata={'source': 'https://python.langchain.com/'})]
```


## 将提取的文本转换为图文档

结构化页面内容可以通过`DiffbotGraphTransformer`进一步处理，以提取实体和关系到图中。


```python
%pip install --upgrade --quiet langchain-experimental
```


```python
<!--IMPORTS:[{"imported": "DiffbotGraphTransformer", "source": "langchain_experimental.graph_transformers.diffbot", "docs": "https://python.langchain.com/api_reference/experimental/graph_transformers/langchain_experimental.graph_transformers.diffbot.DiffbotGraphTransformer.html", "title": "Diffbot"}]-->
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_nlp = DiffbotGraphTransformer(
    diffbot_api_key=os.environ.get("DIFFBOT_API_TOKEN")
)
graph_documents = diffbot_nlp.convert_to_graph_documents(loader.load())
```

要继续将数据加载到知识图中，请遵循[`DiffbotGraphTransformer`指南](/docs/integrations/graphs/diffbot/#loading-the-data-into-a-knowledge-graph)。


## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器[操作指南](/docs/how_to/#document-loaders)
