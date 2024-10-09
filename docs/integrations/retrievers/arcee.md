---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/arcee.ipynb
---
# Arcee

>[Arcee](https://www.arcee.ai/about/about-us) 帮助开发 SLMs——小型、专业、安全和可扩展的语言模型。

本笔记本演示了如何使用 `ArceeRetriever` 类来检索与 Arcee 的 `领域适应语言模型` (`DALMs`) 相关的文档。

### 设置

在使用 `ArceeRetriever` 之前，请确保将 Arcee API 密钥设置为 `ARCEE_API_KEY` 环境变量。您也可以将 API 密钥作为命名参数传递。


```python
<!--IMPORTS:[{"imported": "ArceeRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.arcee.ArceeRetriever.html", "title": "Arcee"}]-->
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 额外配置

您还可以根据需要配置 `ArceeRetriever` 的参数，例如 `arcee_api_url`、`arcee_app_url` 和 `model_kwargs`。
在对象初始化时设置 `model_kwargs` 会将过滤器和大小作为所有后续检索的默认值。


```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### 检索文档
您可以通过提供查询从上传的上下文中检索相关文档。以下是一个示例：


```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### 额外参数

Arcee 允许您应用 `filters` 并设置检索文档的 `size`（以数量为单位）。过滤器有助于缩小结果范围。以下是如何使用这些参数：


```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
