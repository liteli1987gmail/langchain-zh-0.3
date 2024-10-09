---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/bshtml.ipynb
---
# BSHTMLLoader


本笔记本提供了一个快速概述，帮助您开始使用 BeautifulSoup4 [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders)。有关所有 __ModuleName__Loader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html)。


## 概述
### 集成细节


| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [BSHTMLLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器功能
| 来源 | 文档懒加载 | 原生异步支持 |
| :---: | :---: | :---: |
| BSHTMLLoader | ✅ | ❌ |

## 设置

要访问 BSHTMLLoader 文档加载器，您需要安装 `langchain-community` 集成包和 `bs4` python 包。

### 凭证

使用 `BSHTMLLoader` 类不需要凭证。

如果您想自动获取模型调用的最佳追踪，可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community** 和 **bs4**。


```python
%pip install -qU langchain_community bs4
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：

- TODO: 使用相关参数更新模型实例化。


```python
<!--IMPORTS:[{"imported": "BSHTMLLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html", "title": "BSHTMLLoader"}]-->
from langchain_community.document_loaders import BSHTMLLoader

loader = BSHTMLLoader(
    file_path="./example_data/fake-content.html",
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/fake-content.html', 'title': 'Test Title'}, page_content='\nTest Title\n\n\nMy First Heading\nMy first paragraph.\n\n\n')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/fake-content.html', 'title': 'Test Title'}
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
page[0]
```



```output
Document(metadata={'source': './example_data/fake-content.html', 'title': 'Test Title'}, page_content='\nTest Title\n\n\nMy First Heading\nMy first paragraph.\n\n\n')
```


## 向 BS4 添加分隔符

我们还可以传递一个分隔符，用于在调用 soup 的 get_text 时使用


```python
loader = BSHTMLLoader(
    file_path="./example_data/fake-content.html", get_text_separator=", "
)

docs = loader.load()
print(docs[0])
```
```output
page_content='
, Test Title, 
, 
, 
, My First Heading, 
, My first paragraph., 
, 
, 
' metadata={'source': './example_data/fake-content.html', 'title': 'Test Title'}
```
## API 参考

有关所有 BSHTMLLoader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.html_bs.BSHTMLLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
