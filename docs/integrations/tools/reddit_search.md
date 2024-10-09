---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/reddit_search.ipynb
---
# Reddit 搜索

在这个笔记本中，我们学习 Reddit 搜索工具是如何工作的。
首先确保您已使用以下命令安装 praw：


```python
%pip install --upgrade --quiet  praw
```

然后你需要设置正确的API密钥和环境变量。你需要创建一个Reddit用户账户并获取凭证。因此，请访问https://www.reddit.com并注册一个Reddit用户账户。
然后通过访问https://www.reddit.com/prefs/apps并创建一个应用程序来获取你的凭证。
你应该从创建应用程序中获得client_id和secret。现在，你可以将这些字符串粘贴到client_id和client_secret变量中。
注意：你可以为user_agent设置任何字符串。


```python
client_id = ""
client_secret = ""
user_agent = ""
```


```python
<!--IMPORTS:[{"imported": "RedditSearchRun", "source": "langchain_community.tools.reddit_search.tool", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.reddit_search.tool.RedditSearchRun.html", "title": "Reddit Search "}, {"imported": "RedditSearchAPIWrapper", "source": "langchain_community.utilities.reddit_search", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.reddit_search.RedditSearchAPIWrapper.html", "title": "Reddit Search "}]-->
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper

search = RedditSearchRun(
    api_wrapper=RedditSearchAPIWrapper(
        reddit_client_id=client_id,
        reddit_client_secret=client_secret,
        reddit_user_agent=user_agent,
    )
)
```

然后你可以设置你的查询，例如，你想查询哪个subreddit，想返回多少个帖子，结果希望如何排序等。


```python
<!--IMPORTS:[{"imported": "RedditSearchSchema", "source": "langchain_community.tools.reddit_search.tool", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.reddit_search.tool.RedditSearchSchema.html", "title": "Reddit Search "}]-->
from langchain_community.tools.reddit_search.tool import RedditSearchSchema

search_params = RedditSearchSchema(
    query="beginner", sort="new", time_filter="week", subreddit="python", limit="2"
)
```

最后运行搜索并获取结果。


```python
result = search.run(tool_input=search_params.dict())
```


```python
print(result)
```

这是打印结果的一个示例。
注意：根据subreddit中最新的帖子，你可能会得到不同的输出，但格式应该是相似的。


> 搜索r/python找到2个帖子：
> 帖子标题：'在Visual Studio Code中设置Github Copilot'
> 用户: Feisty-Recording-715
> 子版块: r/Python:
>                     文本内容: 🛠️ 本教程非常适合希望加强版本控制理解的初学者，或是寻求在Visual Studio Code中快速参考GitHub设置的经验丰富的开发者。
>
>🎓 到视频结束时，您将掌握自信管理代码库、与他人协作以及为GitHub上的开源项目做出贡献的技能。
>
>
>视频链接: https://youtu.be/IdT1BhrSfdo?si=mV7xVpiyuhlD8Zrw
>
>欢迎您的反馈
>                     帖子链接: https://www.reddit.com/r/Python/comments/1823wr7/setup_github_copilot_in_visual_studio_code/
>                     帖子类别: 不适用。
>                     分数: 0
>
>帖子标题: '使用pygame和PySide6制作的中国跳棋游戏，支持自定义机器人'
>用户: HenryChess
>子版块: r/Python:
>                     正文: GitHub链接: https://github.com/henrychess/pygame-chinese-checkers
>
>我不确定这算不算初学者或中级。我觉得我仍然在初学者阶段，所以我将其标记为初学者。
>
>这是一个适合2到3名玩家的中国跳棋（又名斯特恩哈尔马）游戏。我编写的机器人很容易被击败，因为它们主要用于调试游戏逻辑部分的代码。不过，你可以编写自己的自定义机器人。GitHub页面上有一个指南。
>                     帖子链接: https://www.reddit.com/r/Python/comments/181xq0u/a_chinese_checkers_game_made_with_pygame_and/
>                     帖子类别: 不适用。
>                    分数: 1



## 使用工具与代理链

Reddit搜索功能也作为一个多输入工具提供。在这个例子中，我们改编了[文档中的现有代码](https://python.langchain.com/v0.1/docs/modules/memory/agent_with_memory/)，并使用ChatOpenAI创建一个带有记忆的代理链。这个代理链能够从Reddit提取信息，并使用这些帖子来响应后续输入。

要运行这个例子，请添加你的Reddit API访问信息，并从[OpenAI API](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)获取一个OpenAI密钥。


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "Reddit Search "}, {"imported": "StructuredChatAgent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.structured_chat.base.StructuredChatAgent.html", "title": "Reddit Search "}, {"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Reddit Search "}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Reddit Search "}, {"imported": "ReadOnlySharedMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.readonly.ReadOnlySharedMemory.html", "title": "Reddit Search "}, {"imported": "RedditSearchRun", "source": "langchain_community.tools.reddit_search.tool", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.reddit_search.tool.RedditSearchRun.html", "title": "Reddit Search "}, {"imported": "RedditSearchAPIWrapper", "source": "langchain_community.utilities.reddit_search", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.reddit_search.RedditSearchAPIWrapper.html", "title": "Reddit Search "}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Reddit Search "}, {"imported": "Tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.simple.Tool.html", "title": "Reddit Search "}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Reddit Search "}]-->
# Adapted code from /docs/modules/agents/how_to/sharedmemory_for_tools

from langchain.agents import AgentExecutor, StructuredChatAgent
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory, ReadOnlySharedMemory
from langchain_community.tools.reddit_search.tool import RedditSearchRun
from langchain_community.utilities.reddit_search import RedditSearchAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI

# Provide keys for Reddit
client_id = ""
client_secret = ""
user_agent = ""
# Provide key for OpenAI
openai_api_key = ""

template = """This is a conversation between a human and a bot:

{chat_history}

Write a summary of the conversation for {input}:
"""

prompt = PromptTemplate(input_variables=["input", "chat_history"], template=template)
memory = ConversationBufferMemory(memory_key="chat_history")

prefix = """Have a conversation with a human, answering the following questions as best you can. You have access to the following tools:"""
suffix = """Begin!"

{chat_history}
Question: {input}
{agent_scratchpad}"""

tools = [
    RedditSearchRun(
        api_wrapper=RedditSearchAPIWrapper(
            reddit_client_id=client_id,
            reddit_client_secret=client_secret,
            reddit_user_agent=user_agent,
        )
    )
]

prompt = StructuredChatAgent.create_prompt(
    prefix=prefix,
    tools=tools,
    suffix=suffix,
    input_variables=["input", "chat_history", "agent_scratchpad"],
)

llm = ChatOpenAI(temperature=0, openai_api_key=openai_api_key)

llm_chain = LLMChain(llm=llm, prompt=prompt)
agent = StructuredChatAgent(llm_chain=llm_chain, verbose=True, tools=tools)
agent_chain = AgentExecutor.from_agent_and_tools(
    agent=agent, verbose=True, memory=memory, tools=tools
)

# Answering the first prompt requires usage of the Reddit search tool.
agent_chain.run(input="What is the newest post on r/langchain for the week?")
# Answering the subsequent prompt uses memory.
agent_chain.run(input="Who is the author of the post?")
```


## 相关

- 工具[概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
