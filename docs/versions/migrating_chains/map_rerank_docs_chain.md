---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/map_rerank_docs_chain.ipynb
---
# 从 MapRerankDocumentsChain 迁移

[MapRerankDocumentsChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain.html) 实现了一种分析长文本的策略。该策略如下：

- 将文本拆分为较小的文档；
- 将一个过程映射到文档集，其中该过程包括生成一个分数；
- 按分数对结果进行排名并返回最大值。

在这种情况下，一个常见的过程是使用文档中的上下文片段进行问答。强制模型在生成答案的同时生成分数，有助于选择仅由相关上下文生成的答案。

一个 [LangGraph](https://langchain-ai.github.io/langgraph/) 实现允许将 [工具调用](/docs/concepts/#functiontool-calling) 和其他功能纳入此问题。下面我们将通过一个简单的示例来介绍 `MapRerankDocumentsChain` 和相应的 LangGraph 实现。

## 示例

让我们通过一个示例来分析一组文档。我们将使用以下 3 个文档：


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Migrating from MapRerankDocumentsChain"}]-->
from langchain_core.documents import Document

documents = [
    Document(page_content="Alice has blue eyes", metadata={"title": "book_chapter_2"}),
    Document(page_content="Bob has brown eyes", metadata={"title": "book_chapter_1"}),
    Document(
        page_content="Charlie has green eyes", metadata={"title": "book_chapter_3"}
    ),
]
```

### 旧版

<details open>

下面我们展示了使用 `MapRerankDocumentsChain` 的实现。我们为问答任务定义了提示词模板，并为此实例化了一个 [LLMChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html) 对象。我们定义了文档如何格式化为提示，并确保各种提示中的键保持一致。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating from MapRerankDocumentsChain"}, {"imported": "MapRerankDocumentsChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.map_rerank.MapRerankDocumentsChain.html", "title": "Migrating from MapRerankDocumentsChain"}, {"imported": "RegexParser", "source": "langchain.output_parsers.regex", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.regex.RegexParser.html", "title": "Migrating from MapRerankDocumentsChain"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Migrating from MapRerankDocumentsChain"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Migrating from MapRerankDocumentsChain"}]-->
from langchain.chains import LLMChain, MapRerankDocumentsChain
from langchain.output_parsers.regex import RegexParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

document_variable_name = "context"
llm = OpenAI()
# The prompt here should take as an input variable the
# `document_variable_name`
# The actual prompt will need to be a lot more complex, this is just
# an example.
prompt_template = (
    "What color are Bob's eyes? "
    "Output both your answer and a score (1-10) of how confident "
    "you are in the format: <Answer>\nScore: <Score>.\n\n"
    "Provide no other commentary.\n\n"
    "Context: {context}"
)
output_parser = RegexParser(
    regex=r"(.*?)\nScore: (.*)",
    output_keys=["answer", "score"],
)
prompt = PromptTemplate(
    template=prompt_template,
    input_variables=["context"],
    output_parser=output_parser,
)
llm_chain = LLMChain(llm=llm, prompt=prompt)
chain = MapRerankDocumentsChain(
    llm_chain=llm_chain,
    document_variable_name=document_variable_name,
    rank_key="score",
    answer_key="answer",
)
```


```python
response = chain.invoke(documents)
response["output_text"]
```
```output
/langchain/libs/langchain/langchain/chains/llm.py:369: UserWarning: The apply_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(
```


```output
'Brown'
```


检查上述运行的 [LangSmith trace](https://smith.langchain.com/public/7a071bd1-0283-4b90-898c-6e4a2b5a0593/r)，我们可以看到三个 LLM 调用——每个文档一个——并且评分机制减轻了幻觉的影响。

</details>

### LangGraph

<details open>

下面我们展示了这个过程的 LangGraph 实现。请注意，我们的模板是简化的，因为我们通过 [.with_structured_output](/docs/how_to/structured_output/) 方法将格式化指令委托给聊天模型的工具调用功能。

在这里，我们遵循基本的 [map-reduce](https://langchain-ai.github.io/langgraph/how-tos/map-reduce/) 工作流以并行执行 LLM 调用。

我们需要安装 `langgraph`：


```python
pip install -qU langgraph
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from MapRerankDocumentsChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from MapRerankDocumentsChain"}]-->
import operator
from typing import Annotated, List, TypedDict

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph


class AnswerWithScore(TypedDict):
    answer: str
    score: Annotated[int, ..., "Score from 1-10."]


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt_template = "What color are Bob's eyes?\n\n" "Context: {context}"
prompt = ChatPromptTemplate.from_template(prompt_template)

# The below chain formats context from a document into a prompt, then
# generates a response structured according to the AnswerWithScore schema.
map_chain = prompt | llm.with_structured_output(AnswerWithScore)

# Below we define the components that will make up the graph


# This will be the overall state of the graph.
# It will contain the input document contents, corresponding
# answers with scores, and a final answer.
class State(TypedDict):
    contents: List[str]
    answers_with_scores: Annotated[list, operator.add]
    answer: str


# This will be the state of the node that we will "map" all
# documents to in order to generate answers with scores
class MapState(TypedDict):
    content: str


# Here we define the logic to map out over the documents
# We will use this an edge in the graph
def map_analyses(state: State):
    # We will return a list of `Send` objects
    # Each `Send` object consists of the name of a node in the graph
    # as well as the state to send to that node
    return [
        Send("generate_analysis", {"content": content}) for content in state["contents"]
    ]


# Here we generate an answer with score, given a document
async def generate_analysis(state: MapState):
    response = await map_chain.ainvoke(state["content"])
    return {"answers_with_scores": [response]}


# Here we will select the top answer
def pick_top_ranked(state: State):
    ranked_answers = sorted(
        state["answers_with_scores"], key=lambda x: -int(x["score"])
    )
    return {"answer": ranked_answers[0]}


# Construct the graph: here we put everything together to construct our graph
graph = StateGraph(State)
graph.add_node("generate_analysis", generate_analysis)
graph.add_node("pick_top_ranked", pick_top_ranked)
graph.add_conditional_edges(START, map_analyses, ["generate_analysis"])
graph.add_edge("generate_analysis", "pick_top_ranked")
graph.add_edge("pick_top_ranked", END)
app = graph.compile()
```


```python
from IPython.display import Image

Image(app.get_graph().draw_mermaid_png())
```



![](data:image/jpg;base64,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)



```python
result = await app.ainvoke({"contents": [doc.page_content for doc in documents]})
result["answer"]
```



```output
{'answer': 'Bob has brown eyes.', 'score': 10}
```


检查上述运行的 [LangSmith trace](https://smith.langchain.com/public/b64bf9aa-7558-4c1b-be5c-ba8924069039/r)，我们可以看到三个 LLM 调用，如前所述。使用模型的工具调用功能还使我们能够省去解析步骤。

</details>

## 下一步

请参阅这些 [使用指南](/docs/how_to/#qa-with-rag)，了解更多关于使用 RAG 的问答任务。

查看[LangGraph文档](https://langchain-ai.github.io/langgraph/)以获取有关使用LangGraph构建的详细信息，包括关于LangGraph中map-reduce的详细信息的[本指南](https://langchain-ai.github.io/langgraph/how-tos/map-reduce/)。