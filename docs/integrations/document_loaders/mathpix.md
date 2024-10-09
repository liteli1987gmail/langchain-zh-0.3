---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/mathpix.ipynb
---
# MathPixPDFLoader

灵感来自于 Daniel Gross 的代码片段： [https://gist.github.com/danielgross/3ab4104e14faccc12b49200843adab21](https://gist.github.com/danielgross/3ab4104e14faccc12b49200843adab21)

## 概述
### 集成细节

| 类别 | 包名 | 本地 | 可序列化 | JS 支持 |
| :--- | :--- | :---: | :---: |  :---: |
| [MathPixPDFLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.MathpixPDFLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ❌ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持 |
| :---: | :---: | :---: |
| MathPixPDFLoader | ✅ | ❌ |

## 设置

### 凭证

注册 Mathpix 并 [创建一个 API 密钥](https://mathpix.com/docs/ocr/creating-an-api-key) 以在您的环境中设置 `MATHPIX_API_KEY` 变量


```python
import getpass
import os

if "MATHPIX_API_KEY" not in os.environ:
    os.environ["MATHPIX_API_KEY"] = getpass.getpass("Enter your Mathpix API key: ")
```

如果您想要自动获取最佳的模型调用追踪，您还可以通过取消下面的注释来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


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

现在我们准备初始化我们的加载器：


```python
<!--IMPORTS:[{"imported": "MathpixPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.MathpixPDFLoader.html", "title": "MathPixPDFLoader"}]-->
from langchain_community.document_loaders import MathpixPDFLoader

file_path = "./example_data/layout-parser-paper.pdf"
loader = MathpixPDFLoader(file_path)
```

## 加载


```python
docs = loader.load()
docs[0]
```


```python
print(docs[0].metadata)
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

有关所有 MathpixPDFLoader 功能和配置的详细文档，请访问 API 参考：https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.MathpixPDFLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
