---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/exa_search.ipynb
---
# Exa

>[Exa](https://exa.ai/) 是一个为人工智能和开发者提供的知识API。
>

## 安装和设置

`Exa` 集成存在于其自己的 [第三方库](https://pypi.org/project/langchain-exa/)。您可以通过以下方式安装：


```python
%pip install -qU langchain-exa
```

为了使用该包，您还需要将 `EXA_API_KEY` 环境变量设置为您的 Exa API 密钥。

## 检索器

您可以在标准检索管道中使用 [`ExaSearchRetriever`](/docs/integrations/tools/exa_search#using-exasearchretriever)。您可以按如下方式导入它。

查看 [使用示例](/docs/integrations/tools/exa_search)。



```python
<!--IMPORTS:[{"imported": "ExaSearchRetriever", "source": "langchain_exa", "docs": "https://python.langchain.com/api_reference/exa/retrievers/langchain_exa.retrievers.ExaSearchRetriever.html", "title": "Exa"}]-->
from langchain_exa import ExaSearchRetriever
```

## 工具

您可以将 Exa 作为代理工具使用，具体描述见 [Exa 工具调用文档](/docs/integrations/tools/exa_search#using-the-exa-sdk-as-langchain-agent-tools)。

查看 [使用示例](/docs/integrations/tools/exa_search)。

### ExaFindSimilarResults

一个查询 Metaphor Search API 并返回 JSON 的工具。


```python
<!--IMPORTS:[{"imported": "ExaFindSimilarResults", "source": "langchain_exa.tools", "docs": "https://python.langchain.com/api_reference/exa/tools/langchain_exa.tools.ExaFindSimilarResults.html", "title": "Exa"}]-->
from langchain_exa.tools import ExaFindSimilarResults
```

### ExaSearchResults

Exa搜索工具。


```python
<!--IMPORTS:[{"imported": "ExaSearchResults", "source": "langchain_exa.tools", "docs": "https://python.langchain.com/api_reference/exa/tools/langchain_exa.tools.ExaSearchResults.html", "title": "Exa"}]-->
from langchain_exa.tools import ExaSearchResults
```
