---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/xml.ipynb
---
# 非结构化XML加载器

本笔记本提供了关于如何使用非结构化XML加载器 [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders) 的快速概述。`UnstructuredXMLLoader` 用于加载 `XML` 文件。该加载器适用于 `.xml` 文件。页面内容将是从 XML 标签中提取的文本。


## 概述
### 集成细节


| 类 | 包名 | 本地 | 可序列化 | [JS支持](https://js.langchain.com/docs/integrations/document_loaders/file_loaders/unstructured/)|
| :--- | :--- | :---: | :---: |  :---: |
| [UnstructuredXMLLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.xml.UnstructuredXMLLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ✅ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| UnstructuredXMLLoader | ✅ | ❌ |

## 设置

要访问 UnstructuredXMLLoader 文档加载器，您需要安装 `langchain-community` 集成包。

### 凭证

使用 UnstructuredXMLLoader 不需要凭证

如果您想自动获取模型调用的最佳追踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community**。


```python
%pip install -qU langchain_community
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：


```python
<!--IMPORTS:[{"imported": "UnstructuredXMLLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.xml.UnstructuredXMLLoader.html", "title": "UnstructuredXMLLoader"}]-->
from langchain_community.document_loaders import UnstructuredXMLLoader

loader = UnstructuredXMLLoader(
    "./example_data/factbook.xml",
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/factbook.xml'}, page_content='United States\n\nWashington, DC\n\nJoe Biden\n\nBaseball\n\nCanada\n\nOttawa\n\nJustin Trudeau\n\nHockey\n\nFrance\n\nParis\n\nEmmanuel Macron\n\nSoccer\n\nTrinidad & Tobado\n\nPort of Spain\n\nKeith Rowley\n\nTrack & Field')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/factbook.xml'}
```
## 延迟加载


```python
page = []
for doc in loader.lazy_load():
    page.append(doc)
    if len(page) >= 10:
        # do some paged operation, e.g.
        # index.upsert(page)

        page = []
```

## API 参考

有关所有 __ModuleName__Loader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.xml.UnstructuredXMLLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
