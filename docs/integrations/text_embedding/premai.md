---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/premai.ipynb
---
# PremAI

[PremAI](https://premai.io/) 是一个一体化平台，简化了由生成式人工智能驱动的强大、生产就绪应用程序的创建。通过简化开发过程，PremAI 使您能够专注于提升用户体验和推动应用程序的整体增长。您可以快速开始使用我们的平台 [这里](https://docs.premai.io/quick-start)。

### 安装和设置

我们首先安装 `langchain` 和 `premai-sdk`。您可以输入以下命令进行安装：

```bash
pip install premai langchain
```

在继续之前，请确保您已在PremAI上创建了帐户并创建了项目。如果没有，请参考[快速入门](https://docs.premai.io/introduction)指南以开始使用PremAI平台。创建您的第一个项目并获取您的API密钥。

## PremEmbeddings

在本节中，我们将讨论如何使用`PremEmbeddings`通过LangChain访问不同的嵌入模型。让我们先导入我们的模块并设置我们的API密钥。


```python
<!--IMPORTS:[{"imported": "PremAIEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.premai.PremAIEmbeddings.html", "title": "PremAI"}]-->
# Let's start by doing some imports and define our embedding object

from langchain_community.embeddings import PremAIEmbeddings
```

一旦我们导入了所需的模块，让我们设置我们的客户端。现在假设我们的`project_id`是`8`。但请确保使用您的项目ID，否则会抛出错误。

> 注意：与[ChatPremAI](https://python.langchain.com/v0.1/docs/integrations/chat/premai/)不同，设置`model_name`参数对于PremAIEmbeddings是强制性的。


```python
import getpass
import os

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```


```python
model = "text-embedding-3-large"
embedder = PremAIEmbeddings(project_id=8, model=model)
```

我们支持许多最先进的嵌入模型。您可以在[这里](https://docs.premai.io/get-started/supported-models)查看我们支持的LLMs和嵌入模型列表。现在让我们选择`text-embedding-3-large`模型作为本示例。


```python
query = "Hello, this is a test query"
query_result = embedder.embed_query(query)

# Let's print the first five elements of the query embedding vector

print(query_result[:5])
```
```output
[-0.02129288576543331, 0.0008162345038726926, -0.004556538071483374, 0.02918623760342598, -0.02547479420900345]
```
最后，让我们嵌入一个文档


```python
documents = ["This is document1", "This is document2", "This is document3"]

doc_result = embedder.embed_documents(documents)

# Similar to previous result, let's print the first five element
# of the first document vector

print(doc_result[0][:5])
```
```output
[-0.0030691148713231087, -0.045334383845329285, -0.0161729846149683, 0.04348714277148247, -0.0036920777056366205]
```

## 相关

- 嵌入模型[概念指南](/docs/concepts/#embedding-models)
- 嵌入模型[操作指南](/docs/how_to/#embedding-models)
