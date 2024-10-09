---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/airbyte.ipynb
---
# AirbyteLoader

> [Airbyte](https://github.com/airbytehq/airbyte) 是一个用于从API、数据库和文件到数据仓库和数据湖的ELT管道的数据集成平台。它拥有最大的ELT连接器目录，支持数据仓库和数据库。

这部分介绍如何将Airbyte中的任何源加载到LangChain文档中

## 安装

为了使用 `AirbyteLoader`，您需要安装 `langchain-airbyte` 集成包。


```python
% pip install -qU langchain-airbyte
```

注意：目前，`airbyte`库不支持Pydantic v2。
请降级到Pydantic v1以使用此包。

注意：此包目前还需要Python 3.10及以上版本。

## 加载文档

默认情况下，`AirbyteLoader`将从流中加载任何结构化数据并输出yaml格式的文档。


```python
from langchain_airbyte import AirbyteLoader

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
)
docs = loader.load()
print(docs[0].page_content[:500])
```
```output
\`\`\`yaml
academic_degree: PhD
address:
  city: Lauderdale Lakes
  country_code: FI
  postal_code: '75466'
  province: New Jersey
  state: Hawaii
  street_name: Stoneyford
  street_number: '1112'
age: 44
blood_type: "O\u2212"
created_at: '2004-04-02T13:05:27+00:00'
email: bread2099+1@outlook.com
gender: Fluid
height: '1.62'
id: 1
language: Belarusian
name: Moses
nationality: Dutch
occupation: Track Worker
telephone: 1-467-194-2318
title: M.Sc.Tech.
updated_at: '2024-02-27T16:41:01+00:00'
weight: 6
```
您还可以指定自定义提示词模板来格式化文档：


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "AirbyteLoader"}]-->
from langchain_core.prompts import PromptTemplate

loader_templated = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 10},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)
docs_templated = loader_templated.load()
print(docs_templated[0].page_content)
```
```output
My name is Verdie and I am 1.73 meters tall.
```
## 懒加载文档

`AirbyteLoader`的一个强大功能是能够从上游源加载大型文档。当处理大型数据集时，默认的`.load()`行为可能会很慢且占用大量内存。为避免这种情况，您可以使用`.lazy_load()`方法以更节省内存的方式加载文档。


```python
import time

loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

start_time = time.time()
my_iterator = loader.lazy_load()
print(
    f"Just calling lazy load is quick! This took {time.time() - start_time:.4f} seconds"
)
```
```output
Just calling lazy load is quick! This took 0.0001 seconds
```
您可以在文档被生成时进行迭代：


```python
for doc in my_iterator:
    print(doc.page_content)
```
```output
My name is Andera and I am 1.91 meters tall.
My name is Jody and I am 1.85 meters tall.
My name is Zonia and I am 1.53 meters tall.
```
您还可以使用`.alazy_load()`以异步方式懒加载文档：


```python
loader = AirbyteLoader(
    source="source-faker",
    stream="users",
    config={"count": 3},
    template=PromptTemplate.from_template(
        "My name is {name} and I am {height} meters tall."
    ),
)

my_async_iterator = loader.alazy_load()

async for doc in my_async_iterator:
    print(doc.page_content)
```
```output
My name is Carmelina and I am 1.74 meters tall.
My name is Ali and I am 1.90 meters tall.
My name is Rochell and I am 1.83 meters tall.
```
## 配置

`AirbyteLoader` 可以通过以下选项进行配置：

- `source` (str, 必填): 要加载的 Airbyte 源的名称。
- `stream` (str, 必填): 要加载的流的名称 (Airbyte 源可以返回多个流)
- `config` (dict, 必填): Airbyte 源的配置
- `template` (PromptTemplate, 可选): 用于格式化文档的自定义提示词模板
- `include_metadata` (bool, 可选, 默认 True): 是否将所有字段作为元数据包含在输出文档中

大多数配置将位于 `config` 中，您可以在 [Airbyte 文档](https://docs.airbyte.com/integrations/) 中找到每个源的“配置字段参考”以获取具体的配置选项。


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
