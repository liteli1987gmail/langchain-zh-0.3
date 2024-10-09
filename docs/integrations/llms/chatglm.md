---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/chatglm.ipynb
---
# ChatGLM

[ChatGLM-6B](https://github.com/THUDM/ChatGLM-6B) 是一个基于通用语言模型 (GLM) 框架的开放双语语言模型，拥有62亿个参数。通过量化技术，用户可以在消费级显卡上本地部署（在INT4量化级别下仅需6GB的GPU内存）。

[ChatGLM2-6B](https://github.com/THUDM/ChatGLM2-6B) 是开源双语（中英文）聊天模型ChatGLM-6B的第二代版本。它保留了第一代模型的流畅对话流程和低部署门槛，同时引入了更好的性能、更长的上下文和更高效的推理等新特性。

[ChatGLM3](https://github.com/THUDM/ChatGLM3) 是由智谱AI和清华大学KEG联合发布的新一代预训练对话模型。ChatGLM3-6B是ChatGLM3系列中的开源模型。


```python
# Install required dependencies

%pip install -qU langchain langchain-community
```

## ChatGLM3

本示例介绍如何使用LangChain与ChatGLM3-6B推理进行文本补全。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "ChatGLM"}, {"imported": "ChatGLM3", "source": "langchain_community.llms.chatglm3", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.chatglm3.ChatGLM3.html", "title": "ChatGLM"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.ai.AIMessage.html", "title": "ChatGLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "ChatGLM"}]-->
from langchain.chains import LLMChain
from langchain_community.llms.chatglm3 import ChatGLM3
from langchain_core.messages import AIMessage
from langchain_core.prompts import PromptTemplate
```


```python
template = """{question}"""
prompt = PromptTemplate.from_template(template)
```


```python
endpoint_url = "http://127.0.0.1:8000/v1/chat/completions"

messages = [
    AIMessage(content="我将从美国到中国来旅游，出行前希望了解中国的城市"),
    AIMessage(content="欢迎问我任何问题。"),
]

llm = ChatGLM3(
    endpoint_url=endpoint_url,
    max_tokens=80000,
    prefix_messages=messages,
    top_p=0.9,
)
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
question = "北京和上海两座城市有什么不同？"

llm_chain.run(question)
```



```output
'北京和上海是中国两个不同的城市,它们在很多方面都有所不同。\n\n北京是中国的首都,也是历史悠久的城市之一。它有着丰富的历史文化遗产,如故宫、颐和园等,这些景点吸引着众多游客前来观光。北京也是一个政治、文化和教育中心,有很多政府机构和学术机构总部设在北京。\n\n上海则是一个现代化的城市,它是中国的经济中心之一。上海拥有许多高楼大厦和国际化的金融机构,是中国最国际化的城市之一。上海也是一个美食和购物天堂,有许多著名的餐厅和购物中心。\n\n北京和上海的气候也不同。北京属于温带大陆性气候,冬季寒冷干燥,夏季炎热多风;而上海属于亚热带季风气候,四季分明,春秋宜人。\n\n北京和上海有很多不同之处,但都是中国非常重要的城市,每个城市都有自己独特的魅力和特色。'
```


## ChatGLM和ChatGLM2

以下示例展示如何使用LangChain与ChatGLM2-6B推理进行文本补全。
ChatGLM-6B和ChatGLM2-6B具有相同的API规格，因此此示例应适用于两者。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "ChatGLM"}, {"imported": "ChatGLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.chatglm.ChatGLM.html", "title": "ChatGLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "ChatGLM"}]-->
from langchain.chains import LLMChain
from langchain_community.llms import ChatGLM
from langchain_core.prompts import PromptTemplate

# import os
```


```python
template = """{question}"""
prompt = PromptTemplate.from_template(template)
```


```python
# default endpoint_url for a local deployed ChatGLM api server
endpoint_url = "http://127.0.0.1:8000"

# direct access endpoint in a proxied environment
# os.environ['NO_PROXY'] = '127.0.0.1'

llm = ChatGLM(
    endpoint_url=endpoint_url,
    max_token=80000,
    history=[
        ["我将从美国到中国来旅游，出行前希望了解中国的城市", "欢迎问我任何问题。"]
    ],
    top_p=0.9,
    model_kwargs={"sample_model_args": False},
)

# turn on with_history only when you want the LLM object to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.with_history = True
```


```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```


```python
question = "北京和上海两座城市有什么不同？"

llm_chain.run(question)
```
```output
ChatGLM payload: {'prompt': '北京和上海两座城市有什么不同？', 'temperature': 0.1, 'history': [['我将从美国到中国来旅游，出行前希望了解中国的城市', '欢迎问我任何问题。']], 'max_length': 80000, 'top_p': 0.9, 'sample_model_args': False}
```


```output
'北京和上海是中国的两个首都，它们在许多方面都有所不同。\n\n北京是中国的政治和文化中心，拥有悠久的历史和灿烂的文化。它是中国最重要的古都之一，也是中国历史上最后一个封建王朝的都城。北京有许多著名的古迹和景点，例如紫禁城、天安门广场和长城等。\n\n上海是中国最现代化的城市之一，也是中国商业和金融中心。上海拥有许多国际知名的企业和金融机构，同时也有许多著名的景点和美食。上海的外滩是一个历史悠久的商业区，拥有许多欧式建筑和餐馆。\n\n除此之外，北京和上海在交通和人口方面也有很大差异。北京是中国的首都，人口众多，交通拥堵问题较为严重。而上海是中国的商业和金融中心，人口密度较低，交通相对较为便利。\n\n总的来说，北京和上海是两个拥有独特魅力和特点的城市，可以根据自己的兴趣和时间来选择前往其中一座城市旅游。'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
