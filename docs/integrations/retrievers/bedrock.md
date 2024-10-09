---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/bedrock.ipynb
sidebar_label: Bedrock (Knowledge Bases)
---
# Bedrock (知识库) 检索器

本指南将帮助您开始使用 AWS 知识库 [检索器](/docs/concepts/#retrievers)。

[Amazon Bedrock 的知识库](https://aws.amazon.com/bedrock/knowledge-bases/) 是亚马逊网络服务 (AWS) 的一项服务，允许您通过使用私有数据来定制 FM 响应，快速构建 RAG 应用程序。

实现 `RAG` 需要组织执行多个繁琐的步骤，将数据转换为嵌入（向量），将嵌入存储在专用的向量数据库中，并构建自定义集成以在数据库中搜索和检索与用户查询相关的文本。这可能耗时且效率低下。

使用 `Amazon Bedrock 的知识库`，只需指向您数据在 `Amazon S3` 中的位置，`Amazon Bedrock 的知识库` 将处理整个数据摄取工作流到您的向量数据库。如果您没有现有的向量数据库，Amazon Bedrock 会为您创建一个 Amazon OpenSearch Serverless 向量存储。对于检索，请通过 Retrieve API 使用 Langchain - Amazon Bedrock 集成，从知识库中检索与用户查询相关的结果。

### 集成细节

import {ItemTable} from "@theme/FeatureTables";

<ItemTable category="document_retrievers" item="AmazonKnowledgeBasesRetriever" />


## 设置

知识库可以通过 [AWS 控制台](https://aws.amazon.com/console/) 或使用 [AWS SDK](https://aws.amazon.com/developer/tools/) 进行配置。我们需要 `knowledge_base_id` 来实例化检索器。

如果您想从单个查询中获取自动跟踪，您还可以通过取消注释以下内容来设置您的 [LangSmith](https://docs.smith.langchain.com/) API 密钥：


```python
# os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Enter your LangSmith API key: ")
# os.environ["LANGSMITH_TRACING"] = "true"
```

### 安装

此检索器位于 `langchain-aws` 包中：


```python
%pip install -qU langchain-aws
```

## 实例化

现在我们可以实例化我们的检索器：


```python
from langchain_aws.retrievers import AmazonKnowledgeBasesRetriever

retriever = AmazonKnowledgeBasesRetriever(
    knowledge_base_id="PUIJP4EQUA",
    retrieval_config={"vectorSearchConfiguration": {"numberOfResults": 4}},
)
```

## 使用


```python
query = "What did the president say about Ketanji Brown?"

retriever.invoke(query)
```

## 在链中使用


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Bedrock (Knowledge Bases) Retriever"}]-->
from botocore.client import Config
from langchain.chains import RetrievalQA
from langchain_aws import Bedrock

model_kwargs_claude = {"temperature": 0, "top_k": 10, "max_tokens_to_sample": 3000}

llm = Bedrock(model_id="anthropic.claude-v2", model_kwargs=model_kwargs_claude)

qa = RetrievalQA.from_chain_type(
    llm=llm, retriever=retriever, return_source_documents=True
)

qa(query)
```

## API 参考

有关所有 `AmazonKnowledgeBasesRetriever` 功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/aws/retrievers/langchain_aws.retrievers.bedrock.AmazonKnowledgeBasesRetriever.html)。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
