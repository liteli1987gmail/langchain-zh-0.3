---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_memory/conversation_summary_memory.ipynb
---
# 从 ConversationSummaryMemory 或 ConversationSummaryBufferMemory 迁移

如果您想从下面列出的旧内存类迁移，请遵循本指南：


| 内存类型                              | 描述                                                                                                                                              |
|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `ConversationSummaryMemory`           | 持续总结对话历史。每次对话轮次后，摘要会更新。该抽象返回对话历史的摘要。                                                                 |
| `ConversationSummaryBufferMemory`     | 提供对话的运行摘要以及对话中最新消息的摘要，前提是对话中的总令牌数不超过某个限制。                                                             |

请遵循 LangGraph 中的 [摘要如何指南](https://langchain-ai.github.io/langgraph/how-tos/memory/add-summary-conversation-history/)。

本指南展示了如何维护对话的运行摘要，同时丢弃较旧的消息，确保它们在后续轮次中不会被重新处理。
