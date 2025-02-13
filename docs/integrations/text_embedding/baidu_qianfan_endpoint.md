---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/baidu_qianfan_endpoint.ipynb
---
# 百度千帆

百度AI云千帆平台是一个为企业开发者提供的一站式大型模型开发和服务运营平台。千帆不仅提供包括文心一言（ERNIE-Bot）模型和第三方开源模型，还提供各种AI开发工具和整套开发环境，方便客户轻松使用和开发大型模型应用。

基本上，这些模型分为以下几种类型：

- 嵌入
- 聊天
- 完成

在这个笔记本中，我们将介绍如何主要在`嵌入`对应的`langchain/embeddings`包中使用langchain与[千帆](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)：
对应于langchain中的包`langchain/embeddings`：



## API初始化

要使用基于百度千帆的LLM服务，您必须初始化这些参数：

您可以选择在环境变量中初始化 AK、SK，或者初始化参数：

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```



```python
<!--IMPORTS:[{"imported": "QianfanEmbeddingsEndpoint", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.baidu_qianfan_endpoint.QianfanEmbeddingsEndpoint.html", "title": "Baidu Qianfan"}]-->
"""For basic init and call"""
import os

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

os.environ["QIANFAN_AK"] = "your_ak"
os.environ["QIANFAN_SK"] = "your_sk"

embed = QianfanEmbeddingsEndpoint(
    # qianfan_ak='xxx',
    # qianfan_sk='xxx'
)
res = embed.embed_documents(["hi", "world"])


async def aioEmbed():
    res = await embed.aembed_query("qianfan")
    print(res[:8])


await aioEmbed()


async def aioEmbedDocs():
    res = await embed.aembed_documents(["hi", "world"])
    for r in res:
        print("", r[:8])


await aioEmbedDocs()
```
```output
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: trying to refresh access_token
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: successfully refresh access_token
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: requesting llm api endpoint: /embeddings/embedding-v1
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: async requesting llm api endpoint: /embeddings/embedding-v1
[INFO] [09-15 20:01:35] logging.py:55 [t:140292313159488]: async requesting llm api endpoint: /embeddings/embedding-v1
``````output
[-0.03313107788562775, 0.052325375378131866, 0.04951248690485954, 0.0077608139254152775, -0.05907672271132469, -0.010798933915793896, 0.03741293027997017, 0.013969100080430508]
 [0.0427522286772728, -0.030367236584424973, -0.14847028255462646, 0.055074431002140045, -0.04177454113960266, -0.059512972831726074, -0.043774791061878204, 0.0028191760648041964]
 [0.03803155943751335, -0.013231384567916393, 0.0032379645854234695, 0.015074018388986588, -0.006529552862048149, -0.13813287019729614, 0.03297128155827522, 0.044519297778606415]
```
## 在千帆中使用不同的模型

如果您想基于Ernie Bot或第三方开源模型部署自己的模型，可以按照以下步骤进行：

- 1. （可选，如果模型已包含在默认模型中，请跳过此步骤）在千帆控制台中部署您的模型，获取您自己的定制部署端点。
- 2. 在初始化中设置名为`endpoint`的字段：


```python
embed = QianfanEmbeddingsEndpoint(model="bge_large_zh", endpoint="bge_large_zh")

res = embed.embed_documents(["hi", "world"])
for r in res:
    print(r[:8])
```
```output
[INFO] [09-15 20:01:40] logging.py:55 [t:140292313159488]: requesting llm api endpoint: /embeddings/bge_large_zh
``````output
[-0.0001582596160005778, -0.025089964270591736, -0.03997539356350899, 0.013156415894627571, 0.000135212714667432, 0.012428865768015385, 0.016216561198234558, -0.04126659780740738]
[0.0019113451708108187, -0.008625439368188381, -0.0531032420694828, -0.0018436014652252197, -0.01818147301673889, 0.010310115292668343, -0.008867680095136166, -0.021067561581730843]
```

## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
