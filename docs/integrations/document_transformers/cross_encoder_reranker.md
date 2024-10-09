---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/cross_encoder_reranker.ipynb
---
# 交叉编码器重排序器

本笔记本展示了如何在检索器中实现重排序器，使用您自己的交叉编码器，来自 [Hugging Face 交叉编码器模型](https://huggingface.co/cross-encoder) 或实现交叉编码器功能的 Hugging Face 模型（[示例：BAAI/bge-reranker-base](https://huggingface.co/BAAI/bge-reranker-base)）。`SagemakerEndpointCrossEncoder` 使您能够使用这些加载在 Sagemaker 上的 HuggingFace 模型。

这基于 [ContextualCompressionRetriever](/docs/how_to/contextual_compression) 中的想法。本文档的整体结构来自 [Cohere Reranker 文档](/docs/integrations/retrievers/cohere-reranker)。

有关为什么交叉编码器可以与嵌入结合使用作为更好的检索重排序机制的更多信息，请参阅 [Hugging Face 交叉编码器文档](https://www.sbert.net/examples/applications/cross-encoder/README.html)。


```python
#!pip install faiss sentence_transformers

# OR  (depending on Python version)

#!pip install faiss-cpu sentence_transformers
```


```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]
        )
    )
```

## 设置基础向量存储检索器
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以设置检索器以检索大量（20个）文档。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Cross Encoder Reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Cross Encoder Reranker"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Cross Encoder Reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Cross Encoder Reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
embeddingsModel = HuggingFaceEmbeddings(
    model_name="sentence-transformers/msmarco-distilbert-dot-v5"
)
retriever = FAISS.from_documents(texts, embeddingsModel).as_retriever(
    search_kwargs={"k": 20}
)

query = "What is the plan for the economy?"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```

## 使用CrossEncoderReranker进行重新排序
现在让我们用`ContextualCompressionRetriever`包装我们的基础检索器。`CrossEncoderReranker`使用`HuggingFaceCrossEncoder`对返回的结果进行重新排序。


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "Cross Encoder Reranker"}, {"imported": "CrossEncoderReranker", "source": "langchain.retrievers.document_compressors", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.document_compressors.cross_encoder_rerank.CrossEncoderReranker.html", "title": "Cross Encoder Reranker"}, {"imported": "HuggingFaceCrossEncoder", "source": "langchain_community.cross_encoders", "docs": "https://python.langchain.com/api_reference/community/cross_encoders/langchain_community.cross_encoders.huggingface.HuggingFaceCrossEncoder.html", "title": "Cross Encoder Reranker"}]-->
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-base")
compressor = CrossEncoderReranker(model=model, top_n=3)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke("What is the plan for the economy?")
pretty_print_docs(compressed_docs)
```
```output
Document 1:

More infrastructure and innovation in America. 

More goods moving faster and cheaper in America. 

More jobs where you can earn a good living in America. 

And instead of relying on foreign supply chains, let’s make it in America. 

Economists call it “increasing the productive capacity of our economy.” 

I call it building a better America. 

My plan to fight inflation will lower your costs and lower the deficit.
----------------------------------------------------------------------------------------------------
Document 2:

Second – cut energy costs for families an average of $500 a year by combatting climate change.  

Let’s provide investments and tax credits to weatherize your homes and businesses to be energy efficient and you get a tax credit; double America’s clean energy production in solar, wind, and so much more;  lower the price of electric vehicles, saving you another $80 a month because you’ll never have to pay at the gas pump again.
----------------------------------------------------------------------------------------------------
Document 3:

Look at cars. 

Last year, there weren’t enough semiconductors to make all the cars that people wanted to buy. 

And guess what, prices of automobiles went up. 

So—we have a choice. 

One way to fight inflation is to drive down wages and make Americans poorer.  

I have a better plan to fight inflation. 

Lower your costs, not your wages. 

Make more cars and semiconductors in America. 

More infrastructure and innovation in America. 

More goods moving faster and cheaper in America.
```
## 将Hugging Face模型上传到SageMaker端点

这是一个创建与`SagemakerEndpointCrossEncoder`配合使用的端点的示例`inference.py`。有关逐步指导的更多详细信息，请参阅[这篇文章](https://huggingface.co/blog/kchoe/deploy-any-huggingface-model-to-sagemaker)。

它会动态下载Hugging Face模型，因此您不需要在`model.tar.gz`中保留模型工件，例如`pytorch_model.bin`。


```python
import json
import logging
from typing import List

import torch
from sagemaker_inference import encoder
from transformers import AutoModelForSequenceClassification, AutoTokenizer

PAIRS = "pairs"
SCORES = "scores"


class CrossEncoder:
    def __init__(self) -> None:
        self.device = (
            torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu")
        )
        logging.info(f"Using device: {self.device}")
        model_name = "BAAI/bge-reranker-base"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.model = self.model.to(self.device)

    def __call__(self, pairs: List[List[str]]) -> List[float]:
        with torch.inference_mode():
            inputs = self.tokenizer(
                pairs,
                padding=True,
                truncation=True,
                return_tensors="pt",
                max_length=512,
            )
            inputs = inputs.to(self.device)
            scores = (
                self.model(**inputs, return_dict=True)
                .logits.view(
                    -1,
                )
                .float()
            )

        return scores.detach().cpu().tolist()


def model_fn(model_dir: str) -> CrossEncoder:
    try:
        return CrossEncoder()
    except Exception:
        logging.exception(f"Failed to load model from: {model_dir}")
        raise


def transform_fn(
    cross_encoder: CrossEncoder, input_data: bytes, content_type: str, accept: str
) -> bytes:
    payload = json.loads(input_data)
    model_output = cross_encoder(**payload)
    output = {SCORES: model_output}
    return encoder.encode(output, accept)
```
