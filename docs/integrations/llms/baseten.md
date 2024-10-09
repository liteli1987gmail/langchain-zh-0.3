---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/baseten.ipynb
---
# Baseten

[Baseten](https://baseten.co) 是 LangChain 生态系统中的一个 [Provider](/docs/integrations/providers/baseten)，实现了 LLMs 组件。

本示例演示了如何使用一个 LLM — 在 Baseten 上托管的 Mistral 7B — 与 LangChain。

# 设置

要运行此示例，您需要：

* 一个 [Baseten 账户](https://baseten.co)
* 一个 [API 密钥](https://docs.baseten.co/observability/api-keys)

将您的 API 密钥导出为名为 `BASETEN_API_KEY` 的环境变量。

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

# 单模型调用

首先，您需要将模型部署到 Baseten。

您可以通过 [Baseten 模型库](https://app.baseten.co/explore/) 一键部署基础模型，如 Mistral 和 Llama 2，或者如果您有自己的模型，可以 [使用 Truss 部署](https://truss.baseten.co/welcome)。

在这个示例中，我们将使用 Mistral 7B。[在这里部署 Mistral 7B](https://app.baseten.co/explore/mistral_7b_instruct)，并根据模型仪表板中找到的已部署模型 ID 进行操作。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```


```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```


```python
# Load the model
mistral = Baseten(model="MODEL_ID", deployment="production")
```


```python
# Prompt the model
mistral("What is the Mistral wind?")
```

# 链式模型调用

我们可以将多个调用链在一起，针对一个或多个模型，这正是 LangChain 的核心目的！

例如，我们可以在这个终端仿真演示中用 Mistral 替换 GPT。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Baseten"}, {"imported": "ConversationBufferWindowMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer_window.ConversationBufferWindowMemory.html", "title": "Baseten"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Baseten"}]-->
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)


chatgpt_chain = LLMChain(
    llm=mistral,
    llm_kwargs={"max_length": 4096},
    prompt=prompt,
    verbose=True,
    memory=ConversationBufferWindowMemory(k=2),
)

output = chatgpt_chain.predict(
    human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd."
)
print(output)
```


```python
output = chatgpt_chain.predict(human_input="ls ~")
print(output)
```


```python
output = chatgpt_chain.predict(human_input="cd ~")
print(output)
```


```python
output = chatgpt_chain.predict(
    human_input="""echo -e "x=lambda y:y*5+3;print('Result:' + str(x(6)))" > run.py && python3 run.py"""
)
print(output)
```

正如我们从最后一个示例中看到的，它输出一个可能正确也可能不正确的数字，模型只是近似可能的终端输出，并没有实际执行提供的命令。不过，这个示例展示了 Mistral 的广泛上下文窗口、代码生成能力，以及在对话序列中保持主题的能力。


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
