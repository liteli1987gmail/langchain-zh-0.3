---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/nuclia_transformer.ipynb
---
# Nuclia

>[Nuclia](https://nuclia.com) 自动从任何内部和外部来源自动索引您的非结构化数据，提供优化的搜索结果和生成的答案。它可以处理视频和音频转录、图像内容提取和文档解析。

`Nuclia Understanding API` 文档转换器将文本拆分为段落和句子，识别实体，提供文本摘要，并为所有句子生成嵌入。

要使用 Nuclia Understanding API，您需要拥有一个 Nuclia 账户。您可以在 [https://nuclia.cloud](https://nuclia.cloud) 免费创建一个，然后 [创建一个 NUA 密钥](https://docs.nuclia.dev/docs/docs/using/understanding/intro)。

from langchain_community.document_transformers.nuclia_text_transform import NucliaTextTransformer


```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```


```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

要使用Nuclia文档转换器，您需要实例化一个`NucliaUnderstandingAPI`工具，并将`enable_ml`设置为`True`：


```python
<!--IMPORTS:[{"imported": "NucliaUnderstandingAPI", "source": "langchain_community.tools.nuclia", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.nuclia.tool.NucliaUnderstandingAPI.html", "title": "Nuclia"}]-->
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

Nuclia文档转换器必须以异步模式调用，因此您需要使用`atransform_documents`方法：


```python
<!--IMPORTS:[{"imported": "NucliaTextTransformer", "source": "langchain_community.document_transformers.nuclia_text_transform", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.nuclia_text_transform.NucliaTextTransformer.html", "title": "Nuclia"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Nuclia"}]-->
import asyncio

from langchain_community.document_transformers.nuclia_text_transform import (
    NucliaTextTransformer,
)
from langchain_core.documents import Document


async def process():
    documents = [
        Document(page_content="<TEXT 1>", metadata={}),
        Document(page_content="<TEXT 2>", metadata={}),
        Document(page_content="<TEXT 3>", metadata={}),
    ]
    nuclia_transformer = NucliaTextTransformer(nua)
    transformed_documents = await nuclia_transformer.atransform_documents(documents)
    print(transformed_documents)


asyncio.run(process())
```
