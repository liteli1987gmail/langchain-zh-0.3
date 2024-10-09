---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/zep_memory.ipynb
---
# Zep 开源记忆
> 回忆、理解并从聊天历史中提取数据。增强个性化的AI体验。

> [Zep](https://www.getzep.com) 是一个用于AI助手应用的长期记忆服务。
> 使用Zep，您可以为AI助手提供回忆过去对话的能力，无论时间多么久远，
> 同时减少幻觉、延迟和成本。

> 对Zep Cloud感兴趣？请查看 [Zep Cloud安装指南](https://help.getzep.com/sdks) 和 [Zep Cloud记忆示例](https://help.getzep.com/langchain/examples/messagehistory-example)

## 开源安装和设置

> Zep开源项目: [https://github.com/getzep/zep](https://github.com/getzep/zep)
>
> Zep开源文档: [https://docs.getzep.com/](https://docs.getzep.com/)

## 示例

本笔记本演示了如何将 [Zep](https://www.getzep.com/) 用作您的聊天机器人的记忆。
使用 Zep 的 REACT 代理聊天消息历史 - 用于大型语言模型应用的长期记忆存储。

我们将演示：

1. 将对话历史添加到 Zep。
2. 运行代理并自动将消息添加到存储中。
3. 查看丰富的消息。
4. 对对话历史进行向量搜索。


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Zep Open Source Memory"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Zep Open Source Memory"}, {"imported": "ZepMemory", "source": "langchain_community.memory.zep_memory", "docs": "https://python.langchain.com/api_reference/community/memory/langchain_community.memory.zep_memory.ZepMemory.html", "title": "Zep Open Source Memory"}, {"imported": "ZepRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.zep.ZepRetriever.html", "title": "Zep Open Source Memory"}, {"imported": "WikipediaAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikipedia.WikipediaAPIWrapper.html", "title": "Zep Open Source Memory"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Zep Open Source Memory"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Zep Open Source Memory"}, {"imported": "Tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Zep Open Source Memory"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Zep Open Source Memory"}]-->
from uuid import uuid4

from langchain.agents import AgentType, initialize_agent
from langchain_community.memory.zep_memory import ZepMemory
from langchain_community.retrievers import ZepRetriever
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.tools import Tool
from langchain_openai import OpenAI

# Set this to your Zep server URL
ZEP_API_URL = "http://localhost:8000"

session_id = str(uuid4())  # This is a unique identifier for the user
```


```python
# Provide your OpenAI key
import getpass

openai_key = getpass.getpass()
```


```python
# Provide your Zep API key. Note that this is optional. See https://docs.getzep.com/deployment/auth

zep_api_key = getpass.getpass()
```

### 初始化 Zep 聊天消息历史类并初始化代理



```python
search = WikipediaAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description=(
            "useful for when you need to search online for answers. You should ask"
            " targeted questions"
        ),
    ),
]

# Set up Zep Chat History
memory = ZepMemory(
    session_id=session_id,
    url=ZEP_API_URL,
    api_key=zep_api_key,
    memory_key="chat_history",
)

# Initialize the agent
llm = OpenAI(temperature=0, openai_api_key=openai_key)
agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

### 添加一些历史数据



```python
# Preload some messages into the memory. The default message window is 12 messages. We want to push beyond this to demonstrate auto-summarization.
test_history = [
    {"role": "human", "content": "Who was Octavia Butler?"},
    {
        "role": "ai",
        "content": (
            "Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American"
            " science fiction author."
        ),
    },
    {"role": "human", "content": "Which books of hers were made into movies?"},
    {
        "role": "ai",
        "content": (
            "The most well-known adaptation of Octavia Butler's work is the FX series"
            " Kindred, based on her novel of the same name."
        ),
    },
    {"role": "human", "content": "Who were her contemporaries?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R."
            " Delany, and Joanna Russ."
        ),
    },
    {"role": "human", "content": "What awards did she win?"},
    {
        "role": "ai",
        "content": (
            "Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur"
            " Fellowship."
        ),
    },
    {
        "role": "human",
        "content": "Which other women sci-fi writers might I want to read?",
    },
    {
        "role": "ai",
        "content": "You might want to read Ursula K. Le Guin or Joanna Russ.",
    },
    {
        "role": "human",
        "content": (
            "Write a short synopsis of Butler's book, Parable of the Sower. What is it"
            " about?"
        ),
    },
    {
        "role": "ai",
        "content": (
            "Parable of the Sower is a science fiction novel by Octavia Butler,"
            " published in 1993. It follows the story of Lauren Olamina, a young woman"
            " living in a dystopian future where society has collapsed due to"
            " environmental disasters, poverty, and violence."
        ),
        "metadata": {"foo": "bar"},
    },
]

for msg in test_history:
    memory.chat_memory.add_message(
        (
            HumanMessage(content=msg["content"])
            if msg["role"] == "human"
            else AIMessage(content=msg["content"])
        ),
        metadata=msg.get("metadata", {}),
    )
```

### 运行代理

这样做将自动将输入和响应添加到 Zep 内存中。



```python
agent_chain.run(
    input="What is the book's relevance to the challenges facing contemporary society?",
)
```
```output


[1m> Entering new  chain...[0m
[32;1m[1;3mThought: Do I need to use a tool? No
AI: Parable of the Sower is a prescient novel that speaks to the challenges facing contemporary society, such as climate change, inequality, and violence. It is a cautionary tale that warns of the dangers of unchecked greed and the need for individuals to take responsibility for their own lives and the lives of those around them.[0m

[1m> Finished chain.[0m
```


```output
'Parable of the Sower is a prescient novel that speaks to the challenges facing contemporary society, such as climate change, inequality, and violence. It is a cautionary tale that warns of the dangers of unchecked greed and the need for individuals to take responsibility for their own lives and the lives of those around them.'
```


### 检查 Zep 内存

注意摘要，以及历史记录已被丰富，包含令牌计数、UUID 和时间戳。

摘要偏向于最近的消息。



```python
def print_messages(messages):
    for m in messages:
        print(m.type, ":\n", m.dict())


print(memory.chat_memory.zep_summary)
print("\n")
print_messages(memory.chat_memory.messages)
```
```output
The human inquires about Octavia Butler. The AI identifies her as an American science fiction author. The human then asks which books of hers were made into movies. The AI responds by mentioning the FX series Kindred, based on her novel of the same name. The human then asks about her contemporaries, and the AI lists Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.


system :
 {'content': 'The human inquires about Octavia Butler. The AI identifies her as an American science fiction author. The human then asks which books of hers were made into movies. The AI responds by mentioning the FX series Kindred, based on her novel of the same name. The human then asks about her contemporaries, and the AI lists Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.', 'additional_kwargs': {}}
human :
 {'content': 'What awards did she win?', 'additional_kwargs': {'uuid': '6b733f0b-6778-49ae-b3ec-4e077c039f31', 'created_at': '2023-07-09T19:23:16.611232Z', 'token_count': 8, 'metadata': {'system': {'entities': [], 'intent': 'The subject is inquiring about the awards that someone, whose identity is not specified, has won.'}}}, 'example': False}
ai :
 {'content': 'Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.', 'additional_kwargs': {'uuid': '2f6d80c6-3c08-4fd4-8d4e-7bbee341ac90', 'created_at': '2023-07-09T19:23:16.618947Z', 'token_count': 21, 'metadata': {'system': {'entities': [{'Label': 'PERSON', 'Matches': [{'End': 14, 'Start': 0, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 33, 'Start': 19, 'Text': 'the Hugo Award'}], 'Name': 'the Hugo Award'}, {'Label': 'EVENT', 'Matches': [{'End': 81, 'Start': 57, 'Text': 'the MacArthur Fellowship'}], 'Name': 'the MacArthur Fellowship'}], 'intent': 'The subject is stating that Octavia Butler received the Hugo Award, the Nebula Award, and the MacArthur Fellowship.'}}}, 'example': False}
human :
 {'content': 'Which other women sci-fi writers might I want to read?', 'additional_kwargs': {'uuid': 'ccdcc901-ea39-4981-862f-6fe22ab9289b', 'created_at': '2023-07-09T19:23:16.62678Z', 'token_count': 14, 'metadata': {'system': {'entities': [], 'intent': 'The subject is seeking recommendations for additional women science fiction writers to explore.'}}}, 'example': False}
ai :
 {'content': 'You might want to read Ursula K. Le Guin or Joanna Russ.', 'additional_kwargs': {'uuid': '7977099a-0c62-4c98-bfff-465bbab6c9c3', 'created_at': '2023-07-09T19:23:16.631721Z', 'token_count': 18, 'metadata': {'system': {'entities': [{'Label': 'ORG', 'Matches': [{'End': 40, 'Start': 23, 'Text': 'Ursula K. Le Guin'}], 'Name': 'Ursula K. Le Guin'}, {'Label': 'PERSON', 'Matches': [{'End': 55, 'Start': 44, 'Text': 'Joanna Russ'}], 'Name': 'Joanna Russ'}], 'intent': 'The subject is suggesting that the person should consider reading the works of Ursula K. Le Guin or Joanna Russ.'}}}, 'example': False}
human :
 {'content': "Write a short synopsis of Butler's book, Parable of the Sower. What is it about?", 'additional_kwargs': {'uuid': 'e439b7e6-286a-4278-a8cb-dc260fa2e089', 'created_at': '2023-07-09T19:23:16.63623Z', 'token_count': 23, 'metadata': {'system': {'entities': [{'Label': 'ORG', 'Matches': [{'End': 32, 'Start': 26, 'Text': 'Butler'}], 'Name': 'Butler'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 61, 'Start': 41, 'Text': 'Parable of the Sower'}], 'Name': 'Parable of the Sower'}], 'intent': 'The subject is requesting a brief summary or explanation of the book "Parable of the Sower" by Butler.'}}}, 'example': False}
ai :
 {'content': 'Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', 'additional_kwargs': {'uuid': '6760489b-19c9-41aa-8b45-fae6cb1d7ee6', 'created_at': '2023-07-09T19:23:16.647524Z', 'token_count': 56, 'metadata': {'foo': 'bar', 'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}, {'Label': 'PERSON', 'Matches': [{'End': 65, 'Start': 51, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'DATE', 'Matches': [{'End': 84, 'Start': 80, 'Text': '1993'}], 'Name': '1993'}, {'Label': 'PERSON', 'Matches': [{'End': 124, 'Start': 110, 'Text': 'Lauren Olamina'}], 'Name': 'Lauren Olamina'}], 'intent': 'The subject is providing information about the novel "Parable of the Sower" by Octavia Butler, including its genre, publication date, and a brief summary of the plot.'}}}, 'example': False}
human :
 {'content': "What is the book's relevance to the challenges facing contemporary society?", 'additional_kwargs': {'uuid': '7dbbbb93-492b-4739-800f-cad2b6e0e764', 'created_at': '2023-07-09T19:23:19.315182Z', 'token_count': 15, 'metadata': {'system': {'entities': [], 'intent': 'The subject is asking about the relevance of a book to the challenges currently faced by society.'}}}, 'example': False}
ai :
 {'content': 'Parable of the Sower is a prescient novel that speaks to the challenges facing contemporary society, such as climate change, inequality, and violence. It is a cautionary tale that warns of the dangers of unchecked greed and the need for individuals to take responsibility for their own lives and the lives of those around them.', 'additional_kwargs': {'uuid': '3e14ac8f-b7c1-4360-958b-9f3eae1f784f', 'created_at': '2023-07-09T19:23:19.332517Z', 'token_count': 66, 'metadata': {'system': {'entities': [{'Label': 'GPE', 'Matches': [{'End': 20, 'Start': 15, 'Text': 'Sower'}], 'Name': 'Sower'}], 'intent': 'The subject is providing an analysis and evaluation of the novel "Parable of the Sower" and highlighting its relevance to contemporary societal challenges.'}}}, 'example': False}
```
### 在 Zep 内存上进行向量搜索

Zep 通过 `ZepRetriever` 提供对历史对话内存的原生向量搜索。

您可以将 `ZepRetriever` 与支持传入 Langchain `Retriever` 对象的链一起使用。



```python
retriever = ZepRetriever(
    session_id=session_id,
    url=ZEP_API_URL,
    api_key=zep_api_key,
)

search_results = memory.chat_memory.search("who are some famous women sci-fi authors?")
for r in search_results:
    if r.dist > 0.8:  # Only print results with similarity of 0.8 or higher
        print(r.message, r.dist)
```
```output
{'uuid': 'ccdcc901-ea39-4981-862f-6fe22ab9289b', 'created_at': '2023-07-09T19:23:16.62678Z', 'role': 'human', 'content': 'Which other women sci-fi writers might I want to read?', 'metadata': {'system': {'entities': [], 'intent': 'The subject is seeking recommendations for additional women science fiction writers to explore.'}}, 'token_count': 14} 0.9119619869747062
{'uuid': '7977099a-0c62-4c98-bfff-465bbab6c9c3', 'created_at': '2023-07-09T19:23:16.631721Z', 'role': 'ai', 'content': 'You might want to read Ursula K. Le Guin or Joanna Russ.', 'metadata': {'system': {'entities': [{'Label': 'ORG', 'Matches': [{'End': 40, 'Start': 23, 'Text': 'Ursula K. Le Guin'}], 'Name': 'Ursula K. Le Guin'}, {'Label': 'PERSON', 'Matches': [{'End': 55, 'Start': 44, 'Text': 'Joanna Russ'}], 'Name': 'Joanna Russ'}], 'intent': 'The subject is suggesting that the person should consider reading the works of Ursula K. Le Guin or Joanna Russ.'}}, 'token_count': 18} 0.8534346954749745
{'uuid': 'b05e2eb5-c103-4973-9458-928726f08655', 'created_at': '2023-07-09T19:23:16.603098Z', 'role': 'ai', 'content': "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ.", 'metadata': {'system': {'entities': [{'Label': 'PERSON', 'Matches': [{'End': 16, 'Start': 0, 'Text': "Octavia Butler's"}], 'Name': "Octavia Butler's"}, {'Label': 'ORG', 'Matches': [{'End': 58, 'Start': 41, 'Text': 'Ursula K. Le Guin'}], 'Name': 'Ursula K. Le Guin'}, {'Label': 'PERSON', 'Matches': [{'End': 76, 'Start': 60, 'Text': 'Samuel R. Delany'}], 'Name': 'Samuel R. Delany'}, {'Label': 'PERSON', 'Matches': [{'End': 93, 'Start': 82, 'Text': 'Joanna Russ'}], 'Name': 'Joanna Russ'}], 'intent': "The subject is stating that Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R. Delany, and Joanna Russ."}}, 'token_count': 27} 0.8523831524040919
{'uuid': 'e346f02b-f854-435d-b6ba-fb394a416b9b', 'created_at': '2023-07-09T19:23:16.556587Z', 'role': 'human', 'content': 'Who was Octavia Butler?', 'metadata': {'system': {'entities': [{'Label': 'PERSON', 'Matches': [{'End': 22, 'Start': 8, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}], 'intent': 'The subject is asking for information about the identity or background of Octavia Butler.'}}, 'token_count': 8} 0.8236355436055457
{'uuid': '42ff41d2-c63a-4d5b-b19b-d9a87105cfc3', 'created_at': '2023-07-09T19:23:16.578022Z', 'role': 'ai', 'content': 'Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American science fiction author.', 'metadata': {'system': {'entities': [{'Label': 'PERSON', 'Matches': [{'End': 22, 'Start': 0, 'Text': 'Octavia Estelle Butler'}], 'Name': 'Octavia Estelle Butler'}, {'Label': 'DATE', 'Matches': [{'End': 37, 'Start': 24, 'Text': 'June 22, 1947'}], 'Name': 'June 22, 1947'}, {'Label': 'DATE', 'Matches': [{'End': 57, 'Start': 40, 'Text': 'February 24, 2006'}], 'Name': 'February 24, 2006'}, {'Label': 'NORP', 'Matches': [{'End': 74, 'Start': 66, 'Text': 'American'}], 'Name': 'American'}], 'intent': 'The subject is providing information about Octavia Estelle Butler, who was an American science fiction author.'}}, 'token_count': 31} 0.8206687242257686
{'uuid': '2f6d80c6-3c08-4fd4-8d4e-7bbee341ac90', 'created_at': '2023-07-09T19:23:16.618947Z', 'role': 'ai', 'content': 'Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur Fellowship.', 'metadata': {'system': {'entities': [{'Label': 'PERSON', 'Matches': [{'End': 14, 'Start': 0, 'Text': 'Octavia Butler'}], 'Name': 'Octavia Butler'}, {'Label': 'WORK_OF_ART', 'Matches': [{'End': 33, 'Start': 19, 'Text': 'the Hugo Award'}], 'Name': 'the Hugo Award'}, {'Label': 'EVENT', 'Matches': [{'End': 81, 'Start': 57, 'Text': 'the MacArthur Fellowship'}], 'Name': 'the MacArthur Fellowship'}], 'intent': 'The subject is stating that Octavia Butler received the Hugo Award, the Nebula Award, and the MacArthur Fellowship.'}}, 'token_count': 21} 0.8199012397683285
```