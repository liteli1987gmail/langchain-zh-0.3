---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/image_captions.ipynb
---
# 图像标题

默认情况下，加载器使用预训练的 [Salesforce BLIP 图像标题生成模型](https://huggingface.co/Salesforce/blip-image-captioning-base)。

本笔记本展示了如何使用 `ImageCaptionLoader` 生成可查询的图像标题索引。


```python
%pip install -qU transformers langchain_openai langchain_chroma

import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

### 准备一份来自维基媒体的图片网址列表


```python
<!--IMPORTS:[{"imported": "ImageCaptionLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.image_captions.ImageCaptionLoader.html", "title": "Image captions"}]-->
from langchain_community.document_loaders import ImageCaptionLoader

list_image_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Ara_ararauna_Luc_Viatour.jpg/1554px-Ara_ararauna_Luc_Viatour.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/1928_Model_A_Ford.jpg/640px-1928_Model_A_Ford.jpg",
]
```

### 创建加载器


```python
loader = ImageCaptionLoader(images=list_image_urls)
list_docs = loader.load()
list_docs
```



```output
[Document(metadata={'image_path': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Ara_ararauna_Luc_Viatour.jpg/1554px-Ara_ararauna_Luc_Viatour.jpg'}, page_content='an image of a bird flying in the air [SEP]'),
 Document(metadata={'image_path': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/1928_Model_A_Ford.jpg/640px-1928_Model_A_Ford.jpg'}, page_content='an image of a vintage car parked on the street [SEP]')]
```



```python
import requests
from PIL import Image

Image.open(requests.get(list_image_urls[0], stream=True).raw).convert("RGB")
```





### 创建索引


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Image captions"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Image captions"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Image captions"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(list_docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever(k=2)
```

### 查询


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "Image captions"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "Image captions"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Image captions"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Image captions"}]-->
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o", temperature=0)

system_prompt = (
    "You are an assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)


question_answer_chain = create_stuff_documents_chain(model, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

response = rag_chain.invoke({"input": "What animals are in the images?"})

print(response["answer"])
```
```output
The images include a bird.
```

```python
response = rag_chain.invoke({"input": "What kind of images are there?"})

print(response["answer"])
```
```output
There are images of a bird flying in the air and a vintage car parked on the street.
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)