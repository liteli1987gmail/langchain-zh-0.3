---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/azure_ai_data.ipynb
---
# Azure AI 数据

> [Azure AI Studio](https://ai.azure.com/) 提供将数据资产上传到云存储并注册来自以下来源的现有数据资产的能力：
>
>- `Microsoft OneLake`
>- `Azure Blob Storage`
>- `Azure Data Lake gen 2`

这种方法相较于 `AzureBlobStorageContainerLoader` 和 `AzureBlobStorageFileLoader` 的好处在于，身份验证无缝处理云存储。您可以使用 *基于身份* 的数据访问控制或 *基于凭证* 的访问（例如 SAS 令牌、账户密钥）。在基于凭证的数据访问情况下，您无需在代码中指定机密或设置密钥库 - 系统会为您处理这些。

本笔记本介绍如何从 AI Studio 中的数据资产加载文档对象。


```python
%pip install --upgrade --quiet  azureml-fsspec, azure-ai-generative
```


```python
<!--IMPORTS:[{"imported": "AzureAIDataLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.azure_ai_data.AzureAIDataLoader.html", "title": "Azure AI Data"}]-->
from azure.ai.resources.client import AIClient
from azure.identity import DefaultAzureCredential
from langchain_community.document_loaders import AzureAIDataLoader
```


```python
# Create a connection to your project
client = AIClient(
    credential=DefaultAzureCredential(),
    subscription_id="<subscription_id>",
    resource_group_name="<resource_group_name>",
    project_name="<project_name>",
)
```


```python
# get the latest version of your data asset
data_asset = client.data.get(name="<data_asset_name>", label="latest")
```


```python
# load the data asset
loader = AzureAIDataLoader(url=data_asset.path)
```


```python
loader.load()
```



```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpaa9xl6ch/fake.docx'}, lookup_index=0)]
```


## 指定 glob 模式
您还可以指定 glob 模式，以更精细地控制要加载的文件。在下面的示例中，仅加载扩展名为 `pdf` 的文件。


```python
loader = AzureAIDataLoader(url=data_asset.path, glob="*.pdf")
```


```python
loader.load()
```



```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpujbkzf_l/fake.docx'}, lookup_index=0)]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
