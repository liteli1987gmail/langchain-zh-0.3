---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat/llama_api.ipynb
sidebar_label: Llama API
---
# ChatLlamaAPI

本笔记本展示了如何使用LangChain与[LlamaAPI](https://llama-api.com/) - 一个托管版本的Llama2，增加了对函数调用的支持。

%pip install --upgrade --quiet  llamaapi


```python
from llamaapi import LlamaAPI

# Replace 'Your_API_Token' with your actual API token
llama = LlamaAPI("Your_API_Token")
```


```python
<!--IMPORTS:[{"imported": "ChatLlamaAPI", "source": "langchain_experimental.llms", "docs": "https://python.langchain.com/api_reference/experimental/llms/langchain_experimental.llms.llamaapi.ChatLlamaAPI.html", "title": "ChatLlamaAPI"}]-->
from langchain_experimental.llms import ChatLlamaAPI
```
```output
/Users/harrisonchase/.pyenv/versions/3.9.1/envs/langchain/lib/python3.9/site-packages/deeplake/util/check_latest_version.py:32: UserWarning: A newer version of deeplake (3.6.12) is available. It's recommended that you update to the latest version using `pip install -U deeplake`.
  warnings.warn(
```

```python
model = ChatLlamaAPI(client=llama)
```


```python
<!--IMPORTS:[{"imported": "create_tagging_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.openai_functions.tagging.create_tagging_chain.html", "title": "ChatLlamaAPI"}]-->
from langchain.chains import create_tagging_chain

schema = {
    "properties": {
        "sentiment": {
            "type": "string",
            "description": "the sentiment encountered in the passage",
        },
        "aggressiveness": {
            "type": "integer",
            "description": "a 0-10 score of how aggressive the passage is",
        },
        "language": {"type": "string", "description": "the language of the passage"},
    }
}

chain = create_tagging_chain(schema, model)
```


```python
chain.run("give me your money")
```



```output
{'sentiment': 'aggressive', 'aggressiveness': 8, 'language': 'english'}
```



## 相关

- 聊天模型 [概念指南](/docs/concepts/#chat-models)
- 聊天模型 [使用指南](/docs/how_to/#chat-models)
