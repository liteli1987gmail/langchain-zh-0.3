---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/nasa.ipynb
---
# NASA 工具包

本笔记本展示了如何使用代理与 NASA 工具包进行交互。该工具包提供对 NASA 图像和视频库 API 的访问，未来版本有可能扩展并包含其他可访问的 NASA API。

**注意：当未指定所需媒体结果的数量时，NASA 图像和视频库的搜索查询可能会导致大量响应。在使用代理与大型语言模型 (LLM) 代币时，请考虑这一点。**

## 示例用法：
---
### Initializing the agent


```python
%pip install -qU langchain-community
```


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "NASA Toolkit"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "NASA Toolkit"}, {"imported": "NasaToolkit", "source": "langchain_community.agent_toolkits.nasa.toolkit", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.nasa.toolkit.NasaToolkit.html", "title": "NASA Toolkit"}, {"imported": "NasaAPIWrapper", "source": "langchain_community.utilities.nasa", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.nasa.NasaAPIWrapper.html", "title": "NASA Toolkit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "NASA Toolkit"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.nasa.toolkit import NasaToolkit
from langchain_community.utilities.nasa import NasaAPIWrapper
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, openai_api_key="")
nasa = NasaAPIWrapper()
toolkit = NasaToolkit.from_nasa_api_wrapper(nasa)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

### Querying media assets


```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### Querying details about media assets


```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```


## Related

- Tool [conceptual guide](/docs/concepts/#tools)
- Tool [how-to guides](/docs/how_to/#tools)
