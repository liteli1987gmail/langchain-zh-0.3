---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/rockset.ipynb
---
# Rockset

> Rockset 是一个实时分析数据库，可以在没有操作负担的情况下对大量半结构化数据进行查询。使用 Rockset，摄取的数据在一秒内可查询，对该数据的分析查询通常在毫秒级别执行。Rockset 经过计算优化，适合用于服务高并发应用，适用于小于 100TB 的范围（或大于 100TB 的数据通过汇总处理）。

本笔记本演示了如何在 LangChain 中使用 Rockset 作为文档加载器。要开始，请确保您拥有 Rockset 账户和可用的 API 密钥。




## 设置环境

1. 前往 [Rockset 控制台](https://console.rockset.com/apikeys) 获取 API 密钥。从 [API 参考](https://rockset.com/docs/rest-api/#introduction) 中找到您的 API 区域。为了本笔记本的目的，我们假设您正在使用来自 `Oregon(us-west-2)` 的 Rockset。
2. 设置环境变量 `ROCKSET_API_KEY`。
3. 安装 Rockset Python 客户端，LangChain 将使用该客户端与 Rockset 数据库进行交互。


```python
%pip install --upgrade --quiet  rockset
```

# 加载文档
Rockset与LangChain的集成允许您通过SQL查询从Rockset集合中加载文档。为此，您必须构造一个`RocksetLoader`对象。以下是初始化`RocksetLoader`的示例代码片段。


```python
<!--IMPORTS:[{"imported": "RocksetLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.rocksetdb.RocksetLoader.html", "title": "Rockset"}]-->
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

在这里，您可以看到运行了以下查询：

```sql
SELECT * FROM langchain_demo LIMIT 3
```

集合中的`text`列用作页面内容，记录的`id`和`date`列用作元数据（如果您没有传递任何内容到`metadata_keys`，整个Rockset文档将作为元数据使用）。

要执行查询并访问结果`Document`的迭代器，请运行：


```python
loader.lazy_load()
```

要执行查询并一次性访问所有结果`Document`，请运行：


```python
loader.load()
```

以下是`loader.load()`的示例响应：
```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.", 
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.", 
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.", 
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## 使用多个列作为内容

您可以选择使用多个列作为内容：


```python
<!--IMPORTS:[{"imported": "RocksetLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.rocksetdb.RocksetLoader.html", "title": "Rockset"}]-->
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

假设“sentence1”字段为“这是第一句。”，而“sentence2”字段为“这是第二句。”，则结果`Document`的`page_content`将是：

```
This is the first sentence.
This is the second sentence.
```

您可以通过在 `RocksetLoader` 构造函数中设置 `content_columns_joiner` 参数来定义自己的函数以连接内容列。`content_columns_joiner` 是一个方法，它接受一个 `List[Tuple[str, Any]]` 作为参数，表示一个包含（列名，列值）元组的列表。默认情况下，这是一个将每个列值用换行符连接的方法。

例如，如果您想用空格而不是换行符连接 sentence1 和 sentence2，您可以这样设置 `content_columns_joiner`：


```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

生成的 `Document` 的 `page_content` 将是：

```
This is the first sentence. This is the second sentence.
```

通常情况下，您希望在 `page_content` 中包含列名。您可以这样做：


```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

这将导致以下 `page_content`：

```
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
