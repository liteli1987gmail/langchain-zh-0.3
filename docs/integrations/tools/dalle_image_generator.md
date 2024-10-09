---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/dalle_image_generator.ipynb
---
# Dall-E 图像生成器

>[OpenAI Dall-E](https://openai.com/dall-e-3) 是由 `OpenAI` 开发的文本到图像模型，使用深度学习方法根据自然语言描述（称为“提示词”）生成数字图像。

本笔记本展示了如何从使用 OpenAI 大型语言模型合成的提示词生成图像。图像是使用 `Dall-E` 生成的，它使用与大型语言模型相同的 OpenAI API 密钥。


```python
# Needed if you would like to display images in the notebook
%pip install --upgrade --quiet  opencv-python scikit-image langchain-community
```


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Dall-E Image Generator"}]-->
import os

from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = "<your-key-here>"
```

## 作为链运行


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Dall-E Image Generator"}, {"imported": "DallEAPIWrapper", "source": "langchain_community.utilities.dalle_image_generator", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.dalle_image_generator.DallEAPIWrapper.html", "title": "Dall-E Image Generator"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Dall-E Image Generator"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Dall-E Image Generator"}]-->
from langchain.chains import LLMChain
from langchain_community.utilities.dalle_image_generator import DallEAPIWrapper
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

llm = OpenAI(temperature=0.9)
prompt = PromptTemplate(
    input_variables=["image_desc"],
    template="Generate a detailed prompt to generate an image based on the following description: {image_desc}",
)
chain = LLMChain(llm=llm, prompt=prompt)
```


```python
image_url = DallEAPIWrapper().run(chain.run("halloween night at a haunted museum"))
```


```python
image_url
```



```output
'https://oaidalleapiprodscus.blob.core.windows.net/private/org-i0zjYONU3PemzJ222esBaAzZ/user-f6uEIOFxoiUZivy567cDSWni/img-i7Z2ZxvJ4IbbdAiO6OXJgS3v.png?st=2023-08-11T14%3A03%3A14Z&se=2023-08-11T16%3A03%3A14Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-08-10T20%3A58%3A32Z&ske=2023-08-11T20%3A58%3A32Z&sks=b&skv=2021-08-06&sig=/sECe7C0EAq37ssgBm7g7JkVIM/Q1W3xOstd0Go6slA%3D'
```



```python
# You can click on the link above to display the image
# Or you can try the options below to display the image inline in this notebook

try:
    import google.colab

    IN_COLAB = True
except ImportError:
    IN_COLAB = False

if IN_COLAB:
    from google.colab.patches import cv2_imshow  # for image display
    from skimage import io

    image = io.imread(image_url)
    cv2_imshow(image)
else:
    import cv2
    from skimage import io

    image = io.imread(image_url)
    cv2.imshow("image", image)
    cv2.waitKey(0)  # wait for a keyboard input
    cv2.destroyAllWindows()
```

## 作为带代理的工具运行


```python
<!--IMPORTS:[{"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Dall-E Image Generator"}, {"imported": "load_tools", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "Dall-E Image Generator"}]-->
from langchain.agents import initialize_agent, load_tools

tools = load_tools(["dalle-image-generator"])
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
output = agent.run("Create an image of a halloween night at a haunted museum")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m What is the best way to turn this description into an image?
Action: Dall-E Image Generator
Action Input: A spooky Halloween night at a haunted museum[0mhttps://oaidalleapiprodscus.blob.core.windows.net/private/org-rocrupyvzgcl4yf25rqq6d1v/user-WsxrbKyP2c8rfhCKWDyMfe8N/img-ogKfqxxOS5KWVSj4gYySR6FY.png?st=2023-01-31T07%3A38%3A25Z&se=2023-01-31T09%3A38%3A25Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-01-30T22%3A19%3A36Z&ske=2023-01-31T22%3A19%3A36Z&sks=b&skv=2021-08-06&sig=XsomxxBfu2CP78SzR9lrWUlbask4wBNnaMsHamy4VvU%3D

Observation: [36;1m[1;3mhttps://oaidalleapiprodscus.blob.core.windows.net/private/org-rocrupyvzgcl4yf25rqq6d1v/user-WsxrbKyP2c8rfhCKWDyMfe8N/img-ogKfqxxOS5KWVSj4gYySR6FY.png?st=2023-01-31T07%3A38%3A25Z&se=2023-01-31T09%3A38%3A25Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-01-30T22%3A19%3A36Z&ske=2023-01-31T22%3A19%3A36Z&sks=b&skv=2021-08-06&sig=XsomxxBfu2CP78SzR9lrWUlbask4wBNnaMsHamy4VvU%3D[0m
Thought:[32;1m[1;3m With the image generated, I can now make my final answer.
Final Answer: An image of a Halloween night at a haunted museum can be seen here: https://oaidalleapiprodscus.blob.core.windows.net/private/org-rocrupyvzgcl4yf25rqq6d1v/user-WsxrbKyP2c8rfhCKWDyMfe8N/img-ogKfqxxOS5KWVSj4gYySR6FY.png?st=2023-01-31T07%3A38%3A25Z&se=2023-01-31T09%3A38%3A25Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-01-30T22[0m

[1m> Finished chain.[0m
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
