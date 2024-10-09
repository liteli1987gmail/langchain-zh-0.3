---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/aws_s3_file.ipynb
---
# AWS S3 文件

>[亚马逊简单存储服务 (Amazon S3)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html) 是一种对象存储服务。

>[AWS S3 存储桶](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)

这涵盖了如何从 `AWS S3 文件` 对象加载文档对象。


```python
<!--IMPORTS:[{"imported": "S3FileLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.s3_file.S3FileLoader.html", "title": "AWS S3 File"}]-->
from langchain_community.document_loaders import S3FileLoader
```


```python
%pip install --upgrade --quiet  boto3
```


```python
loader = S3FileLoader("testing-hwc", "fake.docx")
```


```python
loader.load()
```



```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': 's3://testing-hwc/fake.docx'}, lookup_index=0)]
```


## 配置 AWS Boto3 客户端
您可以通过传递命名参数来配置 AWS [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) 客户端，
在创建 S3DirectoryLoader 时。
当 AWS 凭证无法设置为环境变量时，这非常有用。
请参阅可以配置的 [参数列表](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/core/session.html#boto3.session.Session)。


```python
loader = S3FileLoader(
    "testing-hwc", "fake.docx", aws_access_key_id="xxxx", aws_secret_access_key="yyyy"
)
```


```python
loader.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
