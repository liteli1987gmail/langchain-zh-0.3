---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/apify_dataset.ipynb
---
# Apify 数据集

>[Apify 数据集](https://docs.apify.com/platform/storage/dataset) 是一个可扩展的仅追加存储，具有顺序访问功能，专为存储结构化的网页抓取结果而构建，例如产品列表或 Google SERP，然后将其导出为 JSON、CSV 或 Excel 等各种格式。数据集主要用于保存 [Apify Actors](https://apify.com/store) 的结果——用于各种网页抓取、爬虫和数据提取用例的无服务器云程序。

本笔记本展示了如何将 Apify 数据集加载到 LangChain。


## 先决条件

您需要在 Apify 平台上拥有一个现有的数据集。此示例展示了如何加载由 [网站内容爬虫](https://apify.com/apify/website-content-crawler) 生成的数据集。


```python
%pip install --upgrade --quiet  apify-client
```

首先，将 `ApifyDatasetLoader` 导入到您的源代码中：


```python
<!--IMPORTS:[{"imported": "ApifyDatasetLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.apify_dataset.ApifyDatasetLoader.html", "title": "Apify Dataset"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Apify Dataset"}]-->
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

然后提供一个函数，将 Apify 数据集记录字段映射到 LangChain `Document` 格式。

例如，如果您的数据集项结构如下：

```json
{
    "url": "https://apify.com",
    "text": "Apify is the best web scraping and automation platform."
}
```

下面代码中的映射函数将把它们转换为 LangChain `Document` 格式，以便您可以进一步与任何 LLM 模型（例如，用于问答）一起使用。


```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```


```python
data = loader.load()
```

## 一个问答示例

在这个示例中，我们使用数据集中的数据来回答一个问题。


```python
<!--IMPORTS:[{"imported": "VectorstoreIndexCreator", "source": "langchain.indexes", "docs": "https://python.langchain.com/api_reference/langchain/indexes/langchain.indexes.vectorstore.VectorstoreIndexCreator.html", "title": "Apify Dataset"}, {"imported": "ApifyWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.apify.ApifyWrapper.html", "title": "Apify Dataset"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Apify Dataset"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Apify Dataset"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai.embeddings", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Apify Dataset"}]-->
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
```


```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```


```python
index = VectorstoreIndexCreator(embedding=OpenAIEmbeddings()).from_loaders([loader])
```


```python
query = "What is Apify?"
result = index.query_with_sources(query, llm=OpenAI())
```


```python
print(result["answer"])
print(result["sources"])
```
```output
 Apify is a platform for developing, running, and sharing serverless cloud programs. It enables users to create web scraping and automation tools and publish them on the Apify platform.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
