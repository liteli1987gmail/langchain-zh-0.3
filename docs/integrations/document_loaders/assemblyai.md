---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/assemblyai.ipynb
---
# AssemblyAI 音频转录

`AssemblyAIAudioTranscriptLoader` 允许使用 [AssemblyAI API](https://www.assemblyai.com) 转录音频文件，并将转录的文本加载到文档中。

要使用它，您需要安装 `assemblyai` python 包，并设置环境变量 `ASSEMBLYAI_API_KEY`，其中包含您的 API 密钥。或者，API 密钥也可以作为参数传递。
有关 AssemblyAI 的更多信息：

- [网站](https://www.assemblyai.com/)

- [获取免费 API 密钥](https://www.assemblyai.com/dashboard/signup)
- [AssemblyAI API 文档](https://www.assemblyai.com/docs)
- [AssemblyAI API 文档](https://www.assemblyai.com/docs)

## 安装

首先，您需要安装 `assemblyai` python 包。

您可以在[assemblyai-python-sdk GitHub 仓库](https://github.com/AssemblyAI/assemblyai-python-sdk)中找到更多信息。


```python
%pip install --upgrade --quiet  assemblyai
```

## 示例

`AssemblyAIAudioTranscriptLoader` 至少需要 `file_path` 参数。音频文件可以指定为 URL 或本地文件路径。


```python
<!--IMPORTS:[{"imported": "AssemblyAIAudioTranscriptLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.assemblyai.AssemblyAIAudioTranscriptLoader.html", "title": "AssemblyAI Audio Transcripts"}]-->
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

注意：调用 `loader.load()` 会阻塞，直到转录完成。

转录的文本在 `page_content` 中可用：


```python
docs[0].page_content
```

```
"Load time, a new president and new congressional makeup. Same old ..."
```

`metadata` 包含完整的 JSON 响应以及更多元信息：


```python
docs[0].metadata
```

```
{'language_code': <LanguageCode.en_us: 'en_us'>,
 'audio_url': 'https://storage.googleapis.com/aai-docs-samples/nbc.mp3',
 'punctuate': True,
 'format_text': True,
  ...
}
```

## 转录格式

您可以为不同格式指定 `transcript_format` 参数。

根据格式，返回一个或多个文档。这些是不同的 `TranscriptFormat` 选项：

- `TEXT`：一个包含转录文本的文档
- `SENTENCES`: 多个文档，按每个句子分割转录
- `PARAGRAPHS`: 多个文档，按每个段落分割转录
- `SUBTITLES_SRT`: 一个文档，转录以SRT字幕格式导出
- `SUBTITLES_VTT`: 一个文档，转录以VTT字幕格式导出


```python
<!--IMPORTS:[{"imported": "TranscriptFormat", "source": "langchain_community.document_loaders.assemblyai", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.assemblyai.TranscriptFormat.html", "title": "AssemblyAI Audio Transcripts"}]-->
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## 转录配置

您还可以指定`config`参数以使用不同的音频智能模型。

访问[AssemblyAI API文档](https://www.assemblyai.com/docs)以获取所有可用模型的概述！


```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## 将API密钥作为参数传递

除了将API密钥设置为环境变量`ASSEMBLYAI_API_KEY`，还可以将其作为参数传递。


```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
