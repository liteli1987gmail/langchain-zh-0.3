---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/openlm.ipynb
---
# OpenLM
[OpenLM](https://github.com/r2d4/openlm) 是一个零依赖的 OpenAI 兼容大模型供应商，可以通过 HTTP 直接调用不同的推理端点。


它实现了 OpenAI Completion 类，因此可以作为 OpenAI API 的直接替代。这次更改利用了 BaseOpenAI，以最小化添加的代码。

这个示例介绍了如何使用 LangChain 与 OpenAI 和 HuggingFace 进行交互。您需要从两者获取 API 密钥。

### 设置
安装依赖项并设置 API 密钥。


```python
# Uncomment to install openlm and openai if you haven't already

%pip install --upgrade --quiet  openlm
%pip install --upgrade --quiet  langchain-openai
```


```python
import os
from getpass import getpass

# Check if OPENAI_API_KEY environment variable is set
if "OPENAI_API_KEY" not in os.environ:
    print("Enter your OpenAI API key:")
    os.environ["OPENAI_API_KEY"] = getpass()

# Check if HF_API_TOKEN environment variable is set
if "HF_API_TOKEN" not in os.environ:
    print("Enter your HuggingFace Hub API key:")
    os.environ["HF_API_TOKEN"] = getpass()
```

### 使用 LangChain 与 OpenLM

在这里，我们将调用两个模型在 LLMChain 中，来自 OpenAI 的 `text-davinci-003` 和 HuggingFace 上的 `gpt2`。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "OpenLM"}, {"imported": "OpenLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.openlm.OpenLM.html", "title": "OpenLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OpenLM"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import OpenLM
from langchain_core.prompts import PromptTemplate
```


```python
question = "What is the capital of France?"
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)

for model in ["text-davinci-003", "huggingface.co/gpt2"]:
    llm = OpenLM(model=model)
    llm_chain = LLMChain(prompt=prompt, llm=llm)
    result = llm_chain.run(question)
    print(
        """Model: {}
Result: {}""".format(model, result)
    )
```
```output
Model: text-davinci-003
Result:  France is a country in Europe. The capital of France is Paris.
Model: huggingface.co/gpt2
Result: Question: What is the capital of France?

Answer: Let's think step by step. I am not going to lie, this is a complicated issue, and I don't see any solutions to all this, but it is still far more
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
