---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/modal.ipynb
---
# 模态

该[Modal云平台](https://modal.com/docs/guide)提供了从本地计算机的Python脚本方便的按需无服务器云计算访问。
使用`modal`运行您自己的自定义LLM模型，而不是依赖LLM API。

本示例介绍了如何使用LangChain与`modal` HTTPS [网络端点](https://modal.com/docs/guide/webhooks)进行交互。

[_使用LangChain进行问答_](https://modal.com/docs/guide/ex/potus_speech_qanda)是另一个如何将LangChain与`Modal`结合使用的示例。在该示例中，Modal端到端运行LangChain应用程序，并使用OpenAI作为其LLM API。


```python
%pip install --upgrade --quiet  modal
```


```python
# Register an account with Modal and get a new token.

!modal token new
```
```output
Launching login page in your browser window...
If this is not showing up, please copy this URL into your web browser manually:
https://modal.com/token-flow/tf-Dzm3Y01234mqmm1234Vcu3
```
[`langchain.llms.modal.Modal`](https://github.com/langchain-ai/langchain/blame/master/langchain/llms/modal.py) 集成类要求您部署一个具有符合以下 JSON 接口的 web 端点的 Modal 应用程序：

1. LLM 提示作为键 "prompt" 下的 `str` 值被接受
2. LLM 响应作为键 "prompt" 下的 `str` 值返回

**示例请求 JSON:**

```json
{
    "prompt": "Identify yourself, bot!",
    "extra": "args are allowed",
}
```

**示例响应 JSON:**

```json
{
    "prompt": "This is the LLM speaking",
}
```

一个满足此接口的 'dummy' Modal web 端点函数示例是

```python
...
...

class Request(BaseModel):
    prompt: str

@stub.function()
@modal.web_endpoint(method="POST")
def web(request: Request):
    _ = request  # ignore input
    return {"prompt": "hello world"}
```

* 请参阅 Modal 的 [web 端点](https://modal.com/docs/guide/webhooks#passing-arguments-to-web-endpoints) 指南，了解设置满足此接口的端点的基础知识。
* 请参阅 Modal 的 ['使用 AutoGPTQ 运行 Falcon-40B'](https://modal.com/docs/guide/ex/falcon_gptq) 开源 LLM 示例，作为您自定义 LLM 的起点！

一旦您部署了 Modal web 端点，您可以将其 URL 传递给 `langchain.llms.modal.Modal` LLM 类。该类可以作为您链中的构建块。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Modal"}, {"imported": "Modal", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.modal.Modal.html", "title": "Modal"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Modal"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import Modal
from langchain_core.prompts import PromptTemplate
```


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```


```python
endpoint_url = "https://ecorp--custom-llm-endpoint.modal.run"  # REPLACE ME with your deployed Modal web endpoint's URL
llm = Modal(endpoint_url=endpoint_url)
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
