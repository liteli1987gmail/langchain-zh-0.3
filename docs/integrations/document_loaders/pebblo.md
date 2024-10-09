---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/pebblo.ipynb
---
# Pebblo 安全文档加载器

> [Pebblo](https://daxa-ai.github.io/pebblo/) 使开发者能够安全地加载数据，并在不担心组织的合规性和安全要求的情况下，将他们的生成 AI 应用程序推广到部署。该项目识别加载数据中的语义主题和实体，并在用户界面或 PDF 报告中对其进行总结。

Pebblo 有两个组件。

1. LangChain 的 Pebblo 安全文档加载器
1. Pebblo 服务器

本文档描述了如何使用 Pebblo 安全文档加载器增强您现有的 LangChain 文档加载器，以深入了解输入到生成 AI LangChain 应用程序中的主题和实体类型。有关 `Pebblo 服务器` 的详细信息，请参见此 [pebblo server](https://daxa-ai.github.io/pebblo/daemon) 文档。

Pebblo 安全加载器为 LangChain 的 `DocumentLoader` 提供安全的数据摄取。这是通过用 `Pebblo 安全文档加载器` 包装文档加载器调用来实现的。

注意：要在 Pebblo 的默认 URL（localhost:8000）以外的某个 URL 上配置 Pebblo 服务器，请将正确的 URL 放入 `PEBBLO_CLASSIFIER_URL` 环境变量中。这也可以使用 `classifier_url` 关键字参数进行配置。参考：[server-configurations](https://daxa-ai.github.io/pebblo/config)

#### 如何启用 Pebblo 文档加载？

假设一个使用 `CSVLoader` 读取 CSV 文档进行推理的 LangChain RAG 应用程序代码片段。

这是使用 `CSVLoader` 加载文档的代码片段。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Pebblo Safe DocumentLoader"}]-->
from langchain_community.document_loaders import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

Pebblo SafeLoader 可以通过对上述代码片段进行少量代码更改来启用。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Pebblo Safe DocumentLoader"}, {"imported": "PebbloSafeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pebblo.PebbloSafeLoader.html", "title": "Pebblo Safe DocumentLoader"}]-->
from langchain_community.document_loaders import CSVLoader, PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### 将语义主题和身份发送到 Pebblo 云服务器

要将语义数据发送到 pebblo-cloud，请将 api-key 作为参数传递给 PebbloSafeLoader，或者将 api-key 放入 `PEBBLO_API_KEY` 环境变量中。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Pebblo Safe DocumentLoader"}, {"imported": "PebbloSafeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pebblo.PebbloSafeLoader.html", "title": "Pebblo Safe DocumentLoader"}]-->
from langchain_community.document_loaders import CSVLoader, PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### 将语义主题和身份添加到加载的元数据

要将语义主题和语义实体添加到加载文档的元数据中，请将 load_semantic 设置为 True 作为参数，或者定义一个新的环境变量 `PEBBLO_LOAD_SEMANTIC`，并将其设置为 True。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Pebblo Safe DocumentLoader"}, {"imported": "PebbloSafeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pebblo.PebbloSafeLoader.html", "title": "Pebblo Safe DocumentLoader"}]-->
from langchain_community.document_loaders import CSVLoader, PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```

### 匿名化片段以删除所有个人身份信息 (PII) 细节

将 `anonymize_snippets` 设置为 `True` 以从进入 VectorDB 和生成报告的片段中匿名化所有个人身份信息 (PII)。

> 注意：_Pebblo 实体分类器_ 有效识别个人身份信息 (PII)，并在不断发展。虽然其召回率尚未达到 100%，但正在稳步提高。
> 有关更多详细信息，请参阅 [_Pebblo 实体分类器文档_](https://daxa-ai.github.io/pebblo/entityclassifier/)


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "Pebblo Safe DocumentLoader"}, {"imported": "PebbloSafeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pebblo.PebbloSafeLoader.html", "title": "Pebblo Safe DocumentLoader"}]-->
from langchain_community.document_loaders import CSVLoader, PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    anonymize_snippets=True,  # Whether to anonymize entities in the PDF Report (Optional, default=False)
)
documents = loader.load()
print(documents[0].metadata)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
