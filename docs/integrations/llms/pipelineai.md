---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/pipelineai.ipynb
---
# PipelineAI

>[PipelineAI](https://pipeline.ai) 允许您在云中大规模运行您的机器学习模型。它还提供对 [多个大型语言模型](https://pipeline.ai) 的 API 访问。

本笔记本介绍了如何将 LangChain 与 [PipelineAI](https://docs.pipeline.ai/docs) 一起使用。

## PipelineAI 示例

[此示例展示了 PipelineAI 如何与 LangChain 集成](https://docs.pipeline.ai/docs/langchain)，由 PipelineAI 创建。

## 设置
使用 `PipelineAI` API（即 `Pipeline Cloud`）需要 `pipeline-ai` 库。使用 `pip install pipeline-ai` 安装 `pipeline-ai`。


```python
# Install the package
%pip install --upgrade --quiet  pipeline-ai
```

## 示例

### 导入


```python
<!--IMPORTS:[{"imported": "PipelineAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.pipelineai.PipelineAI.html", "title": "PipelineAI"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "PipelineAI"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "PipelineAI"}]-->
import os

from langchain_community.llms import PipelineAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
```

### 设置环境 API 密钥
确保从 PipelineAI 获取您的 API 密钥。查看 [云快速入门指南](https://docs.pipeline.ai/docs/cloud-quickstart)。您将获得 30 天的免费试用，包含 10 小时的无服务器 GPU 计算，以测试不同的模型。


```python
os.environ["PIPELINE_API_KEY"] = "YOUR_API_KEY_HERE"
```

## 创建 PipelineAI 实例
在实例化 PipelineAI 时，您需要指定要使用的管道的 ID 或标签，例如 `pipeline_key = "public/gpt-j:base"`。然后，您可以选择传递其他特定于管道的关键字参数：


```python
llm = PipelineAI(pipeline_key="YOUR_PIPELINE_KEY", pipeline_kwargs={...})
```

### 创建提示词模板
我们将为问答创建一个提示词模板。


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

### 初始化 LLMChain


```python
llm_chain = prompt | llm | StrOutputParser()
```

### 运行 LLMChain
提供一个问题并运行 LLMChain。


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
