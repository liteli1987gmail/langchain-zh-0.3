---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/infino.ipynb
---
# Infino

>[Infino](https://github.com/infinohq/infino) 是一个可扩展的遥测存储，专为日志、指标和追踪设计。Infino 可以作为独立的可观察性解决方案，或作为您可观察性堆栈中的存储层。

本示例展示了如何在通过 `LangChain` 和 [Infino](https://github.com/infinohq/infino) 调用 OpenAI 和 ChatOpenAI 模型时跟踪以下内容：

* 提示输入
* 来自 `ChatGPT` 或任何其他 `LangChain` 模型的响应
* 延迟
* 错误
* 消耗的令牌数量

## 初始化


```python
# Install necessary dependencies.
%pip install --upgrade --quiet  infinopy
%pip install --upgrade --quiet  matplotlib
%pip install --upgrade --quiet  tiktoken
%pip install --upgrade --quiet  langchain langchain-openai langchain-community
%pip install --upgrade --quiet  beautifulsoup4
```


```python
<!--IMPORTS:[{"imported": "InfinoCallbackHandler", "source": "langchain_community.callbacks.infino_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.infino_callback.InfinoCallbackHandler.html", "title": "Infino"}]-->
from langchain_community.callbacks.infino_callback import InfinoCallbackHandler
```


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Infino"}]-->
import datetime as dt
import json
import time

import matplotlib.dates as md
import matplotlib.pyplot as plt
from infinopy import InfinoClient
from langchain_openai import OpenAI
```

## 启动 Infino 服务器，初始化 Infino 客户端


```python
# Start server using the Infino docker image.
!docker run --rm --detach --name infino-example -p 3000:3000 infinohq/infino:latest

# Create Infino client.
client = InfinoClient()
```
```output
a1159e99c6bdb3101139157acee6aba7ae9319375e77ab6fbc79beff75abeca3
```
## 读取问题数据集


```python
# These are a subset of questions from Stanford's QA dataset -
# https://rajpurkar.github.io/SQuAD-explorer/
data = """In what country is Normandy located?
When were the Normans in Normandy?
From which countries did the Norse originate?
Who was the Norse leader?
What century did the Normans first gain their separate identity?
Who gave their name to Normandy in the 1000's and 1100's
What is France a region of?
Who did King Charles III swear fealty to?
When did the Frankish identity emerge?
Who was the duke in the battle of Hastings?
Who ruled the duchy of Normandy
What religion were the Normans
What type of major impact did the Norman dynasty have on modern Europe?
Who was famed for their Christian spirit?
Who assimilted the Roman language?
Who ruled the country of Normandy?
What principality did William the conqueror found?
What is the original meaning of the word Norman?
When was the Latin version of the word Norman first recorded?
What name comes from the English words Normans/Normanz?"""

questions = data.split("\n")
```

## 示例 1：LangChain OpenAI 问答；将指标和日志发布到 Infino


```python
# Set your key here.
# os.environ["OPENAI_API_KEY"] = "YOUR_API_KEY"

# Create callback handler. This logs latency, errors, token usage, prompts as well as prompt responses to Infino.
handler = InfinoCallbackHandler(
    model_id="test_openai", model_version="0.1", verbose=False
)

# Create LLM.
llm = OpenAI(temperature=0.1)

# Number of questions to ask the OpenAI model. We limit to a short number here to save $$ while running this demo.
num_questions = 10

questions = questions[0:num_questions]
for question in questions:
    print(question)

    # We send the question to OpenAI API, with Infino callback.
    llm_result = llm.generate([question], callbacks=[handler])
    print(llm_result)
```
```output
In what country is Normandy located?
generations=[[Generation(text='\n\nNormandy is located in France.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 16, 'prompt_tokens': 7, 'completion_tokens': 9}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('67a516e3-d48a-4e83-92ba-a139079bd3b1'))]
When were the Normans in Normandy?
generations=[[Generation(text='\n\nThe Normans first settled in Normandy in the late 9th century.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 24, 'prompt_tokens': 8, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('6417a773-c863-4942-9607-c8a0c5d486e7'))]
From which countries did the Norse originate?
generations=[[Generation(text='\n\nThe Norse originated from Scandinavia, which includes the modern-day countries of Norway, Sweden, and Denmark.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 32, 'prompt_tokens': 8, 'completion_tokens': 24}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('70547d72-7925-454e-97fb-5539f8788c3f'))]
Who was the Norse leader?
generations=[[Generation(text='\n\nThe most famous Norse leader was the legendary Viking king Ragnar Lodbrok. He was a legendary Viking hero and ruler who is said to have lived in the 9th century. He is known for his legendary exploits, including leading a Viking raid on Paris in 845.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 62, 'prompt_tokens': 6, 'completion_tokens': 56}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('04500e37-44ab-4e56-9017-76fe8c19e2ca'))]
What century did the Normans first gain their separate identity?
generations=[[Generation(text='\n\nThe Normans first gained their separate identity in the 11th century.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 28, 'prompt_tokens': 12, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('adf319b7-1022-40df-9afe-1d65f869d83d'))]
Who gave their name to Normandy in the 1000's and 1100's
generations=[[Generation(text='\n\nThe Normans, a people from northern France, gave their name to Normandy in the 1000s and 1100s. The Normans were descendants of Vikings who had settled in the region in the late 800s.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 57, 'prompt_tokens': 13, 'completion_tokens': 44}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('1a0503bc-d033-4b69-a5fa-5e1796566133'))]
What is France a region of?
generations=[[Generation(text='\n\nFrance is a region of Europe.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 16, 'prompt_tokens': 7, 'completion_tokens': 9}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('7485d954-1c14-4dff-988a-25a0aa0871cc'))]
Who did King Charles III swear fealty to?
generations=[[Generation(text='\n\nKing Charles III swore fealty to King Philip II of Spain.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 25, 'prompt_tokens': 10, 'completion_tokens': 15}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('292c7143-4a08-43cd-a1e1-42cb1f594f33'))]
When did the Frankish identity emerge?
generations=[[Generation(text='\n\nThe Frankish identity began to emerge in the late 5th century, when the Franks began to expand their power and influence in the region. The Franks were a Germanic tribe that had settled in the area of modern-day France and Germany. They eventually established the Merovingian dynasty, which ruled much of Western Europe from the mid-6th century until 751.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 85, 'prompt_tokens': 8, 'completion_tokens': 77}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('3d9475c2-931e-4217-8bc3-b3e970e7597c'))]
Who was the duke in the battle of Hastings?
generations=[[Generation(text='\n\nThe Duke of Normandy, William the Conqueror, was the leader of the Norman forces at the Battle of Hastings in 1066.', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 39, 'prompt_tokens': 11, 'completion_tokens': 28}, 'model_name': 'text-davinci-003'} run=[RunInfo(run_id=UUID('b8f84619-ea5f-4c18-b411-b62194f36fe0'))]
```
## 创建指标图表

我们现在使用 matplotlib 创建延迟、错误和消耗的令牌的图表。


```python
# Helper function to create a graph using matplotlib.
def plot(data, title):
    data = json.loads(data)

    # Extract x and y values from the data
    timestamps = [item["time"] for item in data]
    dates = [dt.datetime.fromtimestamp(ts) for ts in timestamps]
    y = [item["value"] for item in data]

    plt.rcParams["figure.figsize"] = [6, 4]
    plt.subplots_adjust(bottom=0.2)
    plt.xticks(rotation=25)
    ax = plt.gca()
    xfmt = md.DateFormatter("%Y-%m-%d %H:%M:%S")
    ax.xaxis.set_major_formatter(xfmt)

    # Create the plot
    plt.plot(dates, y)

    # Set labels and title
    plt.xlabel("Time")
    plt.ylabel("Value")
    plt.title(title)

    plt.show()
```


```python
response = client.search_ts("__name__", "latency", 0, int(time.time()))
plot(response.text, "Latency")

response = client.search_ts("__name__", "error", 0, int(time.time()))
plot(response.text, "Errors")

response = client.search_ts("__name__", "prompt_tokens", 0, int(time.time()))
plot(response.text, "Prompt Tokens")

response = client.search_ts("__name__", "completion_tokens", 0, int(time.time()))
plot(response.text, "Completion Tokens")

response = client.search_ts("__name__", "total_tokens", 0, int(time.time()))
plot(response.text, "Total Tokens")
```

## 在提示或提示输出上进行全文查询。


```python
# Search for a particular prompt text.
query = "normandy"
response = client.search_log(query, 0, int(time.time()))
print("Results for", query, ":", response.text)

print("===")

query = "king charles III"
response = client.search_log("king charles III", 0, int(time.time()))
print("Results for", query, ":", response.text)
```
```output
Results for normandy : [{"time":1696947743,"fields":{"prompt_response":"\n\nThe Normans, a people from northern France, gave their name to Normandy in the 1000s and 1100s. The Normans were descendants of Vikings who had settled in the region in the late 800s."},"text":"\n\nThe Normans, a people from northern France, gave their name to Normandy in the 1000s and 1100s. The Normans were descendants of Vikings who had settled in the region in the late 800s."},{"time":1696947740,"fields":{"prompt":"Who gave their name to Normandy in the 1000's and 1100's"},"text":"Who gave their name to Normandy in the 1000's and 1100's"},{"time":1696947733,"fields":{"prompt_response":"\n\nThe Normans first settled in Normandy in the late 9th century."},"text":"\n\nThe Normans first settled in Normandy in the late 9th century."},{"time":1696947732,"fields":{"prompt_response":"\n\nNormandy is located in France."},"text":"\n\nNormandy is located in France."},{"time":1696947731,"fields":{"prompt":"In what country is Normandy located?"},"text":"In what country is Normandy located?"}]
===
Results for king charles III : [{"time":1696947745,"fields":{"prompt_response":"\n\nKing Charles III swore fealty to King Philip II of Spain."},"text":"\n\nKing Charles III swore fealty to King Philip II of Spain."},{"time":1696947744,"fields":{"prompt":"Who did King Charles III swear fealty to?"},"text":"Who did King Charles III swear fealty to?"}]
```
# 示例 2：使用 ChatOpenAI 对一段文本进行总结


```python
<!--IMPORTS:[{"imported": "load_summarize_chain", "source": "langchain.chains.summarize", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.summarize.chain.load_summarize_chain.html", "title": "Infino"}, {"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Infino"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Infino"}]-->
# Set your key here.
# os.environ["OPENAI_API_KEY"] = "YOUR_API_KEY"

from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI

# Create callback handler. This logs latency, errors, token usage, prompts, as well as prompt responses to Infino.
handler = InfinoCallbackHandler(
    model_id="test_chatopenai", model_version="0.1", verbose=False
)

urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    "https://medium.com/lyft-engineering/lyftlearn-ml-model-training-infrastructure-built-on-kubernetes-aef8218842bb",
    "https://blog.langchain.dev/week-of-10-2-langchain-release-notes/",
]

for url in urls:
    loader = WebBaseLoader(url)
    docs = loader.load()

    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k", callbacks=[handler])
    chain = load_summarize_chain(llm, chain_type="stuff", verbose=False)

    chain.run(docs)
```

## 创建指标图表


```python
response = client.search_ts("__name__", "latency", 0, int(time.time()))
plot(response.text, "Latency")

response = client.search_ts("__name__", "error", 0, int(time.time()))
plot(response.text, "Errors")

response = client.search_ts("__name__", "prompt_tokens", 0, int(time.time()))
plot(response.text, "Prompt Tokens")

response = client.search_ts("__name__", "completion_tokens", 0, int(time.time()))
plot(response.text, "Completion Tokens")
```


```python
## Full text query on prompt or prompt outputs
```


```python
# Search for a particular prompt text.
query = "machine learning"
response = client.search_log(query, 0, int(time.time()))

# The output can be verbose - uncomment below if it needs to be printed.
# print("Results for", query, ":", response.text)

print("===")
```
```output
===
```

```python
## Stop Infino server
```


```python
!docker rm -f infino-example
```
```output
infino-example
```