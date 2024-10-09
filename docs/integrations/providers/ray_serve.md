---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/ray_serve.ipynb
---
# Ray Serve

[Ray Serve](https://docs.ray.io/en/latest/serve/index.html) 是一个可扩展的模型服务库，用于构建在线推理API。Serve 特别适合系统组合，使您能够用 Python 代码构建由多个链和业务逻辑组成的复杂推理服务。

## 本笔记本的目标
本笔记本展示了如何将 OpenAI 链部署到生产环境的简单示例。您可以扩展它以部署您自己的自托管模型，在那里您可以轻松定义运行模型所需的硬件资源（GPU 和 CPU）数量，以高效地在生产中运行。有关可用选项（包括自动扩展）的更多信息，请参阅 Ray Serve [文档](https://docs.ray.io/en/latest/serve/getting_started.html)。


## 设置 Ray Serve
使用 `pip install ray[serve]` 安装 ray。

## 一般框架

部署服务的一般框架如下：


```python
# 0: Import ray serve and request from starlette
from ray import serve
from starlette.requests import Request


# 1: Define a Ray Serve deployment.
@serve.deployment
class LLMServe:
    def __init__(self) -> None:
        # All the initialization code goes here
        pass

    async def __call__(self, request: Request) -> str:
        # You can parse the request here
        # and return a response
        return "Hello World"


# 2: Bind the model to deployment
deployment = LLMServe.bind()

# 3: Run the deployment
serve.api.run(deployment)
```


```python
# Shutdown the deployment
serve.api.shutdown()
```

## 部署和 OpenAI 链的示例，使用自定义提示词

从 [这里](https://platform.openai.com/account/api-keys) 获取 OpenAI API 密钥。运行以下代码时，系统会要求您提供 API 密钥。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Ray Serve"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Ray Serve"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Ray Serve"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```


```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```


```python
@serve.deployment
class DeployLLM:
    def __init__(self):
        # We initialize the LLM, template and the chain here
        llm = OpenAI(openai_api_key=OPENAI_API_KEY)
        template = "Question: {question}\n\nAnswer: Let's think step by step."
        prompt = PromptTemplate.from_template(template)
        self.chain = LLMChain(llm=llm, prompt=prompt)

    def _run_chain(self, text: str):
        return self.chain(text)

    async def __call__(self, request: Request):
        # 1. Parse the request
        text = request.query_params["text"]
        # 2. Run the chain
        resp = self._run_chain(text)
        # 3. Return the response
        return resp["text"]
```

现在我们可以绑定部署。


```python
# Bind the model to deployment
deployment = DeployLLM.bind()
```

当我们想要运行部署时，可以分配端口号和主机。


```python
# Example port number
PORT_NUMBER = 8282
# Run the deployment
serve.api.run(deployment, port=PORT_NUMBER)
```

现在服务已部署在端口 `localhost:8282`，我们可以发送 POST 请求以获取结果。


```python
import requests

text = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
response = requests.post(f"http://localhost:{PORT_NUMBER}/?text={text}")
print(response.content.decode())
```
