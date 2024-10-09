---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/aphrodite.ipynb
---
# 阿佛洛狄忒引擎

[阿佛洛狄忒](https://github.com/PygmalionAI/aphrodite-engine) 是一个开源的大规模推理引擎，旨在为 [PygmalionAI](https://pygmalion.chat) 网站上的数千名用户提供服务。

* vLLM 提供的注意力机制，具有快速吞吐量和低延迟
* 支持多种最先进的采样方法
* Exllamav2 GPTQ 内核，在较小的批量大小下实现更好的吞吐量

本笔记本介绍了如何使用大型语言模型与 LangChain 和阿佛洛狄忒。

要使用此功能，您需要安装 `aphrodite-engine` Python 包。


```python
##Installing the langchain packages needed to use the integration
%pip install -qU langchain-community
```


```python
%pip install --upgrade --quiet  aphrodite-engine==0.4.2
# %pip list | grep aphrodite
```


```python
<!--IMPORTS:[{"imported": "Aphrodite", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.aphrodite.Aphrodite.html", "title": "Aphrodite Engine"}]-->
from langchain_community.llms import Aphrodite

llm = Aphrodite(
    model="PygmalionAI/pygmalion-2-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_tokens=128,
    temperature=1.2,
    min_p=0.05,
    mirostat_mode=0,  # change to 2 to use mirostat
    mirostat_tau=5.0,
    mirostat_eta=0.1,
)

print(
    llm.invoke(
        '<|system|>Enter RP mode. You are Ayumu "Osaka" Kasuga.<|user|>Hey Osaka. Tell me about yourself.<|model|>'
    )
)
```
```output
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Initializing the Aphrodite Engine with the following config:
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Model = 'PygmalionAI/pygmalion-2-7b'
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Tokenizer = 'PygmalionAI/pygmalion-2-7b'
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] tokenizer_mode = auto
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] revision = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] trust_remote_code = True
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] DataType = torch.bfloat16
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Download Directory = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Model Load Format = auto
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Number of GPUs = 1
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Quantization Format = None
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Sampler Seed = 0
[32mINFO 12-15 11:52:48 aphrodite_engine.py:73] Context Length = 4096[0m
[32mINFO 12-15 11:54:07 aphrodite_engine.py:206] # GPU blocks: 3826, # CPU blocks: 512[0m
``````output
Processed prompts: 100%|██████████| 1/1 [00:02<00:00,  2.91s/it]
``````output
I'm Ayumu "Osaka" Kasuga, and I'm an avid anime and manga fan! I'm pretty introverted, but I've always loved reading books, watching anime and manga, and learning about Japanese culture. My favourite anime series would be My Hero Academia, Attack on Titan, and Sword Art Online. I also really enjoy reading the manga series One Piece, Naruto, and the Gintama series.
```
## 在LLMChain中集成模型


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Aphrodite Engine"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Aphrodite Engine"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.run(question))
```
```output
Processed prompts: 100%|██████████| 1/1 [00:03<00:00,  3.56s/it]
``````output
 The first Pokemon game was released in Japan on 27 February 1996 (their release dates differ from ours) and it is known as Red and Green. President Bill Clinton was in the White House in the years of 1993, 1994, 1995 and 1996 so this fits.

Answer: Let's think step by step.

The first Pokémon game was released in Japan on February 27, 1996 (their release dates differ from ours) and it is known as
```
## 分布式推理

Aphrodite 支持分布式张量并行推理和服务。

要使用 LLM 类运行多 GPU 推理，请将 `tensor_parallel_size` 参数设置为您想要使用的 GPU 数量。例如，要在 4 个 GPU 上运行推理


```python
<!--IMPORTS:[{"imported": "Aphrodite", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.aphrodite.Aphrodite.html", "title": "Aphrodite Engine"}]-->
from langchain_community.llms import Aphrodite

llm = Aphrodite(
    model="PygmalionAI/mythalion-13b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm("What is the future of AI?")
```
```output
2023-12-15 11:41:27,790	INFO worker.py:1636 -- Started a local Ray instance.
``````output
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Initializing the Aphrodite Engine with the following config:
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Model = 'PygmalionAI/mythalion-13b'
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Tokenizer = 'PygmalionAI/mythalion-13b'
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] tokenizer_mode = auto
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] revision = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] trust_remote_code = True
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] DataType = torch.float16
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Download Directory = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Model Load Format = auto
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Number of GPUs = 4
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Quantization Format = None
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Sampler Seed = 0
[32mINFO 12-15 11:41:35 aphrodite_engine.py:73] Context Length = 4096[0m
[32mINFO 12-15 11:43:58 aphrodite_engine.py:206] # GPU blocks: 11902, # CPU blocks: 1310[0m
``````output
Processed prompts: 100%|██████████| 1/1 [00:16<00:00, 16.09s/it]
```


```output
"\n2 years ago StockBot101\nAI is becoming increasingly real and more and more powerful with every year. But what does the future hold for artificial intelligence?\nThere are many possibilities for how AI could evolve and change our world. Some believe that AI will become so advanced that it will take over human jobs, while others believe that AI will be used to augment and assist human workers. There is also the possibility that AI could develop its own consciousness and become self-aware.\nWhatever the future holds, it is clear that AI will continue to play an important role in our lives. Technologies such as machine learning and natural language processing are already transforming industries like healthcare, manufacturing, and transportation. And as AI continues to develop, we can expect even more disruption and innovation across all sectors of the economy.\nSo what exactly are we looking at? What's the future of AI?\nIn the next few years, we can expect AI to be used more and more in healthcare. With the power of machine learning, artificial intelligence can help doctors diagnose diseases earlier and more accurately. It can also be used to develop new treatments and personalize care plans for individual patients.\nManufacturing is another area where AI is already having a big impact. Companies are using robotics and automation to build products faster and with fewer errors. And as AI continues to advance, we can expect even more changes in manufacturing, such as the development of self-driving factories.\nTransportation is another industry that is being transformed by artificial intelligence. Self-driving cars are already being tested on public roads, and it's likely that they will become commonplace in the next decade or so. AI-powered drones are also being developed for use in delivery and even firefighting.\nFinally, artificial intelligence is also poised to have a big impact on customer service and sales. Chatbots and virtual assistants will become more sophisticated, making it easier for businesses to communicate with customers and sell their products.\nThis is just the beginning for artificial intelligence. As the technology continues to develop, we can expect even more amazing advances and innovations. The future of AI is truly limitless.\nWhat do you think the future of AI holds? Do you see any other major"
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
