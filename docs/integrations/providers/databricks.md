Databricks
==========

> [Databricks](https://www.databricks.com/) 智能平台是全球首个由生成式AI驱动的数据智能平台。将AI融入您业务的每一个方面。

Databricks以多种方式拥抱LangChain生态系统：

1. 🚀 **模型服务** - 通过高可用性和低延迟的推理端点，访问最先进的大型语言模型，如DBRX、Llama3、Mixtral或您微调的模型，访问[Databricks模型服务](https://www.databricks.com/product/model-serving)。LangChain提供LLM（`Databricks`）、聊天模型（`ChatDatabricks`）和嵌入（`DatabricksEmbeddings`）的实现，简化了您在Databricks模型服务上托管的模型与LangChain应用程序的集成。
2. 📃 **向量搜索** - [Databricks向量搜索](https://www.databricks.com/product/machine-learning/vector-search)是一个无服务器的向量数据库，完美集成于Databricks平台。使用`DatabricksVectorSearch`，您可以将高度可扩展和可靠的相似性搜索引擎纳入您的LangChain应用程序。
3. 📊 **MLflow** - [MLflow](https://mlflow.org/)是一个开源平台，用于管理完整的机器学习生命周期，包括实验管理、评估、追踪、部署等。[MLflow的LangChain集成](/docs/integrations/providers/mlflow_tracking)简化了开发和操作现代复合机器学习系统的过程。
4. 🌐 **SQL数据库** - [Databricks SQL](https://www.databricks.com/product/databricks-sql)与LangChain中的`SQLDatabase`集成，使您能够访问自动优化、性能卓越的数据仓库。
5. 💡 **开放模型** - Databricks开源模型，如[DBRX](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm)，可通过[Hugging Face Hub](https://huggingface.co/databricks/dbrx-instruct)获得。这些模型可以直接与LangChain一起使用，利用其与`transformers`库的集成。

安装
------------

第一方 Databricks 集成可在 langchain-databricks 第三方库中获得。

```
pip install langchain-databricks
```

聊天模型
----------

`ChatDatabricks` 是一个聊天模型类，用于访问托管在 Databricks 上的聊天端点，包括最先进的模型，如 Llama3、Mixtral 和 DBRX，以及您自己微调的模型。

```
from langchain_databricks import ChatDatabricks

chat_model = ChatDatabricks(endpoint="databricks-meta-llama-3-70b-instruct")
```

有关如何在您的 LangChain 应用程序中使用它的更多指导，请参见 [使用示例](/docs/integrations/chat/databricks)。

大型语言模型
---

`Databricks` is an LLM class to access completion endpoints hosted on Databricks.

:::caution
Text completion models have been deprecated and the latest and most popular models are [chat completion models](/docs/concepts/#chat-models). Use `ChatDatabricks` chat model instead to use those models and advanced features such as tool calling.
:::

```
from langchain_community.llm.databricks import Databricks

llm = Databricks(endpoint="your-completion-endpoint")
```

See the [usage example](/docs/integrations/llms/databricks) for more guidance on how to use it within your LangChain application.


Embeddings
----------

`DatabricksEmbeddings` is an Embeddings class to access text-embedding endpoints hosted on Databricks, including state-of-the-art models such as BGE, as well as your own fine-tuned models.

```
from langchain_databricks import DatabricksEmbeddings

embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
```

See the [usage example](/docs/integrations/text_embedding/databricks) for more guidance on how to use it within your LangChain application.


Vector Search
-------------

Databricks Vector Search is a serverless similarity search engine that allows you to store a vector representation of your data, including metadata, in a vector database. With Vector Search, you can create auto-updating vector search indexes from [Delta](https://docs.databricks.com/en/introduction/delta-comparison.html) tables managed by [Unity Catalog](https://www.databricks.com/product/unity-catalog) and query them with a simple API to return the most similar vectors.

```
from langchain_databricks.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    endpoint="<YOUT_ENDPOINT_NAME>",
    index_name="<YOUR_INDEX_NAME>",
    index,
    text_column="text",
    embedding=embeddings,
    columns=["source"]
)
docs = dvs.similarity_search("What is vector search?)
```

See the [usage example](/docs/integrations/vectorstores/databricks_vector_search) for how to set up vector indices and integrate them with LangChain.


MLflow Integration
------------------

In the context of LangChain integration, MLflow provides the following capabilities:

- **Experiment Tracking**: Tracks and stores models, artifacts, and traces from your LangChain experiments.
- **Dependency Management**: Automatically records dependency libraries, ensuring consistency among development, staging, and production environments.
- **Model Evaluation** Offers native capabilities for evaluating LangChain applications.
- **Tracing**: Visually traces data flows through your LangChain application.

See [MLflow LangChain Integration](/docs/integrations/providers/mlflow_tracking) to learn about the full capabilities of using MLflow with LangChain through extensive code examples and guides.

SQLDatabase
-----------
You can connect to Databricks SQL using the SQLDatabase wrapper of LangChain.
```
from langchain.sql_database import SQLDatabase

db = SQLDatabase.from_databricks(catalog="samples", schema="nyctaxi")
```

See [Databricks SQL Agent](https://docs.databricks.com/en/large-language-models/langchain.html#databricks-sql-agent) for how to connect Databricks SQL with your LangChain Agent as a powerful querying tool.

Open Models
-----------

To directly integrate Databricks's open models hosted on HuggingFace, you can use the [HuggingFace Integration](/docs/integrations/platforms/huggingface) of LangChain.

```
from langchain_huggingface import HuggingFaceEndpoint

llm = HuggingFaceEndpoint(
    repo_id="databricks/dbrx-instruct",
    task="text-generation",
    max_new_tokens=512,
    do_sample=False,
    repetition_penalty=1.03,
)
llm.invoke("What is DBRX model?")
```
