---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/ibm_watsonx.ipynb
---
# IBM watsonx.ai

>WatsonxEmbeddings 是 IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) 基础模型的封装。

本示例展示了如何使用 `LangChain` 与 `watsonx.ai` 模型进行通信。

## 设置

安装包 `langchain-ibm`。


```python
!pip install -qU langchain-ibm
```

此单元定义了与watsonx嵌入模型一起使用所需的WML凭据。

**操作：** 提供IBM Cloud用户API密钥。有关详细信息，请参见
[文档](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)。


```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

此外，您可以将其他机密作为环境变量传递。


```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## 加载模型

您可能需要根据不同模型调整模型`参数`。


```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

使用先前设置的参数初始化`WatsonxEmbeddings`类。


**注意：**

- 为API调用提供上下文，您必须添加`project_id`或`space_id`。有关更多信息，请参见[文档](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)。
- 根据您所配置服务实例的区域，使用[这里](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)描述的其中一个网址。

在这个例子中，我们将使用 `project_id` 和达拉斯网址。


您需要指定将用于推理的 `model_id`。


```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

或者，您可以使用 Cloud Pak for Data 凭据。有关详细信息，请参见 [文档](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)。


```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

对于某些要求，可以选择将 IBM 的 [`APIClient`](https://ibm.github.io/watsonx-ai-python-sdk/base.html#apiclient) 对象传递到 `WatsonxEmbeddings` 类中。


```python
from ibm_watsonx_ai import APIClient

api_client = APIClient(...)

watsonx_llm = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    watsonx_client=api_client,
)
```

## 用法

### 嵌入查询


```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```



```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```


### 嵌入文档


```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```



```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
