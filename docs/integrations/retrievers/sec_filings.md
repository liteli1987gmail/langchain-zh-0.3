---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/sec_filings.ipynb
---
# SEC 文件


> [SEC 文件](https://www.sec.gov/edgar) 是提交给美国证券交易委员会 (SEC) 的财务报表或其他正式文件。上市公司、某些内部人士和经纪交易商需要定期进行 `SEC 文件` 的提交。投资者和金融专业人士依赖这些文件获取他们评估的公司的信息，以便进行投资决策。
>
>`SEC 文件` 数据由 [Kay.ai](https://kay.ai) 和 [Cybersyn](https://www.cybersyn.com/) 提供，来源于 [Snowflake Marketplace](https://app.snowflake.com/marketplace/providers/GZTSZAS2KCS/Cybersyn%2C%20Inc)。


## 设置


首先，您需要安装 `kay` 包。您还需要一个 API 密钥：您可以在 [https://kay.ai](https://kay.ai/) 免费获取一个。获得 API 密钥后，您必须将其设置为环境变量 `KAY_API_KEY`。

在这个示例中，我们将使用 `KayAiRetriever`。请查看 [kay notebook](/docs/integrations/retrievers/kay) 以获取有关其接受的参数的更详细信息。


```python
# Setup API keys for Kay and OpenAI
from getpass import getpass

KAY_API_KEY = getpass()
OPENAI_API_KEY = getpass()
```
```output
 ········
 ········
```

```python
import os

os.environ["KAY_API_KEY"] = KAY_API_KEY
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## 示例


```python
<!--IMPORTS:[{"imported": "ConversationalRetrievalChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.conversational_retrieval.base.ConversationalRetrievalChain.html", "title": "SEC filing"}, {"imported": "KayAiRetriever", "source": "langchain_community.retrievers", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.kay.KayAiRetriever.html", "title": "SEC filing"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "SEC filing"}]-->
from langchain.chains import ConversationalRetrievalChain
from langchain_community.retrievers import KayAiRetriever
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo")
retriever = KayAiRetriever.create(
    dataset_id="company", data_types=["10-K", "10-Q"], num_contexts=6
)
qa = ConversationalRetrievalChain.from_llm(model, retriever=retriever)
```


```python
questions = [
    "What are patterns in Nvidia's spend over the past three quarters?",
    # "What are some recent challenges faced by the renewable energy sector?",
]
chat_history = []

for question in questions:
    result = qa({"question": question, "chat_history": chat_history})
    chat_history.append((question, result["answer"]))
    print(f"-> **Question**: {question} \n")
    print(f"**Answer**: {result['answer']} \n")
```
```output
-> **Question**: What are patterns in Nvidia's spend over the past three quarters? 

**Answer**: Based on the provided information, here are the patterns in NVIDIA's spend over the past three quarters:

1. Research and Development Expenses:
   - Q3 2022: Increased by 34% compared to Q3 2021.
   - Q1 2023: Increased by 40% compared to Q1 2022.
   - Q2 2022: Increased by 25% compared to Q2 2021.
   
   Overall, research and development expenses have been consistently increasing over the past three quarters.

2. Sales, General and Administrative Expenses:
   - Q3 2022: Increased by 8% compared to Q3 2021.
   - Q1 2023: Increased by 14% compared to Q1 2022.
   - Q2 2022: Decreased by 16% compared to Q2 2021.
   
   The pattern for sales, general and administrative expenses is not as consistent, with some quarters showing an increase and others showing a decrease.

3. Total Operating Expenses:
   - Q3 2022: Increased by 25% compared to Q3 2021.
   - Q1 2023: Increased by 113% compared to Q1 2022.
   - Q2 2022: Increased by 9% compared to Q2 2021.
   
   Total operating expenses have generally been increasing over the past three quarters, with a significant increase in Q1 2023.

Overall, the pattern indicates a consistent increase in research and development expenses and total operating expenses, while sales, general and administrative expenses show some fluctuations.
```

## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
