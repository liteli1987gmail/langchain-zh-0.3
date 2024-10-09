---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/gradio_tools.ipynb
---
# Gradio

在 `Hugging Face Spaces` 上有成千上万的 `Gradio` 应用。这个库将它们放在你大型语言模型 (LLM) 的指尖 🦾

具体来说，`gradio-tools` 是一个 Python 库，用于将 `Gradio` 应用转换为可以被基于大型语言模型 (LLM) 的代理利用的工具，以完成其任务。例如，LLM 可以使用 `Gradio` 工具转录它在网上找到的语音录音，然后为你总结。或者它可以使用另一个 `Gradio` 工具对你 Google Drive 上的文档应用 OCR，然后回答有关该文档的问题。

如果你想使用一个不是预构建工具的空间，创建你自己的工具非常简单。请查看 gradio-tools 文档的这一部分，以获取如何做到这一点的信息。欢迎所有贡献！


```python
%pip install --upgrade --quiet  gradio_tools langchain-community
```

## 使用工具


```python
from gradio_tools.tools import StableDiffusionTool
```


```python
local_file_path = StableDiffusionTool().langchain.run(
    "Please create a photo of a dog riding a skateboard"
)
local_file_path
```
```output
Loaded as API: https://gradio-client-demos-stable-diffusion.hf.space ✔

Job Status: Status.STARTING eta: None
```


```output
'/Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/b61c1dd9-47e2-46f1-a47c-20d27640993d/tmp4ap48vnm.jpg'
```



```python
from PIL import Image
```


```python
im = Image.open(local_file_path)
```


```python
from IPython.display import display

display(im)
```

## 在代理中使用


```python
<!--IMPORTS:[{"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Gradio"}, {"imported": "ConversationBufferMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer.ConversationBufferMemory.html", "title": "Gradio"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Gradio"}]-->
from gradio_tools.tools import (
    ImageCaptioningTool,
    StableDiffusionPromptGeneratorTool,
    StableDiffusionTool,
    TextToVideoTool,
)
from langchain.agents import initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history")
tools = [
    StableDiffusionTool().langchain,
    ImageCaptioningTool().langchain,
    StableDiffusionPromptGeneratorTool().langchain,
    TextToVideoTool().langchain,
]


agent = initialize_agent(
    tools, llm, memory=memory, agent="conversational-react-description", verbose=True
)
output = agent.run(
    input=(
        "Please create a photo of a dog riding a skateboard "
        "but improve my prompt prior to using an image generator."
        "Please caption the generated image and create a video for it using the improved prompt."
    )
)
```
```output
Loaded as API: https://gradio-client-demos-stable-diffusion.hf.space ✔
Loaded as API: https://taesiri-blip-2.hf.space ✔
Loaded as API: https://microsoft-promptist.hf.space ✔
Loaded as API: https://damo-vilab-modelscope-text-to-video-synthesis.hf.space ✔


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Thought: Do I need to use a tool? Yes
Action: StableDiffusionPromptGenerator
Action Input: A dog riding a skateboard[0m
Job Status: Status.STARTING eta: None

Observation: [38;5;200m[1;3mA dog riding a skateboard, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: StableDiffusion
Action Input: A dog riding a skateboard, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha[0m
Job Status: Status.STARTING eta: None

Job Status: Status.PROCESSING eta: None

Observation: [36;1m[1;3m/Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/2e280ce4-4974-4420-8680-450825c31601/tmpfmiz2g1c.jpg[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: ImageCaptioner
Action Input: /Users/harrisonchase/workplace/langchain/docs/modules/agents/tools/integrations/2e280ce4-4974-4420-8680-450825c31601/tmpfmiz2g1c.jpg[0m
Job Status: Status.STARTING eta: None

Observation: [33;1m[1;3ma painting of a dog sitting on a skateboard[0m
Thought:[32;1m[1;3m Do I need to use a tool? Yes
Action: TextToVideo
Action Input: a painting of a dog sitting on a skateboard[0m
Job Status: Status.STARTING eta: None
Due to heavy traffic on this app, the prediction will take approximately 73 seconds.For faster predictions without waiting in queue, you may duplicate the space using: Client.duplicate(damo-vilab/modelscope-text-to-video-synthesis)

Job Status: Status.IN_QUEUE eta: 73.89824726581574
Due to heavy traffic on this app, the prediction will take approximately 42 seconds.For faster predictions without waiting in queue, you may duplicate the space using: Client.duplicate(damo-vilab/modelscope-text-to-video-synthesis)

Job Status: Status.IN_QUEUE eta: 42.49370198879602

Job Status: Status.IN_QUEUE eta: 21.314297944849187

Observation: [31;1m[1;3m/var/folders/bm/ylzhm36n075cslb9fvvbgq640000gn/T/tmp5snj_nmzf20_cb3m.mp4[0m
Thought:[32;1m[1;3m Do I need to use a tool? No
AI: Here is a video of a painting of a dog sitting on a skateboard.[0m

[1m> Finished chain.[0m
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
