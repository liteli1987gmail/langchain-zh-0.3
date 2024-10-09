---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/textgen.ipynb
---
# 文本生成

[GitHub:oobabooga/text-generation-webui](https://github.com/oobabooga/text-generation-webui) 一个用于运行大型语言模型（如LLaMA、llama.cpp、GPT-J、Pythia、OPT和GALACTICA）的Gradio网页用户界面。

本示例介绍如何使用LangChain通过`text-generation-webui` API集成与大型语言模型进行交互。

请确保您已配置`text-generation-webui`并安装了大型语言模型。建议通过适合您操作系统的[一键安装程序](https://github.com/oobabooga/text-generation-webui#one-click-installers)进行安装。

一旦`text-generation-webui`安装完成并通过网页界面确认工作，请通过网页模型配置选项卡启用`api`选项，或通过在启动命令中添加运行时参数`--api`来启用。

## 设置model_url并运行示例


```python
model_url = "http://localhost:5000"
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "TextGen"}, {"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "TextGen"}, {"imported": "TextGen", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.textgen.TextGen.html", "title": "TextGen"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "TextGen"}]-->
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(model_url=model_url)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```

### 流式处理版本

您需要安装 websocket-client 才能使用此功能。
`pip install websocket-client`


```python
model_url = "ws://localhost:5005"
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "TextGen"}, {"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "TextGen"}, {"imported": "TextGen", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.textgen.TextGen.html", "title": "TextGen"}, {"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "TextGen"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "TextGen"}]-->
from langchain.chains import LLMChain
from langchain.globals import set_debug
from langchain_community.llms import TextGen
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain_core.prompts import PromptTemplate

set_debug(True)

template = """Question: {question}

Answer: Let's think step by step."""


prompt = PromptTemplate.from_template(template)
llm = TextGen(
    model_url=model_url, streaming=True, callbacks=[StreamingStdOutCallbackHandler()]
)
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "What NFL team won the Super Bowl in the year Justin Bieber was born?"

llm_chain.run(question)
```


```python
llm = TextGen(model_url=model_url, streaming=True)
for chunk in llm.stream("Ask 'Hi, how are you?' like a pirate:'", stop=["'", "\n"]):
    print(chunk, end="", flush=True)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
