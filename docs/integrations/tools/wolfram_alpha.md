---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/wolfram_alpha.ipynb
---
# Wolfram Alpha

本笔记本介绍如何使用 Wolfram Alpha 组件。

首先，您需要设置您的 Wolfram Alpha 开发者账户并获取您的 APP ID：

1. 前往 Wolfram Alpha 并在 [这里](https://developer.wolframalpha.com/) 注册开发者账户
2. 创建一个应用并获取您的 APP ID
3. pip install wolframalpha

然后我们需要设置一些环境变量：
1. 将您的 APP ID 保存到 WOLFRAM_ALPHA_APPID 环境变量中


```python
pip install wolframalpha
```


```python
import os

os.environ["WOLFRAM_ALPHA_APPID"] = ""
```


```python
<!--IMPORTS:[{"imported": "WolframAlphaAPIWrapper", "source": "langchain_community.utilities.wolfram_alpha", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wolfram_alpha.WolframAlphaAPIWrapper.html", "title": "Wolfram Alpha"}]-->
from langchain_community.utilities.wolfram_alpha import WolframAlphaAPIWrapper
```


```python
wolfram = WolframAlphaAPIWrapper()
```


```python
wolfram.run("What is 2x+5 = -3x + 7?")
```



```output
'x = 2/5'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
