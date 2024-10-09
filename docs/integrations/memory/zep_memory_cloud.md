---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/zep_memory_cloud.ipynb
---
# Zep 云端记忆
> 回忆、理解并提取聊天历史中的数据。增强个性化的AI体验。

> [Zep](https://www.getzep.com) 是一个用于AI助手应用的长期记忆服务。
> 使用Zep，您可以为AI助手提供回忆过去对话的能力，无论时间多么久远，
> 同时减少幻觉、延迟和成本。

> 请参阅 [Zep 云端安装指南](https://help.getzep.com/sdks) 和更多 [Zep 云端 LangChain 示例](https://github.com/getzep/zep-python/tree/main/examples)

## 示例

本笔记本演示了如何将 [Zep](https://www.getzep.com/) 用作您的聊天机器人的记忆。

我们将演示：

1. 将对话历史添加到Zep。
2. 运行代理并自动将消息添加到存储中。
3. 查看丰富的消息。
4. 在对话历史中进行向量搜索。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Zep Cloud Memory"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Zep Cloud Memory"}, {"imported": "ZepCloudMemory", "source": "langchain_community.memory.zep_cloud_memory", "docs": "https://python.langchain.com/api_reference/community/memory/langchain_community.memory.zep_cloud_memory.ZepCloudMemory.html", "title": "Zep Cloud Memory"}, {"imported": "ZepCloudRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.zep_cloud.ZepCloudRetriever.html", "title": "Zep Cloud Memory"}, {"imported": "WikipediaAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikipedia.WikipediaAPIWrapper.html", "title": "Zep Cloud Memory"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Zep Cloud Memory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Zep Cloud Memory"}, {"imported": "Tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Zep Cloud Memory"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Zep Cloud Memory"}]-->
from uuid import uuid4

from langchain.agents import AgentType, initialize_agent
from langchain_community.memory.zep_cloud_memory import ZepCloudMemory
from langchain_community.retrievers import ZepCloudRetriever
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.tools import Tool
from langchain_openai import OpenAI

session_id = str(uuid4())  # This is a unique identifier for the session
```

```output
---------------------------------------------------------------------------
``````output
AttributeError                            Traceback (most recent call last)
``````output
Cell In[3], line 8
      6 from langchain_community.utilities import WikipediaAPIWrapper
      7 from langchain_core.messages import AIMessage, HumanMessage
----> 8 from langchain_openai import OpenAI
     10 session_id = str(uuid4())  # This is a unique identifier for the session
``````output
File ~/job/integrations/langchain/libs/partners/openai/langchain_openai/__init__.py:1
----> 1 from langchain_openai.chat_models import (
      2     AzureChatOpenAI,
      3     ChatOpenAI,
      4 )
      5 from langchain_openai.embeddings import (
      6     AzureOpenAIEmbeddings,
      7     OpenAIEmbeddings,
      8 )
      9 from langchain_openai.llms import AzureOpenAI, OpenAI
``````output
File ~/job/integrations/langchain/libs/partners/openai/langchain_openai/chat_models/__init__.py:1
----> 1 from langchain_openai.chat_models.azure import AzureChatOpenAI
      2 from langchain_openai.chat_models.base import ChatOpenAI
      4 __all__ = [
      5     "ChatOpenAI",
      6     "AzureChatOpenAI",
      7 ]
``````output
File ~/job/integrations/langchain/libs/partners/openai/langchain_openai/chat_models/azure.py:8
      5 import os
      6 from typing import Any, Callable, Dict, List, Optional, Union
----> 8 import openai
      9 from langchain_core.outputs import ChatResult
     10 from langchain_core.pydantic_v1 import Field, SecretStr, root_validator
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/openai/__init__.py:8
      5 import os as _os
      6 from typing_extensions import override
----> 8 from . import types
      9 from ._types import NOT_GIVEN, NoneType, NotGiven, Transport, ProxiesTypes
     10 from ._utils import file_from_path
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/openai/types/__init__.py:5
      1 # File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
      3 from __future__ import annotations
----> 5 from .batch import Batch as Batch
      6 from .image import Image as Image
      7 from .model import Model as Model
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/openai/types/batch.py:7
      4 from typing import List, Optional
      5 from typing_extensions import Literal
----> 7 from .._models import BaseModel
      8 from .batch_error import BatchError
      9 from .batch_request_counts import BatchRequestCounts
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/openai/_models.py:667
    662     json_data: Body
    663     extra_json: AnyMapping
    666 @final
--> 667 class FinalRequestOptions(pydantic.BaseModel):
    668     method: str
    669     url: str
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py:202, in __new__(mcs, cls_name, bases, namespace, __pydantic_generic_metadata__, __pydantic_reset_parent_namespace__, _create_model_module, **kwargs)
    199         super(cls, cls).__pydantic_init_subclass__(**kwargs)  # type: ignore[misc]
    200         return cls
    201     else:
--> 202         # this is the BaseModel class itself being created, no logic required
    203         return super().__new__(mcs, cls_name, bases, namespace, **kwargs)
    205 if not typing.TYPE_CHECKING:  # pragma: no branch
    206     # We put `__getattr__` in a non-TYPE_CHECKING block because otherwise, mypy allows arbitrary attribute access
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_model_construction.py:539, in complete_model_class(cls, cls_name, config_wrapper, raise_errors, types_namespace, create_model_module)
    532 # debug(schema)
    533 cls.__pydantic_core_schema__ = schema
    535 cls.__pydantic_validator__ = create_schema_validator(
    536     schema,
    537     cls,
    538     create_model_module or cls.__module__,
--> 539     cls.__qualname__,
    540     'create_model' if create_model_module else 'BaseModel',
    541     core_config,
    542     config_wrapper.plugin_settings,
    543 )
    544 cls.__pydantic_serializer__ = SchemaSerializer(schema, core_config)
    545 cls.__pydantic_complete__ = True
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/main.py:626, in __get_pydantic_core_schema__(cls, source, handler)
    611 @classmethod
    612 def __pydantic_init_subclass__(cls, **kwargs: Any) -> None:
    613     """This is intended to behave just like `__init_subclass__`, but is called by `ModelMetaclass`
    614     only after the class is actually fully initialized. In particular, attributes like `model_fields` will
    615     be present when this is called.
    616 
    617     This is necessary because `__init_subclass__` will always be called by `type.__new__`,
    618     and it would require a prohibitively large refactor to the `ModelMetaclass` to ensure that
    619     `type.__new__` was called in such a manner that the class would already be sufficiently initialized.
    620 
    621     This will receive the same `kwargs` that would be passed to the standard `__init_subclass__`, namely,
    622     any kwargs passed to the class definition that aren't used internally by pydantic.
    623 
    624     Args:
    625         **kwargs: Any keyword arguments passed to the class definition that aren't used internally
--> 626             by pydantic.
    627     """
    628     pass
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_schema_generation_shared.py:82, in CallbackGetCoreSchemaHandler.__call__(self, source_type)
     81 def __call__(self, __source_type: Any) -> core_schema.CoreSchema:
---> 82     schema = self._handler(__source_type)
     83     ref = schema.get('ref')
     84     if self._ref_mode == 'to-def':
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:502, in generate_schema(self, obj, from_dunder_get_core_schema)
    498 schema = _add_custom_serialization_from_json_encoders(self._config_wrapper.json_encoders, obj, schema)
    500 schema = self._post_process_generated_schema(schema)
--> 502 return schema
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:753, in _generate_schema_inner(self, obj)
    749 def match_type(self, obj: Any) -> core_schema.CoreSchema:  # noqa: C901
    750     """Main mapping of types to schemas.
    751 
    752     The general structure is a series of if statements starting with the simple cases
--> 753     (non-generic primitive types) and then handling generics and other more complex cases.
    754 
    755     Each case either generates a schema directly, calls into a public user-overridable method
    756     (like `GenerateSchema.tuple_variable_schema`) or calls into a private method that handles some
    757     boilerplate before calling into the user-facing method (e.g. `GenerateSchema._tuple_schema`).
    758 
    759     The idea is that we'll evolve this into adding more and more user facing methods over time
    760     as they get requested and we figure out what the right API for them is.
    761     """
    762     if obj is str:
    763         return self.str_schema()
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:580, in _model_schema(self, cls)
    574         inner_schema = new_inner_schema
    575     inner_schema = apply_model_validators(inner_schema, model_validators, 'inner')
    577     model_schema = core_schema.model_schema(
    578         cls,
    579         inner_schema,
--> 580         custom_init=getattr(cls, '__pydantic_custom_init__', None),
    581         root_model=False,
    582         post_init=getattr(cls, '__pydantic_post_init__', None),
    583         config=core_config,
    584         ref=model_ref,
    585         metadata=metadata,
    586     )
    588 schema = self._apply_model_serializers(model_schema, decorators.model_serializers.values())
    589 schema = apply_model_validators(schema, model_validators, 'outer')
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:580, in <dictcomp>(.0)
    574         inner_schema = new_inner_schema
    575     inner_schema = apply_model_validators(inner_schema, model_validators, 'inner')
    577     model_schema = core_schema.model_schema(
    578         cls,
    579         inner_schema,
--> 580         custom_init=getattr(cls, '__pydantic_custom_init__', None),
    581         root_model=False,
    582         post_init=getattr(cls, '__pydantic_post_init__', None),
    583         config=core_config,
    584         ref=model_ref,
    585         metadata=metadata,
    586     )
    588 schema = self._apply_model_serializers(model_schema, decorators.model_serializers.values())
    589 schema = apply_model_validators(schema, model_validators, 'outer')
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:916, in _generate_md_field_schema(self, name, field_info, decorators)
    906     common_field = self._common_field_schema(name, field_info, decorators)
    907     return core_schema.model_field(
    908         common_field['schema'],
    909         serialization_exclude=common_field['serialization_exclude'],
   (...)
    913         metadata=common_field['metadata'],
    914     )
--> 916 def _generate_dc_field_schema(
    917     self,
    918     name: str,
    919     field_info: FieldInfo,
    920     decorators: DecoratorInfos,
    921 ) -> core_schema.DataclassField:
    922     """Prepare a DataclassField to represent the parameter/field, of a dataclass."""
    923     common_field = self._common_field_schema(name, field_info, decorators)
``````output
File ~/job/zep-proprietary/venv/lib/python3.11/site-packages/pydantic/_internal/_generate_schema.py:1114, in _common_field_schema(self, name, field_info, decorators)
   1108 json_schema_extra = field_info.json_schema_extra
   1110 metadata = build_metadata_dict(
   1111     js_annotation_functions=[get_json_schema_update_func(json_schema_updates, json_schema_extra)]
   1112 )
-> 1114 alias_generator = self._config_wrapper.alias_generator
   1115 if alias_generator is not None:
   1116     self._apply_alias_generator_to_field_info(alias_generator, field_info, name)
``````output
AttributeError: 'FieldInfo' object has no attribute 'deprecated'
```


```python
# Provide your OpenAI key
import getpass

openai_key = getpass.getpass()
```


```python
# Provide your Zep API key. See https://help.getzep.com/projects#api-keys

zep_api_key = getpass.getpass()
```

### 初始化 Zep 聊天消息历史类并初始化代理



```python
search = WikipediaAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description=(
            "useful for when you need to search online for answers. You should ask"
            " targeted questions"
        ),
    ),
]

