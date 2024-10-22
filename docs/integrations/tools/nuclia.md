---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/nuclia.ipynb
---
# Nuclia 理解

>[Nuclia](https://nuclia.com) 自动索引来自任何内部和外部来源的非结构化数据，提供优化的搜索结果和生成的答案。它可以处理视频和音频转录、图像内容提取和文档解析。

`Nuclia 理解 API` 支持处理非结构化数据，包括文本、网页、文档和音频/视频内容。它提取所有文本，无论其位置如何（在需要时使用语音转文本或OCR），识别实体，提取元数据、嵌入文件（如PDF中的图像）和网页链接。它还提供内容摘要。

要使用 `Nuclia 理解 API`，您需要拥有一个 `Nuclia` 账户。您可以在 [https://nuclia.cloud](https://nuclia.cloud) 免费创建一个，然后 [创建一个 NUA 密钥](https://docs.nuclia.dev/docs/docs/using/understanding/intro)。


```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```


```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```


```python
<!--IMPORTS:[{"imported": "NucliaUnderstandingAPI", "source": "langchain_community.tools.nuclia", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.nuclia.tool.NucliaUnderstandingAPI.html", "title": "Nuclia Understanding"}]-->
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

您可以使用 `push` 操作将文件推送到 Nuclia Understanding API。由于处理是异步进行的，结果可能会以与文件推送顺序不同的顺序返回。这就是为什么您需要提供一个 `id` 来将结果与相应的文件匹配。


```python
nua.run({"action": "push", "id": "1", "path": "./report.docx"})
nua.run({"action": "push", "id": "2", "path": "./interview.mp4"})
```

您现在可以在循环中调用 `pull` 操作，直到获得 JSON 格式的结果。


```python
import time

pending = True
data = None
while pending:
    time.sleep(15)
    data = nua.run({"action": "pull", "id": "1", "path": None})
    if data:
        print(data)
        pending = False
    else:
        print("waiting...")
```

您也可以在 `async` 模式下一步完成，只需进行一次推送，它将等待直到结果被拉取：


```python
import asyncio


async def process():
    data = await nua.arun(
        {"action": "push", "id": "1", "path": "./talk.mp4", "text": None}
    )
    print(data)


asyncio.run(process())
```

## 检索到的信息

Nuclia 返回以下信息：

- 文件元数据
- 提取的文本
- 嵌套文本（如嵌入图像中的文本）
- 摘要（仅当 `enable_ml` 设置为 `True` 时）
- 段落和句子的分割（由其第一个和最后一个字符的位置定义，以及视频或音频文件的开始时间和结束时间）
- 命名实体：人、日期、地点、组织等（仅当 `enable_ml` 设置为 `True` 时）
- 链接
- 缩略图
- 嵌入文件
- 文本的向量表示（仅当 `enable_ml` 设置为 `True` 时）

注意：

生成的文件（缩略图、提取的嵌入文件等）作为一个令牌提供。您可以通过 [`/processing/download` 端点](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get) 下载它们。

在任何级别，如果某个属性超过一定大小，它将被放入可下载文件中，并在文档中由文件指针替换。其内容将是 `{"file": {"uri": "JWT_TOKEN"}}`。规则是，如果消息的大小超过 1000000 个字符，最大的部分将被移动到可下载文件中。首先，压缩过程将针对向量。如果这还不够，它将针对大型字段元数据，最后将针对提取的文本。



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
