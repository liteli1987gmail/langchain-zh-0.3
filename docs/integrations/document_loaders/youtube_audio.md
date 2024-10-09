---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/youtube_audio.ipynb
---
# YouTube 音频

在 YouTube 视频上构建聊天或问答应用程序是一个备受关注的话题。

下面我们展示如何轻松地从 `YouTube url` 转换为 `视频音频` 再到 `文本` 再到 `聊天`！

我们将使用 `OpenAIWhisperParser`，它将使用 OpenAI Whisper API 将音频转录为文本，
以及 `OpenAIWhisperParserLocal` 以支持本地运行和在私有云或本地环境中运行。

注意：您需要提供一个 `OPENAI_API_KEY`。


```python
<!--IMPORTS:[{"imported": "YoutubeAudioLoader", "source": "langchain_community.document_loaders.blob_loaders.youtube_audio", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.blob_loaders.youtube_audio.YoutubeAudioLoader.html", "title": "YouTube audio"}, {"imported": "GenericLoader", "source": "langchain_community.document_loaders.generic", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.generic.GenericLoader.html", "title": "YouTube audio"}, {"imported": "OpenAIWhisperParser", "source": "langchain_community.document_loaders.parsers", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.parsers.audio.OpenAIWhisperParser.html", "title": "YouTube audio"}]-->
from langchain_community.document_loaders.blob_loaders.youtube_audio import (
    YoutubeAudioLoader,
)
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import (
    OpenAIWhisperParser,
    OpenAIWhisperParserLocal,
)
```

我们将使用 `yt_dlp` 下载 YouTube URL 的音频。

我们将使用 `pydub` 来分割下载的音频文件（以遵守 Whisper API 的 25MB 文件大小限制）。


```python
%pip install --upgrade --quiet  yt_dlp
%pip install --upgrade --quiet  pydub
%pip install --upgrade --quiet  librosa
```

### YouTube URL 转文本

使用 `YoutubeAudioLoader` 来获取/下载音频文件。

然后，使用 `OpenAIWhisperParser()` 将它们转录为文本。

让我们以 Andrej Karpathy 的 YouTube 课程的第一讲为例！


```python
# set a flag to switch between local and remote parsing
# change this to True if you want to use local parsing
local = False
```


```python
# Two Karpathy lecture videos
urls = ["https://youtu.be/kCc8FmEb1nY", "https://youtu.be/VMj-3S1tku0"]

# Directory to save audio files
save_dir = "~/Downloads/YouTube"

# Transcribe the videos to text
if local:
    loader = GenericLoader(
        YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParserLocal()
    )
else:
    loader = GenericLoader(YoutubeAudioLoader(urls, save_dir), OpenAIWhisperParser())
docs = loader.load()
```
```output
[youtube] Extracting URL: https://youtu.be/kCc8FmEb1nY
[youtube] kCc8FmEb1nY: Downloading webpage
[youtube] kCc8FmEb1nY: Downloading android player API JSON
[info] kCc8FmEb1nY: Downloading 1 format(s): 140
[dashsegments] Total fragments: 11
[download] Destination: /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a
[download] 100% of  107.73MiB in 00:00:18 at 5.92MiB/s                   
[FixupM4a] Correcting container of "/Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a"
[ExtractAudio] Not converting audio /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/Let's build GPT： from scratch, in code, spelled out..m4a; file is already in target format m4a
[youtube] Extracting URL: https://youtu.be/VMj-3S1tku0
[youtube] VMj-3S1tku0: Downloading webpage
[youtube] VMj-3S1tku0: Downloading android player API JSON
[info] VMj-3S1tku0: Downloading 1 format(s): 140
[download] /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/The spelled-out intro to neural networks and backpropagation： building micrograd.m4a has already been downloaded
[download] 100% of  134.98MiB
[ExtractAudio] Not converting audio /Users/31treehaus/Desktop/AI/langchain-fork/docs/modules/indexes/document_loaders/examples/The spelled-out intro to neural networks and backpropagation： building micrograd.m4a; file is already in target format m4a
```

```python
# Returns a list of Documents, which can be easily viewed or parsed
docs[0].page_content[0:500]
```



```output
"Hello, my name is Andrej and I've been training deep neural networks for a bit more than a decade. And in this lecture I'd like to show you what neural network training looks like under the hood. So in particular we are going to start with a blank Jupyter notebook and by the end of this lecture we will define and train a neural net and you'll get to see everything that goes on under the hood and exactly sort of how that works on an intuitive level. Now specifically what I would like to do is I w"
```


### 从 YouTube 视频构建聊天应用

给定 `Documents`，我们可以轻松启用聊天/问答功能。


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "YouTube audio"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "YouTube audio"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "YouTube audio"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "YouTube audio"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "YouTube audio"}]-->
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```


```python
# Combine doc
combined_docs = [doc.page_content for doc in docs]
text = " ".join(combined_docs)
```


```python
# Split them
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=150)
splits = text_splitter.split_text(text)
```


```python
# Build an index
embeddings = OpenAIEmbeddings()
vectordb = FAISS.from_texts(splits, embeddings)
```


```python
# Build a QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-3.5-turbo", temperature=0),
    chain_type="stuff",
    retriever=vectordb.as_retriever(),
)
```


```python
# Ask a question!
query = "Why do we need to zero out the gradient before backprop at each step?"
qa_chain.run(query)
```



```output
"We need to zero out the gradient before backprop at each step because the backward pass accumulates gradients in the grad attribute of each parameter. If we don't reset the grad to zero before each backward pass, the gradients will accumulate and add up, leading to incorrect updates and slower convergence. By resetting the grad to zero before each backward pass, we ensure that the gradients are calculated correctly and that the optimization process works as intended."
```



```python
query = "What is the difference between an encoder and decoder?"
qa_chain.run(query)
```



```output
'In the context of transformers, an encoder is a component that reads in a sequence of input tokens and generates a sequence of hidden representations. On the other hand, a decoder is a component that takes in a sequence of hidden representations and generates a sequence of output tokens. The main difference between the two is that the encoder is used to encode the input sequence into a fixed-length representation, while the decoder is used to decode the fixed-length representation into an output sequence. In machine translation, for example, the encoder reads in the source language sentence and generates a fixed-length representation, which is then used by the decoder to generate the target language sentence.'
```



```python
query = "For any token, what are x, k, v, and q?"
qa_chain.run(query)
```



```output
'For any token, x is the input vector that contains the private information of that token, k and q are the key and query vectors respectively, which are produced by forwarding linear modules on x, and v is the vector that is calculated by propagating the same linear module on x again. The key vector represents what the token contains, and the query vector represents what the token is looking for. The vector v is the information that the token will communicate to other tokens if it finds them interesting, and it gets aggregated for the purposes of the self-attention mechanism.'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