# Set up Zep Chat History
memory = ZepCloudMemory(
    session_id=session_id,
    api_key=zep_api_key,
    return_messages=True,
    memory_key="chat_history",
)

# Initialize the agent
llm = OpenAI(temperature=0, openai_api_key=openai_key)
agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

### 添加一些历史数据



```python
# Preload some messages into the memory. The default message window is 12 messages. We want to push beyond this to demonstrate auto-summarization.
test_history = [
    {"role": "human", "content": "Who was Octavia Butler?"},
    {
        "role": "ai",
        "content": (
            "Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American"
            " science fiction author."
        ),
    },
    {"role": "human", "content": "Which books of hers were made into movies?"},
    {
        "role": "ai",
        "content": (
            "The most well-known adaptation of Octavia Butler's work is the FX series"
            " Kindred, based on her novel of the same name."
        ),
    },
    {"role": "human", "content": "Who were her contemporaries?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R."
            " Delany, and Joanna Russ."
        ),
    },
    {"role": "human", "content": "What awards did she win?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur"
            " Fellowship."
        ),
    },
    {
        "role": "human",
        "content": "Which other women sci-fi writers might I want to read?",
    },
    {
        "role": "ai",
        "content": "You might want to read Ursula K. Le Guin or Joanna Russ.",
    },
    {
        "role": "human",
        "content": (
            "Write a short synopsis of Butler's book, Parable of the Sower. What is it"
            " about?"
        ),
    },
    {
        "role": "ai",
        "content": (
            "Parable of the Sower is a science fiction novel by Octavia Butler,"
            " published in 1993. It follows the story of Lauren Olamina, a young woman"
            " living in a dystopian future where society has collapsed due to"
            " environmental disasters, poverty, and violence."
        ),
        "metadata": {"foo": "bar"},
    },
]

for msg in test_history:
    memory.chat_memory.add_message(
        (
            HumanMessage(content=msg["content"])
            if msg["role"] == "human"
            else AIMessage(content=msg["content"])
        ),
        metadata=msg.get("metadata", {}),
    )
```

