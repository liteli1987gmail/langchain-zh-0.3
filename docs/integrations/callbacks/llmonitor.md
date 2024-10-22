# LLMonitor

>[LLMonitor](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) 是一个开源可观察性平台，提供成本和使用分析、用户跟踪、追踪和评估工具。

<video controls width='100%' >
  <source src='https://llmonitor.com/videos/demo-annotated.mp4'/>
</video>

## 设置

在 [llmonitor.com](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) 上创建一个账户，然后复制您新应用的 `tracking id`。

一旦您有了它，通过运行以下命令将其设置为环境变量：

```bash
export LLMONITOR_APP_ID="..."
```

如果您不想设置环境变量，可以在初始化回调处理程序时直接传递密钥：

```python
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler(app_id="...")
```

## 与大型语言模型/聊天模型的使用

```python
from langchain_openai import OpenAI
from langchain_openai import ChatOpenAI

handler = LLMonitorCallbackHandler()

llm = OpenAI(
    callbacks=[handler],
)

chat = ChatOpenAI(callbacks=[handler])

llm("Tell me a joke")

```

## 与链和代理的使用

确保将回调处理程序传递给 `run` 方法，以便正确跟踪所有相关的链和大型语言模型调用。

还建议在元数据中传递 `agent_name`，以便能够在仪表板中区分代理。

示例：

```python
from langchain_openai import ChatOpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.agents import OpenAIFunctionsAgent, AgentExecutor, tool

llm = ChatOpenAI(temperature=0)

handler = LLMonitorCallbackHandler()

@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)

tools = [get_word_length]

prompt = OpenAIFunctionsAgent.create_prompt(
    system_message=SystemMessage(
        content="You are very powerful assistant, but bad at calculating lengths of words."
    )
)

agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=prompt, verbose=True)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, metadata={"agent_name": "WordCount"}  # <- recommended, assign a custom name
)
agent_executor.run("how many letters in the word educa?", callbacks=[handler])
```

另一个示例：

```python
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain_openai import OpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler


handler = LLMonitorCallbackHandler()

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, metadata={ "agent_name": "GirlfriendAgeFinder" })  # <- recommended, assign a custom name

agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=[handler],
)
```

## 用户跟踪
用户跟踪允许您识别用户，跟踪他们的成本、对话等。

```python
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler, identify

with identify("user-123"):
    llm.invoke("Tell me a joke")

with identify("user-456", user_props={"email": "user456@test.com"}):
    agent.run("Who is Leo DiCaprio's girlfriend?")
```
## 支持

对于任何与集成相关的问题或疑问，您可以通过 [Discord](http://discord.com/invite/8PafSG58kK) 或通过 [电子邮件](mailto:vince@llmonitor.com) 联系 LLMonitor 团队。
