---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/azure_blob_storage_file.ipynb
---
# Azure Blob 存储文件

>[Azure Files](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction) 提供完全托管的云文件共享，可以通过行业标准的服务器消息块 (`SMB`) 协议、网络文件系统 (`NFS`) 协议和 `Azure Files REST API` 访问。

这涵盖了如何从 Azure Files 加载文档对象。


```python
%pip install --upgrade --quiet  azure-storage-blob
```


```python
<!--IMPORTS:[{"imported": "AzureBlobStorageFileLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.azure_blob_storage_file.AzureBlobStorageFileLoader.html", "title": "Azure Blob Storage File"}]-->
from langchain_community.document_loaders import AzureBlobStorageFileLoader
```


```python
loader = AzureBlobStorageFileLoader(
    conn_str="<connection string>",
    container="<container name>",
    blob_name="<blob name>",
)
```


```python
loader.load()
```



```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmpxvave6wl/fake.docx'}, lookup_index=0)]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
