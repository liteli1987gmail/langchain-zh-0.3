# LiteLLM

>[LiteLLM](https://docs.litellm.ai/docs/) 是一个简化调用Anthropic、
> Azure、Huggingface、Replicate等大型语言模型的库，以统一的方式进行调用。
>
>您可以通过以下方式使用 `LiteLLM`：
>
>* [LiteLLM代理服务器](https://docs.litellm.ai/docs/#openai-proxy) - 用于调用100+大型语言模型的服务器，负载均衡，跨项目成本跟踪
>* [LiteLLM python SDK](https://docs.litellm.ai/docs/#basic-usage) - 用于调用100+大型语言模型的Python客户端，负载均衡，成本跟踪

## 安装和设置

安装 `litellm` Python包。

```bash
pip install litellm
```

## 聊天模型

### ChatLiteLLM

查看 [使用示例](/docs/integrations/chat/litellm)。

```python
from langchain_community.chat_models import ChatLiteLLM
```

### ChatLiteLLMRouter

您还可以使用 `ChatLiteLLMRouter` 将请求路由到不同的 LLM 或 LLM 大模型供应商。

查看 [使用示例](/docs/integrations/chat/litellm_router)。

```python
from langchain_community.chat_models import ChatLiteLLMRouter
```
