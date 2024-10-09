---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/python.ipynb
---
# Python REPL

有时，对于复杂的计算，与其让大型语言模型直接生成答案，不如让大型语言模型生成代码来计算答案，然后运行该代码以获得答案。为了方便实现这一点，我们提供了一个简单的Python REPL来执行命令。

此接口只会返回打印的内容 - 因此，如果您想用它来计算答案，请确保让它打印出答案。


:::caution
Python REPL可以在主机上执行任意代码（例如，删除文件，进行网络请求）。请谨慎使用。

有关更多信息和一般安全指南，请参见 https://python.langchain.com/docs/security/。
:::


```python
<!--IMPORTS:[{"imported": "Tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Python REPL"}, {"imported": "PythonREPL", "source": "langchain_experimental.utilities", "docs": "https://python.langchain.com/api_reference/experimental/utilities/langchain_experimental.utilities.python.PythonREPL.html", "title": "Python REPL"}]-->
from langchain_core.tools import Tool
from langchain_experimental.utilities import PythonREPL
```


```python
python_repl = PythonREPL()
```


```python
python_repl.run("print(1+1)")
```
```output
Python REPL can execute arbitrary code. Use with caution.
```


```output
'2\n'
```



```python
# You can create the tool to pass to an agent
repl_tool = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`.",
    func=python_repl.run,
)
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
