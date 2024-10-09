---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/google_cloud_texttospeech.ipynb
---
# 谷歌云文本转语音

>[谷歌云文本转语音](https://cloud.google.com/text-to-speech) 使开发者能够合成自然听起来的语音，提供100多种声音，支持多种语言和变体。它应用了DeepMind在WaveNet方面的突破性研究和谷歌强大的神经网络，以提供最高的音质。
>
>它支持多种语言，包括英语、德语、波兰语、西班牙语、意大利语、法语、葡萄牙语和印地语。

本笔记本展示了如何与 `谷歌云文本转语音API` 进行交互，以实现语音合成功能。

首先，您需要设置一个谷歌云项目。您可以按照[这里](https://cloud.google.com/text-to-speech/docs/before-you-begin)的说明进行操作。


```python
!pip install --upgrade langchain-google-community[texttospeech]
```

## 实例化


```python
from langchain_google_community import TextToSpeechTool
```

## 已弃用的 GoogleCloudTextToSpeechTool


```python
<!--IMPORTS:[{"imported": "GoogleCloudTextToSpeechTool", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.google_cloud.texttospeech.GoogleCloudTextToSpeechTool.html", "title": "Google Cloud Text-to-Speech"}]-->
from langchain_community.tools import GoogleCloudTextToSpeechTool
```


```python
text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

我们可以生成音频，将其保存到临时文件中，然后播放。


```python
speech_file = tts.run(text_to_speak)
```


## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [操作指南](/docs/how_to/#tools)
