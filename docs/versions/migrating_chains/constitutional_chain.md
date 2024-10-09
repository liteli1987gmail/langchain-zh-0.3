---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/constitutional_chain.ipynb
---
# 从 ConstitutionalChain 迁移

[ConstitutionalChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.constitutional_ai.base.ConstitutionalChain.html) 允许大型语言模型根据 [原则](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html) 对生成内容进行批评和修订，这些原则结构化为批评和修订请求的组合。例如，一个原则可能包括识别有害内容的请求，以及重写内容的请求。

`Constitutional AI 原则` 基于 [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/pdf/2212.08073) 论文。

在 `ConstitutionalChain` 中，这种批评请求及相关修订的结构被格式化为大型语言模型提示，并从字符串响应中解析出来。这可以通过聊天模型的 [结构化输出](/docs/how_to/structured_output/) 特性更自然地实现。我们可以在 [LangGraph](https://langchain-ai.github.io/langgraph/) 中构建一个简单的链来实现这个目的。这种方法的一些优点包括：

- 利用为此目的进行微调的聊天模型的工具调用能力；
- 减少从字符串大型语言模型响应中提取表达式时的解析错误；
- 将指令委派给 [消息角色](/docs/concepts/#messages)（例如，聊天模型可以理解 `ToolMessage` 代表什么，而无需额外提示）；
- 支持流式处理，包括单个标记和链步骤。


```python
%pip install --upgrade --quiet langchain-openai
```


```python
import os
from getpass import getpass

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass()
```

## 旧版

<details open>


```python
<!--IMPORTS:[{"imported": "ConstitutionalChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.constitutional_ai.base.ConstitutionalChain.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "ConstitutionalPrinciple", "source": "langchain.chains.constitutional_ai.models", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Migrating from ConstitutionalChain"}]-->
from langchain.chains import ConstitutionalChain, LLMChain
from langchain.chains.constitutional_ai.models import ConstitutionalPrinciple
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

llm = OpenAI()

qa_prompt = PromptTemplate(
    template="Q: {question} A:",
    input_variables=["question"],
)
qa_chain = LLMChain(llm=llm, prompt=qa_prompt)

constitutional_chain = ConstitutionalChain.from_llm(
    llm=llm,
    chain=qa_chain,
    constitutional_principles=[
        ConstitutionalPrinciple(
            critique_request="Tell if this answer is good.",
            revision_request="Give a better answer.",
        )
    ],
    return_intermediate_steps=True,
)

result = constitutional_chain.invoke("What is the meaning of life?")
```


```python
result
```



```output
{'question': 'What is the meaning of life?',
 'output': 'The meaning of life is a deeply personal and ever-evolving concept. It is a journey of self-discovery and growth, and can be different for each individual. Some may find meaning in relationships, others in achieving their goals, and some may never find a concrete answer. Ultimately, the meaning of life is what we make of it.',
 'initial_output': ' The meaning of life is a subjective concept that can vary from person to person. Some may believe that the purpose of life is to find happiness and fulfillment, while others may see it as a journey of self-discovery and personal growth. Ultimately, the meaning of life is something that each individual must determine for themselves.',
 'critiques_and_revisions': [('This answer is good in that it recognizes and acknowledges the subjective nature of the question and provides a valid and thoughtful response. However, it could have also mentioned that the meaning of life is a complex and deeply personal concept that can also change and evolve over time for each individual. Critique Needed.',
   'The meaning of life is a deeply personal and ever-evolving concept. It is a journey of self-discovery and growth, and can be different for each individual. Some may find meaning in relationships, others in achieving their goals, and some may never find a concrete answer. Ultimately, the meaning of life is what we make of it.')]}
```


上面，我们返回了显示中间步骤的内容：

- 原始问题；
- 初始输出；
- 批评和修订；
- 最终输出（匹配修订）。

</details>

## LangGraph

<details open>

下面，我们使用 [.with_structured_output](/docs/how_to/structured_output/) 方法同时生成 (1) 是否需要批评的判断，以及 (2) 批评。我们展示了所有相关的提示，以便于清晰和自定义。

请注意，我们还能够通过此实现流式处理中间步骤，因此我们可以在执行过程中监控并在需要时进行干预。


```python
<!--IMPORTS:[{"imported": "ConstitutionalPrinciple", "source": "langchain.chains.constitutional_ai.models", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.constitutional_ai.models.ConstitutionalPrinciple.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "CRITIQUE_PROMPT", "source": "langchain.chains.constitutional_ai.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.CRITIQUE_PROMPT.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "REVISION_PROMPT", "source": "langchain.chains.constitutional_ai.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.REVISION_PROMPT.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from ConstitutionalChain"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Migrating from ConstitutionalChain"}]-->
from typing import List, Optional, Tuple

from langchain.chains.constitutional_ai.models import ConstitutionalPrinciple
from langchain.chains.constitutional_ai.prompts import (
    CRITIQUE_PROMPT,
    REVISION_PROMPT,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from typing_extensions import Annotated, TypedDict

llm = ChatOpenAI(model="gpt-4o-mini")


class Critique(TypedDict):
    """Generate a critique, if needed."""

    critique_needed: Annotated[bool, ..., "Whether or not a critique is needed."]
    critique: Annotated[str, ..., "If needed, the critique."]


critique_prompt = ChatPromptTemplate.from_template(
    "Critique this response according to the critique request. "
    "If no critique is needed, specify that.\n\n"
    "Query: {query}\n\n"
    "Response: {response}\n\n"
    "Critique request: {critique_request}"
)

revision_prompt = ChatPromptTemplate.from_template(
    "Revise this response according to the critique and reivsion request.\n\n"
    "Query: {query}\n\n"
    "Response: {response}\n\n"
    "Critique request: {critique_request}\n\n"
    "Critique: {critique}\n\n"
    "If the critique does not identify anything worth changing, ignore the "
    "revision request and return 'No revisions needed'. If the critique "
    "does identify something worth changing, revise the response based on "
    "the revision request.\n\n"
    "Revision Request: {revision_request}"
)

chain = llm | StrOutputParser()
critique_chain = critique_prompt | llm.with_structured_output(Critique)
revision_chain = revision_prompt | llm | StrOutputParser()


class State(TypedDict):
    query: str
    constitutional_principles: List[ConstitutionalPrinciple]
    initial_response: str
    critiques_and_revisions: List[Tuple[str, str]]
    response: str


async def generate_response(state: State):
    """Generate initial response."""
    response = await chain.ainvoke(state["query"])
    return {"response": response, "initial_response": response}


async def critique_and_revise(state: State):
    """Critique and revise response according to principles."""
    critiques_and_revisions = []
    response = state["initial_response"]
    for principle in state["constitutional_principles"]:
        critique = await critique_chain.ainvoke(
            {
                "query": state["query"],
                "response": response,
                "critique_request": principle.critique_request,
            }
        )
        if critique["critique_needed"]:
            revision = await revision_chain.ainvoke(
                {
                    "query": state["query"],
                    "response": response,
                    "critique_request": principle.critique_request,
                    "critique": critique["critique"],
                    "revision_request": principle.revision_request,
                }
            )
            response = revision
            critiques_and_revisions.append((critique["critique"], revision))
        else:
            critiques_and_revisions.append((critique["critique"], ""))
    return {
        "critiques_and_revisions": critiques_and_revisions,
        "response": response,
    }


graph = StateGraph(State)
graph.add_node("generate_response", generate_response)
graph.add_node("critique_and_revise", critique_and_revise)

graph.add_edge(START, "generate_response")
graph.add_edge("generate_response", "critique_and_revise")
graph.add_edge("critique_and_revise", END)
app = graph.compile()
```


```python
constitutional_principles = [
    ConstitutionalPrinciple(
        critique_request="Tell if this answer is good.",
        revision_request="Give a better answer.",
    )
]

query = "What is the meaning of life? Answer in 10 words or fewer."

async for step in app.astream(
    {"query": query, "constitutional_principles": constitutional_principles},
    stream_mode="values",
):
    subset = ["initial_response", "critiques_and_revisions", "response"]
    print({k: v for k, v in step.items() if k in subset})
```
```output
{}
{'initial_response': 'Finding purpose, connection, and joy in our experiences and relationships.', 'response': 'Finding purpose, connection, and joy in our experiences and relationships.'}
{'initial_response': 'Finding purpose, connection, and joy in our experiences and relationships.', 'critiques_and_revisions': [("The response exceeds the 10-word limit, providing a more elaborate answer than requested. A concise response, such as 'To seek purpose and joy in life,' would better align with the query.", 'To seek purpose and joy in life.')], 'response': 'To seek purpose and joy in life.'}
```
</details>

## 下一步

请查看生成结构化输出的指南 [这里](/docs/how_to/structured_output/)。

请查看 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) 以获取有关使用 LangGraph 构建的详细信息。
