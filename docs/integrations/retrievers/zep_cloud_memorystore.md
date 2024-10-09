---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/zep_cloud_memorystore.ipynb
---
# Zep Cloud
## [Zep Cloud](https://docs.getzep.com/) 的检索器示例

> 回忆、理解并从聊天历史中提取数据。为个性化的AI体验提供动力。

> [Zep](https://www.getzep.com) 是一个用于AI助手应用的长期记忆服务。
> 使用Zep，您可以为AI助手提供回忆过去对话的能力，无论多么久远，
> 同时减少幻觉、延迟和成本。

> 请参阅 [Zep Cloud安装指南](https://help.getzep.com/sdks) 和更多 [Zep Cloud Langchain示例](https://github.com/getzep/zep-python/tree/main/examples)

## 检索器示例

本笔记本演示如何使用 [Zep长期记忆存储](https://www.getzep.com/) 搜索历史聊天消息记录。

我们将演示：

1. 将对话历史添加到Zep内存存储中。
2. 在对话历史上进行向量搜索：
1. 对聊天消息进行相似性搜索
2. 使用聊天消息搜索的最大边际相关性重新排序
3. 使用元数据过滤器过滤搜索
4. 对聊天消息摘要进行相似性搜索
5. 使用摘要搜索的最大边际相关性重新排序




```python
<!--IMPORTS:[{"imported": "ZepCloudMemory", "source": "langchain_community.memory.zep_cloud_memory", "docs": "https://python.langchain.com/api_reference/community/memory/langchain_community.memory.zep_cloud_memory.ZepCloudMemory.html", "title": "Zep Cloud"}, {"imported": "ZepCloudRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.zep_cloud.ZepCloudRetriever.html", "title": "Zep Cloud"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Zep Cloud"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Zep Cloud"}]-->
import getpass
import time
from uuid import uuid4

from langchain_community.memory.zep_cloud_memory import ZepCloudMemory
from langchain_community.retrievers import ZepCloudRetriever
from langchain_core.messages import AIMessage, HumanMessage

# Provide your Zep API key.
zep_api_key = getpass.getpass()
```

### 初始化 Zep 聊天消息历史类并将聊天消息历史添加到内存存储

**注意：** 与其他检索器不同，Zep 检索器返回的内容是会话/用户特定的。在实例化检索器时需要提供 `session_id`。


```python
session_id = str(uuid4())  # This is a unique identifier for the user/session

# Initialize the Zep Memory Class
zep_memory = ZepCloudMemory(session_id=session_id, api_key=zep_api_key)
```


```python
# Preload some messages into the memory. The default message window is 4 messages. We want to push beyond this to demonstrate auto-summarization.
test_history = [
    {"role": "human", "role_type": "user", "content": "Who was Octavia Butler?"},
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "Octavia Estelle Butler (June 22, 1947 – February 24, 2006) was an American"
            " science fiction author."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "Which books of hers were made into movies?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "The most well-known adaptation of Octavia Butler's work is the FX series"
            " Kindred, based on her novel of the same name."
        ),
    },
    {"role": "human", "role_type": "user", "content": "Who were her contemporaries?"},
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "Octavia Butler's contemporaries included Ursula K. Le Guin, Samuel R."
            " Delany, and Joanna Russ."
        ),
    },
    {"role": "human", "role_type": "user", "content": "What awards did she win?"},
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "Octavia Butler won the Hugo Award, the Nebula Award, and the MacArthur"
            " Fellowship."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "Which other women sci-fi writers might I want to read?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": "You might want to read Ursula K. Le Guin or Joanna Russ.",
    },
    {
        "role": "human",
        "role_type": "user",
        "content": (
            "Write a short synopsis of Butler's book, Parable of the Sower. What is it"
            " about?"
        ),
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "Parable of the Sower is a science fiction novel by Octavia Butler,"
            " published in 1993. It follows the story of Lauren Olamina, a young woman"
            " living in a dystopian future where society has collapsed due to"
            " environmental disasters, poverty, and violence."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "What is the setting of the book?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "The book is set in a dystopian future in the 2020s, where society has"
            " collapsed due to climate change and economic crises."
        ),
    },
    {"role": "human", "role_type": "user", "content": "Who is the protagonist?"},
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "The protagonist of the book is Lauren Olamina, a young woman who possesses"
            " 'hyperempathy', the ability to feel pain and other sensations she"
            " witnesses."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "What is the main theme of the book?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "The main theme of the book is survival in the face of drastic societal"
            " change and collapse. It also explores themes of adaptability, community,"
            " and the human capacity for change."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "What is the 'Parable of the Sower'?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "The 'Parable of the Sower' is a biblical parable that Butler uses as a"
            " metaphor in the book. In the parable, a sower scatters seeds, some of"
            " which fall on fertile ground and grow, while others fall on rocky ground"
            " or among thorns and fail to grow. The parable is used to illustrate the"
            " importance of receptivity and preparedness in the face of change."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "What is Butler's writing style like?",
    },
    {
        "role": "ai",
        "role_type": "assistant",
        "content": (
            "Butler's writing style is known for its clarity, directness, and"
            " psychological insight. Her narratives often involve complex, diverse"
            " characters and explore themes of race, gender, and power."
        ),
    },
    {
        "role": "human",
        "role_type": "user",
        "content": "What other books has she written?",
    },
    {
        "role": "ai",
        "content": (
            "In addition to 'Parable of the Sower', Butler has written several other"
            " notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'."
        ),
    },
]

for msg in test_history:
    zep_memory.chat_memory.add_message(
        HumanMessage(content=msg["content"])
        if msg["role"] == "human"
        else AIMessage(content=msg["content"])
    )

time.sleep(
    10
)  # Wait for the messages to be embedded and summarized, this happens asynchronously.
```

### 使用 Zep 检索器在 Zep 内存中进行向量搜索

Zep 提供对历史对话内存的原生向量搜索。嵌入过程是自动进行的。

注意：消息的嵌入是异步发生的，因此第一次查询可能不会返回结果。后续查询将在生成嵌入后返回结果。


```python
zep_retriever = ZepCloudRetriever(
    api_key=zep_api_key,
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    top_k=5,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```



```output
[Document(page_content="What is the 'Parable of the Sower'?", metadata={'score': 0.9333381652832031, 'uuid': 'bebc441c-a32d-44a1-ae61-968e7b3d4956', 'created_at': '2024-05-10T05:02:01.857627Z', 'token_count': 11, 'role': 'human'}),
 Document(page_content="The 'Parable of the Sower' is a biblical parable that Butler uses as a metaphor in the book. In the parable, a sower scatters seeds, some of which fall on fertile ground and grow, while others fall on rocky ground or among thorns and fail to grow. The parable is used to illustrate the importance of receptivity and preparedness in the face of change.", metadata={'score': 0.8757256865501404, 'uuid': '193c60d8-2b7b-4eb1-a4be-c2d8afd92991', 'created_at': '2024-05-10T05:02:01.97174Z', 'token_count': 82, 'role': 'ai'}),
 Document(page_content="Write a short synopsis of Butler's book, Parable of the Sower. What is it about?", metadata={'score': 0.8641344904899597, 'uuid': 'fc78901d-a625-4530-ba63-1ae3e3b11683', 'created_at': '2024-05-10T05:02:00.942994Z', 'token_count': 21, 'role': 'human'}),
 Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler, published in 1993. It follows the story of Lauren Olamina, a young woman living in a dystopian future where society has collapsed due to environmental disasters, poverty, and violence.', metadata={'score': 0.8581685125827789, 'uuid': '91f2cda4-276e-446d-96bf-07d34e5af616', 'created_at': '2024-05-10T05:02:01.05577Z', 'token_count': 54, 'role': 'ai'}),
 Document(page_content="In addition to 'Parable of the Sower', Butler has written several other notable works, including 'Kindred', 'Dawn', and 'Parable of the Talents'.", metadata={'score': 0.8076582252979279, 'uuid': 'e3994519-9a90-410c-b14c-2c652f6d184f', 'created_at': '2024-05-10T05:02:02.401682Z', 'token_count': 37, 'role': 'ai'})]
```


我们还可以使用 Zep 同步 API 来检索结果：


```python
zep_retriever.invoke("Who wrote Parable of the Sower?")
```



```output
[Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler set in a dystopian future in the 2020s. The story follows Lauren Olamina, a young woman living in a society that has collapsed due to environmental disasters, poverty, and violence. The novel explores themes of societal breakdown, the struggle for survival, and the search for a better future.', metadata={'score': 0.8473024368286133, 'uuid': 'e4689f8e-33be-4a59-a9c2-e5ef5dd70f74', 'created_at': '2024-05-10T05:02:02.713123Z', 'token_count': 76})]
```


### 使用 MMR（最大边际相关性）进行重新排序

Zep 原生支持使用 MMR 进行结果的 SIMD 加速重新排序。这对于消除结果中的冗余非常有用。


```python
zep_retriever = ZepCloudRetriever(
    api_key=zep_api_key,
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    top_k=5,
    search_type="mmr",
    mmr_lambda=0.5,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```

### 使用元数据过滤器来优化搜索结果

Zep 支持通过元数据过滤结果。这对于按实体类型或其他元数据过滤结果非常有用。

更多信息请访问：https://help.getzep.com/document-collections#searching-a-collection-with-hybrid-vector-search


```python
filter = {"where": {"jsonpath": '$[*] ? (@.baz == "qux")'}}

await zep_retriever.ainvoke(
    "Who wrote Parable of the Sower?", config={"metadata": filter}
)
```

### 使用MMR重排序进行摘要搜索

Zep会自动生成聊天消息的摘要。这些摘要可以通过Zep检索器进行搜索。由于摘要是对对话的提炼，它们更可能与您的搜索查询匹配，并为大型语言模型提供丰富、简洁的上下文。

连续的摘要可能包含相似的内容，Zep的相似性搜索返回最高匹配的结果，但多样性较少。
MMR重新排序结果，以确保您填入提示中的摘要既相关又为大型语言模型提供额外信息。


```python
zep_retriever = ZepCloudRetriever(
    api_key=zep_api_key,
    session_id=session_id,  # Ensure that you provide the session_id when instantiating the Retriever
    top_k=3,
    search_scope="summary",
    search_type="mmr",
    mmr_lambda=0.5,
)

await zep_retriever.ainvoke("Who wrote Parable of the Sower?")
```



```output
[Document(page_content='Parable of the Sower is a science fiction novel by Octavia Butler set in a dystopian future in the 2020s. The story follows Lauren Olamina, a young woman living in a society that has collapsed due to environmental disasters, poverty, and violence. The novel explores themes of societal breakdown, the struggle for survival, and the search for a better future.', metadata={'score': 0.8473024368286133, 'uuid': 'e4689f8e-33be-4a59-a9c2-e5ef5dd70f74', 'created_at': '2024-05-10T05:02:02.713123Z', 'token_count': 76}),
 Document(page_content='The \'Parable of the Sower\' refers to a new religious belief system that the protagonist, Lauren Olamina, develops over the course of the novel. As her community disintegrates due to climate change, economic collapse, and social unrest, Lauren comes to believe that humanity must adapt and "shape God" in order to survive. The \'Parable of the Sower\' is the foundational text of this new religion, which Lauren calls "Earthseed", that emphasizes the inevitability of change and the need for humanity to take an active role in shaping its own future. This parable is a central thematic element of the novel, representing the protagonist\'s search for meaning and purpose in the face of societal upheaval.', metadata={'score': 0.8466987311840057, 'uuid': '1f1a44eb-ebd8-4617-ac14-0281099bd770', 'created_at': '2024-05-10T05:02:07.541073Z', 'token_count': 146}),
 Document(page_content='The dialog discusses the central themes of Octavia Butler\'s acclaimed science fiction novel "Parable of the Sower." The main theme is survival in the face of drastic societal collapse, and the importance of adaptability, community, and the human capacity for change. The "Parable of the Sower," a biblical parable, serves as a metaphorical framework for the novel, illustrating the need for receptivity and preparedness when confronting transformative upheaval.', metadata={'score': 0.8283970355987549, 'uuid': '4158a750-3ccd-45ce-ab88-fed5ba68b755', 'created_at': '2024-05-10T05:02:06.510068Z', 'token_count': 91})]
```



## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
