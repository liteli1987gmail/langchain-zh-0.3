# Portkey

[Portkey](https://portkey.ai) 是 AI 应用的控制面板。凭借其流行的 AI 网关和可观察性套件，数百个团队交付 **可靠**、**成本高效** 和 **快速** 的应用。

## LangChain 的 LLMOps

Portkey 为 LangChain 带来了生产就绪性。使用 Portkey，您可以
- [x] 通过统一 API 连接 150+ 个模型，
- [x] 查看 42+ 个 **指标和日志** 以获取所有请求，
- [x] 启用 **语义缓存** 以减少延迟和成本，
- [x] 为失败的请求实现自动 **重试和回退**，
- [x] 为请求添加 **自定义标签** 以便更好地跟踪和分析，以及 [更多](https://portkey.ai/docs)。


## 快速入门 - Portkey 和 LangChain
由于 Portkey 完全兼容 OpenAI 签名，您可以通过 `ChatOpenAI` 接口连接到 Portkey AI 网关。

- 将 `base_url` 设置为 `PORTKEY_GATEWAY_URL`
- 添加 `default_headers` 以使用 `createHeaders` 辅助方法消耗 Portkey 所需的头部信息。

首先，通过 [在此注册](https://app.portkey.ai/signup) 获取您的 Portkey API 密钥。 （点击左下角的个人资料图标，然后点击“复制 API 密钥”）或在 [您自己的环境中](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md) 部署开源 AI 网关。

接下来，安装 Portkey SDK
```python
pip install -U portkey_ai
```

现在我们可以通过更新LangChain中的`ChatOpenAI`模型来连接Portkey AI网关。
```python
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..." # Not needed when hosting your own gateway
PROVIDER_API_KEY = "..." # Add the API key of the AI provider being used 

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,provider="openai")

llm = ChatOpenAI(api_key=PROVIDER_API_KEY, base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

请求通过您的Portkey AI网关路由到指定的`provider`。Portkey还将开始记录您账户中的所有请求，这使得调试变得非常简单。

![View logs from Langchain in Portkey](https://assets.portkey.ai/docs/langchain-logs.gif)

## 通过AI网关使用150+模型
AI网关的强大之处在于您能够使用上述代码片段连接到20多个提供商支持的150多个模型。

让我们修改上述代码，以调用Anthropic的`claude-3-opus-20240229`模型。

Portkey支持**[虚拟密钥](https://docs.portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/virtual-keys)**，这是一种安全存储和管理API密钥的简单方法。让我们尝试使用虚拟密钥进行LLM调用。您可以在Portkey中导航到虚拟密钥选项卡并为Anthropic创建一个新密钥。

`virtual_key`参数设置所使用的AI提供商的身份验证和大模型供应商。在我们的例子中，我们使用的是Anthropic虚拟密钥。

> 请注意，`api_key`可以留空，因为该身份验证将不会被使用。

```python
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..."
VIRTUAL_KEY = "..." # Anthropic's virtual key we copied above

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,virtual_key=VIRTUAL_KEY)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, model="claude-3-opus-20240229")

llm.invoke("What is the meaning of life, universe and everything?")
```

Portkey AI网关将对Anthropic的API请求进行身份验证，并以OpenAI格式返回响应供您使用。

AI网关扩展了LangChain的`ChatOpenAI`类，使其成为调用任何提供商和任何模型的单一接口。

## 高级路由 - 负载均衡、回退、重试
Portkey AI 网关通过配置优先的方法为 LangChain 带来了负载均衡、回退、实验和金丝雀测试等功能。

让我们举一个**例子**，假设我们想要将流量在 `gpt-4` 和 `claude-opus` 之间以 50:50 的比例进行分配，以测试这两个大型模型。网关的配置如下所示：

```python
config = {
    "strategy": {
         "mode": "loadbalance"
    },
    "targets": [{
        "virtual_key": "openai-25654", # OpenAI's virtual key
        "override_params": {"model": "gpt4"},
        "weight": 0.5
    }, {
        "virtual_key": "anthropic-25654", # Anthropic's virtual key
        "override_params": {"model": "claude-3-opus-20240229"},
        "weight": 0.5
    }]
}
```

然后我们可以在从 LangChain 发出的请求中使用这个配置。

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    config=config
)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

当调用大型语言模型时，Portkey 将按照定义的权重比例将请求分配给 `gpt-4` 和 `claude-3-opus-20240229`。

您可以在[这里](https://docs.portkey.ai/docs/api-reference/config-object#examples)找到更多配置示例。

## **追踪链与代理**

Portkey 的 LangChain 集成使您能够全面了解代理的运行情况。让我们举一个[流行的代理工作流](https://python.langchain.com/docs/use_cases/tool_use/quickstart/#agents)的例子。

我们只需修改 `ChatOpenAI` 类以使用上述 AI 网关。

```python
from langchain import hub  
from langchain.agents import AgentExecutor, create_openai_tools_agent  
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders
 
prompt = hub.pull("hwchase17/openai-tools-agent")

portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    virtual_key=OPENAI_VIRTUAL_KEY,
    trace_id="uuid-uuid-uuid-uuid"
)

@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
  
  
@tool  
def exponentiate(base: int, exponent: int) -> int:  
    "Exponentiate the base to the exponent power."  
    return base**exponent  
  
  
tools = [multiply, exponentiate]

model = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0)
  
# Construct the OpenAI Tools agent  
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
})
```

**您可以在 Portkey 仪表板上查看请求日志及其追踪 ID：**
![Langchain Agent Logs on Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)


更多文档可在此查看：
- 可观察性 - https://portkey.ai/docs/product/observability-modern-monitoring-for-llms
- AI 网关 - https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations
- 提示词库 - https://portkey.ai/docs/product/prompt-library

您可以在此查看我们流行的开源 AI 网关 - https://github.com/portkey-ai/gateway

有关每个功能及其使用方法的详细信息，请[参考 Portkey 文档](https://portkey.ai/docs)。如果您有任何问题或需要进一步的帮助，[请在 Twitter 上与我们联系。](https://twitter.com/portkeyai) 或通过我们的[支持邮箱](mailto:hello@portkey.ai)。
