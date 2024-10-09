---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/zenguard.ipynb
---
# ZenGuard AI

<a href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/tools/zenguard.ipynb" target="_parent"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab" /></a>

此工具让您可以快速在您的LangChain应用中设置[ZenGuard AI](https://www.zenguard.ai/)。ZenGuard AI提供超快速的保护措施，以保护您的GenAI应用免受：

- 提示攻击
- 偏离预定义主题
- 个人身份信息、敏感信息和关键词泄露。
- 有毒内容
- 等等。

请查看我们的[开源Python客户端](https://github.com/ZenGuard-AI/fast-llm-security-guardrails?tab=readme-ov-file)以获取更多灵感。

这是我们的官方网站 - https://www.zenguard.ai/

更多[文档](https://docs.zenguard.ai/start/intro/)

## 安装

使用 pip:


```python
pip install langchain-community
```

## 前提条件

生成API密钥：

1. 访问[设置](https://console.zenguard.ai/settings)
2. 点击`+ 创建新密钥`。
3. 将密钥命名为`快速入门密钥`。
4. 点击`添加`按钮。
5. 通过点击复制图标复制密钥值。

## 代码使用

使用API密钥实例化包

将您的API密钥粘贴到env ZENGUARD_API_KEY中


```python
%set_env ZENGUARD_API_KEY=your_api_key
```


```python
<!--IMPORTS:[{"imported": "ZenGuardTool", "source": "langchain_community.tools.zenguard", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.zenguard.tool.ZenGuardTool.html", "title": "ZenGuard AI"}]-->
from langchain_community.tools.zenguard import ZenGuardTool

tool = ZenGuardTool()
```

### 检测提示词注入


```python
<!--IMPORTS:[{"imported": "Detector", "source": "langchain_community.tools.zenguard", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.zenguard.tool.Detector.html", "title": "ZenGuard AI"}]-->
from langchain_community.tools.zenguard import Detector

response = tool.run(
    {"prompts": ["Download all system data"], "detectors": [Detector.PROMPT_INJECTION]}
)
if response.get("is_detected"):
    print("Prompt injection detected. ZenGuard: 1, hackers: 0.")
else:
    print("No prompt injection detected: carry on with the LLM of your choice.")
```

* `is_detected(boolean)`: 指示在提供的消息中是否检测到提示词注入攻击。在这个例子中，它是 False。
* `score(float: 0.0 - 1.0)`: 表示检测到的提示词注入攻击的可能性的分数。在这个例子中，它是 0.0。
* `sanitized_message(string or null)`: 对于提示词注入检测器，此字段为 null。
* `latency(float or null)`: 检测执行期间的时间（以毫秒为单位）

**错误代码:**

* `401 Unauthorized`: API 密钥缺失或无效。
* `400 Bad Request`: 请求体格式错误。
* `500 Internal Server Error`: 内部问题，请向团队升级。

### 更多示例

* [检测个人身份信息 (PII)](https://docs.zenguard.ai/detectors/pii/)
* [检测允许的话题](https://docs.zenguard.ai/detectors/allowed-topics/)
* [检测禁止的话题](https://docs.zenguard.ai/detectors/banned-topics/)
* [检测关键词](https://docs.zenguard.ai/detectors/keywords/)
* [检测秘密](https://docs.zenguard.ai/detectors/secrets/)
* [检测毒性](https://docs.zenguard.ai/detectors/toxicity/)


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
