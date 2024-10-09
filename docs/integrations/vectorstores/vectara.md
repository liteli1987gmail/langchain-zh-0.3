---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vectara.ipynb
---
# Vectara

[Vectara](https://vectara.com/) 提供一个可信的生成式人工智能平台，使组织能够快速创建类似ChatGPT的体验（一个AI助手），该体验基于他们拥有的数据、文档和知识（从技术上讲，它是检索增强生成即服务）。

Vectara无服务器的RAG即服务提供了所有RAG组件，背后有一个易于使用的API，包括：
1. 从文件中提取文本的方法（PDF、PPT、DOCX等）
2. 基于机器学习的分块，提供最先进的性能。
3. [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 嵌入模型。
4. 自有的内部向量数据库，用于存储文本块和嵌入向量。
5. 一个查询服务，自动将查询编码为嵌入，并检索最相关的文本片段（包括对[混合搜索](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching)和[MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)的支持）
7. 一个大型语言模型，用于基于检索到的文档（上下文）创建[生成摘要](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)，包括引用。

有关如何使用API的更多信息，请参见[Vectara API文档](https://docs.vectara.com/docs/)。

本笔记本展示了如何使用基本的检索功能，当将 Vectara 仅作为向量存储使用时（不进行摘要），包括：`similarity_search` 和 `similarity_search_with_score`，以及使用 LangChain 的 `as_retriever` 功能。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

# 开始使用

要开始使用，请按照以下步骤操作：
1. 如果您还没有帐户，请[注册](https://www.vectara.com/integrations/langchain)一个免费的 Vectara 帐户。完成注册后，您将获得一个 Vectara 客户 ID。您可以通过单击 Vectara 控制台窗口右上角的姓名找到您的客户 ID。
2. 在您的帐户中，您可以创建一个或多个语料库。每个语料库代表一个存储文本数据的区域，这些数据来自输入文档的摄取。要创建语料库，请使用 **"创建语料库"** 按钮。然后为您的语料库提供一个名称和描述。您可以选择定义过滤属性并应用一些高级选项。如果您单击已创建的语料库，您可以在顶部看到其名称和语料库 ID。
3. 接下来，您需要创建 API 密钥以访问语料库。在语料库视图中单击 **"访问控制"** 选项卡，然后单击 **"创建 API 密钥"** 按钮。为您的密钥命名，并选择您希望密钥是仅查询还是查询+索引。单击 "创建"，您现在拥有一个有效的 API 密钥。请保密此密钥。

要将 LangChain 与 Vectara 一起使用，您需要这三个值：`customer ID`、`corpus ID` 和 `api_key`。
您可以通过两种方式将这些值提供给 LangChain：

1. 在您的环境中包含这三个变量：`VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID` 和 `VECTARA_API_KEY`。

例如，您可以使用 os.environ 和 getpass 设置这些变量，如下所示：

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. 将它们添加到 `Vectara` 向量存储构造函数中：

```python
vectara = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

在这个笔记本中，我们假设它们在环境中提供。


```python
<!--IMPORTS:[{"imported": "Vectara", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vectara.Vectara.html", "title": "Vectara"}, {"imported": "RerankConfig", "source": "langchain_community.vectorstores.vectara", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vectara.RerankConfig.html", "title": "Vectara"}, {"imported": "SummaryConfig", "source": "langchain_community.vectorstores.vectara", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vectara.SummaryConfig.html", "title": "Vectara"}, {"imported": "VectaraQueryConfig", "source": "langchain_community.vectorstores.vectara", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vectara.VectaraQueryConfig.html", "title": "Vectara"}]-->
import os

os.environ["VECTARA_API_KEY"] = "<YOUR_VECTARA_API_KEY>"
os.environ["VECTARA_CORPUS_ID"] = "<YOUR_VECTARA_CORPUS_ID>"
os.environ["VECTARA_CUSTOMER_ID"] = "<YOUR_VECTARA_CUSTOMER_ID>"

from langchain_community.vectorstores import Vectara
from langchain_community.vectorstores.vectara import (
    RerankConfig,
    SummaryConfig,
    VectaraQueryConfig,
)
```

首先，我们将国情咨文文本加载到 Vectara 中。

请注意，我们使用 `from_files` 接口，它不需要任何本地处理或分块 - Vectara 接收文件内容并执行所有必要的预处理、分块和将文件嵌入其知识存储中。

在这种情况下，它使用 `.txt` 文件，但同样适用于许多其他 [文件类型](https://docs.vectara.com/docs/api-reference/indexing-apis/file-upload/file-upload-filetypes)。


```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

## 基本 Vectara RAG（检索增强生成）

我们现在创建一个 `VectaraQueryConfig` 对象来控制检索和摘要选项：
* 我们启用摘要，指定希望 LLM 选择前 7 个匹配的块并用英语回应
* 我们在检索过程中启用 MMR（最大边际相关性），设置 0.2 的多样性偏差因子
* 我们希望获得前 10 个结果，混合搜索配置值为 0.025

使用此配置，让我们创建一个 LangChain `Runnable` 对象，封装完整的 Vectara RAG 流水线，使用 `as_rag` 方法：


```python
summary_config = SummaryConfig(is_enabled=True, max_results=7, response_lang="eng")
rerank_config = RerankConfig(reranker="mmr", rerank_k=50, mmr_diversity_bias=0.2)
config = VectaraQueryConfig(
    k=10, lambda_val=0.005, rerank_config=rerank_config, summary_config=summary_config
)

query_str = "what did Biden say?"

rag = vectara.as_rag(config)
rag.invoke(query_str)["answer"]
```



```output
"Biden addressed various topics in his statements. He highlighted the need to confront Putin by building a coalition of nations[1]. He also expressed commitment to investigating the impact of burn pits on soldiers' health, including his son's case[2]. Additionally, Biden outlined a plan to fight inflation by cutting prescription drug costs[3]. He emphasized the importance of continuing to combat COVID-19 and not just accepting living with it[4]. Furthermore, he discussed measures to weaken Russia economically and target Russian oligarchs[6]. Biden also advocated for passing the Equality Act to support LGBTQ+ Americans and condemned state laws targeting transgender individuals[7]."
```


我们还可以像这样使用流式接口：


```python
output = {}
curr_key = None
for chunk in rag.stream(query_str):
    for key in chunk:
        if key not in output:
            output[key] = chunk[key]
        else:
            output[key] += chunk[key]
        if key == "answer":
            print(chunk[key], end="", flush=True)
        curr_key = key
```
```output
Biden addressed various topics in his statements. He highlighted the importance of building coalitions to confront global challenges [1]. He also expressed commitment to investigating the impact of burn pits on soldiers' health, including his son's case [2, 4]. Additionally, Biden outlined his plan to combat inflation by cutting prescription drug costs and reducing the deficit, with support from Nobel laureates and business leaders [3]. He emphasized the ongoing fight against COVID-19 and the need to continue combating the virus [5]. Furthermore, Biden discussed measures taken to weaken Russia's economic and military strength, targeting Russian oligarchs and corrupt leaders [6]. He also advocated for passing the Equality Act to support LGBTQ+ Americans and address discriminatory state laws [7].
```
## 幻觉检测和事实一致性评分

Vectara 创建了 [HHEM](https://huggingface.co/vectara/hallucination_evaluation_model) - 一个开源模型，可用于评估 RAG 响应的事实一致性。

作为 Vectara RAG 的一部分，'事实一致性评分'（或 FCS），这是开源 HHEM 的改进版本，通过 API 提供。它会自动包含在 RAG 流水线的输出中。


```python
summary_config = SummaryConfig(is_enabled=True, max_results=5, response_lang="eng")
rerank_config = RerankConfig(reranker="mmr", rerank_k=50, mmr_diversity_bias=0.1)
config = VectaraQueryConfig(
    k=10, lambda_val=0.005, rerank_config=rerank_config, summary_config=summary_config
)

rag = vectara.as_rag(config)
resp = rag.invoke(query_str)
print(resp["answer"])
print(f"Vectara FCS = {resp['fcs']}")
```
```output
Biden addressed various topics in his statements. He highlighted the need to confront Putin by building a coalition of nations[1]. He also expressed his commitment to investigating the impact of burn pits on soldiers' health, referencing his son's experience[2]. Additionally, Biden discussed his plan to fight inflation by cutting prescription drug costs and garnering support from Nobel laureates and business leaders[4]. Furthermore, he emphasized the importance of continuing to combat COVID-19 and not merely accepting living with the virus[5]. Biden's remarks encompassed international relations, healthcare challenges faced by soldiers, economic strategies, and the ongoing battle against the pandemic.
Vectara FCS = 0.41796625
```
## Vectara 作为 LangChain 检索器

Vectara 组件也可以仅用作检索器。

在这种情况下，它的行为就像任何其他 LangChain 检索器。此模式的主要用途是语义搜索，在这种情况下我们禁用摘要：


```python
config.summary_config.is_enabled = False
config.k = 3
retriever = vectara.as_retriever(config=config)
retriever.invoke(query_str)
```



```output
[Document(page_content='He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully. We spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin.', metadata={'lang': 'eng', 'section': '1', 'offset': '2160', 'len': '36', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are.', metadata={'lang': 'eng', 'section': '1', 'offset': '35442', 'len': '57', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```


为了向后兼容，您还可以在检索器中启用摘要，在这种情况下，摘要将作为额外的文档对象添加：


```python
config.summary_config.is_enabled = True
config.k = 3
retriever = vectara.as_retriever(config=config)
retriever.invoke(query_str)
```



```output
[Document(page_content='He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully. We spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin.', metadata={'lang': 'eng', 'section': '1', 'offset': '2160', 'len': '36', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are.', metadata={'lang': 'eng', 'section': '1', 'offset': '35442', 'len': '57', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content="Biden discussed various topics in his statements. He highlighted the importance of unity and preparation to confront challenges, such as building coalitions to address global issues [1]. Additionally, he shared personal stories about the impact of health issues on soldiers, including his son's experience with brain cancer possibly linked to burn pits [2]. Biden also outlined his plans to combat inflation by cutting prescription drug costs and emphasized the ongoing efforts to combat COVID-19, rejecting the idea of merely living with the virus [4, 5]. Overall, Biden's messages revolved around unity, healthcare challenges faced by soldiers, economic plans, and the ongoing fight against COVID-19.", metadata={'summary': True, 'fcs': 0.54751414})]
```


## 使用 Vectara 进行高级 LangChain 查询预处理

Vectara的“RAG即服务”在创建问答或聊天机器人链中承担了大量的重任。与LangChain的集成提供了使用额外功能的选项，例如查询预处理，如`SelfQueryRetriever`或`MultiQueryRetriever`。让我们看一个使用[MultiQueryRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/MultiQueryRetriever)的例子。

由于MQR使用了大型语言模型，我们需要进行设置 - 这里我们选择`ChatOpenAI`：


```python
<!--IMPORTS:[{"imported": "MultiQueryRetriever", "source": "langchain.retrievers.multi_query", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.multi_query.MultiQueryRetriever.html", "title": "Vectara"}, {"imported": "ChatOpenAI", "source": "langchain_openai.chat_models", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Vectara"}]-->
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)


def get_summary(documents):
    return documents[-1].page_content


(mqr | get_summary).invoke(query_str)
```



```output
"Biden's statement highlighted his efforts to unite freedom-loving nations against Putin's aggression, sharing information in advance to counter Russian lies and hold Putin accountable[1]. Additionally, he emphasized his commitment to military families, like Danielle Robinson, and outlined plans for more affordable housing, Pre-K for 3- and 4-year-olds, and ensuring no additional taxes for those earning less than $400,000 a year[2][3]. The statement also touched on the readiness of the West and NATO to respond to Putin's actions, showcasing extensive preparation and coalition-building efforts[4]. Heath Robinson's story, a combat medic who succumbed to cancer from burn pits, was used to illustrate the resilience and fight for better conditions[5]."
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
