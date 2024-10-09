---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/volcengine_rerank.ipynb
---
# Volcengine 重新排序器

本笔记本展示了如何使用 Volcengine 重新排序器进行文档压缩和检索。[Volcengine](https://www.volcengine.com/) 是字节跳动（TikTok 的母公司）开发的云服务平台。

Volcengine 的重新排序服务支持对最多 50 个文档进行重新排序，最大支持 4000 个令牌。欲了解更多信息，请访问 [这里](https://www.volcengine.com/docs/84313/1254474) 和 [这里](https://www.volcengine.com/docs/84313/1254605)。


```python
%pip install --upgrade --quiet  volcengine
```


```python
%pip install --upgrade --quiet  faiss

# OR  (depending on Python version)

%pip install --upgrade --quiet  faiss-cpu
```


```python
# To obtain ak/sk: https://www.volcengine.com/docs/84313/1254488

import getpass
import os

if "VOLC_API_AK" not in os.environ:
    os.environ["VOLC_API_AK"] = getpass.getpass("Volcengine API AK:")
if "VOLC_API_SK" not in os.environ:
    os.environ["VOLC_API_SK"] = getpass.getpass("Volcengine API SK:")
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
让我们开始初始化一个简单的向量存储检索器，并存储2023年国情咨文（分块）。我们可以设置检索器以检索大量（20）文档。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Volcengine Reranker"}, {"imported": "FAISS", "source": "langchain_community.vectorstores.faiss", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.faiss.FAISS.html", "title": "Volcengine Reranker"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_huggingface", "docs": "https://python.langchain.com/api_reference/huggingface/embeddings/langchain_huggingface.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "Volcengine Reranker"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Volcengine Reranker"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.faiss import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

documents = TextLoader("../../how_to/state_of_the_union.txt").load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
retriever = FAISS.from_documents(
    texts, HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
).as_retriever(search_kwargs={"k": 20})

query = "What did the president say about Ketanji Brown Jackson"
docs = retriever.invoke(query)
pretty_print_docs(docs)
```
```output
/Users/terminator/Developer/langchain/.venv/lib/python3.11/site-packages/sentence_transformers/cross_encoder/CrossEncoder.py:11: TqdmExperimentalWarning: Using `tqdm.autonotebook.tqdm` in notebook mode. Use `tqdm.tqdm` instead to force console mode (e.g. in jupyter console)
  from tqdm.autonotebook import tqdm, trange
/Users/terminator/Developer/langchain/.venv/lib/python3.11/site-packages/huggingface_hub/file_download.py:1132: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`.
  warnings.warn(
``````output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

We cannot let this happen. 

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.
----------------------------------------------------------------------------------------------------
Document 3:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
----------------------------------------------------------------------------------------------------
Document 4:

He will never extinguish their love of freedom. He will never weaken the resolve of the free world. 

We meet tonight in an America that has lived through two of the hardest years this nation has ever faced. 

The pandemic has been punishing. 

And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. 

I understand.
----------------------------------------------------------------------------------------------------
Document 5:

As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.” 

It’s time. 

But with all the bright spots in our economy, record job growth and higher wages, too many families are struggling to keep up with the bills.  

Inflation is robbing them of the gains they might otherwise feel. 

I get it. That’s why my top priority is getting prices under control.
----------------------------------------------------------------------------------------------------
Document 6:

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. 

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.
----------------------------------------------------------------------------------------------------
Document 7:

It’s not only the right thing to do—it’s the economically smart thing to do. 

That’s why immigration reform is supported by everyone from labor unions to religious leaders to the U.S. Chamber of Commerce. 

Let’s get it done once and for all. 

Advancing liberty and justice also requires protecting the rights of women. 

The constitutional right affirmed in Roe v. Wade—standing precedent for half a century—is under attack as never before.
----------------------------------------------------------------------------------------------------
Document 8:

I understand. 

I remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. 

That’s why one of the first things I did as President was fight to pass the American Rescue Plan.  

Because people were hurting. We needed to act, and we did. 

Few pieces of legislation have done more in a critical moment in our history to lift us out of crisis.
----------------------------------------------------------------------------------------------------
Document 9:

Third – we can end the shutdown of schools and businesses. We have the tools we need. 

It’s time for Americans to get back to work and fill our great downtowns again.  People working from home can feel safe to begin to return to the office.   

We’re doing that here in the federal government. The vast majority of federal workers will once again work in person. 

Our schools are open. Let’s keep it that way. Our kids need to be in school.
----------------------------------------------------------------------------------------------------
Document 10:

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. 

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.
----------------------------------------------------------------------------------------------------
Document 11:

The widow of Sergeant First Class Heath Robinson.  

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq. 

Stationed near Baghdad, just yards from burn pits the size of football fields. 

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter. 

But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body. 

Danielle says Heath was a fighter to the very end.
----------------------------------------------------------------------------------------------------
Document 12:

Danielle says Heath was a fighter to the very end. 

He didn’t know how to stop fighting, and neither did she. 

Through her pain she found purpose to demand we do better. 

Tonight, Danielle—we are. 

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits. 

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.
----------------------------------------------------------------------------------------------------
Document 13:

We can do all this while keeping lit the torch of liberty that has led generations of immigrants to this land—my forefathers and so many of yours. 

Provide a pathway to citizenship for Dreamers, those on temporary status, farm workers, and essential workers. 

Revise our laws so businesses have the workers they need and families don’t wait decades to reunite. 

It’s not only the right thing to do—it’s the economically smart thing to do.
----------------------------------------------------------------------------------------------------
Document 14:

He rejected repeated efforts at diplomacy. 

He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   

We prepared extensively and carefully. 

We spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin.
----------------------------------------------------------------------------------------------------
Document 15:

As I’ve told Xi Jinping, it is never a good bet to bet against the American people. 

We’ll create good jobs for millions of Americans, modernizing roads, airports, ports, and waterways all across America. 

And we’ll do it all to withstand the devastating effects of the climate crisis and promote environmental justice.
----------------------------------------------------------------------------------------------------
Document 16:

Tonight I say to the Russian oligarchs and corrupt leaders who have bilked billions of dollars off this violent regime no more. 

The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs.  

We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains.
----------------------------------------------------------------------------------------------------
Document 17:

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
----------------------------------------------------------------------------------------------------
Document 18:

So that’s my plan. It will grow the economy and lower costs for families. 

So what are we waiting for? Let’s get this done. And while you’re at it, confirm my nominees to the Federal Reserve, which plays a critical role in fighting inflation.  

My plan will not only lower costs to give families a fair shot, it will lower the deficit.
----------------------------------------------------------------------------------------------------
Document 19:

Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. 

Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. 

Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   

They keep moving.   

And the costs and the threats to America and the world keep rising.
----------------------------------------------------------------------------------------------------
Document 20:

It’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.  

ARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more. 

A unity agenda for the nation. 

We can do this. 

My fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. 

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.
``````output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)
```
## 使用VolcengineRerank进行重新排序
现在让我们用`ContextualCompressionRetriever`包装我们的基础检索器。我们将使用`VolcengineRerank`对返回的结果进行重新排序。


```python
<!--IMPORTS:[{"imported": "ContextualCompressionRetriever", "source": "langchain.retrievers", "docs": "https://python.langchain.com/api_reference/langchain/retrievers/langchain.retrievers.contextual_compression.ContextualCompressionRetriever.html", "title": "Volcengine Reranker"}, {"imported": "VolcengineRerank", "source": "langchain_community.document_compressors.volcengine_rerank", "docs": "https://python.langchain.com/api_reference/community/document_compressors/langchain_community.document_compressors.volcengine_rerank.VolcengineRerank.html", "title": "Volcengine Reranker"}]-->
from langchain.retrievers import ContextualCompressionRetriever
from langchain_community.document_compressors.volcengine_rerank import VolcengineRerank

compressor = VolcengineRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

compressed_docs = compression_retriever.invoke(
    "What did the president say about Ketanji Jackson Brown"
)
pretty_print_docs(compressed_docs)
```
```output
Document 1:

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. 

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
----------------------------------------------------------------------------------------------------
Document 2:

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. 

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.
----------------------------------------------------------------------------------------------------
Document 3:

We cannot let this happen. 

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. 

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.
```