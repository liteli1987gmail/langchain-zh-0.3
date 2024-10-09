---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/sagemaker-endpoint.ipynb
---
# SageMaker

让我们加载 `SageMaker Endpoints Embeddings` 类。该类可以在您托管自己的 Hugging Face 模型在 SageMaker 上时使用。

有关如何执行此操作的说明，请参见 [这里](https://www.philschmid.de/custom-inference-huggingface-sagemaker)。

**注意**：为了处理批量请求，您需要调整自定义 `inference.py` 脚本中的 `predict_fn()` 函数的返回行：

更改为

`return `

到：

`return `.


```python
!pip3 install langchain boto3
```


```python
<!--IMPORTS:[{"imported": "SagemakerEndpointEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.sagemaker_endpoint.SagemakerEndpointEmbeddings.html", "title": "SageMaker"}, {"imported": "EmbeddingsContentHandler", "source": "langchain_community.embeddings.sagemaker_endpoint", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.sagemaker_endpoint.EmbeddingsContentHandler.html", "title": "SageMaker"}]-->
import json
from typing import Dict, List

from langchain_community.embeddings import SagemakerEndpointEmbeddings
from langchain_community.embeddings.sagemaker_endpoint import EmbeddingsContentHandler


class ContentHandler(EmbeddingsContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, inputs: list[str], model_kwargs: Dict) -> bytes:
        """
        Transforms the input into bytes that can be consumed by SageMaker endpoint.
        Args:
            inputs: List of input strings.
            model_kwargs: Additional keyword arguments to be passed to the endpoint.
        Returns:
            The transformed bytes input.
        """
        # Example: inference.py expects a JSON string with a "inputs" key:
        input_str = json.dumps({"inputs": inputs, **model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> List[List[float]]:
        """
        Transforms the bytes output from the endpoint into a list of embeddings.
        Args:
            output: The bytes output from SageMaker endpoint.
        Returns:
            The transformed output - list of embeddings
        Note:
            The length of the outer list is the number of input strings.
            The length of the inner lists is the embedding dimension.
        """
        # Example: inference.py returns a JSON string with the list of
        # embeddings in a "vectors" key:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json["vectors"]


content_handler = ContentHandler()


embeddings = SagemakerEndpointEmbeddings(
    # credentials_profile_name="credentials-profile-name",
    endpoint_name="huggingface-pytorch-inference-2023-03-21-16-14-03-834",
    region_name="us-east-1",
    content_handler=content_handler,
)


# client = boto3.client(
#     "sagemaker-runtime",
#     region_name="us-west-2"
# )
# embeddings = SagemakerEndpointEmbeddings(
#     endpoint_name="huggingface-pytorch-inference-2023-03-21-16-14-03-834",
#     client=client
#     content_handler=content_handler,
# )
```


```python
query_result = embeddings.embed_query("foo")
```


```python
doc_results = embeddings.embed_documents(["foo"])
```


```python
doc_results
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
