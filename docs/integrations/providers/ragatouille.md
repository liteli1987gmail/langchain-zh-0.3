---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/providers/ragatouille.ipynb
---
# RAGatouille

>[RAGatouille](https://github.com/bclavie/RAGatouille) 使得使用 `ColBERT` 变得简单易行！[ColBERT](https://github.com/stanford-futuredata/ColBERT) 是一个快速且准确的检索模型，能够在数十毫秒内对大型文本集合进行可扩展的基于BERT的搜索。
>
>查看 [ColBERTv2: 通过轻量级晚期交互实现有效和高效的检索](https://arxiv.org/abs/2112.01488) 论文。

我们可以使用 RAGatouille 的方式有很多种。


## 设置

集成位于 `ragatouille` 包中。

```bash
pip install -U ragatouille
```


```python
from ragatouille import RAGPretrainedModel

RAG = RAGPretrainedModel.from_pretrained("colbert-ir/colbertv2.0")
```
```output
[Jan 10, 10:53:28] Loading segmented_maxsim_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
``````output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/cuda/amp/grad_scaler.py:125: UserWarning: torch.cuda.amp.GradScaler is enabled, but CUDA is not available.  Disabling.
  warnings.warn(
```
## 检索器

我们可以使用 RAGatouille 作为检索器。有关更多信息，请参见 [RAGatouille 检索器](/docs/integrations/retrievers/ragatouille)

## 文档压缩器

我们还可以将 RAGatouille 作为现成的重排序器使用。这将允许我们使用 ColBERT 对来自任何通用检索器的检索结果进行重排序。这样做的好处是我们可以在任何现有索引的基础上进行，而不需要创建新的索引。我们可以通过使用 LangChain 中的 [文档压缩器](/docs/how_to/contextual_compression) 抽象来实现这一点。

## 设置基础检索器

首先，让我们设置一个基础检索器作为示例。


```python
<!--IMPORTS:[{"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "RAGatouille"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "RAGatouille"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "RAGatouille"}]-->
import requests
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


def get_wikipedia_page(title: str):
    """
    Retrieve the full text content of a Wikipedia page.

    :param title: str - Title of the Wikipedia page.
    :return: str - Full text content of the page as raw string.
    """
    # Wikipedia API endpoint
    URL = "https://en.wikipedia.org/w/api.php"

    # Parameters for the API request
    params = {
        "action": "query",
        "format": "json",
        "titles": title,
        "prop": "extracts",
        "explaintext": True,
    }

    # Custom User-Agent header to comply with Wikipedia's best practices
    headers = {"User-Agent": "RAGatouille_tutorial/0.0.1 (ben@clavie.eu)"}

    response = requests.get(URL, params=params, headers=headers)
    data = response.json()

    # Extracting page content
    page = next(iter(data["query"]["pages"].values()))
    return page["extract"] if "extract" in page else None


text = get_wikipedia_page("Hayao_Miyazaki")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
texts = text_splitter.create_documents([text])
```


```python
retriever = FAISS.from_documents(texts, OpenAIEmbeddings()).as_retriever(
    search_kwargs={"k": 10}
)
```


```python
docs = retriever.invoke("What animation studio did Miyazaki found")
docs[0]
```



```output
Document(page_content='collaborative projects. In April 1984, Miyazaki opened his own office in Suginami Ward, naming it Nibariki.')
```


我们可以看到结果与所提问的问题并不是非常相关

## 使用 ColBERT 作为重排序器


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "RAGatouille"}]-->
from langchain.retrievers import ContextualCompressionRetriever

compression_retriever = ContextualCompressionRetriever(
    base_compressor=RAG.as_langchain_document_compressor(), base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What animation studio did Miyazaki found"
)
```
```output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
```

```python
compressed_docs[0]
```



```output
Document(page_content='In June 1985, Miyazaki, Takahata, Tokuma and Suzuki founded the animation production company Studio Ghibli, with funding from Tokuma Shoten. Studio Ghibli\'s first film, Laputa: Castle in the Sky (1986), employed the same production crew of Nausicaä. Miyazaki\'s designs for the film\'s setting were inspired by Greek architecture and "European urbanistic templates". Some of the architecture in the film was also inspired by a Welsh mining town; Miyazaki witnessed the mining strike upon his first', metadata={'relevance_score': 26.5194149017334})
```


这个答案相关性更高！
