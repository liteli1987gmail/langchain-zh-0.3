---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/ragatouille.ipynb
---
# RAGatouille


>[RAGatouille](https://github.com/bclavie/RAGatouille) 使得使用 `ColBERT` 变得简单至极！
>
>[ColBERT](https://github.com/stanford-futuredata/ColBERT) 是一个快速且准确的检索模型，能够在数十毫秒内对大型文本集合进行可扩展的基于BERT的搜索。
>
>请参阅 [ColBERTv2: 通过轻量级晚期交互实现有效和高效的检索](https://arxiv.org/abs/2112.01488) 论文。

我们可以将其用作 [检索器](/docs/how_to#retrievers)。它将显示与此集成相关的功能。完成后，探索 [相关用例页面](/docs/how_to#qa-with-rag) 可能会很有用，以了解如何将此向量存储用作更大链的一部分。

本页面介绍如何在 LangChain 链中使用 [RAGatouille](https://github.com/bclavie/RAGatouille) 作为检索器。

## 设置

集成位于 `ragatouille` 包中。

```bash
pip install -U ragatouille
```

## 使用

这个例子取自他们的文档


```python
from ragatouille import RAGPretrainedModel

RAG = RAGPretrainedModel.from_pretrained("colbert-ir/colbertv2.0")
```


```python
import requests


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
```


```python
full_document = get_wikipedia_page("Hayao_Miyazaki")
```


```python
RAG.index(
    collection=[full_document],
    index_name="Miyazaki-123",
    max_document_length=180,
    split_documents=True,
)
```
```output


[Jan 07, 10:38:18] #> Creating directory .ragatouille/colbert/indexes/Miyazaki-123 


#> Starting...
[Jan 07, 10:38:23] Loading segmented_maxsim_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
``````output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/cuda/amp/grad_scaler.py:125: UserWarning: torch.cuda.amp.GradScaler is enabled, but CUDA is not available.  Disabling.
  warnings.warn(

  0%|          | 0/2 [00:00<?, ?it/s]/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
``````output
[Jan 07, 10:38:24] [0] 		 #> Encoding 81 passages..
``````output
 50%|█████     | 1/2 [00:02<00:02,  2.85s/it]/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
100%|██████████| 2/2 [00:03<00:00,  1.74s/it]
WARNING clustering 10001 points to 1024 centroids: please provide at least 39936 training points
``````output
[Jan 07, 10:38:27] [0] 		 avg_doclen_est = 129.9629669189453 	 len(local_sample) = 81
[Jan 07, 10:38:27] [0] 		 Creating 1,024 partitions.
[Jan 07, 10:38:27] [0] 		 *Estimated* 10,527 embeddings.
[Jan 07, 10:38:27] [0] 		 #> Saving the indexing plan to .ragatouille/colbert/indexes/Miyazaki-123/plan.json ..
Clustering 10001 points in 128D to 1024 clusters, redo 1 times, 20 iterations
  Preprocessing in 0.00 s
  Iteration 0 (0.02 s, search 0.02 s): objective=3772.41 imbalance=1.562 nsplit=0       
  Iteration 1 (0.02 s, search 0.02 s): objective=2408.99 imbalance=1.470 nsplit=1       
  Iteration 2 (0.03 s, search 0.03 s): objective=2243.87 imbalance=1.450 nsplit=0       
  Iteration 3 (0.04 s, search 0.04 s): objective=2168.48 imbalance=1.444 nsplit=0       
  Iteration 4 (0.05 s, search 0.05 s): objective=2134.26 imbalance=1.449 nsplit=0       
  Iteration 5 (0.06 s, search 0.05 s): objective=2117.18 imbalance=1.449 nsplit=0       
  Iteration 6 (0.06 s, search 0.06 s): objective=2108.43 imbalance=1.449 nsplit=0       
  Iteration 7 (0.07 s, search 0.07 s): objective=2102.62 imbalance=1.450 nsplit=0       
  Iteration 8 (0.08 s, search 0.08 s): objective=2100.68 imbalance=1.451 nsplit=0       
  Iteration 9 (0.09 s, search 0.08 s): objective=2099.66 imbalance=1.451 nsplit=0       
  Iteration 10 (0.10 s, search 0.09 s): objective=2099.03 imbalance=1.451 nsplit=0       
  Iteration 11 (0.10 s, search 0.10 s): objective=2098.67 imbalance=1.453 nsplit=0       
  Iteration 12 (0.11 s, search 0.11 s): objective=2097.78 imbalance=1.455 nsplit=0       
  Iteration 13 (0.12 s, search 0.12 s): objective=2097.31 imbalance=1.455 nsplit=0       
  Iteration 14 (0.13 s, search 0.12 s): objective=2097.13 imbalance=1.455 nsplit=0       
  Iteration 15 (0.14 s, search 0.13 s): objective=2097.09 imbalance=1.455 nsplit=0       
  Iteration 16 (0.14 s, search 0.14 s): objective=2097.09 imbalance=1.455 nsplit=0       
  Iteration 17 (0.15 s, search 0.15 s): objective=2097.09 imbalance=1.455 nsplit=0       
  Iteration 18 (0.16 s, search 0.15 s): objective=2097.09 imbalance=1.455 nsplit=0       
  Iteration 19 (0.17 s, search 0.16 s): objective=2097.09 imbalance=1.455 nsplit=0       
[0.037, 0.038, 0.041, 0.036, 0.035, 0.036, 0.034, 0.036, 0.034, 0.034, 0.036, 0.037, 0.032, 0.039, 0.035, 0.039, 0.033, 0.035, 0.035, 0.037, 0.037, 0.037, 0.037, 0.037, 0.038, 0.034, 0.037, 0.035, 0.036, 0.037, 0.036, 0.04, 0.037, 0.037, 0.036, 0.034, 0.037, 0.035, 0.038, 0.039, 0.037, 0.039, 0.035, 0.036, 0.036, 0.035, 0.035, 0.038, 0.037, 0.033, 0.036, 0.032, 0.034, 0.035, 0.037, 0.037, 0.041, 0.037, 0.039, 0.033, 0.035, 0.033, 0.036, 0.036, 0.038, 0.036, 0.037, 0.038, 0.035, 0.035, 0.033, 0.034, 0.032, 0.038, 0.037, 0.037, 0.036, 0.04, 0.033, 0.037, 0.035, 0.04, 0.036, 0.04, 0.032, 0.037, 0.036, 0.037, 0.034, 0.042, 0.037, 0.035, 0.035, 0.038, 0.034, 0.036, 0.041, 0.035, 0.036, 0.037, 0.041, 0.04, 0.036, 0.036, 0.035, 0.036, 0.034, 0.033, 0.036, 0.033, 0.037, 0.038, 0.036, 0.033, 0.038, 0.037, 0.038, 0.037, 0.039, 0.04, 0.034, 0.034, 0.036, 0.039, 0.033, 0.037, 0.035, 0.037]
[Jan 07, 10:38:27] [0] 		 #> Encoding 81 passages..
``````output
0it [00:00, ?it/s]
  0%|          | 0/2 [00:00<?, ?it/s][A
 50%|█████     | 1/2 [00:02<00:02,  2.53s/it][A
100%|██████████| 2/2 [00:03<00:00,  1.56s/it][A
1it [00:03,  3.16s/it]
100%|██████████| 1/1 [00:00<00:00, 4017.53it/s]
100%|██████████| 1024/1024 [00:00<00:00, 306105.57it/s]
``````output
[Jan 07, 10:38:30] #> Optimizing IVF to store map from centroids to list of pids..
[Jan 07, 10:38:30] #> Building the emb2pid mapping..
[Jan 07, 10:38:30] len(emb2pid) = 10527
[Jan 07, 10:38:30] #> Saved optimized IVF to .ragatouille/colbert/indexes/Miyazaki-123/ivf.pid.pt

#> Joined...
Done indexing!
```

```python
results = RAG.search(query="What animation studio did Miyazaki found?", k=3)
```
```output
Loading searcher for index Miyazaki-123 for the first time... This may take a few seconds
[Jan 07, 10:38:34] Loading segmented_maxsim_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
[Jan 07, 10:38:35] #> Loading codec...
[Jan 07, 10:38:35] #> Loading IVF...
[Jan 07, 10:38:35] Loading segmented_lookup_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
``````output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/cuda/amp/grad_scaler.py:125: UserWarning: torch.cuda.amp.GradScaler is enabled, but CUDA is not available.  Disabling.
  warnings.warn(
``````output
[Jan 07, 10:38:35] #> Loading doclens...
``````output
100%|███████████████████████████████████████████████████████| 1/1 [00:00<00:00, 3872.86it/s]
``````output
[Jan 07, 10:38:35] #> Loading codes and residuals...
``````output

100%|████████████████████████████████████████████████████████| 1/1 [00:00<00:00, 604.89it/s]
``````output
[Jan 07, 10:38:35] Loading filter_pids_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
``````output
[Jan 07, 10:38:35] Loading decompress_residuals_cpp extension (set COLBERT_LOAD_TORCH_EXTENSION_VERBOSE=True for more info)...
Searcher loaded!

#> QueryTokenizer.tensorize(batch_text[0], batch_background[0], bsize) ==
#> Input: . What animation studio did Miyazaki found?, 		 True, 		 None
#> Output IDs: torch.Size([32]), tensor([  101,     1,  2054,  7284,  2996,  2106,  2771,  3148, 18637,  2179,
         1029,   102,   103,   103,   103,   103,   103,   103,   103,   103,
          103,   103,   103,   103,   103,   103,   103,   103,   103,   103,
          103,   103])
#> Output Mask: torch.Size([32]), tensor([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0])
``````output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
```

```python
results
```



```output
[{'content': 'In April 1984, Miyazaki opened his own office in Suginami Ward, naming it Nibariki.\n\n\n=== Studio Ghibli ===\n\n\n==== Early films (1985–1996) ====\nIn June 1985, Miyazaki, Takahata, Tokuma and Suzuki founded the animation production company Studio Ghibli, with funding from Tokuma Shoten. Studio Ghibli\'s first film, Laputa: Castle in the Sky (1986), employed the same production crew of Nausicaä. Miyazaki\'s designs for the film\'s setting were inspired by Greek architecture and "European urbanistic templates".',
  'score': 25.90749740600586,
  'rank': 1},
 {'content': 'Hayao Miyazaki (宮崎 駿 or 宮﨑 駿, Miyazaki Hayao, [mijaꜜzaki hajao]; born January 5, 1941) is a Japanese animator, filmmaker, and manga artist. A co-founder of Studio Ghibli, he has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films, and is widely regarded as one of the most accomplished filmmakers in the history of animation.\nBorn in Tokyo City in the Empire of Japan, Miyazaki expressed interest in manga and animation from an early age, and he joined Toei Animation in 1963. During his early years at Toei Animation he worked as an in-between artist and later collaborated with director Isao Takahata.',
  'score': 25.4748477935791,
  'rank': 2},
 {'content': 'Glen Keane said Miyazaki is a "huge influence" on Walt Disney Animation Studios and has been "part of our heritage" ever since The Rescuers Down Under (1990). The Disney Renaissance era was also prompted by competition with the development of Miyazaki\'s films. Artists from Pixar and Aardman Studios signed a tribute stating, "You\'re our inspiration, Miyazaki-san!"',
  'score': 24.84897232055664,
  'rank': 3}]
```


我们可以很容易地转换为LangChain检索器！在创建时，我们可以传入任何我们想要的kwargs（比如`k`）


```python
retriever = RAG.as_langchain_retriever(k=3)
```


```python
retriever.invoke("What animation studio did Miyazaki found?")
```
```output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
```


```output
[Document(page_content='In April 1984, Miyazaki opened his own office in Suginami Ward, naming it Nibariki.\n\n\n=== Studio Ghibli ===\n\n\n==== Early films (1985–1996) ====\nIn June 1985, Miyazaki, Takahata, Tokuma and Suzuki founded the animation production company Studio Ghibli, with funding from Tokuma Shoten. Studio Ghibli\'s first film, Laputa: Castle in the Sky (1986), employed the same production crew of Nausicaä. Miyazaki\'s designs for the film\'s setting were inspired by Greek architecture and "European urbanistic templates".'),
 Document(page_content='Hayao Miyazaki (宮崎 駿 or 宮﨑 駿, Miyazaki Hayao, [mijaꜜzaki hajao]; born January 5, 1941) is a Japanese animator, filmmaker, and manga artist. A co-founder of Studio Ghibli, he has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films, and is widely regarded as one of the most accomplished filmmakers in the history of animation.\nBorn in Tokyo City in the Empire of Japan, Miyazaki expressed interest in manga and animation from an early age, and he joined Toei Animation in 1963. During his early years at Toei Animation he worked as an in-between artist and later collaborated with director Isao Takahata.'),
 Document(page_content='Glen Keane said Miyazaki is a "huge influence" on Walt Disney Animation Studios and has been "part of our heritage" ever since The Rescuers Down Under (1990). The Disney Renaissance era was also prompted by competition with the development of Miyazaki\'s films. Artists from Pixar and Aardman Studios signed a tribute stating, "You\'re our inspiration, Miyazaki-san!"')]
```


## 链接

我们可以轻松地将这个检索器组合成一个链。


```python
<!--IMPORTS:[{"imported": "create_retrieval_chain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval.create_retrieval_chain.html", "title": "RAGatouille"}, {"imported": "create_stuff_documents_chain", "source": "langchain.chains.combine_documents", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.create_stuff_documents_chain.html", "title": "RAGatouille"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "RAGatouille"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "RAGatouille"}]-->
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template(
    """Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}"""
)

llm = ChatOpenAI()

document_chain = create_stuff_documents_chain(llm, prompt)
retrieval_chain = create_retrieval_chain(retriever, document_chain)
```


```python
retrieval_chain.invoke({"input": "What animation studio did Miyazaki found?"})
```
```output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
```


```output
{'input': 'What animation studio did Miyazaki found?',
 'context': [Document(page_content='In April 1984, Miyazaki opened his own office in Suginami Ward, naming it Nibariki.\n\n\n=== Studio Ghibli ===\n\n\n==== Early films (1985–1996) ====\nIn June 1985, Miyazaki, Takahata, Tokuma and Suzuki founded the animation production company Studio Ghibli, with funding from Tokuma Shoten. Studio Ghibli\'s first film, Laputa: Castle in the Sky (1986), employed the same production crew of Nausicaä. Miyazaki\'s designs for the film\'s setting were inspired by Greek architecture and "European urbanistic templates".'),
  Document(page_content='Hayao Miyazaki (宮崎 駿 or 宮﨑 駿, Miyazaki Hayao, [mijaꜜzaki hajao]; born January 5, 1941) is a Japanese animator, filmmaker, and manga artist. A co-founder of Studio Ghibli, he has attained international acclaim as a masterful storyteller and creator of Japanese animated feature films, and is widely regarded as one of the most accomplished filmmakers in the history of animation.\nBorn in Tokyo City in the Empire of Japan, Miyazaki expressed interest in manga and animation from an early age, and he joined Toei Animation in 1963. During his early years at Toei Animation he worked as an in-between artist and later collaborated with director Isao Takahata.'),
  Document(page_content='Glen Keane said Miyazaki is a "huge influence" on Walt Disney Animation Studios and has been "part of our heritage" ever since The Rescuers Down Under (1990). The Disney Renaissance era was also prompted by competition with the development of Miyazaki\'s films. Artists from Pixar and Aardman Studios signed a tribute stating, "You\'re our inspiration, Miyazaki-san!"')],
 'answer': 'Miyazaki founded Studio Ghibli.'}
```



```python
for s in retrieval_chain.stream({"input": "What animation studio did Miyazaki found?"}):
    print(s.get("answer", ""), end="")
```
```output
/Users/harrisonchase/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/torch/amp/autocast_mode.py:250: UserWarning: User provided device_type of 'cuda', but CUDA is not available. Disabling
  warnings.warn(
``````output
Miyazaki founded Studio Ghibli.
```

## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
