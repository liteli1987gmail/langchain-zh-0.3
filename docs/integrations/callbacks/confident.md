---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/confident.ipynb
---
# Confident

> [DeepEval](https://confident-ai.com) 包用于对大型语言模型进行单元测试。
> 使用 Confident，任何人都可以通过更快的迭代构建稳健的语言模型。
> 使用单元测试和集成测试。我们为迭代的每一步提供支持。
> 从合成数据创建到测试。


在本指南中，我们将演示如何测试和衡量大型语言模型的性能。我们展示了如何使用我们的回调来衡量性能，以及如何定义自己的指标并将其记录到我们的仪表板中。

DeepEval 还提供：
- 如何生成合成数据
- 如何衡量性能
- 一个仪表板，用于监控和回顾结果

## 安装与设置


```python
%pip install --upgrade --quiet  langchain langchain-openai langchain-community deepeval langchain-chroma
```

### 获取API凭证

要获取DeepEval API凭证，请按照以下步骤操作：

1. 访问 https://app.confident-ai.com
2. 点击“组织”
3. 复制API密钥。


登录时，系统还会要求您设置`implementation`名称。实现名称用于描述实现类型。（想想您想给项目起什么名字。我们建议使用描述性名称。）


```python
!deepeval login
```

### 设置DeepEval

默认情况下，您可以使用`DeepEvalCallbackHandler`来设置您想要跟踪的指标。然而，目前对指标的支持有限（更多功能将很快添加）。目前支持：
- [答案相关性](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [偏见](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [毒性](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)


```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# Here we want to make sure the answer is minimally relevant
answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## 开始使用

要使用 `DeepEvalCallbackHandler`，我们需要 `implementation_name`。


```python
<!--IMPORTS:[{"imported": "DeepEvalCallbackHandler", "source": "langchain_community.callbacks.confident_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.confident_callback.DeepEvalCallbackHandler.html", "title": "Confident"}]-->
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### 场景 1：输入到大型语言模型中

然后你可以将其输入到你的大型语言模型中，使用OpenAI。


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Confident"}]-->
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```



```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```


然后你可以通过调用 `is_successful()` 方法检查该指标是否成功。


```python
answer_relevancy_metric.is_successful()
# returns True/False
```

一旦你运行了这个，你应该能够看到下面的仪表板。

![Dashboard](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### 场景 2：在没有回调的情况下跟踪大型语言模型

要在没有回调的情况下跟踪大型语言模型，你可以在最后插入它。

我们可以从定义一个简单的链开始，如下所示。


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "Confident"}, {"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "Confident"}, {"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Confident"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Confident"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Confident"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Confident"}]-->
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# Providing a new question-answering pipeline
query = "Who is the president?"
result = qa.run(query)
```

定义链后，您可以手动检查答案的相似性。


```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### 接下来是什么？

您可以在[这里](https://docs.confident-ai.com/docs/quickstart/custom-metrics)创建您自己的自定义指标。

DeepEval还提供其他功能，例如能够[自动创建单元测试](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation)和[幻觉测试](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency)。

如果您感兴趣，请查看我们的Github仓库[这里](https://github.com/confident-ai/deepeval)。我们欢迎任何PR和关于如何提高LLM性能的讨论。
