---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/tencent_cos_file.ipynb
---
# 腾讯云 COS 文件

> [腾讯云对象存储 (COS)](https://www.tencentcloud.com/products/cos) 是一个分布式
> 存储服务，允许您通过 HTTP/HTTPS 协议从任何地方存储任意数量的数据。
> `COS` 对数据结构或格式没有限制。它也没有桶大小限制和
> 分区管理，使其适用于几乎任何用例，例如数据传输、
> 数据处理和数据湖。`COS` 提供基于网页的控制台、多语言 SDK 和 API、
> 命令行工具和图形工具。它与 Amazon S3 API 兼容，允许您快速
> 访问社区工具和插件。

这涵盖了如何从 `腾讯云 COS 文件` 加载文档对象。


```python
%pip install --upgrade --quiet  cos-python-sdk-v5
```


```python
<!--IMPORTS:[{"imported": "TencentCOSFileLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.tencent_cos_file.TencentCOSFileLoader.html", "title": "Tencent COS File"}]-->
from langchain_community.document_loaders import TencentCOSFileLoader
from qcloud_cos import CosConfig
```


```python
conf = CosConfig(
    Region="your cos region",
    SecretId="your cos secret_id",
    SecretKey="your cos secret_key",
)
loader = TencentCOSFileLoader(conf=conf, bucket="you_cos_bucket", key="fake.docx")
```


```python
loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
