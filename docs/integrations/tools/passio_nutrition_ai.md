---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/passio_nutrition_ai.ipynb
---
# Passio NutritionAI

为了更好地理解 NutritionAI 如何赋予您的代理超强的食品营养能力，让我们构建一个可以通过 Passio NutritionAI 查找该信息的代理。

## 定义工具

我们首先需要创建 [Passio NutritionAI 工具](/docs/integrations/tools/passio_nutrition_ai)。

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

我们在 LangChain 中内置了一个工具，可以轻松使用 Passio NutritionAI 查找食品营养信息。
请注意，这需要一个 API 密钥 - 他们提供免费套餐。

一旦您创建了 API 密钥，您需要将其导出为：

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... 或通过其他方式将其提供给您的 Python 环境，例如 `dotenv` 包。您还可以通过构造函数调用显式控制密钥。


```python
<!--IMPORTS:[{"imported": "get_from_env", "source": "langchain_core.utils", "docs": "https://python.langchain.com/api_reference/core/utils/langchain_core.utils.env.get_from_env.html", "title": "Passio NutritionAI"}]-->
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```


```python
<!--IMPORTS:[{"imported": "NutritionAI", "source": "langchain_community.tools.passio_nutrition_ai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.passio_nutrition_ai.tool.NutritionAI.html", "title": "Passio NutritionAI"}, {"imported": "NutritionAIAPI", "source": "langchain_community.utilities.passio_nutrition_ai", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.passio_nutrition_ai.NutritionAIAPI.html", "title": "Passio NutritionAI"}]-->
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```


```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```


```python
nutritionai_search.invoke("chicken tikka masala")
```


```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### 工具

现在我们有了工具，我们可以创建一个将要在后续使用的工具列表。


```python
tools = [nutritionai_search]
```

## 创建代理

现在我们已经定义了工具，我们可以创建代理。我们将使用 OpenAI Functions 代理 - 有关这种代理的更多信息以及其他选项，请参见 [本指南](/docs/concepts#agents)

首先，我们选择希望指导代理的 LLM。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Passio NutritionAI"}]-->
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

接下来，我们选择希望用来指导代理的提示。


```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```



```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```


现在，我们可以用 LLM、提示和工具初始化代理。代理负责接收输入并决定采取什么行动。至关重要的是，代理并不执行这些行动 - 这是由 AgentExecutor 完成的（下一步）。有关如何思考这些组件的更多信息，请参见我们的 [概念指南](/docs/concepts#agents)


```python
<!--IMPORTS:[{"imported": "create_openai_functions_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_functions_agent.base.create_openai_functions_agent.html", "title": "Passio NutritionAI"}]-->
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

最后，我们将代理（大脑）与 AgentExecutor 内部的工具结合起来（它将反复调用代理并执行工具）。有关如何思考这些组件的更多信息，请参见我们的 [概念指南](/docs/concepts#agents)


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Passio NutritionAI"}]-->
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## 运行代理

我们现在可以在几个查询上运行代理！请注意，目前这些都是**无状态**查询（它不会记住之前的交互）。


```python
agent_executor.invoke({"input": "hi!"})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```


```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```



```python
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

如果我们想自动跟踪这些消息，可以将其包装在RunnableWithMessageHistory中。有关如何使用此功能的更多信息，请参见[本指南](/docs/how_to/message_history)。


```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```


```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```


```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```


```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## 结论

到此为止！在这个快速入门中，我们介绍了如何创建一个能够将食品营养信息纳入其回答的简单代理。代理是一个复杂的话题，还有很多需要学习的内容！


## 相关

- 工具[概念指南](/docs/concepts/#tools)
- 工具[使用指南](/docs/how_to/#tools)
