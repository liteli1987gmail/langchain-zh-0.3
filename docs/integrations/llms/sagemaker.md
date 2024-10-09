---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/sagemaker.ipynb
---
# SageMakerEndpoint

[Amazon SageMaker](https://aws.amazon.com/sagemaker/) 是一个可以构建、训练和部署适用于任何用例的机器学习 (ML) 模型的系统，提供完全托管的基础设施、工具和工作流程。

本笔记本介绍了如何使用托管在 `SageMaker endpoint` 上的 LLM。


```python
!pip3 install langchain boto3
```

## 设置

您必须设置以下 `SagemakerEndpoint` 调用的必需参数：
- `endpoint_name`: 部署的 Sagemaker 模型的端点名称。
在 AWS 区域内必须是唯一的。
- `credentials_profile_name`: ~/.aws/credentials 或 ~/.aws/config 文件中配置文件的名称，
该文件中指定了访问密钥或角色信息。
如果未指定，将使用默认凭证配置文件，或者如果在 EC2 实例上，
将使用 IMDS 中的凭证。
请参见：https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html

## 示例


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "SageMakerEndpoint"}]-->
from langchain_core.documents import Document
```


```python
example_doc_1 = """
Peter and Elizabeth took a taxi to attend the night party in the city. While in the party, Elizabeth collapsed and was rushed to the hospital.
Since she was diagnosed with a brain injury, the doctor told Peter to stay besides her until she gets well.
Therefore, Peter stayed with her at the hospital for 3 days without leaving.
"""

docs = [
    Document(
        page_content=example_doc_1,
    )
]
```

## 使用外部 boto3 会话进行初始化的示例

### 用于跨账户场景


```python
<!--IMPORTS:[{"imported": "load_qa_chain", "source": "langchain.chains.question_answering", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.question_answering.chain.load_qa_chain.html", "title": "SageMakerEndpoint"}, {"imported": "SagemakerEndpoint", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sagemaker_endpoint.SagemakerEndpoint.html", "title": "SageMakerEndpoint"}, {"imported": "LLMContentHandler", "source": "langchain_community.llms.sagemaker_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sagemaker_endpoint.LLMContentHandler.html", "title": "SageMakerEndpoint"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "SageMakerEndpoint"}]-->
import json
from typing import Dict

import boto3
from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate

query = """How long was Elizabeth hospitalized?
"""

prompt_template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)

roleARN = "arn:aws:iam::123456789:role/cross-account-role"
sts_client = boto3.client("sts")
response = sts_client.assume_role(
    RoleArn=roleARN, RoleSessionName="CrossAccountSession"
)

client = boto3.client(
    "sagemaker-runtime",
    region_name="us-west-2",
    aws_access_key_id=response["Credentials"]["AccessKeyId"],
    aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
    aws_session_token=response["Credentials"]["SessionToken"],
)


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps({"inputs": prompt, "parameters": model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generated_text"]


content_handler = ContentHandler()

chain = load_qa_chain(
    llm=SagemakerEndpoint(
        endpoint_name="endpoint-name",
        client=client,
        model_kwargs={"temperature": 1e-10},
        content_handler=content_handler,
    ),
    prompt=PROMPT,
)

chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```


```python
<!--IMPORTS:[{"imported": "load_qa_chain", "source": "langchain.chains.question_answering", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.question_answering.chain.load_qa_chain.html", "title": "SageMakerEndpoint"}, {"imported": "SagemakerEndpoint", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sagemaker_endpoint.SagemakerEndpoint.html", "title": "SageMakerEndpoint"}, {"imported": "LLMContentHandler", "source": "langchain_community.llms.sagemaker_endpoint", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sagemaker_endpoint.LLMContentHandler.html", "title": "SageMakerEndpoint"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "SageMakerEndpoint"}]-->
import json
from typing import Dict

from langchain.chains.question_answering import load_qa_chain
from langchain_community.llms import SagemakerEndpoint
from langchain_community.llms.sagemaker_endpoint import LLMContentHandler
from langchain_core.prompts import PromptTemplate

query = """How long was Elizabeth hospitalized?
"""

prompt_template = """Use the following pieces of context to answer the question at the end.

{context}

Question: {question}
Answer:"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)


class ContentHandler(LLMContentHandler):
    content_type = "application/json"
    accepts = "application/json"

    def transform_input(self, prompt: str, model_kwargs: Dict) -> bytes:
        input_str = json.dumps({"inputs": prompt, "parameters": model_kwargs})
        return input_str.encode("utf-8")

    def transform_output(self, output: bytes) -> str:
        response_json = json.loads(output.read().decode("utf-8"))
        return response_json[0]["generated_text"]


content_handler = ContentHandler()

chain = load_qa_chain(
    llm=SagemakerEndpoint(
        endpoint_name="endpoint-name",
        credentials_profile_name="credentials-profile-name",
        region_name="us-west-2",
        model_kwargs={"temperature": 1e-10},
        content_handler=content_handler,
    ),
    prompt=PROMPT,
)

chain({"input_documents": docs, "question": query}, return_only_outputs=True)
```


## 相关内容

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
