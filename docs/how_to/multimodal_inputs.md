---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/multimodal_inputs.ipynb
---
# 如何将多模态数据直接传递给模型

在这里，我们演示如何将多模态输入直接传递给模型。
我们目前期望所有输入都以与[OpenAI期望的格式](https://platform.openai.com/docs/guides/vision)相同的格式传递。
对于其他支持多模态输入的大模型供应商，我们在类内部添加了逻辑以转换为预期格式。

在这个例子中，我们将要求模型描述一张图片。


```python
image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
```


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "How to pass multimodal data directly to models"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to pass multimodal data directly to models"}]-->
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
```

传递图像的最常见方式是将其作为字节字符串传递。
这应该适用于大多数模型集成。


```python
import base64

import httpx

image_data = base64.b64encode(httpx.get(image_url).content).decode("utf-8")
```


```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "describe the weather in this image"},
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
        },
    ],
)
response = model.invoke([message])
print(response.content)
```
```output
The weather in the image appears to be clear and pleasant. The sky is mostly blue with scattered, light clouds, suggesting a sunny day with minimal cloud cover. There is no indication of rain or strong winds, and the overall scene looks bright and calm. The lush green grass and clear visibility further indicate good weather conditions.
```
我们可以直接在类型为 "image_url" 的内容块中传递图像 URL。请注意，只有一些大模型供应商支持此功能。


```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "describe the weather in this image"},
        {"type": "image_url", "image_url": {"url": image_url}},
    ],
)
response = model.invoke([message])
print(response.content)
```
```output
The weather in the image appears to be clear and sunny. The sky is mostly blue with a few scattered clouds, suggesting good visibility and a likely pleasant temperature. The bright sunlight is casting distinct shadows on the grass and vegetation, indicating it is likely daytime, possibly late morning or early afternoon. The overall ambiance suggests a warm and inviting day, suitable for outdoor activities.
```
我们还可以传递多个图像。


```python
message = HumanMessage(
    content=[
        {"type": "text", "text": "are these two images the same?"},
        {"type": "image_url", "image_url": {"url": image_url}},
        {"type": "image_url", "image_url": {"url": image_url}},
    ],
)
response = model.invoke([message])
print(response.content)
```
```output
Yes, the two images are the same. They both depict a wooden boardwalk extending through a grassy field under a blue sky with light clouds. The scenery, lighting, and composition are identical.
```
## 工具调用

一些多模态模型也支持 [工具调用](/docs/concepts/#functiontool-calling) 功能。要使用此类模型调用工具，只需以 [通常的方式](/docs/how_to/tool_calling) 将工具绑定到它们，并使用所需类型的内容块（例如，包含图像数据）调用模型。


```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://python.langchain.com/api_reference/core/tools/langchain_core.tools.convert.tool.html", "title": "How to pass multimodal data directly to models"}]-->
from typing import Literal

from langchain_core.tools import tool


@tool
def weather_tool(weather: Literal["sunny", "cloudy", "rainy"]) -> None:
    """Describe the weather"""
    pass


model_with_tools = model.bind_tools([weather_tool])

message = HumanMessage(
    content=[
        {"type": "text", "text": "describe the weather in this image"},
        {"type": "image_url", "image_url": {"url": image_url}},
    ],
)
response = model_with_tools.invoke([message])
print(response.tool_calls)
```
```output
[{'name': 'weather_tool', 'args': {'weather': 'sunny'}, 'id': 'call_BSX4oq4SKnLlp2WlzDhToHBr'}]
```