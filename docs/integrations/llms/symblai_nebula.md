---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/symblai_nebula.ipynb
---
# Nebula (Symbl.ai)
[Nebula](https://symbl.ai/nebula/) 是由 [Symbl.ai](https://symbl.ai) 构建的大型语言模型 (LLM)。它经过训练以在人工对话中执行生成任务。Nebula 擅长建模对话的细微细节并在对话中执行任务。

Nebula 文档: https://docs.symbl.ai/docs/nebula-llm

本示例介绍如何使用 LangChain 与 [Nebula 平台](https://docs.symbl.ai/docs/nebula-llm) 进行交互。

确保您有 API 密钥。如果您没有，请 [申请一个](https://info.symbl.ai/Nebula_Private_Beta.html)。


```python
<!--IMPORTS:[{"imported": "Nebula", "source": "langchain_community.llms.symblai_nebula", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.symblai_nebula.Nebula.html", "title": "Nebula (Symbl.ai)"}]-->
from langchain_community.llms.symblai_nebula import Nebula

llm = Nebula(nebula_api_key="<your_api_key>")
```

使用对话记录和指令构建提示词。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Nebula (Symbl.ai)"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Nebula (Symbl.ai)"}]-->
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

conversation = """Sam: Good morning, team! Let's keep this standup concise. We'll go in the usual order: what you did yesterday, what you plan to do today, and any blockers. Alex, kick us off.
Alex: Morning! Yesterday, I wrapped up the UI for the user dashboard. The new charts and widgets are now responsive. I also had a sync with the design team to ensure the final touchups are in line with the brand guidelines. Today, I'll start integrating the frontend with the new API endpoints Rhea was working on. The only blocker is waiting for some final API documentation, but I guess Rhea can update on that.
Rhea: Hey, all! Yep, about the API documentation - I completed the majority of the backend work for user data retrieval yesterday. The endpoints are mostly set up, but I need to do a bit more testing today. I'll finalize the API documentation by noon, so that should unblock Alex. After that, I’ll be working on optimizing the database queries for faster data fetching. No other blockers on my end.
Sam: Great, thanks Rhea. Do reach out if you need any testing assistance or if there are any hitches with the database. Now, my update: Yesterday, I coordinated with the client to get clarity on some feature requirements. Today, I'll be updating our project roadmap and timelines based on their feedback. Additionally, I'll be sitting with the QA team in the afternoon for preliminary testing. Blocker: I might need both of you to be available for a quick call in case the client wants to discuss the changes live.
Alex: Sounds good, Sam. Just let us know a little in advance for the call.
Rhea: Agreed. We can make time for that.
Sam: Perfect! Let's keep the momentum going. Reach out if there are any sudden issues or support needed. Have a productive day!
Alex: You too.
Rhea: Thanks, bye!"""

instruction = "Identify the main objectives mentioned in this conversation."

prompt = PromptTemplate.from_template("{instruction}\n{conversation}")

llm_chain = LLMChain(prompt=prompt, llm=llm)

llm_chain.run(instruction=instruction, conversation=conversation)
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [使用指南](/docs/how_to/#llms)
