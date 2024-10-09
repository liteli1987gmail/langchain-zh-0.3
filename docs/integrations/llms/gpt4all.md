---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/gpt4all.ipynb
---
# GPT4All

[GitHub:nomic-ai/gpt4all](https://github.com/nomic-ai/gpt4all) 一个基于大量干净助手数据（包括代码、故事和对话）训练的开源聊天机器人生态系统。

本示例介绍如何使用LangChain与`GPT4All`模型进行交互。


```python
%pip install --upgrade --quiet langchain-community gpt4all
```

### 导入 GPT4All


```python
<!--IMPORTS:[{"imported": "GPT4All", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.gpt4all.GPT4All.html", "title": "GPT4All"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "GPT4All"}]-->
from langchain_community.llms import GPT4All
from langchain_core.prompts import PromptTemplate
```

### 设置要传递给大型语言模型的问题


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### 指定模型

要在本地运行，请下载兼容的 ggml 格式模型。
 
该 [gpt4all 页面](https://gpt4all.io/index.html) 有一个有用的 `模型浏览器` 部分：

* 选择感兴趣的模型
* 使用 UI 下载并将 `.bin` 文件移动到 `local_path`（如下所示）

有关更多信息，请访问 https://github.com/nomic-ai/gpt4all。

---

This integration does not yet support streaming in chunks via the [`.stream()`](https://python.langchain.com/docs/how_to/streaming/) method. The below example uses a callback handler with `streaming=True`:


```python
local_path = (
    "./models/Meta-Llama-3-8B-Instruct.Q4_0.gguf"  # replace with your local file path
)
```


```python
<!--IMPORTS:[{"imported": "BaseCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.base.BaseCallbackHandler.html", "title": "GPT4All"}]-->
from langchain_core.callbacks import BaseCallbackHandler

count = 0


class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        global count
        if count < 10:
            print(f"Token: {token}")
            count += 1


# Verbose is required to pass to the callback manager
llm = GPT4All(model=local_path, callbacks=[MyCustomHandler()], streaming=True)

# If you want to use a custom model add the backend parameter
# Check https://docs.gpt4all.io/gpt4all_python.html for supported backends
# llm = GPT4All(model=local_path, backend="gptj", callbacks=callbacks, streaming=True)

chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

# Streamed tokens will be logged/aggregated via the passed callback
res = chain.invoke({"question": question})
```
```output
Token:  Justin
Token:  Bieber
Token:  was
Token:  born
Token:  on
Token:  March
Token:  
Token: 1
Token: ,
Token:
```

## Related

- LLM [conceptual guide](/docs/concepts/#llms)
- LLM [how-to guides](/docs/how_to/#llms)
