---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/elasticsearch_chat_message_history.ipynb
---
# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/) 是一个分布式的、RESTful的搜索和分析引擎，能够执行向量和词汇搜索。它建立在 Apache Lucene 库之上。

本笔记本展示了如何使用 `Elasticsearch` 的聊天消息历史功能。

## 设置 Elasticsearch

设置 Elasticsearch 实例主要有两种方式：

1. **Elastic Cloud.** Elastic Cloud 是一个托管的 Elasticsearch 服务。注册 [免费试用](https://cloud.elastic.co/registration?storm=langchain-notebook)。

2. **本地 Elasticsearch 安装.** 通过本地运行 Elasticsearch 开始使用。最简单的方法是使用官方的 Elasticsearch Docker 镜像。有关更多信息，请参见 [Elasticsearch Docker 文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)。

## 安装依赖


```python
%pip install --upgrade --quiet  elasticsearch langchain langchain-community
```

## 认证

### 如何获取默认 "elastic" 用户的密码

要获取默认 "elastic" 用户的 Elastic Cloud 密码，请：
1. 登录到 [Elastic Cloud 控制台](https://cloud.elastic.co)
2. 转到 "安全" > "用户"
3. 找到 "elastic" 用户并点击 "编辑"
4. 点击 "重置密码"
5. 按照提示重置密码


### 使用用户名/密码

```python
es_username = os.environ.get("ES_USERNAME", "elastic")
es_password = os.environ.get("ES_PASSWORD", "change me...")

history = ElasticsearchChatMessageHistory(
    es_url=es_url,
    es_user=es_username,
    es_password=es_password,
    index="test-history",
    session_id="test-session"
)
```

### 如何获取 API 密钥

获取API密钥：
1. 登录到[Elastic Cloud控制台](https://cloud.elastic.co)
2. 打开`Kibana`并转到堆栈管理 > API密钥
3. 点击“创建API密钥”
4. 输入API密钥的名称并点击“创建”

### 使用API密钥

```python
es_api_key = os.environ.get("ES_API_KEY")

history = ElasticsearchChatMessageHistory(
    es_api_key=es_api_key,
    index="test-history",
    session_id="test-session"
)
```


## 初始化Elasticsearch客户端和聊天消息历史


```python
<!--IMPORTS:[{"imported": "ElasticsearchChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.elasticsearch.ElasticsearchChatMessageHistory.html", "title": "Elasticsearch"}]-->
import os

from langchain_community.chat_message_histories import (
    ElasticsearchChatMessageHistory,
)

es_url = os.environ.get("ES_URL", "http://localhost:9200")

# If using Elastic Cloud:
# es_cloud_id = os.environ.get("ES_CLOUD_ID")

# Note: see Authentication section for various authentication methods

history = ElasticsearchChatMessageHistory(
    es_url=es_url, index="test-history", session_id="test-session"
)
```

## 使用聊天消息历史


```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```
```output
indexing message content='hi!' additional_kwargs={} example=False
indexing message content='whats up?' additional_kwargs={} example=False
```