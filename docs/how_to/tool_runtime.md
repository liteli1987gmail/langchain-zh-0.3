---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/tool_runtime.ipynb
---
# 如何将运行时值传递给工具

import Prerequisites from "@theme/Prerequisites";
import Compatibility from "@theme/Compatibility";

<Prerequisites titlesAndLinks={[
  ["Chat models", "/docs/concepts/#chat-models"],
  ["LangChain Tools", "/docs/concepts/#tools"],
  ["How to create tools", "/docs/how_to/custom_tools"],
  ["How to use a model to call tools", "/docs/how_to/tool_calling"],
]} />


<Compatibility packagesAndVersions={[
  ["langchain-core", "0.2.21"],
]} />

您可能需要将仅在运行时已知的值绑定到工具。例如，工具逻辑可能需要使用发出请求的用户的ID。

大多数情况下，这些值不应由大型语言模型（LLM）控制。实际上，允许LLM控制用户ID可能会导致安全风险。

相反，LLM应仅控制工具中应由LLM控制的参数，而其他参数（如用户ID）应由应用程序逻辑固定。

本使用手册将向您展示如何防止模型生成某些工具参数并在运行时直接注入它们。

:::info Using with LangGraph

如果您正在使用LangGraph，请参考[本使用手册](https://langchain-ai.github.io/langgraph/how-tos/pass-run-time-values-to-tools/)
该手册展示了如何创建一个代理，以跟踪特定用户的最爱宠物。
:::

我们可以将它们绑定到聊天模型，如下所示：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>


## 隐藏模型参数

我们可以使用 InjectedToolArg 注解来标记我们工具的某些参数，例如 `user_id`，表示它们在运行时被注入，意味着它们不应该由模型生成


```python
<!--IMPORTS:[{"imported": "InjectedToolArg", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.InjectedToolArg.html", "title": "How to pass run time values to tools"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to pass run time values to tools"}]-->
from typing import List

from langchain_core.tools import InjectedToolArg, tool
from typing_extensions import Annotated

user_to_pets = {}


@tool(parse_docstring=True)
def update_favorite_pets(
    pets: List[str], user_id: Annotated[str, InjectedToolArg]
) -> None:
    """Add the list of favorite pets.

    Args:
        pets: List of favorite pets to set.
        user_id: User's ID.
    """
    user_to_pets[user_id] = pets


@tool(parse_docstring=True)
def delete_favorite_pets(user_id: Annotated[str, InjectedToolArg]) -> None:
    """Delete the list of favorite pets.

    Args:
        user_id: User's ID.
    """
    if user_id in user_to_pets:
        del user_to_pets[user_id]


@tool(parse_docstring=True)
def list_favorite_pets(user_id: Annotated[str, InjectedToolArg]) -> None:
    """List favorite pets if any.

    Args:
        user_id: User's ID.
    """
    return user_to_pets.get(user_id, [])
```

如果我们查看这些工具的输入模式，我们会看到 user_id 仍然被列出：


```python
update_favorite_pets.get_input_schema().schema()
```



```output
{'description': 'Add the list of favorite pets.',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'},
  'user_id': {'description': "User's ID.",
   'title': 'User Id',
   'type': 'string'}},
 'required': ['pets', 'user_id'],
 'title': 'update_favorite_petsSchema',
 'type': 'object'}
```


但是如果我们查看工具调用模式，也就是传递给模型进行工具调用的内容，user_id 已被移除：


```python
update_favorite_pets.tool_call_schema.schema()
```



```output
{'description': 'Add the list of favorite pets.',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'}},
 'required': ['pets'],
 'title': 'update_favorite_pets',
 'type': 'object'}
```


所以当我们调用我们的工具时，我们需要传入 user_id：


```python
user_id = "123"
update_favorite_pets.invoke({"pets": ["lizard", "dog"], "user_id": user_id})
print(user_to_pets)
print(list_favorite_pets.invoke({"user_id": user_id}))
```
```output
{'123': ['lizard', 'dog']}
['lizard', 'dog']
```
但是当模型调用工具时，不会生成 user_id 参数：


```python
tools = [
    update_favorite_pets,
    delete_favorite_pets,
    list_favorite_pets,
]
llm_with_tools = llm.bind_tools(tools)
ai_msg = llm_with_tools.invoke("my favorite animals are cats and parrots")
ai_msg.tool_calls
```



```output
[{'name': 'update_favorite_pets',
  'args': {'pets': ['cats', 'parrots']},
  'id': 'call_pZ6XVREGh1L0BBSsiGIf1xVm',
  'type': 'tool_call'}]
```


## 在运行时注入参数

如果我们想要实际使用模型生成的工具调用来执行我们的工具，我们需要自己注入 user_id：


```python
<!--IMPORTS:[{"imported": "chain", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.chain.html", "title": "How to pass run time values to tools"}]-->
from copy import deepcopy

from langchain_core.runnables import chain


@chain
def inject_user_id(ai_msg):
    tool_calls = []
    for tool_call in ai_msg.tool_calls:
        tool_call_copy = deepcopy(tool_call)
        tool_call_copy["args"]["user_id"] = user_id
        tool_calls.append(tool_call_copy)
    return tool_calls


inject_user_id.invoke(ai_msg)
```



```output
[{'name': 'update_favorite_pets',
  'args': {'pets': ['cats', 'parrots'], 'user_id': '123'},
  'id': 'call_pZ6XVREGh1L0BBSsiGIf1xVm',
  'type': 'tool_call'}]
```


现在我们可以将我们的模型、注入代码和实际工具链在一起，创建一个工具执行链：


```python
tool_map = {tool.name: tool for tool in tools}


@chain
def tool_router(tool_call):
    return tool_map[tool_call["name"]]


chain = llm_with_tools | inject_user_id | tool_router.map()
chain.invoke("my favorite animals are cats and parrots")
```



```output
[ToolMessage(content='null', name='update_favorite_pets', tool_call_id='call_oYCD0THSedHTbwNAY3NW6uUj')]
```


查看 user_to_pets 字典，我们可以看到它已更新以包含猫和鹦鹉：


```python
user_to_pets
```



```output
{'123': ['cats', 'parrots']}
```


## 注释参数的其他方法

以下是注释我们工具参数的几种其他方法：


```python
<!--IMPORTS:[{"imported": "BaseTool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.base.BaseTool.html", "title": "How to pass run time values to tools"}]-->
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field


class UpdateFavoritePetsSchema(BaseModel):
    """Update list of favorite pets"""

    pets: List[str] = Field(..., description="List of favorite pets to set.")
    user_id: Annotated[str, InjectedToolArg] = Field(..., description="User's ID.")


@tool(args_schema=UpdateFavoritePetsSchema)
def update_favorite_pets(pets, user_id):
    user_to_pets[user_id] = pets


update_favorite_pets.get_input_schema().schema()
```



```output
{'description': 'Update list of favorite pets',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'},
  'user_id': {'description': "User's ID.",
   'title': 'User Id',
   'type': 'string'}},
 'required': ['pets', 'user_id'],
 'title': 'UpdateFavoritePetsSchema',
 'type': 'object'}
```



```python
update_favorite_pets.tool_call_schema.schema()
```



```output
{'description': 'Update list of favorite pets',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'}},
 'required': ['pets'],
 'title': 'update_favorite_pets',
 'type': 'object'}
```



```python
from typing import Optional, Type


class UpdateFavoritePets(BaseTool):
    name: str = "update_favorite_pets"
    description: str = "Update list of favorite pets"
    args_schema: Optional[Type[BaseModel]] = UpdateFavoritePetsSchema

    def _run(self, pets, user_id):
        user_to_pets[user_id] = pets


UpdateFavoritePets().get_input_schema().schema()
```



```output
{'description': 'Update list of favorite pets',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'},
  'user_id': {'description': "User's ID.",
   'title': 'User Id',
   'type': 'string'}},
 'required': ['pets', 'user_id'],
 'title': 'UpdateFavoritePetsSchema',
 'type': 'object'}
```



```python
UpdateFavoritePets().tool_call_schema.schema()
```



```output
{'description': 'Update list of favorite pets',
 'properties': {'pets': {'description': 'List of favorite pets to set.',
   'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'}},
 'required': ['pets'],
 'title': 'update_favorite_pets',
 'type': 'object'}
```



```python
class UpdateFavoritePets2(BaseTool):
    name: str = "update_favorite_pets"
    description: str = "Update list of favorite pets"

    def _run(self, pets: List[str], user_id: Annotated[str, InjectedToolArg]) -> None:
        user_to_pets[user_id] = pets


UpdateFavoritePets2().get_input_schema().schema()
```



```output
{'description': 'Use the tool.\n\nAdd run_manager: Optional[CallbackManagerForToolRun] = None\nto child implementations to enable tracing.',
 'properties': {'pets': {'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'},
  'user_id': {'title': 'User Id', 'type': 'string'}},
 'required': ['pets', 'user_id'],
 'title': 'update_favorite_petsSchema',
 'type': 'object'}
```



```python
UpdateFavoritePets2().tool_call_schema.schema()
```



```output
{'description': 'Update list of favorite pets',
 'properties': {'pets': {'items': {'type': 'string'},
   'title': 'Pets',
   'type': 'array'}},
 'required': ['pets'],
 'title': 'update_favorite_pets',
 'type': 'object'}
```

