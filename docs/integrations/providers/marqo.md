# Marqo

本页面介绍如何在LangChain中使用Marqo生态系统。

### **什么是Marqo?**

Marqo是一个张量搜索引擎，使用存储在内存HNSW索引中的嵌入来实现尖端的搜索速度。Marqo可以通过水平索引分片扩展到数亿文档索引，并允许异步和非阻塞的数据上传和搜索。Marqo使用来自PyTorch、Huggingface、OpenAI等的最新机器学习模型。您可以从预配置的模型开始，或使用您自己的模型。内置的ONNX支持和转换允许在CPU和GPU上实现更快的推理和更高的吞吐量。

由于Marqo包含自己的推理，您的文档可以混合文本和图像，您可以将Marqo索引与来自其他系统的数据引入LangChain生态系统，而无需担心您的嵌入是否兼容。

Marqo的部署灵活，您可以使用我们的docker镜像自行开始，或[联系我们了解我们的托管云服务！](https://www.marqo.ai/pricing)

要使用我们的docker镜像在本地运行Marqo，[请参见我们的入门指南。](https://docs.marqo.ai/latest/)

## 安装和设置
- 使用`pip install marqo`安装Python SDK

## 包装器

### 向量存储

存在一个围绕 Marqo 索引的包装器，允许您在向量存储框架内使用它们。Marqo 让您可以从一系列模型中选择以生成嵌入，并暴露一些预处理配置。

Marqo 向量存储还可以与现有的多模态索引一起工作，其中您的文档包含图像和文本的混合，更多信息请参阅 [我们的文档](https://docs.marqo.ai/latest/#multi-modal-and-cross-modal-search)。请注意，使用现有的多模态索引实例化 Marqo 向量存储将禁用通过 langchain 向量存储 `add_texts` 方法添加任何新文档的能力。

要导入此向量存储：
```python
from langchain_community.vectorstores import Marqo
```

有关 Marqo 包装器及其一些独特功能的更详细指南，请参见 [此笔记本](/docs/integrations/vectorstores/marqo)
