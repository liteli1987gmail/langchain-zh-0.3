---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/huawei_obs_file.ipynb
---
# 华为 OBS 文件
以下代码演示了如何将华为 OBS（对象存储服务）中的对象加载为文档。


```python
# Install the required package
# pip install esdk-obs-python
```


```python
<!--IMPORTS:[{"imported": "OBSFileLoader", "source": "langchain_community.document_loaders.obs_file", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.obs_file.OBSFileLoader.html", "title": "Huawei OBS File"}]-->
from langchain_community.document_loaders.obs_file import OBSFileLoader
```


```python
endpoint = "your-endpoint"
```


```python
from obs import ObsClient

obs_client = ObsClient(
    access_key_id="your-access-key",
    secret_access_key="your-secret-key",
    server=endpoint,
)
loader = OBSFileLoader("your-bucket-name", "your-object-key", client=obs_client)
```


```python
loader.load()
```

## 每个加载器具有单独的认证信息
如果您不需要在不同的加载器之间重用OBS连接，可以直接配置`config`。加载器将使用配置信息初始化其自己的OBS客户端。


```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```


```python
loader.load()
```

## 从ECS获取认证信息
如果您的LangChain部署在华为云ECS上，并且[已设置代理](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7)，加载器可以直接从ECS获取安全令牌，而无需访问密钥和秘密密钥。


```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```


```python
loader.load()
```

## 访问公开可访问的对象
如果您要访问的对象允许匿名用户访问（匿名用户具有`GetObject`权限），您可以直接加载该对象，而无需配置`config`参数。


```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```


```python
loader.load()
```


## 相关

- 文档加载器[概念指南](/docs/concepts/#document-loaders)
- 文档加载器[操作指南](/docs/how_to/#document-loaders)
