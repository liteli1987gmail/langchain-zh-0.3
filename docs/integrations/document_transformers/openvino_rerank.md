---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/openvino_rerank.ipynb
---
# OpenVINO 重新排序器

[OpenVINO™](https://github.com/openvinotoolkit/openvino) 是一个开源工具包，用于优化和部署 AI 推理。OpenVINO™ 运行时支持各种硬件 [设备](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix)，包括 x86 和 ARM CPU 以及英特尔 GPU。它可以帮助提升计算机视觉、自动语音识别、自然语言处理和其他常见任务中的深度学习性能。

Hugging Face 重新排序模型可以通过 ``OpenVINOReranker`` 类支持 OpenVINO。如果您有英特尔 GPU，可以指定 `model_kwargs=` 来在其上运行推理。


```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
%pip install --upgrade --quiet  faiss-cpu
```


```python
# Helper function for printing docs


def pretty_print_docs(docs):
    print(
        f"\n{'-' * 100}\n".join(
            [
                f"Document {i+1}:\n\n{d.page_content}\nMetadata: {d.metadata}"
                for i, d in enumerate(docs)
            ]
        )
    )
```

## 设置基础向量存储检索器
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以设置检索器以检索大量（20）文档。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "OpenVINO Reranker"}, {"imported": "OpenVINOEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.openvino.OpenVINOEmbeddings.html", "title": "OpenVINO Reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "OpenVINO Reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "OpenVINO Reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import OpenVINOEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader(
    "../../how_to/state_of_the_union.txt",
).load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
for idx, text in enumerate(texts):
    text.metadata["id"] = idx

embedding = OpenVINOEmbeddings(
    model_name_or_path="sentence-transformers/all-mpnet-base-v2"
)
retriever = FAISS.from_documents(texts, embedding).as_retriever(search_kwargs={"k": 20})

query = "What did the president say about Ketanji Brown Jackson"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```
```output
/home/ethan/intel/langchain_test/lib/python3.10/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
``````output
INFO:nncf:NNCF initialized successfully. Supported frameworks detected: torch, onnx, openvino
``````output
Framework not specified. Using pt to export the model.
Using the export variant default. Available variants are:
    - default: The default ONNX variant.
Using framework PyTorch: 2.2.1+cu121
/home/ethan/intel/langchain_test/lib/python3.10/site-packages/transformers/modeling_utils.py:4193: FutureWarning: `_is_quantized_training_enabled` is going to be deprecated in transformers 4.39.0. Please use `model.hf_quantizer.is_trainable` instead
  warnings.warn(
Compiling the model to CPU ...
``````output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 73}
----------------------------------------------------------------------------------------------------
Document 2:

Danielle says Heath was a fighter to the very end. 

He didn’t know how to stop fighting, and neither did she. 

Through her pain she found purpose to demand we do better. 

Tonight, Danielle—we are. 

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits. 

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 88}
----------------------------------------------------------------------------------------------------
Document 3:

The widow of Sergeant First Class Heath Robinson.  

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq. 

Stationed near Baghdad, just yards from burn pits the size of football fields. 

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter. 

But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. 

Danielle says Heath was a fighter to the very end.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 87}
----------------------------------------------------------------------------------------------------
Document 4:

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve. 

And fourth, let’s end cancer as we know it. 

This is personal to me and Jill, to Kamala, and to so many of you. 

Cancer is the #2 cause of death in America–second only to heart disease.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 89}
----------------------------------------------------------------------------------------------------
Document 5:

Every Administration says they’ll do it, but we are actually doing it. 

We will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. 

But to compete for the best jobs of the future, we also need to level the playing field with China and other competitors.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 29}
----------------------------------------------------------------------------------------------------
Document 6:

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 2}
----------------------------------------------------------------------------------------------------
Document 7:

As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” 

It’s time. 

But with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills.  

Inflation is robbing them of the gains they might otherwise feel. 

I get it. That’s why my top priority is getting prices under control.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 35}
----------------------------------------------------------------------------------------------------
Document 8:

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century. 

Vice President Harris and I ran for office with a new economic vision for America. 

Invest in America. Educate Americans. Grow the workforce. Build the economy from the bottom up  
and the middle out, not from the top down.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 23}
----------------------------------------------------------------------------------------------------
Document 9:

To all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. 

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 14}
----------------------------------------------------------------------------------------------------
Document 10:

The one thing all Americans agree on is that the tax system is not fair. We have to fix it.  

I’m not looking to punish anyone. But let’s make sure corporations and the wealthiest Americans start paying their fair share. 

