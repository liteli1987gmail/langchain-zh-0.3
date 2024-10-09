---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/kafka_chat_message_history.ipynb
---
# Kafka

[Kafka](https://github.com/apache/kafka) 是一个分布式消息系统，用于发布和订阅记录流。
此演示展示了如何使用 `KafkaChatMessageHistory` 从 Kafka 集群存储和检索聊天消息。

运行此演示需要一个正在运行的 Kafka 集群。您可以按照这个 [说明](https://developer.confluent.io/get-started/python) 在本地创建一个 Kafka 集群。


```python
<!--IMPORTS:[{"imported": "KafkaChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.kafka.KafkaChatMessageHistory.html", "title": "Kafka"}]-->
from langchain_community.chat_message_histories import KafkaChatMessageHistory

chat_session_id = "chat-message-history-kafka"
bootstrap_servers = "localhost:64797"  # host:port. `localhost:Plaintext Ports` if setup Kafka cluster locally
history = KafkaChatMessageHistory(
    chat_session_id,
    bootstrap_servers,
)
```

构造 `KafkaChatMessageHistory` 的可选参数：
- `ttl_ms`: 聊天消息的生存时间（以毫秒为单位）。
- `partition`: 存储聊天消息的主题分区数量。
- `replication_factor`: 存储聊天消息的主题的复制因子。

`KafkaChatMessageHistory` 内部使用 Kafka 消费者读取聊天消息，并具有持久标记已消费位置的能力。它具有以下方法来检索聊天消息：
- `messages`: 从最后一条消息继续消费聊天消息。
- `messages_from_beginning`: 将消费者重置到历史记录的开头并消费消息。可选参数：
1. `max_message_count`: 要读取的最大消息数量。
2. `max_time_sec`: 读取消息的最大时间（以秒为单位）。
- `messages_from_latest`: 将消费者重置到聊天历史的末尾并尝试消费消息。可选参数与上述相同。
- `messages_from_last_consumed`: 返回从最后一个已消费消息继续的消息，类似于 `messages`，但带有可选参数。

`max_message_count` 和 `max_time_sec` 用于避免在检索消息时无限期阻塞。
因此，`messages` 和其他检索消息的方法可能不会返回聊天历史中的所有消息。您需要指定 `max_message_count` 和 `max_time_sec` 以在单个批次中检索所有聊天历史。


添加消息并进行检索。


```python
history.add_user_message("hi!")
history.add_ai_message("whats up?")

history.messages
```



```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```


再次调用 `messages` 返回一个空列表，因为消费者位于聊天历史的末尾。


```python
history.messages
```



```output
[]
```


添加新消息并继续消费。


```python
history.add_user_message("hi again!")
history.add_ai_message("whats up again?")
history.messages
```



```output
[HumanMessage(content='hi again!'), AIMessage(content='whats up again?')]
```


要重置消费者并从头开始读取：


```python
history.messages_from_beginning()
```



```output
[HumanMessage(content='hi again!'),
 AIMessage(content='whats up again?'),
 HumanMessage(content='hi!'),
 AIMessage(content='whats up?')]
```


将消费者设置为聊天历史的末尾，添加几条新消息，并进行消费：


```python
history.messages_from_latest()
history.add_user_message("HI!")
history.add_ai_message("WHATS UP?")
history.messages
```



```output
[HumanMessage(content='HI!'), AIMessage(content='WHATS UP?')]
```

