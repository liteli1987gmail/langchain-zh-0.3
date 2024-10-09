---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/pebblo/pebblo_retrieval_qa.ipynb
---
# 启用身份的RAG使用PebbloRetrievalQA

> PebbloRetrievalQA是一个具有身份和语义强制的检索链，用于问答
针对向量数据库。

本笔记本涵盖如何使用身份和语义强制（拒绝主题/实体）检索文档。
有关Pebblo及其SafeRetriever功能的更多详细信息，请访问[Pebblo文档](https://daxa-ai.github.io/pebblo/retrieval_chain/)

### 步骤：

1. **加载文档：**
我们将带有授权和语义元数据的文档加载到内存中的Qdrant向量存储中。此向量存储将作为PebbloRetrievalQA中的检索器使用。

> **注意：** 建议使用[PebbloSafeLoader](https://daxa-ai.github.io/pebblo/rag)作为加载带有身份验证和语义元数据的文档的对应工具。`PebbloSafeLoader`保证安全高效地加载文档，同时保持元数据的完整性。



2. **测试强制机制：**
我们将分别测试身份和语义强制。对于每个用例，我们将定义一个特定的“请求”函数，包含所需的上下文（*auth_context* 和 *semantic_context*），然后提出我们的问题。


## 设置

### 依赖项

在本次演示中，我们将使用 OpenAI 大型语言模型、OpenAI 嵌入和 Qdrant 向量存储。



```python
%pip install --upgrade --quiet langchain langchain_core langchain-community langchain-openai qdrant_client
```

### 身份感知数据摄取

在这里，我们使用 Qdrant 作为向量数据库；然而，您可以使用任何支持的向量数据库。

**PebbloRetrievalQA 链支持以下向量数据库：**
- Qdrant
- Pinecone
- Postgres（利用 pgvector 扩展）


**使用授权和语义信息加载向量数据库：**

在此步骤中，我们将源文档的授权和语义信息捕获到 VectorDB 条目的元数据中的 `authorized_identities`、`pebblo_semantic_topics` 和 `pebblo_semantic_entities` 字段中，每个块都有一个。


*注意：要使用 PebbloRetrievalQA 链，您必须始终将授权和语义元数据放置在指定字段中。这些字段必须包含字符串列表。*


```python
<!--IMPORTS:[{"imported": "Qdrant", "source": "langchain_community.vectorstores.qdrant", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.qdrant.Qdrant.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai.embeddings", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "OpenAI", "source": "langchain_openai.llms", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}]-->
from langchain_community.vectorstores.qdrant import Qdrant
from langchain_core.documents import Document
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_openai.llms import OpenAI

llm = OpenAI()
embeddings = OpenAIEmbeddings()
collection_name = "pebblo-identity-and-semantic-rag"

page_content = """
**ACME Corp Financial Report**

**Overview:**
ACME Corp, a leading player in the merger and acquisition industry, presents its financial report for the fiscal year ending December 31, 2020. 
Despite a challenging economic landscape, ACME Corp demonstrated robust performance and strategic growth.

**Financial Highlights:**
Revenue soared to $50 million, marking a 15% increase from the previous year, driven by successful deal closures and expansion into new markets. 
Net profit reached $12 million, showcasing a healthy margin of 24%.

**Key Metrics:**
Total assets surged to $80 million, reflecting a 20% growth, highlighting ACME Corp's strong financial position and asset base. 
Additionally, the company maintained a conservative debt-to-equity ratio of 0.5, ensuring sustainable financial stability.

**Future Outlook:**
ACME Corp remains optimistic about the future, with plans to capitalize on emerging opportunities in the global M&A landscape. 
The company is committed to delivering value to shareholders while maintaining ethical business practices.

**Bank Account Details:**
For inquiries or transactions, please refer to ACME Corp's US bank account:
Account Number: 123456789012
Bank Name: Fictitious Bank of America
"""

documents = [
    Document(
        **{
            "page_content": page_content,
            "metadata": {
                "pebblo_semantic_topics": ["financial-report"],
                "pebblo_semantic_entities": ["us-bank-account-number"],
                "authorized_identities": ["finance-team", "exec-leadership"],
                "page": 0,
                "source": "https://drive.google.com/file/d/xxxxxxxxxxxxx/view",
                "title": "ACME Corp Financial Report.pdf",
            },
        }
    )
]

vectordb = Qdrant.from_documents(
    documents,
    embeddings,
    location=":memory:",
    collection_name=collection_name,
)

print("Vectordb loaded.")
```
```output
Vectordb loaded.
```
## 具有身份强制的检索

PebbloRetrievalQA链使用SafeRetrieval来确保用于上下文的片段仅从用户授权的文档中检索。
为此，Gen-AI应用程序需要为此检索链提供授权上下文。
这个*auth_context*应该填充访问Gen-AI应用程序的用户的身份和授权组。


以下是带有`user_auth`（用户授权列表，可能包括他们的用户ID和
他们所属的组）的`PebbloRetrievalQA`示例代码，从访问RAG应用程序的用户传入`auth_context`。


```python
<!--IMPORTS:[{"imported": "PebbloRetrievalQA", "source": "langchain_community.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.base.PebbloRetrievalQA.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "AuthContext", "source": "langchain_community.chains.pebblo_retrieval.models", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.models.AuthContext.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "ChainInput", "source": "langchain_community.chains.pebblo_retrieval.models", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.models.ChainInput.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}]-->
from langchain_community.chains import PebbloRetrievalQA
from langchain_community.chains.pebblo_retrieval.models import AuthContext, ChainInput

# Initialize PebbloRetrievalQA chain
qa_chain = PebbloRetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(),
    app_name="pebblo-identity-rag",
    description="Identity Enforcement app using PebbloRetrievalQA",
    owner="ACME Corp",
)


def ask(question: str, auth_context: dict):
    """
    Ask a question to the PebbloRetrievalQA chain
    """
    auth_context_obj = AuthContext(**auth_context) if auth_context else None
    chain_input_obj = ChainInput(query=question, auth_context=auth_context_obj)
    return qa_chain.invoke(chain_input_obj.dict())
```

### 1. 授权用户的问题

我们为授权身份`["finance-team", "exec-leadership"]`摄取了数据，因此具有授权身份/组`finance-team`的用户应该收到正确的答案。


```python
auth = {
    "user_id": "finance-user@acme.org",
    "user_auth": [
        "finance-team",
    ],
}

question = "Share the financial performance of ACME Corp for the year 2020"
resp = ask(question, auth)
print(f"Question: {question}\n\nAnswer: {resp['result']}")
```
```output
Question: Share the financial performance of ACME Corp for the year 2020

Answer: 
Revenue: $50 million (15% increase from previous year)
Net profit: $12 million (24% margin)
Total assets: $80 million (20% growth)
Debt-to-equity ratio: 0.5
```
### 2. 未授权用户的问题

由于用户的授权身份/组`eng-support`不包含在授权身份`["finance-team", "exec-leadership"]`中，我们不应该收到答案。


```python
auth = {
    "user_id": "eng-user@acme.org",
    "user_auth": [
        "eng-support",
    ],
}

question = "Share the financial performance of ACME Corp for the year 2020"
resp = ask(question, auth)
print(f"Question: {question}\n\nAnswer: {resp['result']}")
```
```output
Question: Share the financial performance of ACME Corp for the year 2020

Answer:  I don't know.
```
### 3. 使用PromptTemplate提供额外指令
您可以使用提示词模板为大型语言模型提供额外的指令，以生成自定义响应。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}]-->
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    """
Answer the question using the provided context. 
If no context is provided, just say "I'm sorry, but that information is unavailable, or Access to it is restricted.".

Question: {question}
"""
)

