---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/redis_chat_message_history.ipynb
---
# Redis 聊天消息历史

>[Redis (远程字典服务器)](https://en.wikipedia.org/wiki/Redis) 是一个开源的内存存储，用作分布式的内存键值数据库、缓存和消息代理，具有可选的持久性。`Redis` 提供低延迟的读写操作。Redis 是最流行的 NoSQL 数据库，也是最流行的数据库之一。

本笔记本演示了如何使用 langchain-redis 包中的 `RedisChatMessageHistory` 类来存储和管理使用 Redis 的聊天消息历史。

## 设置

首先，我们需要安装所需的依赖项，并确保我们有一个正在运行的 Redis 实例。


```python
%pip install -qU langchain-redis langchain-openai redis
```

确保您有一个正在运行的Redis服务器。您可以使用以下命令通过Docker启动一个：

```
docker run -d -p 6379:6379 redis:latest
```

或者根据您的操作系统的说明在本地安装并运行Redis。


```python
import os

# Use the environment variable if set, otherwise default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
print(f"Connecting to Redis at: {REDIS_URL}")
```
```output
Connecting to Redis at: redis://redis:6379
```
## 导入所需的库


```python
<!--IMPORTS:[{"imported": "BaseChatMessageHistory", "source": "langchain_core.chat_history", "docs": "https://python.langchain.com/api_reference/core/chat_history/langchain_core.chat_history.BaseChatMessageHistory.html", "title": "Redis Chat Message History"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "Redis Chat Message History"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Redis Chat Message History"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Redis Chat Message History"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "Redis Chat Message History"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "Redis Chat Message History"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Redis Chat Message History"}]-->
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
from langchain_redis import RedisChatMessageHistory
```

## RedisChatMessageHistory的基本用法


```python
# Initialize RedisChatMessageHistory
history = RedisChatMessageHistory(session_id="user_123", redis_url=REDIS_URL)

# Add messages to the history
history.add_user_message("Hello, AI assistant!")
history.add_ai_message("Hello! How can I assist you today?")

# Retrieve messages
print("Chat History:")
for message in history.messages:
    print(f"{type(message).__name__}: {message.content}")
```
```output
Chat History:
HumanMessage: Hello, AI assistant!
AIMessage: Hello! How can I assist you today?
```
## 将RedisChatMessageHistory与语言模型结合使用

### 设置OpenAI API密钥


```python
from getpass import getpass

# Check if OPENAI_API_KEY is already set in the environment
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    print("OpenAI API key not found in environment variables.")
    openai_api_key = getpass("Please enter your OpenAI API key: ")

    # Set the API key for the current session
    os.environ["OPENAI_API_KEY"] = openai_api_key
    print("OpenAI API key has been set for this session.")
else:
    print("OpenAI API key found in environment variables.")
```
```output
OpenAI API key not found in environment variables.
``````output
Please enter your OpenAI API key:  ········
``````output
OpenAI API key has been set for this session.
```

```python
# Create a prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)

# Initialize the language model
llm = ChatOpenAI()

# Create the conversational chain
chain = prompt | llm


# Function to get or create a RedisChatMessageHistory instance
def get_redis_history(session_id: str) -> BaseChatMessageHistory:
    return RedisChatMessageHistory(session_id, redis_url=REDIS_URL)


# Create a runnable with message history
chain_with_history = RunnableWithMessageHistory(
    chain, get_redis_history, input_messages_key="input", history_messages_key="history"
)

# Use the chain in a conversation
response1 = chain_with_history.invoke(
    {"input": "Hi, my name is Alice."},
    config={"configurable": {"session_id": "alice_123"}},
)
print("AI Response 1:", response1.content)

response2 = chain_with_history.invoke(
    {"input": "What's my name?"}, config={"configurable": {"session_id": "alice_123"}}
)
print("AI Response 2:", response2.content)
```
```output
AI Response 1: Hello Alice! How can I assist you today?
AI Response 2: Your name is Alice.
```
## 高级功能

### 自定义Redis配置


```python
# Initialize with custom Redis configuration
custom_history = RedisChatMessageHistory(
    "user_456",
    redis_url=REDIS_URL,
    key_prefix="custom_prefix:",
    ttl=3600,  # Set TTL to 1 hour
    index_name="custom_index",
)

custom_history.add_user_message("This is a message with custom configuration.")
print("Custom History:", custom_history.messages)
```
```output
Custom History: [HumanMessage(content='This is a message with custom configuration.')]
```
### 搜索消息


```python
# Add more messages
history.add_user_message("Tell me about artificial intelligence.")
history.add_ai_message(
    "Artificial Intelligence (AI) is a branch of computer science..."
)

# Search for messages containing a specific term
search_results = history.search_messages("artificial intelligence")
print("Search Results:")
for result in search_results:
    print(f"{result['type']}: {result['content'][:50]}...")
```
```output
Search Results:
human: Tell me about artificial intelligence....
ai: Artificial Intelligence (AI) is a branch of comput...
```
### 清除历史记录


```python
# Clear the chat history
history.clear()
print("Messages after clearing:", history.messages)
```
```output
Messages after clearing: []
```
## 结论

本笔记本演示了来自 langchain-redis 包的 `RedisChatMessageHistory` 的关键特性。它展示了如何初始化和使用聊天历史，如何将其与语言模型集成，以及如何利用自定义配置和消息搜索等高级功能。Redis 为在 AI 应用中管理聊天历史提供了快速且可扩展的解决方案。
