---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/predictionguard.ipynb
---
# 预测保护


```python
%pip install --upgrade --quiet  predictionguard langchain
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Prediction Guard"}, {"imported": "PredictionGuard", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.predictionguard.PredictionGuard.html", "title": "Prediction Guard"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Prediction Guard"}]-->
import os

from langchain.chains import LLMChain
from langchain_community.llms import PredictionGuard
from langchain_core.prompts import PromptTemplate
```

## 基本的 LLM 使用




```python
# Optional, add your OpenAI API Key. This is optional, as Prediction Guard allows
# you to access all the latest open access models (see https://docs.predictionguard.com)
os.environ["OPENAI_API_KEY"] = "<your OpenAI api key>"

# Your Prediction Guard API key. Get one at predictionguard.com
os.environ["PREDICTIONGUARD_TOKEN"] = "<your Prediction Guard access token>"
```


```python
pgllm = PredictionGuard(model="OpenAI-text-davinci-003")
```


```python
pgllm("Tell me a joke")
```

## 控制 LLM 的输出结构/类型


```python
template = """Respond to the following query based on the context.

Context: EVERY comment, DM + email suggestion has led us to this EXCITING announcement! 🎉 We have officially added TWO new candle subscription box options! 📦
Exclusive Candle Box - $80 
Monthly Candle Box - $45 (NEW!)
Scent of The Month Box - $28 (NEW!)
Head to stories to get ALLL the deets on each box! 👆 BONUS: Save 50% on your first box with code 50OFF! 🎉

Query: {query}

Result: """
prompt = PromptTemplate.from_template(template)
```


```python
# Without "guarding" or controlling the output of the LLM.
pgllm(prompt.format(query="What kind of post is this?"))
```


```python
# With "guarding" or controlling the output of the LLM. See the
# Prediction Guard docs (https://docs.predictionguard.com) to learn how to
# control the output with integer, float, boolean, JSON, and other types and
# structures.
pgllm = PredictionGuard(
    model="OpenAI-text-davinci-003",
    output={
        "type": "categorical",
        "categories": ["product announcement", "apology", "relational"],
    },
)
pgllm(prompt.format(query="What kind of post is this?"))
```

## 链接


```python
pgllm = PredictionGuard(model="OpenAI-text-davinci-003")
```


```python
template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)
llm_chain = LLMChain(prompt=prompt, llm=pgllm, verbose=True)

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.predict(question=question)
```


```python
template = """Write a {adjective} poem about {subject}."""
prompt = PromptTemplate.from_template(template)
llm_chain = LLMChain(prompt=prompt, llm=pgllm, verbose=True)

llm_chain.predict(adjective="sad", subject="ducks")
```


## 相关内容

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
