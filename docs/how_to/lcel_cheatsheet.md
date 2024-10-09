---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/lcel_cheatsheet.ipynb
---
# LangChain表达式 (LCEL) 速查表

这是所有最重要的 LCEL 原语的快速参考。有关更高级的用法，请参见 [LCEL 使用指南](/docs/how_to/#langchain-expression-language-lcel) 和 [完整 API 参考](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html)。

### 调用一个运行接口
#### [Runnable.invoke()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.invoke) / [Runnable.ainvoke()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.ainvoke)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

runnable = RunnableLambda(lambda x: str(x))
runnable.invoke(5)

# Async variant:
# await runnable.ainvoke(5)
```



```output
'5'
```


### 批量运行
#### [Runnable.batch()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.batch) / [Runnable.abatch()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.abatch)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

runnable = RunnableLambda(lambda x: str(x))
runnable.batch([7, 8, 9])

# Async variant:
# await runnable.abatch([7, 8, 9])
```



```output
['7', '8', '9']
```


### 流式运行
#### [Runnable.stream()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.stream) / [Runnable.astream()](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.astream)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda


def func(x):
    for y in x:
        yield str(y)


runnable = RunnableLambda(func)

for chunk in runnable.stream(range(5)):
    print(chunk)

# Async variant:
# async for chunk in await runnable.astream(range(5)):
#     print(chunk)
```
```output
0
1
2
3
4
```
### 组合运行
#### 管道操作符 `|`


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)

chain = runnable1 | runnable2

chain.invoke(2)
```



```output
[{'foo': 2}, {'foo': 2}]
```


### 并行调用运行
#### [RunnableParallel](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)

chain = RunnableParallel(first=runnable1, second=runnable2)

chain.invoke(2)
```



```output
{'first': {'foo': 2}, 'second': [2, 2]}
```


### 将任何函数转换为可运行
#### [RunnableLambda](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda


def func(x):
    return x + 5


runnable = RunnableLambda(func)
runnable.invoke(2)
```



```output
7
```


### 合并输入和输出字典
#### [RunnablePassthrough.assign](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

runnable1 = RunnableLambda(lambda x: x["foo"] + 7)

chain = RunnablePassthrough.assign(bar=runnable1)

chain.invoke({"foo": 10})
```



```output
{'foo': 10, 'bar': 17}
```


### 将输入字典包含在输出字典中
#### [RunnablePassthrough](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)

runnable1 = RunnableLambda(lambda x: x["foo"] + 7)

chain = RunnableParallel(bar=runnable1, baz=RunnablePassthrough())

chain.invoke({"foo": 10})
```



```output
{'bar': 17, 'baz': {'foo': 10}}
```


### 添加默认调用参数
#### [Runnable.bind](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.bind)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from typing import Optional

from langchain_core.runnables import RunnableLambda


def func(main_arg: dict, other_arg: Optional[str] = None) -> dict:
    if other_arg:
        return {**main_arg, **{"foo": other_arg}}
    return main_arg


runnable1 = RunnableLambda(func)
bound_runnable1 = runnable1.bind(other_arg="bye")

bound_runnable1.invoke({"bar": "hello"})
```



```output
{'bar': 'hello', 'foo': 'bye'}
```


### 添加后备选项
#### [Runnable.with_fallbacks](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_fallbacks)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

runnable1 = RunnableLambda(lambda x: x + "foo")
runnable2 = RunnableLambda(lambda x: str(x) + "foo")

chain = runnable1.with_fallbacks([runnable2])

chain.invoke(5)
```



```output
'5foo'
```


### 添加重试
#### [Runnable.with_retry](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_retry)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

counter = -1


def func(x):
    global counter
    counter += 1
    print(f"attempt with {counter=}")
    return x / counter


chain = RunnableLambda(func).with_retry(stop_after_attempt=2)

chain.invoke(2)
```
```output
attempt with counter=0
attempt with counter=1
```


```output
2.0
```


### 配置可运行执行
#### [RunnableConfig](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)
runnable3 = RunnableLambda(lambda x: str(x))

chain = RunnableParallel(first=runnable1, second=runnable2, third=runnable3)

chain.invoke(7, config={"max_concurrency": 2})
```



```output
{'first': {'foo': 7}, 'second': [7, 7], 'third': '7'}
```


### 将默认配置添加到可运行项
#### [Runnable.with_config](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_config)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)
runnable3 = RunnableLambda(lambda x: str(x))

chain = RunnableParallel(first=runnable1, second=runnable2, third=runnable3)
configured_chain = chain.with_config(max_concurrency=2)

chain.invoke(7)
```



```output
{'first': {'foo': 7}, 'second': [7, 7], 'third': '7'}
```


### 使可运行属性可配置
#### [Runnable.with_configurable_fields](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableSerializable.html#langchain_core.runnables.base.RunnableSerializable.configurable_fields)


```python
<!--IMPORTS:[{"imported": "ConfigurableField", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.utils.ConfigurableField.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableSerializable", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableSerializable.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from typing import Any, Optional

from langchain_core.runnables import (
    ConfigurableField,
    RunnableConfig,
    RunnableSerializable,
)


class FooRunnable(RunnableSerializable[dict, dict]):
    output_key: str

    def invoke(
        self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Any
    ) -> list:
        return self._call_with_config(self.subtract_seven, input, config, **kwargs)

    def subtract_seven(self, input: dict) -> dict:
        return {self.output_key: input["foo"] - 7}


runnable1 = FooRunnable(output_key="bar")
configurable_runnable1 = runnable1.configurable_fields(
    output_key=ConfigurableField(id="output_key")
)

configurable_runnable1.invoke(
    {"foo": 10}, config={"configurable": {"output_key": "not bar"}}
)
```



```output
{'not bar': 3}
```



```python
configurable_runnable1.invoke({"foo": 10})
```



```output
{'bar': 3}
```


### 使链组件可配置
#### [Runnable.with_configurable_alternatives](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableSerializable.html#langchain_core.runnables.base.RunnableSerializable.configurable_alternatives)


```python
<!--IMPORTS:[{"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from typing import Any, Optional

from langchain_core.runnables import RunnableConfig, RunnableLambda, RunnableParallel


class ListRunnable(RunnableSerializable[Any, list]):
    def invoke(
        self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Any
    ) -> list:
        return self._call_with_config(self.listify, input, config, **kwargs)

    def listify(self, input: Any) -> list:
        return [input]


class StrRunnable(RunnableSerializable[Any, str]):
    def invoke(
        self, input: Any, config: Optional[RunnableConfig] = None, **kwargs: Any
    ) -> list:
        return self._call_with_config(self.strify, input, config, **kwargs)

    def strify(self, input: Any) -> str:
        return str(input)


runnable1 = RunnableLambda(lambda x: {"foo": x})

configurable_runnable = ListRunnable().configurable_alternatives(
    ConfigurableField(id="second_step"), default_key="list", string=StrRunnable()
)
chain = runnable1 | configurable_runnable

chain.invoke(7, config={"configurable": {"second_step": "string"}})
```



```output
"{'foo': 7}"
```



```python
chain.invoke(7)
```



```output
[{'foo': 7}]
```


### 根据输入动态构建链


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)

chain = RunnableLambda(lambda x: runnable1 if x > 6 else runnable2)

chain.invoke(7)
```



```output
{'foo': 7}
```



```python
chain.invoke(5)
```



```output
[5, 5]
```


### 生成事件流
#### [Runnable.astream_events](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.astream_events)


```python
# | echo: false

import nest_asyncio

nest_asyncio.apply()
```


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x}, name="first")


async def func(x):
    for _ in range(5):
        yield x


runnable2 = RunnableLambda(func, name="second")

chain = runnable1 | runnable2

async for event in chain.astream_events("bar", version="v2"):
    print(f"event={event['event']} | name={event['name']} | data={event['data']}")
```
```output
event=on_chain_start | name=RunnableSequence | data={'input': 'bar'}
event=on_chain_start | name=first | data={}
event=on_chain_stream | name=first | data={'chunk': {'foo': 'bar'}}
event=on_chain_start | name=second | data={}
event=on_chain_end | name=first | data={'output': {'foo': 'bar'}, 'input': 'bar'}
event=on_chain_stream | name=second | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=RunnableSequence | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=second | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=RunnableSequence | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=second | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=RunnableSequence | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=second | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=RunnableSequence | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=second | data={'chunk': {'foo': 'bar'}}
event=on_chain_stream | name=RunnableSequence | data={'chunk': {'foo': 'bar'}}
event=on_chain_end | name=second | data={'output': {'foo': 'bar'}, 'input': {'foo': 'bar'}}
event=on_chain_end | name=RunnableSequence | data={'output': {'foo': 'bar'}}
```
### 按照完成的批次输出
#### [Runnable.batch_as_completed](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.batch_as_completed) / [Runnable.abatch_as_completed](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.abatch_as_completed)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
import time

from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: time.sleep(x) or print(f"slept {x}"))

for idx, result in runnable1.batch_as_completed([5, 1]):
    print(idx, result)

# Async variant:
# async for idx, result in runnable1.abatch_as_completed([5, 1]):
#     print(idx, result)
```
```output
slept 1
1 None
slept 5
0 None
```
### 返回输出字典的子集
#### [Runnable.pick](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.pick)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

runnable1 = RunnableLambda(lambda x: x["baz"] + 5)
chain = RunnablePassthrough.assign(foo=runnable1).pick(["foo", "bar"])

chain.invoke({"bar": "hi", "baz": 2})
```



```output
{'foo': 7, 'bar': 'hi'}
```


### 声明性地创建可运行的批处理版本
#### [Runnable.map](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.map)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda

runnable1 = RunnableLambda(lambda x: list(range(x)))
runnable2 = RunnableLambda(lambda x: x + 5)

chain = runnable1 | runnable2.map()

chain.invoke(3)
```



```output
[5, 6, 7]
```


### 获取可运行的图形表示
#### [Runnable.get_graph](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.get_graph)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

runnable1 = RunnableLambda(lambda x: {"foo": x})
runnable2 = RunnableLambda(lambda x: [x] * 2)
runnable3 = RunnableLambda(lambda x: str(x))

chain = runnable1 | RunnableParallel(second=runnable2, third=runnable3)

chain.get_graph().print_ascii()
```
```output
                             +-------------+                              
                             | LambdaInput |                              
                             +-------------+                              
                                    *                                     
                                    *                                     
                                    *                                     
                    +------------------------------+                      
                    | Lambda(lambda x: {'foo': x}) |                      
                    +------------------------------+                      
                                    *                                     
                                    *                                     
                                    *                                     
                     +-----------------------------+                      
                     | Parallel<second,third>Input |                      
                     +-----------------------------+                      
                        ****                  ***                         
                    ****                         ****                     
                  **                                 **                   
+---------------------------+               +--------------------------+  
| Lambda(lambda x: [x] * 2) |               | Lambda(lambda x: str(x)) |  
+---------------------------+               +--------------------------+  
                        ****                  ***                         
                            ****          ****                            
                                **      **                                
                    +------------------------------+                      
                    | Parallel<second,third>Output |                      
                    +------------------------------+
```
### 获取链中的所有提示
#### [Runnable.get_prompts](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.get_prompts)


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

prompt1 = ChatPromptTemplate.from_messages(
    [("system", "good ai"), ("human", "{input}")]
)
prompt2 = ChatPromptTemplate.from_messages(
    [
        ("system", "really good ai"),
        ("human", "{input}"),
        ("ai", "{ai_output}"),
        ("human", "{input2}"),
    ]
)
fake_llm = RunnableLambda(lambda prompt: "i am good ai")
chain = prompt1.assign(ai_output=fake_llm) | prompt2 | fake_llm

for i, prompt in enumerate(chain.get_prompts()):
    print(f"**prompt {i=}**\n")
    print(prompt.pretty_repr())
    print("\n" * 3)
```
```output
**prompt i=0**

================================ System Message ================================

good ai

================================ Human Message =================================

{input}




**prompt i=1**

================================ System Message ================================

really good ai

================================ Human Message =================================

{input}

================================== AI Message ==================================

{ai_output}

================================ Human Message =================================

{input2}
```
### 添加生命周期监听器
#### [Runnable.with_listeners](https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.Runnable.html#langchain_core.runnables.base.Runnable.with_listeners)


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "LangChain Expression Language Cheatsheet"}, {"imported": "Run", "source": "langchain_core.tracers.schemas", "docs": "https://python.langchain.com/api_reference/langsmith/run_trees/langsmith.run_trees.Run.html", "title": "LangChain Expression Language Cheatsheet"}]-->
import time

from langchain_core.runnables import RunnableLambda
from langchain_core.tracers.schemas import Run


def on_start(run_obj: Run):
    print("start_time:", run_obj.start_time)


def on_end(run_obj: Run):
    print("end_time:", run_obj.end_time)


runnable1 = RunnableLambda(lambda x: time.sleep(x))
chain = runnable1.with_listeners(on_start=on_start, on_end=on_end)
chain.invoke(2)
```
```output
start_time: 2024-05-17 23:04:00.951065+00:00
end_time: 2024-05-17 23:04:02.958765+00:00
```