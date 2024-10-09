---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/huggingface_tools.ipynb
---
# HuggingFace Hub 工具

>[Huggingface 工具](https://huggingface.co/docs/transformers/v4.29.0/en/custom_tools) 支持文本输入/输出，可以直接使用 `load_huggingface_tool` 函数加载。
可以直接使用 `load_huggingface_tool` 函数加载。


```python
# Requires transformers>=4.29.0 and huggingface_hub>=0.14.1
%pip install --upgrade --quiet  transformers huggingface_hub > /dev/null
```


```python
%pip install --upgrade --quiet  langchain-community
```


```python
<!--IMPORTS:[{"imported": "load_huggingface_tool", "source": "langchain_community.agent_toolkits.load_tools", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_huggingface_tool.html", "title": "HuggingFace Hub Tools"}]-->
from langchain_community.agent_toolkits.load_tools import load_huggingface_tool

tool = load_huggingface_tool("lysandre/hf-model-downloads")

print(f"{tool.name}: {tool.description}")
```
```output
model_download_counter: This is a tool that returns the most downloaded model of a given task on the Hugging Face Hub. It takes the name of the category (such as text-classification, depth-estimation, etc), and returns the name of the checkpoint
```

```python
tool.run("text-classification")
```



```output
'facebook/bart-large-mnli'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
