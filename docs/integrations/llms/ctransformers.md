---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/ctransformers.ipynb
---
# C Transformers

[C Transformers](https://github.com/marella/ctransformers)库提供了GGML模型的Python绑定。

本示例介绍了如何使用LangChain与`C Transformers` [模型](https://github.com/marella/ctransformers#supported-models)进行交互。

**安装**


```python
%pip install --upgrade --quiet  ctransformers
```

**加载模型**


```python
<!--IMPORTS:[{"imported": "CTransformers", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ctransformers.CTransformers.html", "title": "C Transformers"}]-->
from langchain_community.llms import CTransformers

llm = CTransformers(model="marella/gpt-2-ggml")
```

**生成文本**


```python
print(llm.invoke("AI is going to"))
```

**流式处理**


```python
<!--IMPORTS:[{"imported": "StreamingStdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.streaming_stdout.StreamingStdOutCallbackHandler.html", "title": "C Transformers"}]-->
from langchain_core.callbacks import StreamingStdOutCallbackHandler

llm = CTransformers(
    model="marella/gpt-2-ggml", callbacks=[StreamingStdOutCallbackHandler()]
)

response = llm.invoke("AI is going to")
```

**LLM链**


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "C Transformers"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "C Transformers"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer:"""

prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

response = llm_chain.run("What is AI?")
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
