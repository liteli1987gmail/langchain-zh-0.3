# Friendli AI

> [FriendliAI](https://friendli.ai/) 提升AI应用性能并优化
> 成本节约，提供可扩展、高效的部署选项，专为高需求的AI工作负载量身定制。

## 安装和设置

安装 `friendli-client` python 包。

```bash
pip install friendli-client
```
登录到 [Friendli Suite](https://suite.friendli.ai/) 创建个人访问令牌，
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
