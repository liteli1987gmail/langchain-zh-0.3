---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/langsmith.ipynb
sidebar_label: LangSmith
---
# LangSmithLoader

本笔记本提供了一个快速概述，帮助您开始使用 LangSmith [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders)。有关所有 LangSmithLoader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/core/document_loaders/langchain_core.document_loaders.langsmith.LangSmithLoader.html)。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [LangSmithLoader](https://python.langchain.com/api_reference/core/document_loaders/langchain_core.document_loaders.langsmith.LangSmithLoader.html) | [langchain-core](https://python.langchain.com/api_reference/core/index.html) | ❌ | ❌ | ❌ |

### 加载器功能
| 来源 | 懒加载 | 原生异步 |
| :---: | :---: | :---: |
| LangSmithLoader | ✅ | ❌ |

## 设置

要访问 LangSmith 文档加载器，您需要安装 `langchain-core`，创建一个 [LangSmith](https://langsmith.com) 账户并获取 API 密钥。

### 凭证

请在 https://langsmith.com 注册并生成 API 密钥。完成后设置 LANGSMITH_API_KEY 环境变量：


```python
import getpass
import os

if not os.environ.get("LANGSMITH_API_KEY"):
    os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
```

如果您想获得自动化的最佳追踪，您还可以开启LangSmith追踪：


```python
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 `langchain-core`：


```python
%pip install -qU langchain-core
```

### 克隆示例数据集

在这个示例中，我们将克隆并加载一个公共的LangSmith数据集。克隆会在我们的个人LangSmith账户上创建该数据集的副本。您只能加载您个人拥有副本的数据集。


```python
from langsmith import Client as LangSmithClient

ls_client = LangSmithClient()

dataset_name = "LangSmith Few Shot Datasets Notebook"
dataset_public_url = (
    "https://smith.langchain.com/public/55658626-124a-4223-af45-07fb774a6212/d"
)

ls_client.clone_public_dataset(dataset_public_url)
```

## 初始化

现在我们可以实例化我们的文档加载器并加载文档：


```python
<!--IMPORTS:[{"imported": "LangSmithLoader", "source": "langchain_core.document_loaders", "docs": "https://python.langchain.com/api_reference/core/document_loaders/langchain_core.document_loaders.langsmith.LangSmithLoader.html", "title": "LangSmithLoader"}]-->
from langchain_core.document_loaders import LangSmithLoader

loader = LangSmithLoader(
    dataset_name=dataset_name,
    content_key="question",
    limit=50,
    # format_content=...,
    # ...
)
```

## 加载


```python
docs = loader.load()
print(docs[0].page_content)
```
```output
Show me an example using Weaviate, but customizing the vectorStoreRetriever to return the top 10 k nearest neighbors.
```

```python
print(docs[0].metadata["inputs"])
```
```output
{'question': 'Show me an example using Weaviate, but customizing the vectorStoreRetriever to return the top 10 k nearest neighbors. '}
```

```python
print(docs[0].metadata["outputs"])
```
```output
{'answer': 'To customize the Weaviate client and return the top 10 k nearest neighbors, you can utilize the `as_retriever` method with the appropriate parameters. Here\'s how you can achieve this:\n\n\`\`\`python\n# Assuming you have imported the necessary modules and classes\n\n# Create the Weaviate client\nclient = weaviate.Client(url=os.environ["WEAVIATE_URL"], ...)\n\n# Initialize the Weaviate wrapper\nweaviate = Weaviate(client, index_name, text_key)\n\n# Customize the client to return top 10 k nearest neighbors using as_retriever\ncustom_retriever = weaviate.as_retriever(\n    search_type="similarity",\n    search_kwargs={\n        \'k\': 10  # Customize the value of k as needed\n    }\n)\n\n# Now you can use the custom_retriever to perform searches\nresults = custom_retriever.search(query, ...)\n\`\`\`'}
```

```python
list(docs[0].metadata.keys())
```



```output
['dataset_id',
 'inputs',
 'outputs',
 'metadata',
 'id',
 'created_at',
 'modified_at',
 'runs',
 'source_run_id']
```


## 懒加载


```python
page = []
for doc in loader.lazy_load():
    page.append(doc)
    if len(page) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)
        # page = []
        break
len(page)
```



```output
10
```


## API参考

有关所有 LangSmithLoader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/core/document_loaders/langchain_core.document_loaders.langsmith.LangSmithLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
