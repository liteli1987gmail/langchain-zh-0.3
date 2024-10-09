# Baseten

>[Baseten](https://baseten.co) 是一个提供您所需的所有基础设施以部署和服务
> ML 模型高效、可扩展且具有成本效益。

>作为一个模型推理平台，`Baseten` 是 LangChain 生态系统中的一个 `Provider`。
`Baseten` 集成目前实现了一个单一的 `Component`，大型语言模型，但计划会有更多！

>`Baseten` 让您可以运行开源模型，如 Llama 2 或 Mistral，并在专用 GPU 上运行专有或
微调模型。如果您习惯于像 OpenAI 这样的提供商，使用 Baseten 有一些不同之处：

>* 与按令牌付费不同，您按使用的 GPU 分钟付费。
>* Baseten 上的每个模型都使用 [Truss](https://truss.baseten.co/welcome)，我们的开源模型包装框架，以实现最大程度的可定制性。
>* 虽然我们有一些 [与 OpenAI ChatCompletions 兼容的模型](https://docs.baseten.co/api-reference/openai)，但您可以使用 `Truss` 定义自己的 I/O 规范。

>[了解更多](https://docs.baseten.co/deploy/lifecycle) 有关模型ID和部署的信息。

>在[Baseten文档](https://docs.baseten.co/)中了解更多关于Baseten的信息。

## 安装和设置

要使用Baseten模型与LangChain，您需要两样东西：

- 一个[Baseten账户](https://baseten.co)
- 一个[API密钥](https://docs.baseten.co/observability/api-keys)

将您的API密钥导出为名为`BASETEN_API_KEY`的环境变量。

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## 大型语言模型

查看[使用示例](/docs/integrations/llms/baseten)。

```python
from langchain_community.llms import Baseten
```
