---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/nuclia.ipynb
---
# Nuclia

>[Nuclia](https://nuclia.com) 自动从任何内部和外部来源自动索引您的非结构化数据，提供优化的搜索结果和生成的答案。它可以处理视频和音频转录、图像内容提取和文档解析。

>`Nuclia Understanding API` 支持处理非结构化数据，包括文本、网页、文档和音频/视频内容。它提取所有文本，无论它们在哪里（在需要时使用语音转文本或OCR），还提取元数据、嵌入文件（如PDF中的图像）和网页链接。如果启用机器学习，它会识别实体，提供内容摘要并为所有句子生成嵌入。


## 设置

要使用 `Nuclia Understanding API`，您需要拥有一个Nuclia账户。您可以在 [https://nuclia.cloud](https://nuclia.cloud) 免费创建一个，然后 [创建一个NUA密钥](https://docs.nuclia.dev/docs/docs/using/understanding/intro)。


```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```


```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

## 示例

要使用 Nuclia 文档加载器，您需要实例化一个 `NucliaUnderstandingAPI` 工具：


```python
<!--IMPORTS:[{"imported": "NucliaUnderstandingAPI", "source": "langchain_community.tools.nuclia", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.nuclia.tool.NucliaUnderstandingAPI.html", "title": "Nuclia"}]-->
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```


```python
<!--IMPORTS:[{"imported": "NucliaLoader", "source": "langchain_community.document_loaders.nuclia", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.nuclia.NucliaLoader.html", "title": "Nuclia"}]-->
from langchain_community.document_loaders.nuclia import NucliaLoader

loader = NucliaLoader("./interview.mp4", nua)
```

您现在可以在循环中调用 `load` 文档，直到获取到文档。


```python
import time

pending = True
while pending:
    time.sleep(15)
    docs = loader.load()
    if len(docs) > 0:
        print(docs[0].page_content)
        print(docs[0].metadata)
        pending = False
    else:
        print("waiting...")
```

## 检索到的信息

Nuclia 返回以下信息：

- 文件元数据
- 提取的文本
- 嵌套文本（如嵌入图像中的文本）
- 段落和句子的分割（由其首尾字符的位置定义，以及视频或音频文件的开始时间和结束时间）
- 链接
- 缩略图
- 嵌入文件

注意：

生成的文件（缩略图、提取的嵌入文件等）作为一个令牌提供。您可以通过 [`/processing/download` 端点](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get) 下载它们。

此外，在任何级别，如果某个属性超过一定大小，它将被放入一个可下载的文件中，并在文档中用文件指针替换。其内容将是 `{"file": {"uri": "JWT_TOKEN"}}`。规则是，如果消息的大小超过 1000000 个字符，最大的部分将被移动到可下载的文件中。首先，压缩过程将针对向量。如果这还不够，它将针对大型字段元数据，最后将针对提取的文本。



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
