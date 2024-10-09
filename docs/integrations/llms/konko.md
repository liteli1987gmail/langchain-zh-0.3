---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/konko.ipynb
sidebar_label: Konko
---
# Konko

>[Konko](https://www.konko.ai/) API 是一个完全托管的 Web API，旨在帮助应用程序开发人员：

1. **选择** 适合其应用程序的开源或专有大型语言模型 (LLMs)
2. **更快地构建** 应用程序，集成领先的应用程序框架和完全托管的 API
3. **微调** 较小的开源大型语言模型，以在成本的很小一部分下实现行业领先的性能
4. **部署生产级 API**，满足安全性、隐私、吞吐量和延迟服务水平协议 (SLA)，无需基础设施设置或管理，使用 Konko AI 的 SOC 2 合规的多云基础设施

本示例介绍如何使用 LangChain 与 `Konko` 完成 [模型](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion) 进行交互

要运行此笔记本，您需要 Konko API 密钥。请登录我们的 Web 应用程序以 [创建 API 密钥](https://platform.konko.ai/settings/api-keys) 以访问模型

#### 设置环境变量

1. 您可以设置环境变量
1. KONKO_API_KEY（必填）
2. OPENAI_API_KEY（可选）
2. 在您当前的 shell 会话中，使用 export 命令：

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## 调用模型

在 [Konko 概览页面](https://docs.konko.ai/docs/list-of-models) 上查找模型

查找运行在 Konko 实例上的模型列表的另一种方法是通过这个 [端点](https://docs.konko.ai/reference/get-models)。

从这里，我们可以初始化我们的模型：


```python
<!--IMPORTS:[{"imported": "Konko", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.konko.Konko.html", "title": "Konko"}]-->
from langchain_community.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```
```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```

## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
