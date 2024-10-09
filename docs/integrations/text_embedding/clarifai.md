---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/clarifai.ipynb
---
# Clarifai

>[Clarifai](https://www.clarifai.com/) 是一个人工智能平台，提供完整的人工智能生命周期，包括数据探索、数据标注、模型训练、评估和推理。

本示例介绍如何使用 LangChain 与 `Clarifai` [模型](https://clarifai.com/explore/models) 进行交互。特别是文本嵌入模型可以在 [这里](https://clarifai.com/explore/models?page=1&perPage=24&filterData=%5B%7B%22field%22%3A%22model_type_id%22%2C%22value%22%3A%5B%22text-embedder%22%5D%7D%5D) 找到。

要使用 Clarifai，您必须拥有一个账户和一个个人访问令牌 (PAT) 密钥。
[在这里检查](https://clarifai.com/settings/security) 获取或创建 PAT。

# 依赖项


```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```

# 导入
在这里我们将设置个人访问令牌。您可以在您的Clarifai帐户的[设置/安全](https://clarifai.com/settings/security)中找到您的PAT。


```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Clarifai"}, {"imported": "ClarifaiEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.clarifai.ClarifaiEmbeddings.html", "title": "Clarifai"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Clarifai"}]-->
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.embeddings import ClarifaiEmbeddings
from langchain_core.prompts import PromptTemplate
```

# 输入
创建一个提示词模板以用于LLM链：


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# 设置
将用户ID和应用程序ID设置为模型所在的应用程序。您可以在https://clarifai.com/explore/models上找到公共模型的列表。

您还需要初始化模型ID，如果需要，还要初始化模型版本ID。一些模型有多个版本，您可以选择适合您任务的版本。


```python
USER_ID = "clarifai"
APP_ID = "main"
MODEL_ID = "BAAI-bge-base-en-v15"
MODEL_URL = "https://clarifai.com/clarifai/main/models/BAAI-bge-base-en-v15"

# Further you can also provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
```


```python
# Initialize a Clarifai embedding model
embeddings = ClarifaiEmbeddings(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)

# Initialize a clarifai embedding model using model URL
embeddings = ClarifaiEmbeddings(model_url=MODEL_URL)

# Alternatively you can initialize clarifai class with pat argument.
```


```python
text = "roses are red violets are blue."
text2 = "Make hay while the sun shines."
```

您可以使用embed_query函数嵌入单行文本！


```python
query_result = embeddings.embed_query(text)
```

要嵌入文本/文档列表，请使用embed_documents函数。


```python
doc_result = embeddings.embed_documents([text, text2])
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用手册](/docs/how_to/#embedding-models)
