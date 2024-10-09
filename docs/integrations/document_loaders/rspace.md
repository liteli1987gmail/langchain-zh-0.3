---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/rspace.ipynb
---
本笔记本展示了如何使用RSpace文档加载器从RSpace电子实验室笔记导入研究笔记和文档到LangChain管道。
要开始，您需要一个RSpace账户和一个API密钥。

您可以在[https://community.researchspace.com](https://community.researchspace.com)上注册一个免费账户，或者使用您的机构RSpace。

您可以从您账户的个人资料页面获取RSpace API令牌。

您可以从您账户的个人资料页面获取RSpace API令牌。


```python
%pip install --upgrade --quiet  rspace_client
```

最好将您的RSpace API密钥存储为环境变量。

RSPACE_API_KEY=&lt;YOUR_KEY&gt;

您还需要设置RSpace安装的URL，例如：

RSPACE_URL=https://community.researchspace.com

如果您使用这些确切的环境变量名称，它们将被自动检测。


```python
<!--IMPORTS:[{"imported": "RSpaceLoader", "source": "langchain_community.document_loaders.rspace", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.rspace.RSpaceLoader.html", "title": "# replace these ids with some from your own research notes."}]-->
from langchain_community.document_loaders.rspace import RSpaceLoader
```

您可以从RSpace导入各种项目：

* 一个单独的RSpace结构化或基本文档。这将一对一映射到LangChain文档。
* 一个文件夹或笔记本。笔记本或文件夹中的所有文档都作为LangChain文档导入。
* 如果您在RSpace画廊中有PDF文件，这些也可以单独导入。在后台，将使用LangChain的PDF加载器，这为每个PDF页面创建一个LangChain文档。


```python
## replace these ids with some from your own research notes.
## Make sure to use  global ids (with the 2 character prefix). This helps the loader know which API calls to make
## to RSpace API.

rspace_ids = ["NB1932027", "FL1921314", "SD1932029", "GL1932384"]
for rs_id in rspace_ids:
    loader = RSpaceLoader(global_id=rs_id)
    docs = loader.load()
    for doc in docs:
        ## the name and ID are added to the 'source' metadata property.
        print(doc.metadata)
        print(doc.page_content[:500])
```

如果您不想使用上述环境变量，可以将这些传递给RSpaceLoader


```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
