---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/arcee.ipynb
---
# Arcee
本笔记本演示了如何使用 `Arcee` 类来生成文本，利用 Arcee 的领域适应语言模型 (DALMs)。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```

### 设置

在使用 Arcee 之前，请确保将 Arcee API 密钥设置为 `ARCEE_API_KEY` 环境变量。您也可以将 API 密钥作为命名参数传递。


```python
<!--IMPORTS:[{"imported": "Arcee", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.arcee.Arcee.html", "title": "Arcee"}]-->
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 额外配置

您还可以根据需要配置 Arcee 的参数，例如 `arcee_api_url`、`arcee_app_url` 和 `model_kwargs`。
在对象初始化时设置 `model_kwargs` 会将这些参数作为默认值用于后续所有生成响应的调用。


```python
arcee = Arcee(
    model="DALM-Patent",
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

### 生成文本

您可以通过提供提示从 Arcee 生成文本。以下是一个示例：


```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### 额外参数

Arcee 允许您应用 `filters` 并设置检索文档的 `size`（以数量为单位）来辅助文本生成。过滤器有助于缩小结果范围。以下是如何使用这些参数：





```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
