# Friendli AI

>[Friendli AI](https://friendli.ai/) 是一家微调和部署大型语言模型的公司，
> 并服务于广泛的生成式人工智能用例。


## 安装和设置

- 安装集成包：

  ```
  pip install friendli-client
  ```

- 登录到 [Friendli Suite](https://suite.friendli.ai/) 创建个人访问令牌，
并将其设置为 `FRIENDLI_TOKEN` 环境变量。

## 聊天模型

查看 [使用示例](/docs/integrations/chat/friendli)。

```python
from langchain_community.chat_models.friendli import ChatFriendli
```

## 大型语言模型

查看 [使用示例](/docs/integrations/llms/friendli)。

```python
from langchain_community.llms.friendli import Friendli
```
