---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/hippo.ipynb
---
# 河马

>[Transwarp Hippo](https://www.transwarp.cn/en/subproduct/hippo) 是一个企业级云原生分布式向量数据库，支持海量基于向量的数据集的存储、检索和管理。它高效地解决了向量相似性搜索和高密度向量聚类等问题。`Hippo` 具有高可用性、高性能和易扩展性。它拥有多种功能，如多个向量搜索索引、数据分区和分片、数据持久化、增量数据摄取、向量标量字段过滤和混合查询。它可以有效满足企业对海量向量数据的高实时搜索需求。

## 入门指南

这里唯一的前提是需要一个来自 OpenAI 网站的 API 密钥。确保您已经启动了一个 Hippo 实例。

## 安装依赖

最初，我们需要安装某些依赖项，如 OpenAI、Langchain 和 Hippo-API。请注意，您应该安装适合您环境的相应版本。


```python
%pip install --upgrade --quiet  langchain langchain_community tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```
```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```
注意：Python 版本需要 >=3.8。

## 最佳实践
### 导入依赖包


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Hippo"}, {"imported": "Hippo", "source": "langchain_community.vectorstores.hippo", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.hippo.Hippo.html", "title": "Hippo"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Hippo"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Hippo"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Hippo"}]-->
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### 加载知识文档


```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
```

### 划分知识文档

在这里，我们使用 LangChain 的 CharacterTextSplitter 进行划分。分隔符是句号。划分后，文本段落不超过 1000 个字符，重复字符的数量为 0。


```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 声明嵌入模型
下面，我们使用 LangChain 的 OpenAIEmbeddings 方法创建 OpenAI 或 Azure 嵌入模型。


```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### 声明 Hippo 客户端


```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### 存储文档


```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```
```output
input...
success
```
### 进行基于知识的问题和回答
#### 创建大型语言问答模型
下面，我们分别使用LangChain中的AzureChatOpenAI和ChatOpenAI方法创建OpenAI或Azure大型语言问答模型。


```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### 基于问题获取相关知识：


```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### 构建提示词模板


```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### 等待大型语言模型生成答案


```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```
```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```

## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