### 运行代理

这样做将自动将输入和响应添加到 Zep 内存中。



```python
agent_chain.invoke(
    input="What is the book's relevance to the challenges facing contemporary society?",
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
AI: Parable of the Sower is highly relevant to contemporary society as it explores themes of environmental degradation, social and economic inequality, and the struggle for survival in a chaotic world. It also delves into issues of race, gender, and religion, making it a thought-provoking and timely read.[0m

[1m> Finished chain.[0m
```


```output
{'input': "What is the book's relevance to the challenges facing contemporary society?",
 'chat_history': [HumanMessage(content="Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.\nOctavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.\nUrsula K. Le Guin is known for novels like The Left Hand of Darkness and The Dispossessed.\nJoanna Russ is the author of the influential feminist science fiction novel The Female Man.\nMargaret Atwood is known for works like The Handmaid's Tale and the MaddAddam trilogy.\nConnie Willis is an award-winning author of science fiction and fantasy, known for novels like Doomsday Book.\nOctavia Butler is a pioneering black female science fiction author, known for Kindred and the Parable series.\nOctavia Estelle Butler was an acclaimed American science fiction author. While none of her books were directly adapted into movies, her novel Kindred was adapted into a TV series on FX. Butler was part of a generation of prominent science fiction writers in the 20th century, including contemporaries such as Ursula K. Le Guin, Samuel R. Delany, Chip Delany, and Nalo Hopkinson.\nhuman: What awards did she win?\nai: Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.\nhuman: Which other women sci-fi writers might I want to read?\nai: You might want to read Ursula K. Le Guin or Joanna Russ.\nhuman: Write a short synopsis of Butler's book, Parable of the Sower. What is it about?\nai: Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.")],
 'output': 'Parable of the Sower is highly relevant to contemporary society as it explores themes of environmental degradation, social and economic inequality, and the struggle for survival in a chaotic world. It also delves into issues of race, gender, and religion, making it a thought-provoking and timely read.'}
```


