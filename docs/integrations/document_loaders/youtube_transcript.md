---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/youtube_transcript.ipynb
---
# YouTube 转录

>[YouTube](https://www.youtube.com/) 是一个由谷歌创建的在线视频分享和社交媒体平台。

本笔记本介绍如何从 `YouTube 转录` 加载文档。


```python
<!--IMPORTS:[{"imported": "YoutubeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.youtube.YoutubeLoader.html", "title": "YouTube transcripts"}]-->
from langchain_community.document_loaders import YoutubeLoader
```


```python
%pip install --upgrade --quiet  youtube-transcript-api
```


```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=False
)
```


```python
loader.load()
```

### 添加视频信息


```python
%pip install --upgrade --quiet  pytube
```


```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### 添加语言偏好

语言参数：这是一个按优先级降序排列的语言代码列表，默认是 `en`。

翻译参数：这是一个翻译偏好，您可以将可用的转录翻译为您偏好的语言。


```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

### 以时间戳块获取转录

获取一个或多个 `Document` 对象，每个对象包含视频转录的一部分。可以指定块的长度（以秒为单位）。每个块的元数据包括视频在 YouTube 上的 URL，该 URL 将在特定块的开头开始播放视频。

`transcript_format` 参数：`langchain_community.document_loaders.youtube.TranscriptFormat` 的值之一。在这种情况下，`TranscriptFormat.CHUNKS`。

`chunk_size_seconds` 参数：表示每个转录数据块的视频秒数的整数。默认是 120 秒。


```python
<!--IMPORTS:[{"imported": "TranscriptFormat", "source": "langchain_community.document_loaders.youtube", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.youtube.TranscriptFormat.html", "title": "YouTube transcripts"}]-->
from langchain_community.document_loaders.youtube import TranscriptFormat

loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=TKCMw0utiak",
    add_video_info=True,
    transcript_format=TranscriptFormat.CHUNKS,
    chunk_size_seconds=30,
)
print("\n\n".join(map(repr, loader.load())))
```

## 来自 Google Cloud 的 YouTube 加载器

### 先决条件

1. 创建一个 Google Cloud 项目或使用现有项目
1. 启用 [Youtube Api](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520)
1. [为桌面应用授权凭据](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 导入 Google Docs 数据的说明
默认情况下，`GoogleDriveLoader` 期望 `credentials.json` 文件位于 `~/.credentials/credentials.json`，但可以使用 `credentials_file` 关键字参数进行配置。`token.json` 也是如此。请注意，`token.json` 会在您第一次使用加载器时自动创建。

`GoogleApiYoutubeLoader` 可以从 Google Docs 文档 ID 列表或文件夹 ID 加载。您可以从 URL 中获取您的文件夹和文档 ID：
请注意，根据您的设置，`service_account_path` 需要进行设置。有关更多详细信息，请参见 [这里](https://developers.google.com/drive/api/v3/quickstart/python)。


```python
<!--IMPORTS:[{"imported": "GoogleApiClient", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.youtube.GoogleApiClient.html", "title": "YouTube transcripts"}, {"imported": "GoogleApiYoutubeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.youtube.GoogleApiYoutubeLoader.html", "title": "YouTube transcripts"}]-->
# Init the GoogleApiClient
from pathlib import Path

from langchain_community.document_loaders import GoogleApiClient, GoogleApiYoutubeLoader

google_api_client = GoogleApiClient(credentials_path=Path("your_path_creds.json"))


# Use a Channel
youtube_loader_channel = GoogleApiYoutubeLoader(
    google_api_client=google_api_client,
    channel_name="Reducible",
    captions_language="en",
)

# Use Youtube Ids

youtube_loader_ids = GoogleApiYoutubeLoader(
    google_api_client=google_api_client, video_ids=["TrdevFK_am4"], add_video_info=True
)

# returns a list of Documents
youtube_loader_channel.load()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
