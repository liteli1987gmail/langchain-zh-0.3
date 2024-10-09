---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/example_selectors_langsmith.ipynb
---
# 如何从 LangSmith 数据集中选择示例

import Prerequisites from "@theme/Prerequisites";
import Compatibility from "@theme/Compatibility";

<Prerequisites titlesAndLinks={[
  ["Chat models", "/docs/concepts/#chat-models"],
  ["Few-shot-prompting", "/docs/concepts/#few-shot-prompting"],
  ["LangSmith", "/docs/concepts/#langsmith"],
]} />


<Compatibility packagesAndVersions={[
  ["langsmith", "0.1.101"],
  ["langchain-core", "0.2.34"],
]} />


LangSmith 数据集内置支持相似性搜索，使其成为构建和查询少量示例的绝佳工具。

在本指南中，我们将看到如何使用索引的 LangSmith 数据集作为少量示例选择器。

## 设置

在开始之前，请确保您已[创建了 LangSmith 账户](https://smith.langchain.com/)并设置了您的凭据：


```python
import getpass
import os

if not os.environ.get("LANGSMITH_API_KEY"):
    os.environ["LANGSMITH_API_KEY"] = getpass.getpass("Set LangSmith API key:\n\n")

os.environ["LANGSMITH_TRACING"] = "true"
```
```output
Set LangSmith API key:

········
```
我们需要安装 `LangSmith` SDK。在这个例子中，我们还将使用 `LangChain`、`langchain-openai` 和 `langchain-benchmarks`：


```python
%pip install -qU "langsmith>=0.1.101" "langchain-core>=0.2.34" langchain langchain-openai langchain-benchmarks
```

现在我们将克隆一个公共数据集并为该数据集开启索引。我们也可以通过 [LangSmith UI](https://docs.smith.langchain.com/how_to_guides/datasets/index_datasets_for_dynamic_few_shot_example_selection) 开启索引。

我们将克隆 [Multiverse 数学少量示例数据集](https://blog.langchain.dev/few-shot-prompting-to-improve-tool-calling-performance/)。

这使得可以在数据集上进行搜索，并确保每当我们更新/添加示例时，它们也会被索引。


```python
from langsmith import Client as LangSmith

ls_client = LangSmith()

dataset_name = "multiverse-math-few-shot-examples-v2"
dataset_public_url = (
    "https://smith.langchain.com/public/620596ee-570b-4d2b-8c8f-f828adbe5242/d"
)

ls_client.clone_public_dataset(dataset_public_url)

dataset_id = ls_client.read_dataset(dataset_name=dataset_name).id

ls_client.index_dataset(dataset_id=dataset_id)
```

## 查询数据集

索引可能需要几秒钟。一旦数据集被索引，我们可以搜索相似的示例。请注意，`similar_examples` 方法的输入必须与示例输入具有相同的结构。在这种情况下，我们的示例输入是一个包含“question”键的字典：


```python
examples = ls_client.similar_examples(
    {"question": "whats the negation of the negation of the negation of 3"},
    limit=3,
    dataset_id=dataset_id,
)
len(examples)
```



```output
3
```



```python
examples[0].inputs["question"]
```



```output
'evaluate the negation of -100'
```


对于这个数据集，输出是跟随问题的对话，采用 OpenAI 消息格式：


```python
examples[0].outputs["conversation"]
```



```output
[{'role': 'assistant',
  'content': None,
  'tool_calls': [{'id': 'toolu_01HTpq4cYNUac6F7omUc2Wz3',
    'type': 'function',
    'function': {'name': 'negate', 'arguments': '{"a": -100}'}}]},
 {'role': 'tool',
  'content': '-100.0',
  'tool_call_id': 'toolu_01HTpq4cYNUac6F7omUc2Wz3'},
 {'role': 'assistant', 'content': 'So the answer is 100.'},
 {'role': 'user',
  'content': '100 is incorrect. Please refer to the output of your tool call.'},
 {'role': 'assistant',
  'content': [{'text': "You're right, my previous answer was incorrect. Let me re-evaluate using the tool output:",
    'type': 'text'}],
  'tool_calls': [{'id': 'toolu_01XsJQboYghGDygQpPjJkeRq',
    'type': 'function',
    'function': {'name': 'negate', 'arguments': '{"a": -100}'}}]},
 {'role': 'tool',
  'content': '-100.0',
  'tool_call_id': 'toolu_01XsJQboYghGDygQpPjJkeRq'},
 {'role': 'assistant', 'content': 'The answer is -100.0'},
 {'role': 'user',
  'content': 'You have the correct numerical answer but are returning additional text. Please only respond with the numerical answer.'},
 {'role': 'assistant', 'content': '-100.0'}]
```


## 创建动态少量示例提示

搜索返回的示例是与查询输入最相似的输入。我们可以这样使用它来进行少量示例提示：


```python
<!--IMPORTS:[{"imported": "init_chat_model", "source": "langchain.chat_models", "docs": "https://python.langchain.com/api_reference/langchain/chat_models/langchain.chat_models.base.init_chat_model.html", "title": "How to select examples from a LangSmith dataset"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to select examples from a LangSmith dataset"}]-->
from langchain.chat_models import init_chat_model
from langchain_benchmarks.tool_usage.tasks.multiverse_math import (
    add,
    cos,
    divide,
    log,
    multiply,
    negate,
    pi,
    power,
    sin,
    subtract,
)
from langchain_core.runnables import RunnableLambda
from langsmith import AsyncClient as AsyncLangSmith

async_ls_client = AsyncLangSmith()


def similar_examples(input_: dict) -> dict:
    examples = ls_client.similar_examples(input_, limit=5, dataset_id=dataset_id)
    return {**input_, "examples": examples}


async def asimilar_examples(input_: dict) -> dict:
    examples = await async_ls_client.similar_examples(
        input_, limit=5, dataset_id=dataset_id
    )
    return {**input_, "examples": examples}


def construct_prompt(input_: dict) -> list:
    instructions = """You are great at using mathematical tools."""
    examples = []
    for ex in input_["examples"]:
        examples.append({"role": "user", "content": ex.inputs["question"]})
        for msg in ex.outputs["conversation"]:
            if msg["role"] == "assistant":
                msg["name"] = "example_assistant"
            if msg["role"] == "user":
                msg["name"] = "example_user"
            examples.append(msg)
    return [
        {"role": "system", "content": instructions},
        *examples,
        {"role": "user", "content": input_["question"]},
    ]


tools = [add, cos, divide, log, multiply, negate, pi, power, sin, subtract]
llm = init_chat_model("gpt-4o-2024-08-06")
llm_with_tools = llm.bind_tools(tools)

example_selector = RunnableLambda(func=similar_examples, afunc=asimilar_examples)

chain = example_selector | construct_prompt | llm_with_tools
```


```python
ai_msg = await chain.ainvoke({"question": "whats the negation of the negation of 3"})
ai_msg.tool_calls
```



```output
[{'name': 'negate',
  'args': {'a': 3},
  'id': 'call_uMSdoTl6ehfHh5a6JQUb2NoZ',
  'type': 'tool_call'}]
```


查看 LangSmith 跟踪，我们可以看到在 `similar_examples` 步骤中提取了相关示例，并作为消息传递给 ChatOpenAI： https://smith.langchain.com/public/9585e30f-765a-4ed9-b964-2211420cd2f8/r/fdea98d6-e90f-49d4-ac22-dfd012e9e0d9。