question = "Share the financial performance of ACME Corp for the year 2020"
prompt = prompt_template.format(question=question)
```

#### 3.1 授权用户的问题


```python
auth = {
    "user_id": "finance-user@acme.org",
    "user_auth": [
        "finance-team",
    ],
}
resp = ask(prompt, auth)
print(f"Question: {question}\n\nAnswer: {resp['result']}")
```
```output
Question: Share the financial performance of ACME Corp for the year 2020

Answer: 
Revenue soared to $50 million, marking a 15% increase from the previous year, and net profit reached $12 million, showcasing a healthy margin of 24%. Total assets also grew by 20% to $80 million, and the company maintained a conservative debt-to-equity ratio of 0.5.
```
#### 3.2 未授权用户的问题


```python
auth = {
    "user_id": "eng-user@acme.org",
    "user_auth": [
        "eng-support",
    ],
}
resp = ask(prompt, auth)
print(f"Question: {question}\n\nAnswer: {resp['result']}")
```
```output
Question: Share the financial performance of ACME Corp for the year 2020

Answer: 
I'm sorry, but that information is unavailable, or Access to it is restricted.
```
## 语义强制检索

PebbloRetrievalQA链使用SafeRetrieval确保上下文中使用的片段仅从符合提供的语义上下文的文档中检索。
提供的语义上下文。
为实现这一点，Gen-AI应用程序必须为此检索链提供语义上下文。
此`semantic_context`应包括应拒绝访问Gen-AI应用程序的用户的主题和实体。

以下是带有`topics_to_deny`和`entities_to_deny`的PebbloRetrievalQA示例代码。这些被传递到链输入的`semantic_context`中。


```python
<!--IMPORTS:[{"imported": "PebbloRetrievalQA", "source": "langchain_community.chains", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.base.PebbloRetrievalQA.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "ChainInput", "source": "langchain_community.chains.pebblo_retrieval.models", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.models.ChainInput.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}, {"imported": "SemanticContext", "source": "langchain_community.chains.pebblo_retrieval.models", "docs": "https://python.langchain.com/api_reference/community/chains/langchain_community.chains.pebblo_retrieval.models.SemanticContext.html", "title": "Identity-enabled RAG using PebbloRetrievalQA"}]-->
from typing import List, Optional

