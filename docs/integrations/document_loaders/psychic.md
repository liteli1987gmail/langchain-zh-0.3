---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/psychic.ipynb
---
# Psychic
本笔记本介绍如何从 `Psychic` 加载文档。有关更多详细信息，请参见 [这里](/docs/integrations/providers/psychic)。

## 前提条件
1. 在 [此文档](/docs/integrations/providers/psychic) 中按照快速入门部分进行操作。
2. 登录 [Psychic 仪表板](https://dashboard.psychic.dev/) 并获取您的密钥。
3. 将前端 React 库安装到您的 Web 应用中，并让用户进行身份验证以建立连接。连接将使用您指定的连接 ID 创建。

## 加载文档

使用 `PsychicLoader` 类从连接中加载文档。每个连接都有一个连接器 ID（对应于连接的 SaaS 应用）和一个连接 ID（您传递给前端库的）。


```python
# Uncomment this to install psychicapi if you don't already have it installed
!poetry run pip -q install psychicapi langchain-chroma
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
<!--IMPORTS:[{"imported": "PsychicLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.psychic.PsychicLoader.html", "title": "Psychic"}]-->
from langchain_community.document_loaders import PsychicLoader
from psychicapi import ConnectorId

# Create a document loader for google drive. We can also load from other connectors by setting the connector_id to the appropriate value e.g. ConnectorId.notion.value
# This loader uses our test credentials
google_drive_loader = PsychicLoader(
    api_key="7ddb61c1-8b6a-4d31-a58e-30d1c9ea480e",
    connector_id=ConnectorId.gdrive.value,
    connection_id="google-test",
)

documents = google_drive_loader.load()
```

## 将文档转换为嵌入

我们现在可以将这些文档转换为嵌入，并将它们存储在像 Chroma 这样的向量数据库中


```python
<!--IMPORTS:[{"imported": "RetrievalQAWithSourcesChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.qa_with_sources.retrieval.RetrievalQAWithSourcesChain.html", "title": "Psychic"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Psychic"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Psychic"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Psychic"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Psychic"}]-->
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_chroma import Chroma
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```


```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
docsearch = Chroma.from_documents(texts, embeddings)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
chain({"question": "what is psychic?"}, return_only_outputs=True)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