Just last year, 55 Fortune 500 corporations earned $40 billion in profits and paid zero dollars in federal income tax.  

That’s simply not fair. That’s why I’ve proposed a 15% minimum tax rate for corporations.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 46}
----------------------------------------------------------------------------------------------------
Document 11:

Joshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  

For Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  

Drug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 41}
----------------------------------------------------------------------------------------------------
Document 12:

As I’ve told Xi Jinping, it is never a good bet to bet against the American people. 

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America. 

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 26}
----------------------------------------------------------------------------------------------------
Document 13:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 79}
----------------------------------------------------------------------------------------------------
Document 14:

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.  

Our troops in Iraq and Afghanistan faced many dangers. 

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more. 

When they came home, many of the world’s fittest and best trained warriors were never the same. 

Headaches. Numbness. Dizziness.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 85}
----------------------------------------------------------------------------------------------------
Document 15:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 74}
----------------------------------------------------------------------------------------------------
Document 16:

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves. 

I’ve worked on these issues a long time. 

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety. 

So let’s not abandon our streets. Or choose between safety and equal justice.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 67}
----------------------------------------------------------------------------------------------------
Document 17:

We’ll build a national network of 500,000 electric vehicle charging stations, begin to replace poisonous lead pipes—so every child—and every American—has clean water to drink at home and at school, provide affordable high-speed internet for every American—urban, suburban, rural, and tribal communities. 

4,000 projects have already been announced. 

And tonight, I’m announcing that this year we will start fixing over 65,000 miles of highway and 1,500 bridges in disrepair.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 27}
----------------------------------------------------------------------------------------------------
Document 18:

Cancer is the #2 cause of death in America–second only to heart disease. 

Last month, I announced our plan to supercharge  
the Cancer Moonshot that President Obama asked me to lead six years ago. 

Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  

More support for patients and families. 

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 90}
----------------------------------------------------------------------------------------------------
Document 19:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world. 

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced. 

The pandemic has been punishing. 

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. 

I understand.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 18}
----------------------------------------------------------------------------------------------------
Document 20:

He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  

But drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. 

Imagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  

What it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be.
Metadata: {'source': '../../how_to/state_of_the_union.txt', 'id': 40}
```
## 使用 OpenVINO 进行重排序
现在让我们用 `ContextualCompressionRetriever` 包装我们的基础检索器，使用 `OpenVINOReranker` 作为压缩器。


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "OpenVINO Reranker"}, {"imported": "OpenVINOReranker", "source": "langchain_community.document_compressors.openvino_rerank", "docs": "https://python.langchain.com/api_reference/community/document_compressors/langchain_community.document_compressors.openvino_rerank.OpenVINOReranker.html", "title": "OpenVINO Reranker"}]-->
from langchain.retrievers import ContextualCompressionRetriever
from langchain_community.document_compressors.openvino_rerank import OpenVINOReranker

model_name = "BAAI/bge-reranker-large"

ov_compressor = OpenVINOReranker(model_name_or_path=model_name, top_n=4)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=ov_compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
print([doc.metadata["id"] for doc in compressed_docs])
```

重排序后，前 4 个文档与基础检索器检索的前 4 个文档不同。


```python
pretty_print_docs(compressed_docs)
```
```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
Metadata: {'id': 0, 'relevance_score': tensor(0.6148)}
----------------------------------------------------------------------------------------------------
Document 2:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world. 

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced. 

The pandemic has been punishing. 

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. 

I understand.
Metadata: {'id': 16, 'relevance_score': tensor(0.0373)}
----------------------------------------------------------------------------------------------------
Document 3:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
Metadata: {'id': 18, 'relevance_score': tensor(0.0131)}
----------------------------------------------------------------------------------------------------
Document 4:

To all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. 

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.
Metadata: {'id': 6, 'relevance_score': tensor(0.0098)}
```
## 导出 IR 模型
可以使用 ``OVModelForSequenceClassification`` 将您的重排序模型导出为 OpenVINO IR 格式，并从本地文件夹加载模型。


```python
from pathlib import Path

ov_model_dir = "bge-reranker-large-ov"
if not Path(ov_model_dir).exists():
    ov_compressor.save_model(ov_model_dir)
```


```python
ov_compressor = OpenVINOReranker(model_name_or_path=ov_model_dir)
```
```output
Compiling the model to CPU ...
```
有关更多信息，请参阅：

* [OpenVINO LLM 指南](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)。

* [OpenVINO 文档](https://docs.openvino.ai/2024/home.html)。

* [OpenVINO 入门指南](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)。

* [与 LangChain 的 RAG 笔记本](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)。
