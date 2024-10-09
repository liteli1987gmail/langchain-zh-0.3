---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/activeloop.ipynb
---
# Activeloop 深度记忆

>[Activeloop 深度记忆](https://docs.activeloop.ai/performance-features/deep-memory) 是一套工具，能够帮助您优化您的向量存储以适应您的用例，并在您的大型语言模型应用中实现更高的准确性。

`检索增强生成` (`RAG`) 最近引起了广泛关注。随着先进的 RAG 技术和代理的出现，它们扩展了 RAG 能够实现的潜力。然而，几个挑战可能限制 RAG 在生产中的集成。在生产环境中实施 RAG 时，主要考虑的因素是准确性（召回率）、成本和延迟。对于基本用例，OpenAI 的 Ada 模型配合简单的相似性搜索可以产生令人满意的结果。然而，对于更高的准确性或搜索召回率，可能需要采用先进的检索技术。这些方法可能涉及不同的数据块大小、多次重写查询等，可能会增加延迟和成本。Activeloop 的 [深度记忆](https://www.activeloop.ai/resources/use-deep-memory-to-boost-rag-apps-accuracy-by-up-to-22/) 是 `Activeloop Deep Lake` 用户可用的一个功能，通过引入一个微小的神经网络层，训练以将用户查询与语料库中的相关数据匹配，解决了这些问题。虽然这个附加功能在搜索时引入的延迟很小，但可以将检索准确性提高多达 27%
%，并且保持成本效益高且易于使用，无需任何额外的高级 RAG 技术。


在本教程中，我们将解析 `DeepLake` 文档，并创建一个能够回答文档中问题的 RAG 系统。


## 1. 数据集创建

我们将使用 `BeautifulSoup` 库和 LangChain 的文档解析器，如 `Html2TextTransformer`、`AsyncHtmlLoader` 来解析 activeloop 的文档。因此，我们需要安装以下库：


```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

此外，您需要创建一个 [Activeloop](https://activeloop.ai) 账户。


```python
ORG_ID = "..."
```


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Activeloop Deep Memory"}, {"imported": "DeepLake", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.deeplake.DeepLake.html", "title": "Activeloop Deep Memory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Activeloop Deep Memory"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Activeloop Deep Memory"}]-->
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import DeepLake
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API token: ")
# # activeloop token is needed if you are not signed in using CLI: `activeloop login -u <USERNAME> -p <PASSWORD>`
if "ACTIVELOOP_TOKEN" not in os.environ:
    os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass(
        "Enter your ActiveLoop API token: "
    )  # Get your API token from https://app.activeloop.ai, click on your profile picture in the top right corner, and select "API Tokens"

token = os.getenv("ACTIVELOOP_TOKEN")
openai_embeddings = OpenAIEmbeddings()
```


```python
db = DeepLake(
    dataset_path=f"hub://{ORG_ID}/deeplake-docs-deepmemory",  # org_id stands for your username or organization from activeloop
    embedding=openai_embeddings,
    runtime={"tensor_db": True},
    token=token,
    # overwrite=True, # user overwrite flag if you want to overwrite the full dataset
    read_only=False,
)
```

使用 `BeautifulSoup` 解析网页中的所有链接


```python
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def get_all_links(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the page: {url}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Finding all 'a' tags which typically contain href attribute for links
    links = [
        urljoin(url, a["href"]) for a in soup.find_all("a", href=True) if a["href"]
    ]

    return links


base_url = "https://docs.deeplake.ai/en/latest/"
all_links = get_all_links(base_url)
```

加载数据：


```python
<!--IMPORTS:[{"imported": "AsyncHtmlLoader", "source": "langchain_community.document_loaders.async_html", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.async_html.AsyncHtmlLoader.html", "title": "Activeloop Deep Memory"}]-->
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

将数据转换为用户可读格式：


```python
<!--IMPORTS:[{"imported": "Html2TextTransformer", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.html2text.Html2TextTransformer.html", "title": "Activeloop Deep Memory"}]-->
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

现在，让我们进一步分块文档，因为其中一些包含太多文本：


```python
<!--IMPORTS:[{"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Activeloop Deep Memory"}]-->
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 4096
docs_new = []

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
)

for doc in docs_transformed:
    if len(doc.page_content) < chunk_size:
        docs_new.append(doc)
    else:
        docs = text_splitter.create_documents([doc.page_content])
        docs_new.extend(docs)
```

填充向量存储：


```python
docs = db.add_documents(docs_new)
```

## 2. 生成合成查询并训练深度记忆

下一步是训练一个深度记忆模型，将用户查询与您已有的数据集对齐。如果您还没有任何用户查询，没关系，我们将使用大型语言模型生成它们！

#### TODO: 添加图片

在上面，我们展示了深度记忆的整体架构。因此，正如您所看到的，为了训练它，您需要相关性、查询以及语料库数据（我们想要查询的数据）。语料库数据在前面的部分已经填充，这里我们将生成问题和相关性。

1. `questions` - 是一组字符串文本，每个字符串代表一个查询
2. `relevance` - 包含每个问题的真实答案链接。可能有多个文档包含给定问题的答案。因此，relevance 是 `List[List[tuple[str, float]]]`，外层列表代表查询，内层列表代表相关文档。元组包含字符串和浮点数对，其中字符串表示源文档的ID（对应于数据集中的 `id` 张量），而浮点数对应于当前文档与问题的相关程度。

现在，让我们生成合成问题和相关性：


```python
<!--IMPORTS:[{"imported": "create_structured_output_chain", "source": "langchain.chains.openai_functions", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.openai_functions.base.create_structured_output_chain.html", "title": "Activeloop Deep Memory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Activeloop Deep Memory"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Activeloop Deep Memory"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Activeloop Deep Memory"}, {"imported": "HumanMessagePromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html", "title": "Activeloop Deep Memory"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Activeloop Deep Memory"}]-->
from typing import List

from langchain.chains.openai_functions import (
    create_structured_output_chain,
)
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```


```python
# fetch dataset docs and ids if they exist (optional you can also ingest)
docs = db.vectorstore.dataset.text.data(fetch_chunks=True, aslist=True)["value"]
ids = db.vectorstore.dataset.id.data(fetch_chunks=True, aslist=True)["value"]
```


```python
# If we pass in a model explicitly, we need to make sure it supports the OpenAI function-calling API.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Questions(BaseModel):
    """Identifying information about a person."""

    question: str = Field(..., description="Questions about text")


prompt_msgs = [
    SystemMessage(
        content="You are a world class expert for generating questions based on provided context. \
                You make sure the question can be answered by the text."
    ),
    HumanMessagePromptTemplate.from_template(
        "Use the given text to generate a question from the following input: {input}"
    ),
    HumanMessage(content="Tips: Make sure to answer in the correct format"),
]
prompt = ChatPromptTemplate(messages=prompt_msgs)
chain = create_structured_output_chain(Questions, llm, prompt, verbose=True)

text = "# Understanding Hallucinations and Bias ## **Introduction** In this lesson, we'll cover the concept of **hallucinations** in LLMs, highlighting their influence on AI applications and demonstrating how to mitigate them using techniques like the retriever's architectures. We'll also explore **bias** within LLMs with examples."
questions = chain.run(input=text)
print(questions)
```


```python
<!--IMPORTS:[{"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Activeloop Deep Memory"}]-->
import random

from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm


def generate_queries(docs: List[str], ids: List[str], n: int = 100):
    questions = []
    relevances = []
    pbar = tqdm(total=n)
    while len(questions) < n:
        # 1. randomly draw a piece of text and relevance id
        r = random.randint(0, len(docs) - 1)
        text, label = docs[r], ids[r]

        # 2. generate queries and assign and relevance id
        generated_qs = [chain.run(input=text).question]
        questions.extend(generated_qs)
        relevances.extend([[(label, 1)] for _ in generated_qs])
        pbar.update(len(generated_qs))
        if len(questions) % 10 == 0:
            print(f"q: {len(questions)}")
    return questions[:n], relevances[:n]


chain = create_structured_output_chain(Questions, llm, prompt, verbose=False)
questions, relevances = generate_queries(docs, ids, n=200)

train_questions, train_relevances = questions[:100], relevances[:100]
test_questions, test_relevances = questions[100:], relevances[100:]
```

现在我们创建了100个训练查询以及100个测试查询。现在让我们训练深度记忆：


```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

让我们跟踪训练进度：


```python
db.vectorstore.deep_memory.status("6538939ca0b69a9ca45c528c")
```
```output

--------------------------------------------------------------
|                  6538e02ecda4691033a51c5b                  |
--------------------------------------------------------------
| status                     | completed                     |
--------------------------------------------------------------
| progress                   | eta: 1.4 seconds              |
|                            | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
| results                    | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
```
## 3. 评估深度记忆性能

太好了，我们已经训练了模型！它在召回率上显示出显著的改善，但我们现在如何使用它并在未见过的新数据上进行评估呢？在这一部分，我们将深入探讨模型评估和推理部分，并看看它如何与LangChain结合使用，以提高检索准确性。

### 3.1 深度记忆评估

首先，我们可以使用深度记忆的内置评估方法。
它计算几个 `召回` 指标。
只需几行代码即可轻松完成。


```python
recall = db.vectorstore.deep_memory.evaluate(
    queries=test_questions,
    relevance=test_relevances,
)
```
```output

Embedding queries took 0.81 seconds
---- Evaluating without model ---- 
Recall@1:	  9.0%
Recall@3:	  19.0%
Recall@5:	  24.0%
Recall@10:	  42.0%
Recall@50:	  93.0%
Recall@100:	  98.0%
---- Evaluating with model ---- 
Recall@1:	  19.0%
Recall@3:	  42.0%
Recall@5:	  49.0%
Recall@10:	  69.0%
Recall@50:	  97.0%
Recall@100:	  97.0%
```
在未见过的测试数据集上也显示出相当显著的改进！！！

### 3.2 深度记忆 + RAGas


```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

让我们将召回转换为真实值：


```python
def convert_relevance_to_ground_truth(docs, relevance):
    ground_truths = []

    for rel in relevance:
        ground_truth = []
        for doc_id, _ in rel:
            ground_truth.append(docs[doc_id])
        ground_truths.append(ground_truth)
    return ground_truths
```


```python
ground_truths = convert_relevance_to_ground_truth(docs, test_relevances)

for deep_memory in [False, True]:
    print("\nEvaluating with deep_memory =", deep_memory)
    print("===================================")

    retriever = db.as_retriever()
    retriever.search_kwargs["deep_memory"] = deep_memory

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )

    metrics = {
        "context_recall_score": 0,
    }

    eval_chains = {m.name: RagasEvaluatorChain(metric=m) for m in [context_recall]}

    for question, ground_truth in zip(test_questions, ground_truths):
        result = qa_chain({"query": question})
        result["ground_truths"] = ground_truth
        for name, eval_chain in eval_chains.items():
            score_name = f"{name}_score"
            metrics[score_name] += eval_chain(result)[score_name]

    for metric in metrics:
        metrics[metric] /= len(test_questions)
        print(f"{metric}: {metrics[metric]}")
    print("===================================")
```
```output

Evaluating with deep_memory = False
===================================
context_recall_score = 0.3763423145
===================================

Evaluating with deep_memory = True
===================================
context_recall_score = 0.5634545323
===================================
```
### 3.3 深度记忆推理

#### TODO: 添加图片

使用深度记忆


```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = True
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
print(qa.run(query))
```
```output
The base htype of the 'video_seq' tensor is 'video'.
```
不使用深度记忆


```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = False
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
qa.run(query)
```
```output
The text does not provide information on the base htype of the 'video_seq' tensor.
```
### 3.4 深度记忆节省成本

深度记忆提高了检索准确性，而不改变您现有的工作流程。此外，通过减少输入到大型语言模型的 top_k，您可以通过降低令牌使用量显著降低推理成本。


## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [操作指南](/docs/how_to/#retrievers)
