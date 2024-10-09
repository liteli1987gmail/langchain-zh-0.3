---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/upstage_groundedness_check.ipynb
sidebar_label: Upstage
---
# Upstage 真实感检查

本笔记本介绍如何开始使用 Upstage 真实感检查模型。

## 安装

安装 `langchain-upstage` 包。

```bash
pip install -U langchain-upstage
```

## 环境设置

确保设置以下环境变量：

- `UPSTAGE_API_KEY`：您的 Upstage API 密钥，来自 [Upstage 开发者文档](https://developers.upstage.ai/docs/getting-started/quick-start)。


```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## 使用方法

初始化 `UpstageGroundednessCheck` 类。


```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

使用 `run` 方法检查输入文本的基础性。


```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