### 检查 Zep 内存

注意摘要，以及历史记录已被丰富，包含令牌计数、UUID 和时间戳。

摘要偏向于最近的消息。



```python
def print_messages(messages):
    for m in messages:
        print(m.type, ":\n", m.dict())


print(memory.chat_memory.zep_summary)
print("\n")
print("Conversation Facts: ")
facts = memory.chat_memory.zep_facts
for fact in facts:
    print(fact + "\n")
print_messages(memory.chat_memory.messages)
```
```output
Octavia Estelle Butler was an acclaimed American science fiction author. While none of her books were directly adapted into movies, her novel Kindred was adapted into a TV series on FX. Butler was part of a generation of prominent science fiction writers in the 20th century, including contemporaries such as Ursula K. Le Guin, Samuel R. Delany, Chip Delany, and Nalo Hopkinson.


Conversation Facts: 
Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.

Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.

Ursula K. Le Guin is known for novels like The Left Hand of Darkness and The Dispossessed.

Joanna Russ is the author of the influential feminist science fiction novel The Female Man.

Margaret Atwood is known for works like The Handmaid's Tale and the MaddAddam trilogy.

Connie Willis is an award-winning author of science fiction and fantasy, known for novels like Doomsday Book.

Octavia Butler is a pioneering black female science fiction author, known for Kindred and the Parable series.

Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993.

The novel follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.

Parable of the Sower explores themes of environmental degradation, social and economic inequality, and the struggle for survival in a chaotic world.

The novel also delves into issues of race, gender, and religion, making it a thought-provoking and timely read.

human :
 {'content': "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.\nOctavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.\nUrsula K. Le Guin is known for novels like The Left Hand of Darkness and The Dispossessed.\nJoanna Russ is the author of the influential feminist science fiction novel The Female Man.\nMargaret Atwood is known for works like The Handmaid's Tale and the MaddAddam trilogy.\nConnie Willis is an award-winning author of science fiction and fantasy, known for novels like Doomsday Book.\nOctavia Butler is a pioneering black female science fiction author, known for Kindred and the Parable series.\nParable of the Sower is a science fiction novel by Octavia Butler, published in 1993.\nThe novel follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.\nParable of the Sower explores themes of environmental degradation, social and economic inequality, and the struggle for survival in a chaotic world.\nThe novel also delves into issues of race, gender, and religion, making it a thought-provoking and timely read.\nOctavia Estelle Butler was an acclaimed American science fiction author. While none of her books were directly adapted into movies, her novel Kindred was adapted into a TV series on FX. Butler was part of a generation of prominent science fiction writers in the 20th century, including contemporaries such as Ursula K. Le Guin, Samuel R. Delany, Chip Delany, and Nalo Hopkinson.\nhuman: Which other women sci-fi writers might I want to read?\nai: You might want to read Ursula K. Le Guin or Joanna Russ.\nhuman: Write a short synopsis of Butler's book, Parable of the Sower. What is it about?\nai: Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.\nhuman: What is the book's relevance to the challenges facing contemporary society?\nai: Parable of the Sower is highly relevant to contemporary society as it explores themes of environmental degradation, social and economic inequality, and the struggle for survival in a chaotic world. It also delves into issues of race, gender, and religion, making it a thought-provoking and timely read.", 'additional_kwargs': {}, 'response_metadata': {}, 'type': 'human', 'name': None, 'id': None, 'example': False}
```
### 在 Zep 内存上进行向量搜索

Zep 通过 `ZepRetriever` 提供对历史对话内存的原生向量搜索。

您可以将 `ZepRetriever` 与支持传入 LangChain `Retriever` 对象的链一起使用。



```python
retriever = ZepCloudRetriever(
    session_id=session_id,
    api_key=zep_api_key,
)

search_results = memory.chat_memory.search("who are some famous women sci-fi authors?")
for r in search_results:
    if r.score > 0.8:  # Only print results with similarity of 0.8 or higher
        print(r.message, r.score)
```
```output
content='Which other women sci-fi writers might I want to read?' created_at='2024-05-10T14:34:16.714292Z' metadata=None role='human' role_type=None token_count=12 updated_at='0001-01-01T00:00:00Z' uuid_='64ca1fae-8db1-4b4f-8a45-9b0e57e88af5' 0.8960460126399994
```