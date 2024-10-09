---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/uptrain.ipynb
---
<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/uptrain.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# UpTrain

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [website](https://uptrain.ai/) || [docs](https://docs.uptrain.ai/getting-started/introduction)] 是一个开源平台，用于评估和改进大型语言模型应用。它提供20多个预配置检查的评分（涵盖语言、代码、嵌入用例），对失败案例的实例进行根本原因分析，并提供解决方案的指导。

## UpTrain 回调处理器

本笔记本展示了UpTrain回调处理器如何无缝集成到您的管道中，促进多样化的评估。我们选择了一些我们认为适合评估链的评估。这些评估会自动运行，结果会显示在输出中。有关UpTrain评估的更多详细信息，请查看[这里](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-).

从LangChain中选出的检索器被突出显示以供演示：

### 1. **基础RAG**：
RAG在检索上下文和生成响应中发挥着关键作用。为了确保其性能和响应质量，我们进行以下评估：

- **[上下文相关性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**：确定从查询中提取的上下文是否与响应相关。
- **[事实准确性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**：评估大型语言模型是否在幻想或提供不正确的信息。
- **[响应完整性](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**：检查响应是否包含查询所请求的所有信息。

### 2. **多查询生成**:
MultiQueryRetriever 创建多个与原始问题具有相似含义的问题变体。考虑到复杂性，我们包括之前的评估并添加：

- **[多查询准确性](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: 确保生成的多查询与原始查询的含义相同。

### 3. **上下文压缩和重新排序**:
重新排序涉及根据与查询的相关性对节点进行重新排序，并选择前 n 个节点。由于在重新排序完成后节点数量可能减少，我们进行以下评估：

- **[上下文重新排序](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: 检查重新排序的节点顺序是否比原始顺序更相关于查询。
- **[上下文简洁性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: 检查减少的节点数量是否仍然提供所有所需的信息。

这些评估共同确保了 RAG、MultiQueryRetriever 和链中重新排序过程的稳健性和有效性。

## 安装依赖


```python
%pip install -qU langchain langchain_openai langchain-community uptrain faiss-cpu flashrank
```
```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)
``````output
[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```
注意：如果您想使用启用 GPU 的库版本，您也可以安装 `faiss-gpu` 而不是 `faiss-cpu`。

## 导入库


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "UpTrain"}, {"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "UpTrain"}, {"imported": "FlashrankRerank", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/community/document_compressors/langchain_community.document_compressors.flashrank_rerank.FlashrankRerank.html", "title": "UpTrain"}, {"imported": "MultiQueryRetriever", "source": "langchain.retrievers.multi_query", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_query.MultiQueryRetriever.html", "title": "UpTrain"}, {"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "UpTrain"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "UpTrain"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers.string", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "UpTrain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts.chat", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "UpTrain"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables.passthrough", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "UpTrain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "UpTrain"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "UpTrain"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "UpTrain"}]-->
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## 加载文档


```python
loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
```

## 将文档拆分为块


```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## 创建检索器


```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## 定义大型语言模型


```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## 设置

UpTrain 为您提供：
1. 具有高级深入分析和过滤选项的仪表板
1. 失败案例中的洞察和常见主题
1. 生产数据的可观察性和实时监控
1. 通过与您的 CI/CD 管道无缝集成进行回归测试

您可以选择以下选项来使用 UpTrain 进行评估：
### 1. **UpTrain 的开源软件 (OSS)**：
您可以使用开源评估服务来评估您的模型。在这种情况下，您需要提供一个 OpenAI API 密钥。UpTrain 使用 GPT 模型来评估 LLM 生成的响应。您可以在 [这里](https://platform.openai.com/account/api-keys) 获取您的密钥。

为了在 UpTrain 仪表板中查看您的评估，您需要通过在终端中运行以下命令来进行设置：

```bash
git clone https://github.com/uptrain-ai/uptrain
cd uptrain
bash run_uptrain.sh
```

这将在您的本地机器上启动 UpTrain 仪表板。您可以通过 `http://localhost:3000/dashboard` 访问它。

参数：
- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name="项目名称"


### 2. **UpTrain 管理服务和仪表板**:
或者，您可以使用 UpTrain 的管理服务来评估您的模型。您可以在 [这里](https://uptrain.ai/) 创建一个免费的 UpTrain 账户并获得免费试用积分。如果您想要更多的试用积分，[在这里与 UpTrain 的维护者预约通话](https://calendly.com/uptrain-sourabh/30min)。

使用管理服务的好处包括：
1. 无需在本地机器上设置 UpTrain 仪表板。
1. 可以访问许多大型语言模型，而无需它们的 API 密钥。

一旦您进行评估，您可以在 UpTrain 仪表板上查看它们，网址为 `https://dashboard.uptrain.ai/dashboard`

参数：
- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name="项目名称"


**注意：** `project_name` 将是评估结果在 UpTrain 仪表板中显示的项目名称。

## 设置 API 密钥

笔记本将提示您输入 API 密钥。您可以通过更改下面单元格中的 `key_type` 参数在 OpenAI API 密钥和 UpTrain API 密钥之间进行选择。


```python
KEY_TYPE = "openai"  # or "uptrain"
API_KEY = getpass()
```

# 1. 原始 RAG

UpTrain 回调处理程序将在生成后自动捕获查询、上下文和响应，并将对响应运行以下三个评估 *(评分范围从 0 到 1)*：
- **[上下文相关性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**：检查从查询中提取的上下文是否与响应相关。
- **[事实准确性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**：检查响应的事实准确性。
- **[响应完整性](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**：检查响应是否包含查询所要求的所有信息。


```python
# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Create the uptrain callback handler
uptrain_callback = UpTrainCallbackHandler(key_type=KEY_TYPE, api_key=API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(query, config=config)
```
```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m
``````output

Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```
# 2. 多查询生成

**MultiQueryRetriever**用于解决RAG管道可能无法根据查询返回最佳文档集的问题。它生成多个与原始查询意思相同的查询，然后为每个查询获取文档。

为了评估这个检索器，UpTrain将进行以下评估：
- **[多查询准确性](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**：检查生成的多查询是否与原始查询意思相同。


```python
# Create the retriever
multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type=KEY_TYPE, api_key=API_KEY)
config = {"callbacks": [uptrain_callback]}

# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Invoke the chain with a query
question = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(question, config=config)
```
```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m
``````output

Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5
``````output
[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m
``````output

Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```
# 3. 上下文压缩和重新排序

重排序过程涉及根据与查询的相关性重新排列节点，并选择前n个节点。由于在重排序完成后节点数量可能会减少，我们进行以下评估：
- **[上下文重排序](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**：检查重排序后的节点顺序是否比原始顺序更相关于查询。
- **[上下文简洁性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**：检查减少后的节点数量是否仍然提供所有所需的信息。


```python
# Create the retriever
compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# Create the chain
chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type=KEY_TYPE, api_key=API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
result = chain.invoke(query, config=config)
```
```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m
``````output

Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0
``````output
[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m
``````output

Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```
# UpTrain的仪表板和洞察

这是一个展示仪表板和洞察的短视频：

![langchain_uptrain.gif](https://uptrain-assets.s3.ap-south-1.amazonaws.com/images/langchain/langchain_uptrain.gif)
