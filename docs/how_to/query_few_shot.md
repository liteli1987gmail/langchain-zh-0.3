---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_few_shot.ipynb
sidebar_position: 2
---
# 如何为查询分析添加示例到提示词

随着我们的查询分析变得越来越复杂，LLM 可能会在某些场景中难以理解它应该如何准确响应。为了提高这里的性能，我们可以在提示词中添加示例来引导 LLM。

让我们看看如何为我们在 [快速入门](/docs/tutorials/query_analysis) 中构建的 LangChain YouTube 视频查询分析器添加示例。

## 设置
#### 安装依赖


```python
# %pip install -qU langchain-core langchain-openai
```

#### 设置环境变量

我们将在这个例子中使用OpenAI：


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 查询模式

我们将定义一个查询模式，希望我们的模型输出。为了使我们的查询分析更有趣，我们将添加一个`sub_queries`字段，其中包含从顶层问题派生的更具体的问题。


```python
from typing import List, Optional

from pydantic import BaseModel, Field

sub_queries_description = """\
If the original question contains multiple distinct sub-questions, \
or if there are more generic questions that would be helpful to answer in \
order to answer the original question, write a list of all relevant sub-questions. \
Make sure this list is comprehensive and covers all parts of the original question. \
It's ok if there's redundancy in the sub-questions. \
Make sure the sub-questions are as narrowly focused as possible."""


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Primary similarity search query applied to video transcripts.",
    )
    sub_queries: List[str] = Field(
        default_factory=list, description=sub_queries_description
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

## 查询生成


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add examples to the prompt for query analysis"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

让我们在提示中不使用任何示例来尝试我们的查询分析器：


```python
query_analyzer.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```



```output
Search(query='difference between web voyager and reflection agents', sub_queries=['what is web voyager', 'what are reflection agents', 'do both web voyager and reflection agents use langgraph?'], publish_year=None)
```


## 添加示例和调整提示

这效果很好，但我们可能希望它进一步分解问题，以分开关于Web Voyager和Reflection Agents的查询。

为了调整我们的查询生成结果，我们可以在提示中添加一些输入问题和标准输出查询的示例。


```python
examples = []
```


```python
question = "What's chat langchain, is it a langchain template?"
query = Search(
    query="What is chat langchain and is it a langchain template?",
    sub_queries=["What is chat langchain", "What is a langchain template"],
)
examples.append({"input": question, "tool_calls": [query]})
```


```python
question = "How to build multi-agent system and stream intermediate steps from it"
query = Search(
    query="How to build multi-agent system and stream intermediate steps from it",
    sub_queries=[
        "How to build multi-agent system",
        "How to stream intermediate steps from multi-agent system",
        "How to stream intermediate steps",
    ],
)

examples.append({"input": question, "tool_calls": [query]})
```


```python
question = "LangChain agents vs LangGraph?"
query = Search(
    query="What's the difference between LangChain agents and LangGraph? How do you deploy them?",
    sub_queries=[
        "What are LangChain agents",
        "What is LangGraph",
        "How do you deploy LangChain agents",
        "How do you deploy LangGraph",
    ],
)
examples.append({"input": question, "tool_calls": [query]})
```

现在我们需要更新我们的提示模板和链，以便在每个提示中包含示例。由于我们正在使用OpenAI的函数调用，我们需要做一些额外的结构调整，以将示例输入和输出发送给模型。我们将创建一个`tool_example_to_messages`辅助函数来处理这个问题：


```python
<!--IMPORTS:[{"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.base.BaseMessage.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "How to add examples to the prompt for query analysis"}, {"imported": "ToolMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.tool.ToolMessage.html", "title": "How to add examples to the prompt for query analysis"}]-->
import uuid
from typing import Dict

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)


def tool_example_to_messages(example: Dict) -> List[BaseMessage]:
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```


```python
<!--IMPORTS:[{"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "How to add examples to the prompt for query analysis"}]-->
from langchain_core.prompts import MessagesPlaceholder

query_analyzer_with_examples = (
    {"question": RunnablePassthrough()}
    | prompt.partial(examples=example_msgs)
    | structured_llm
)
```


```python
query_analyzer_with_examples.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```



```output
Search(query="What's the difference between web voyager and reflection agents? Do both use langgraph?", sub_queries=['What is web voyager', 'What are reflection agents', 'Do web voyager and reflection agents use langgraph?'], publish_year=None)
```


感谢我们的示例，我们得到了一个稍微更细化的搜索查询。通过更多的提示词工程和对示例的调整，我们可以进一步改善查询生成。

您可以看到这些示例作为消息传递给模型，在[LangSmith追踪](https://smith.langchain.com/public/aeaaafce-d2b1-4943-9a61-bc954e8fc6f2/r)中查看。
