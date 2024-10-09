---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/multimodal_prompts.ipynb
---
# 如何使用多模态提示

在这里我们演示如何使用提示词模板来格式化模型的多模态输入。

在这个例子中，我们将要求模型描述一张图片。


```python
import base64

import httpx

image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
image_data = base64.b64encode(httpx.get(image_url).content).decode("utf-8")
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to use multimodal prompts"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use multimodal prompts"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")
```


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "Describe the image provided"),
        (
            "user",
            [
                {
                    "type": "image_url",
                    "image_url": {"url": "data:image/jpeg;base64,{image_data}"},
                }
            ],
        ),
    ]
)
```


```python
chain = prompt | model
```


```python
response = chain.invoke({"image_data": image_data})
print(response.content)
```
```output
The image depicts a sunny day with a beautiful blue sky filled with scattered white clouds. The sky has varying shades of blue, ranging from a deeper hue near the horizon to a lighter, almost pale blue higher up. The white clouds are fluffy and scattered across the expanse of the sky, creating a peaceful and serene atmosphere. The lighting and cloud patterns suggest pleasant weather conditions, likely during the daytime hours on a mild, sunny day in an outdoor natural setting.
```
我们还可以传入多张图片。


```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "compare the two pictures provided"),
        (
            "user",
            [
                {
                    "type": "image_url",
                    "image_url": {"url": "data:image/jpeg;base64,{image_data1}"},
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "data:image/jpeg;base64,{image_data2}"},
                },
            ],
        ),
    ]
)
```


```python
chain = prompt | model
```


```python
response = chain.invoke({"image_data1": image_data, "image_data2": image_data})
print(response.content)
```
```output
The two images provided are identical. Both images feature a wooden boardwalk path extending through a lush green field under a bright blue sky with some clouds. The perspective, colors, and elements in both images are exactly the same.
```