---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/index.ipynb
sidebar_position: 1
---
# 如何从 v0.0 链迁移

自最初发布以来，LangChain 已经发展，许多原始的 "链" 类
已被弃用，取而代之的是更灵活和强大的 LCEL 和 LangGraph 框架。

本指南将帮助您将现有的 v0.0 链迁移到新的抽象。

:::info How deprecated implementations work
尽管许多实现已被弃用，但它们在代码库中**仍然受支持**。
然而，不建议在新开发中使用它们，我们建议使用以下指南重新实现它们！

要查看每个弃用实现的计划移除版本，请查看它们的 API 参考。
:::

:::info Prerequisites

这些指南假设您对以下概念有一定的了解：
- [LangChain 表达式](/docs/concepts#langchain-expression-language-lcel)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
:::

LangChain维护了一些遗留抽象。许多这些可以通过LCEL和LangGraph原语的简短组合重新实现。

### LCEL
[LCEL](/docs/concepts/#langchain-expression-language-lcel)旨在简化使用大型语言模型（LLMs）构建有用应用程序的过程，并结合相关组件。它通过提供以下功能实现这一目标：

1. **统一接口**：每个LCEL对象都实现了`Runnable`接口，该接口定义了一组通用的调用方法（`invoke`、`batch`、`stream`、`ainvoke`等）。这使得能够自动且一致地支持有用的操作，如中间步骤的流式处理和批处理，因为由LCEL对象组成的每个链本身也是一个LCEL对象。
2. **组合原语**：LCEL提供了一些原语，使得组合链、并行化组件、添加回退、动态配置链内部等变得简单。

### LangGraph
[LangGraph](https://langchain-ai.github.io/langgraph/)建立在LCEL之上，允许高效地协调应用程序组件，同时保持简洁和可读的代码。它包括内置持久性、对循环的支持，并优先考虑可控性。
如果LCEL对于更大或更复杂的链变得笨重，它们可能会受益于LangGraph的实现。

### 优势
使用这些框架来处理现有的v0.0链带来了一些优势：

- 生成的链通常实现完整的 `运行接口`，在适当的情况下包括流式处理和异步支持；
- 链可能更容易扩展或修改；
- 链的参数通常更易于定制（例如，提示词），相比之前的版本，后者往往是子类并且具有不透明的参数和内部结构。
- 如果使用 LangGraph，链支持内置持久性，允许通过聊天历史的“记忆”实现对话体验。
- 如果使用 LangGraph，链的步骤可以流式处理，允许更大的控制和可定制性。


以下页面帮助从各种特定链迁移到 LCEL 和 LangGraph：

- [LLMChain](./llm_chain.md)
- [ConversationChain](./conversation_chain.md)
- [RetrievalQA](./retrieval_qa.md)
- [ConversationalRetrievalChain](./conversation_retrieval_chain.md)
- [StuffDocumentsChain](./stuff_docs_chain.md)
- [MapReduceDocumentsChain](./map_reduce_chain.md)
- [MapRerankDocumentsChain](./map_rerank_docs_chain.md)
- [RefineDocumentsChain](./refine_docs_chain.md)
- [LLMRouterChain](./llm_router_chain.md)
- [MultiPromptChain](./multi_prompt_chain.md)
- [LLMMathChain](./llm_math_chain.md)
- [ConstitutionalChain](./constitutional_chain.md)

查看 [LCEL 概念文档](/docs/concepts/#langchain-expression-language-lcel) 和 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) 以获取更多背景信息。
