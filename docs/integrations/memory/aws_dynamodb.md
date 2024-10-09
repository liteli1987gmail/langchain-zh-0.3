---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/memory/aws_dynamodb.ipynb
---
# AWS DynamoDB

>[Amazon AWS DynamoDB](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/index.html) 是一个完全托管的 `NoSQL` 数据库服务，提供快速且可预测的性能，并具有无缝的可扩展性。

本笔记本介绍了如何使用 `DynamoDB` 通过 `DynamoDBChatMessageHistory` 类存储聊天消息历史。

## 设置

首先确保您已正确配置 [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)。然后确保您已安装 `langchain-community` 包，因此我们需要安装它。我们还需要安装 `boto3` 包。

```bash
pip install -U langchain-community boto3
```

为了获得最佳的可观察性，设置 [LangSmith](https://smith.langchain.com/) 也是有帮助的（但不是必需的）


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```


```python
<!--IMPORTS:[{"imported": "DynamoDBChatMessageHistory", "source": "langchain_community.chat_message_histories", "docs": "https://python.langchain.com/api_reference/community/chat_message_histories/langchain_community.chat_message_histories.dynamodb.DynamoDBChatMessageHistory.html", "title": "AWS DynamoDB"}]-->
from langchain_community.chat_message_histories import (
    DynamoDBChatMessageHistory,
)
```

## 创建表

现在，创建我们将存储消息的 `DynamoDB` 表：


```python
import boto3

# Get the service resource.
dynamodb = boto3.resource("dynamodb")

# Create the DynamoDB table.
table = dynamodb.create_table(
    TableName="SessionTable",
    KeySchema=[{"AttributeName": "SessionId", "KeyType": "HASH"}],
    AttributeDefinitions=[{"AttributeName": "SessionId", "AttributeType": "S"}],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
table.meta.client.get_waiter("table_exists").wait(TableName="SessionTable")

# Print out some data about the table.
print(table.item_count)
```
```output
0
```
## DynamoDB聊天消息历史


```python
history = DynamoDBChatMessageHistory(table_name="SessionTable", session_id="0")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```


```python
history.messages
```



```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```


## 带有自定义端点URL的DynamoDB聊天消息历史

有时指定要连接的AWS端点的URL是有用的。例如，当您在本地运行 [Localstack](https://localstack.cloud/) 时。在这些情况下，您可以通过构造函数中的 `endpoint_url` 参数指定URL。


```python
history = DynamoDBChatMessageHistory(
    table_name="SessionTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
)
```

## 带有复合键的DynamoDB聊天消息历史
DynamoDB聊天消息历史的默认键是 ```{"SessionId": self.session_id}```, 但您可以修改此键以匹配您的表设计。

### 主键名称
您可以通过在构造函数中传入 primary_key_name 值来修改主键，结果如下：
```{self.primary_key_name: self.session_id}```

### Composite Keys
When using an existing DynamoDB table, you may need to modify the key structure from the default of to something including a Sort Key. To do this you may use the ```key``` parameter.

Passing a value for key will override the primary_key parameter, and the resulting key structure will be the passed value.



```python
composite_table = dynamodb.create_table(
    TableName="CompositeTable",
    KeySchema=[
        {"AttributeName": "PK", "KeyType": "HASH"},
        {"AttributeName": "SK", "KeyType": "RANGE"},
    ],
    AttributeDefinitions=[
        {"AttributeName": "PK", "AttributeType": "S"},
        {"AttributeName": "SK", "AttributeType": "S"},
    ],
    BillingMode="PAY_PER_REQUEST",
)

# Wait until the table exists.
composite_table.meta.client.get_waiter("table_exists").wait(TableName="CompositeTable")

# Print out some data about the table.
print(composite_table.item_count)
```
```output
0
```

```python
my_key = {
    "PK": "session_id::0",
    "SK": "langchain_history",
}

composite_key_history = DynamoDBChatMessageHistory(
    table_name="CompositeTable",
    session_id="0",
    endpoint_url="http://localhost.localstack.cloud:4566",
    key=my_key,
)

composite_key_history.add_user_message("hello, composite dynamodb table!")

composite_key_history.messages
```



```output
[HumanMessage(content='hello, composite dynamodb table!')]
```


## 链接

我们可以轻松地将这个消息历史类与 [LangChain表达式 (LCEL) 运行接口](/docs/how_to/message_history) 结合起来

为此，我们需要使用 OpenAI，因此我们需要安装它


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "AWS DynamoDB"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "AWS DynamoDB"}, {"imported": "RunnableWithMessageHistory", "source": "langchain_core.runnables.history", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.history.RunnableWithMessageHistory.html", "title": "AWS DynamoDB"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "AWS DynamoDB"}]-->
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```


```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: DynamoDBChatMessageHistory(
        table_name="SessionTable", session_id=session_id
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```


```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```


```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```



```output
AIMessage(content='Hello Bob! How can I assist you today?')
```



```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```



```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```

