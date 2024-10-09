---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/huawei_obs_directory.ipynb
---
# 华为 OBS 目录
以下代码演示了如何将华为 OBS（对象存储服务）中的对象加载为文档。


```python
# Install the required package
# pip install esdk-obs-python
```


```python
<!--IMPORTS:[{"imported": "OBSDirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.obs_directory.OBSDirectoryLoader.html", "title": "Huawei OBS Directory"}]-->
from langchain_community.document_loaders import OBSDirectoryLoader
```


```python
endpoint = "your-endpoint"
```


```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```


```python
loader.load()
```

## 指定加载的前缀
如果您想从存储桶中加载具有特定前缀的对象，可以使用以下代码：


```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```


```python
loader.load()
```

## 从ECS获取认证信息
如果您的LangChain部署在华为云ECS上，并且[已设置代理](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)，加载器可以直接从ECS获取安全令牌，而无需访问密钥和秘密密钥。


```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```


```python
loader.load()
```

## 使用公共存储桶
如果您的存储桶策略允许匿名访问（匿名用户具有`listBucket`和`GetObject`权限），您可以直接加载对象，而无需配置`config`参数。


```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```


```python
loader.load()
```


## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器[操作指南](/docs/how_to/#document-loaders)
