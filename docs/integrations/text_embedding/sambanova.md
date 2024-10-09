---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/sambanova.ipynb
---
# SambaNova

**[SambaNova](https://sambanova.ai/)** 的 [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform) 是一个运行您自己的开源模型的平台

本示例介绍如何使用 LangChain 与 SambaNova 嵌入模型进行交互

## SambaStudio

**SambaStudio** 允许您训练、运行批量推理任务，并部署在线推理端点，以运行您自己微调的开源模型。

部署模型需要一个 SambaStudio 环境。获取更多信息请访问 [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)

注册您的环境变量：


```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_base_uri = "<Your SambaStudio environment URI>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URI"] = sambastudio_base_uri
os.environ["SAMBASTUDIO_EMBEDDINGS_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_EMBEDDINGS_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_EMBEDDINGS_API_KEY"] = sambastudio_api_key
```

直接从LangChain调用SambaStudio托管的嵌入！


```python
<!--IMPORTS:[{"imported": "SambaStudioEmbeddings", "source": "langchain_community.embeddings.sambanova", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.sambanova.SambaStudioEmbeddings.html", "title": "SambaNova"}]-->
from langchain_community.embeddings.sambanova import SambaStudioEmbeddings

embeddings = SambaStudioEmbeddings()

text = "Hello, this is a test"
result = embeddings.embed_query(text)
print(result)

texts = ["Hello, this is a test", "Hello, this is another test"]
results = embeddings.embed_documents(texts)
print(results)
```

您可以手动传递端点参数，并手动设置在SambaStudio嵌入端点中的批量大小


```python
embeddings = SambaStudioEmbeddings(
    sambastudio_embeddings_base_url=sambastudio_base_url,
    sambastudio_embeddings_base_uri=sambastudio_base_uri,
    sambastudio_embeddings_project_id=sambastudio_project_id,
    sambastudio_embeddings_endpoint_id=sambastudio_endpoint_id,
    sambastudio_embeddings_api_key=sambastudio_api_key,
    batch_size=32,  # set depending on the deployed endpoint configuration
)
```

或者您可以使用部署的CoE中包含的嵌入模型专家


```python
embeddings = SambaStudioEmbeddings(
    batch_size=1,
    model_kwargs={
        "select_expert": "e5-mistral-7b-instruct",
    },
)
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
