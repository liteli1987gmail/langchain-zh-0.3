---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/manifest.ipynb
---
# 清单

本笔记本介绍了如何使用清单和LangChain。

有关`manifest`的更详细信息，以及如何在本示例中与本地huggingface模型一起使用它，请参见 https://github.com/HazyResearch/manifest

另一个[使用清单与LangChain的示例](https://github.com/HazyResearch/manifest/blob/main/examples/langchain_chatgpt.html)。


```python
%pip install --upgrade --quiet  manifest-ml
```


```python
<!--IMPORTS:[{"imported": "ManifestWrapper", "source": "langchain_community.llms.manifest", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.manifest.ManifestWrapper.html", "title": "Manifest"}]-->
from langchain_community.llms.manifest import ManifestWrapper
from manifest import Manifest
```


```python
manifest = Manifest(
    client_name="huggingface", client_connection="http://127.0.0.1:5000"
)
print(manifest.client_pool.get_current_client().get_model_params())
```


```python
llm = ManifestWrapper(
    client=manifest, llm_kwargs={"temperature": 0.001, "max_tokens": 256}
)
```


```python
<!--IMPORTS:[{"imported": "MapReduceChain", "source": "langchain.chains.mapreduce", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.mapreduce.MapReduceChain.html", "title": "Manifest"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Manifest"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Manifest"}]-->
# Map reduce example
from langchain.chains.mapreduce import MapReduceChain
from langchain_core.prompts import PromptTemplate
from langchain_text_splitters import CharacterTextSplitter

_prompt = """Write a concise summary of the following:


{text}


CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(_prompt)

text_splitter = CharacterTextSplitter()

mp_chain = MapReduceChain.from_params(llm, prompt, text_splitter)
```


```python
with open("../../how_to/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
mp_chain.run(state_of_the_union)
```



```output
'President Obama delivered his annual State of the Union address on Tuesday night, laying out his priorities for the coming year. Obama said the government will provide free flu vaccines to all Americans, ending the government shutdown and allowing businesses to reopen. The president also said that the government will continue to send vaccines to 112 countries, more than any other nation. "We have lost so much to COVID-19," Trump said. "Time with one another. And worst of all, so much loss of life." He said the CDC is working on a vaccine for kids under 5, and that the government will be ready with plenty of vaccines when they are available. Obama says the new guidelines are a "great step forward" and that the virus is no longer a threat. He says the government is launching a "Test to Treat" initiative that will allow people to get tested at a pharmacy and get antiviral pills on the spot at no cost. Obama says the new guidelines are a "great step forward" and that the virus is no longer a threat. He says the government will continue to send vaccines to 112 countries, more than any other nation. "We are coming for your'
```


## 比较HF模型


```python
<!--IMPORTS:[{"imported": "ModelLaboratory", "source": "langchain.model_laboratory", "docs": "https://python.langchain.com/api_reference/langchain/model_laboratory/langchain.model_laboratory.ModelLaboratory.html", "title": "Manifest"}]-->
from langchain.model_laboratory import ModelLaboratory

manifest1 = ManifestWrapper(
    client=Manifest(
        client_name="huggingface", client_connection="http://127.0.0.1:5000"
    ),
    llm_kwargs={"temperature": 0.01},
)
manifest2 = ManifestWrapper(
    client=Manifest(
        client_name="huggingface", client_connection="http://127.0.0.1:5001"
    ),
    llm_kwargs={"temperature": 0.01},
)
manifest3 = ManifestWrapper(
    client=Manifest(
        client_name="huggingface", client_connection="http://127.0.0.1:5002"
    ),
    llm_kwargs={"temperature": 0.01},
)
llms = [manifest1, manifest2, manifest3]
model_lab = ModelLaboratory(llms)
```


```python
model_lab.compare("What color is a flamingo?")
```
```output
[1mInput:[0m
What color is a flamingo?

[1mManifestWrapper[0m
Params: {'model_name': 'bigscience/T0_3B', 'model_path': 'bigscience/T0_3B', 'temperature': 0.01}
[104mpink[0m

[1mManifestWrapper[0m
Params: {'model_name': 'EleutherAI/gpt-neo-125M', 'model_path': 'EleutherAI/gpt-neo-125M', 'temperature': 0.01}
[103mA flamingo is a small, round[0m

[1mManifestWrapper[0m
Params: {'model_name': 'google/flan-t5-xl', 'model_path': 'google/flan-t5-xl', 'temperature': 0.01}
[101mpink[0m
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
