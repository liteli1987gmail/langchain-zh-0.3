---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/runnable_runtime_secrets.ipynb
---
# 如何将运行时机密传递给可运行对象

:::info Requires `langchain-core >= 0.2.22`

:::

我们可以使用 `RunnableConfig` 在运行时将机密传递给我们的可运行对象。具体来说，我们可以将带有 `__` 前缀的机密传递给 `configurable` 字段。这将确保这些机密不会作为调用的一部分被追踪：


```python
<!--IMPORTS:[{"imported": "RunnableConfig", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.config.RunnableConfig.html", "title": "How to pass runtime secrets to runnables"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to pass runtime secrets to runnables"}]-->
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool


@tool
def foo(x: int, config: RunnableConfig) -> int:
    """Sum x and a secret int"""
    return x + config["configurable"]["__top_secret_int"]


foo.invoke({"x": 5}, {"configurable": {"__top_secret_int": 2, "traced_key": "bar"}})
```



```output
7
```


查看此次运行的LangSmith追踪，我们可以看到“traced_key”被记录（作为元数据的一部分），而我们的秘密整数没有被记录： https://smith.langchain.com/public/aa7e3289-49ca-422d-a408-f6b927210170/r
