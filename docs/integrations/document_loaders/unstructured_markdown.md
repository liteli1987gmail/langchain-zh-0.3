---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/unstructured_markdown.ipynb
---
# 非结构化Markdown加载器

本笔记本提供了一个快速概述，帮助您开始使用非结构化Markdown [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders)。有关所有 __ModuleName__Loader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html)。

## 概述
### 集成细节


| 类 | 包名 | 本地 | 可序列化 | [JS支持](https://js.langchain.com/docs/integrations/document_loaders/file_loaders/unstructured/)|
| :--- | :--- | :---: | :---: |  :---: |
| [非结构化Markdown加载器](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ❌ | ❌ | ✅ |
### 加载器功能
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| UnstructuredMarkdownLoader | ✅ | ❌ |

## 设置

要访问 UnstructuredMarkdownLoader 文档加载器，您需要安装 `langchain-community` 集成包和 `unstructured` python 包。

### 凭证

使用此加载器不需要凭证。

如果您想获得自动化的最佳模型调用追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community** 和 **unstructured**


```python
%pip install -qU langchain_community unstructured
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档。

您可以以两种模式运行加载器："single" 和 "elements"。如果您使用 "single" 模式，文档将作为单个 `Document` 对象返回。如果您使用 "elements" 模式，unstructured 库将把文档拆分为 `Title` 和 `NarrativeText` 等元素。您可以在模式后传入额外的 `unstructured` 关键字参数，以应用不同的 `unstructured` 设置。


```python
<!--IMPORTS:[{"imported": "UnstructuredMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html", "title": "UnstructuredMarkdownLoader"}]-->
from langchain_community.document_loaders import UnstructuredMarkdownLoader

loader = UnstructuredMarkdownLoader(
    "./example_data/example.md",
    mode="single",
    strategy="fast",
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': './example_data/example.md'}, page_content='Sample Markdown Document\n\nIntroduction\n\nWelcome to this sample Markdown document. Markdown is a lightweight markup language used for formatting text. It\'s widely used for documentation, readme files, and more.\n\nFeatures\n\nHeaders\n\nMarkdown supports multiple levels of headers:\n\nHeader 1: # Header 1\n\nHeader 2: ## Header 2\n\nHeader 3: ### Header 3\n\nLists\n\nUnordered List\n\nItem 1\n\nItem 2\n\nSubitem 2.1\n\nSubitem 2.2\n\nOrdered List\n\nFirst item\n\nSecond item\n\nThird item\n\nLinks\n\nOpenAI is an AI research organization.\n\nImages\n\nHere\'s an example image:\n\nCode\n\nInline Code\n\nUse code for inline code snippets.\n\nCode Block\n\n\`\`\`python def greet(name): return f"Hello, {name}!"\n\nprint(greet("World")) \`\`\`')
```



```python
print(docs[0].metadata)
```
```output
{'source': './example_data/example.md'}
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
Document(metadata={'source': './example_data/example.md', 'link_texts': ['OpenAI'], 'link_urls': ['https://www.openai.com'], 'last_modified': '2024-08-14T15:04:18', 'languages': ['eng'], 'parent_id': 'de1f74bf226224377ab4d8b54f215bb9', 'filetype': 'text/markdown', 'file_directory': './example_data', 'filename': 'example.md', 'category': 'NarrativeText', 'element_id': '898a542a261f7dc65e0072d1e847d535'}, page_content='OpenAI is an AI research organization.')
```


## 加载元素

在这个例子中，我们将以 `elements` 模式加载，这将返回 markdown 文档中不同元素的列表：


```python
<!--IMPORTS:[{"imported": "UnstructuredMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html", "title": "UnstructuredMarkdownLoader"}]-->
from langchain_community.document_loaders import UnstructuredMarkdownLoader

loader = UnstructuredMarkdownLoader(
    "./example_data/example.md",
    mode="elements",
    strategy="fast",
)

docs = loader.load()
len(docs)
```



```output
29
```


正如您所看到的，从 `example.md` 文件中提取了 29 个元素。第一个元素是文档的标题，正如预期的那样：


```python
docs[0].page_content
```



```output
'Sample Markdown Document'
```


## API 参考

有关所有 UnstructuredMarkdownLoader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.markdown.UnstructuredMarkdownLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