from langchain_community.chains import PebbloRetrievalQA
from langchain_community.chains.pebblo_retrieval.models import (
    ChainInput,
    SemanticContext,
)

# Initialize PebbloRetrievalQA chain
qa_chain = PebbloRetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectordb.as_retriever(),
    app_name="pebblo-semantic-rag",
    description="Semantic Enforcement app using PebbloRetrievalQA",
    owner="ACME Corp",
)


def ask(
    question: str,
    topics_to_deny: Optional[List[str]] = None,
    entities_to_deny: Optional[List[str]] = None,
):
    """
    Ask a question to the PebbloRetrievalQA chain
    """
    semantic_context = dict()
    if topics_to_deny:
        semantic_context["pebblo_semantic_topics"] = {"deny": topics_to_deny}
    if entities_to_deny:
        semantic_context["pebblo_semantic_entities"] = {"deny": entities_to_deny}

    semantic_context_obj = (
        SemanticContext(**semantic_context) if semantic_context else None
    )
    chain_input_obj = ChainInput(query=question, semantic_context=semantic_context_obj)
    return qa_chain.invoke(chain_input_obj.dict())
```

### 1. 无语义强制

由于没有应用语义强制，系统应返回答案，而不因与上下文相关的语义标签而排除任何上下文。



```python
topic_to_deny = []
entities_to_deny = []
question = "Share the financial performance of ACME Corp for the year 2020"
resp = ask(question, topics_to_deny=topic_to_deny, entities_to_deny=entities_to_deny)
print(
    f"Topics to deny: {topic_to_deny}\nEntities to deny: {entities_to_deny}\n"
    f"Question: {question}\nAnswer: {resp['result']}"
)
```
```output
Topics to deny: []
Entities to deny: []
Question: Share the financial performance of ACME Corp for the year 2020
Answer: 
Revenue for ACME Corp increased by 15% to $50 million in 2020, with a net profit of $12 million and a strong asset base of $80 million. The company also maintained a conservative debt-to-equity ratio of 0.5.
```
### 2. 拒绝财务报告主题

数据已被摄取，主题为：`["financial-report"]`。
因此，拒绝`financial-report`主题的应用程序不应收到答案。


```python
topic_to_deny = ["financial-report"]
entities_to_deny = []
question = "Share the financial performance of ACME Corp for the year 2020"
resp = ask(question, topics_to_deny=topic_to_deny, entities_to_deny=entities_to_deny)
print(
    f"Topics to deny: {topic_to_deny}\nEntities to deny: {entities_to_deny}\n"
    f"Question: {question}\nAnswer: {resp['result']}"
)
```
```output
Topics to deny: ['financial-report']
Entities to deny: []
Question: Share the financial performance of ACME Corp for the year 2020
Answer: 

Unfortunately, I do not have access to the financial performance of ACME Corp for the year 2020.
```
### 3. 拒绝美国银行账户号码实体
由于实体`us-bank-account-number`被拒绝，系统不应返回答案。


```python
topic_to_deny = []
entities_to_deny = ["us-bank-account-number"]
question = "Share the financial performance of ACME Corp for the year 2020"
resp = ask(question, topics_to_deny=topic_to_deny, entities_to_deny=entities_to_deny)
print(
    f"Topics to deny: {topic_to_deny}\nEntities to deny: {entities_to_deny}\n"
    f"Question: {question}\nAnswer: {resp['result']}"
)
```
```output
Topics to deny: []
Entities to deny: ['us-bank-account-number']
Question: Share the financial performance of ACME Corp for the year 2020
Answer:  I don't have information about ACME Corp's financial performance for 2020.
```