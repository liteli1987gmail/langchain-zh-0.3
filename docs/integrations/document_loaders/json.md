---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/json.ipynb
---
# JSONLoader

本笔记本提供了关于如何使用 JSON [文档加载器](https://python.langchain.com/docs/concepts/#document-loaders) 的快速概述。有关所有 JSONLoader 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.json_loader.JSONLoader.html)。

- TODO: 添加其他相关链接，例如关于底层 API 的信息等。

## 概述
### 集成细节

| 类 | 包名 | 本地 | 可序列化 | [JS 支持](https://js.langchain.com/docs/integrations/document_loaders/file_loaders/json/)|
| :--- | :--- | :---: | :---: |  :---: |
| [JSONLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.json_loader.JSONLoader.html) | [langchain_community](https://python.langchain.com/api_reference/community/index.html) | ✅ | ❌ | ✅ |
### 加载器特性
| 来源 | 文档懒加载 | 原生异步支持
| :---: | :---: | :---: |
| JSONLoader | ✅ | ❌ |

## 设置

要访问 JSON 文档加载器，您需要安装 `langchain-community` 集成包以及 ``jq`` python 包。

### 凭证

使用 `JSONLoader` 类不需要任何凭证。

如果您想获得模型调用的自动最佳跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

安装 **langchain_community** 和 **jq**：


```python
%pip install -qU langchain_community jq 
```

## 初始化

现在我们可以实例化我们的模型对象并加载文档：

- TODO: 使用相关参数更新模型实例化。


```python
<!--IMPORTS:[{"imported": "JSONLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.json_loader.JSONLoader.html", "title": "JSONLoader"}]-->
from langchain_community.document_loaders import JSONLoader

loader = JSONLoader(
    file_path="./example_data/facebook_chat.json",
    jq_schema=".messages[].content",
    text_content=False,
)
```

## 加载


```python
docs = loader.load()
docs[0]
```



```output
Document(metadata={'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat.json', 'seq_num': 1}, page_content='Bye!')
```



```python
print(docs[0].metadata)
```
```output
{'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat.json', 'seq_num': 1}
```
## 延迟加载


```python
pages = []
for doc in loader.lazy_load():
    pages.append(doc)
    if len(pages) >= 10:
        # do some paged operation, e.g.
        # index.upsert(pages)

        pages = []
```

## 从 JSON Lines 文件读取

如果您想从 JSON Lines 文件加载文档，请传递 `json_lines=True`
并指定 `jq_schema` 以从单个 JSON 对象中提取 `page_content`。


```python
loader = JSONLoader(
    file_path="./example_data/facebook_chat_messages.jsonl",
    jq_schema=".content",
    text_content=False,
    json_lines=True,
)

docs = loader.load()
print(docs[0])
```
```output
page_content='Bye!' metadata={'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat_messages.jsonl', 'seq_num': 1}
```
## 读取特定内容键

另一个选项是设置 `jq_schema='.'` 并提供 `content_key` 以仅加载特定内容：


```python
loader = JSONLoader(
    file_path="./example_data/facebook_chat_messages.jsonl",
    jq_schema=".",
    content_key="sender_name",
    json_lines=True,
)

docs = loader.load()
print(docs[0])
```
```output
page_content='User 2' metadata={'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat_messages.jsonl', 'seq_num': 1}
```
## 带有 jq 模式 `content_key` 的 JSON 文件

要使用 jq 模式中的 `content_key` 从 JSON 文件加载文档，请设置 `is_content_key_jq_parsable=True`。确保 `content_key` 兼容并且可以使用 jq 模式进行解析。


```python
loader = JSONLoader(
    file_path="./example_data/facebook_chat.json",
    jq_schema=".messages[]",
    content_key=".content",
    is_content_key_jq_parsable=True,
)

docs = loader.load()
print(docs[0])
```
```output
page_content='Bye!' metadata={'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat.json', 'seq_num': 1}
```
## 提取元数据

通常，我们希望将 JSON 文件中可用的元数据包含到我们从内容创建的文档中。

以下演示了如何使用 `JSONLoader` 提取元数据。

需要注意一些关键变化。在之前的示例中，我们没有收集元数据，我们直接在模式中指定了 `page_content` 的值可以从哪里提取。

在这个示例中，我们必须告诉加载器遍历 `messages` 字段中的记录。jq_schema 然后必须是 `.messages[]`

这使我们能够将记录（字典）传递给必须实现的 `metadata_func`。`metadata_func` 负责识别记录中哪些信息应包含在最终 `Document` 对象中存储的元数据中。

此外，我们现在必须在加载器中通过 `content_key` 参数明确指定记录中提取 `page_content` 值的键。


```python
# Define the metadata extraction function.
def metadata_func(record: dict, metadata: dict) -> dict:
    metadata["sender_name"] = record.get("sender_name")
    metadata["timestamp_ms"] = record.get("timestamp_ms")

    return metadata


loader = JSONLoader(
    file_path="./example_data/facebook_chat.json",
    jq_schema=".messages[]",
    content_key="content",
    metadata_func=metadata_func,
)

docs = loader.load()
print(docs[0].metadata)
```
```output
{'source': '/Users/isaachershenson/Documents/langchain/docs/docs/integrations/document_loaders/example_data/facebook_chat.json', 'seq_num': 1, 'sender_name': 'User 2', 'timestamp_ms': 1675597571851}
```
## API 参考

有关所有 JSONLoader 功能和配置的详细文档，请访问 API 参考： https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.json_loader.JSONLoader.html


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
