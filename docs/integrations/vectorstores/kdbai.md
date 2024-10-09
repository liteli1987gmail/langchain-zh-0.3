---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/kdbai.ipynb
---
# KDB.AI

> [KDB.AI](https://kdb.ai/) 是一个强大的基于知识的向量数据库和搜索引擎，允许您使用实时数据构建可扩展、可靠的AI应用程序，提供高级搜索、推荐和个性化服务。

[这个示例](https://github.com/KxSystems/kdbai-samples/blob/main/document_search/document_search.ipynb) 演示了如何使用 KDB.AI 在非结构化文本文档上运行语义搜索。

要访问您的端点和API密钥，请[在这里注册 KDB.AI](https://kdb.ai/get-started/)。

要设置您的开发环境，请按照[KDB.AI 先决条件页面](https://code.kx.com/kdbai/pre-requisites.html)上的说明进行操作。

以下示例演示了您可以通过 LangChain 与 KDB.AI 进行交互的一些方式。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 导入所需的包


```python
<!--IMPORTS:[{"imported": "RetrievalQA", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.retrieval_qa.base.RetrievalQA.html", "title": "KDB.AI"}, {"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "KDB.AI"}, {"imported": "KDBAI", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.kdbai.KDBAI.html", "title": "KDB.AI"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "KDB.AI"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "KDB.AI"}]-->
import os
import time
from getpass import getpass

import kdbai_client as kdbai
import pandas as pd
import requests
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import KDBAI
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```


```python
KDBAI_ENDPOINT = input("KDB.AI endpoint: ")
KDBAI_API_KEY = getpass("KDB.AI API key: ")
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass("OpenAI API Key: ")
```
```output
KDB.AI endpoint:  https://ui.qa.cld.kx.com/instance/pcnvlmi860
KDB.AI API key:  ········
OpenAI API Key:  ········
```

```python
TEMP = 0.0
K = 3
```

## 创建 KBD.AI 会话


```python
print("Create a KDB.AI session...")
session = kdbai.Session(endpoint=KDBAI_ENDPOINT, api_key=KDBAI_API_KEY)
```
```output
Create a KDB.AI session...
```
## 创建表格


```python
print('Create table "documents"...')
schema = {
    "columns": [
        {"name": "id", "pytype": "str"},
        {"name": "text", "pytype": "bytes"},
        {
            "name": "embeddings",
            "pytype": "float32",
            "vectorIndex": {"dims": 1536, "metric": "L2", "type": "hnsw"},
        },
        {"name": "tag", "pytype": "str"},
        {"name": "title", "pytype": "bytes"},
    ]
}
table = session.create_table("documents", schema)
```
```output
Create table "documents"...
```

```python
%%time
URL = "https://www.conseil-constitutionnel.fr/node/3850/pdf"
PDF = "Déclaration_des_droits_de_l_homme_et_du_citoyen.pdf"
open(PDF, "wb").write(requests.get(URL).content)
```
```output
CPU times: user 44.1 ms, sys: 6.04 ms, total: 50.2 ms
Wall time: 213 ms
```


```output
562978
```


## 读取 PDF


```python
%%time
print("Read a PDF...")
loader = PyPDFLoader(PDF)
pages = loader.load_and_split()
len(pages)
```
```output
Read a PDF...
CPU times: user 156 ms, sys: 12.5 ms, total: 169 ms
Wall time: 183 ms
```


```output
3
```


## 从 PDF 文本创建向量数据库


```python
%%time
print("Create a Vector Database from PDF text...")
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
texts = [p.page_content for p in pages]
metadata = pd.DataFrame(index=list(range(len(texts))))
metadata["tag"] = "law"
metadata["title"] = "Déclaration des Droits de l'Homme et du Citoyen de 1789".encode(
    "utf-8"
)
vectordb = KDBAI(table, embeddings)
vectordb.add_texts(texts=texts, metadatas=metadata)
```
```output
Create a Vector Database from PDF text...
CPU times: user 211 ms, sys: 18.4 ms, total: 229 ms
Wall time: 2.23 s
```


```output
['3ef27d23-47cf-419b-8fe9-5dfae9e8e895',
 'd3a9a69d-28f5-434b-b95b-135db46695c8',
 'd2069bda-c0b8-4791-b84d-0c6f84f4be34']
```


## 创建 LangChain 流水线


```python
%%time
print("Create LangChain Pipeline...")
qabot = RetrievalQA.from_chain_type(
    chain_type="stuff",
    llm=ChatOpenAI(model="gpt-3.5-turbo-16k", temperature=TEMP),
    retriever=vectordb.as_retriever(search_kwargs=dict(k=K)),
    return_source_documents=True,
)
```
```output
Create LangChain Pipeline...
CPU times: user 40.8 ms, sys: 4.69 ms, total: 45.5 ms
Wall time: 44.7 ms
```
## 用英语总结文档


```python
%%time
Q = "Summarize the document in English:"
print(f"\n\n{Q}\n")
print(qabot.invoke(dict(query=Q))["result"])
```
```output


Summarize the document in English:

The document is the Declaration of the Rights of Man and of the Citizen of 1789. It was written by the representatives of the French people and aims to declare the natural, inalienable, and sacred rights of every individual. These rights include freedom, property, security, and resistance to oppression. The document emphasizes the importance of equality and the principle that sovereignty resides in the nation. It also highlights the role of law in protecting individual rights and ensuring the common good. The document asserts the right to freedom of thought, expression, and religion, as long as it does not disturb public order. It emphasizes the need for a public force to guarantee the rights of all citizens and the importance of a fair and equal distribution of public contributions. The document also recognizes the right of citizens to hold public officials accountable and states that any society without the guarantee of rights and separation of powers does not have a constitution. Finally, it affirms the inviolable and sacred nature of property, stating that it can only be taken away for public necessity and with just compensation.
CPU times: user 144 ms, sys: 50.2 ms, total: 194 ms
Wall time: 4.96 s
```
## 查询数据


```python
%%time
Q = "Is it a fair law and why ?"
print(f"\n\n{Q}\n")
print(qabot.invoke(dict(query=Q))["result"])
```
```output


Is it a fair law and why ?

As an AI language model, I don't have personal opinions. However, I can provide some analysis based on the given context. The text provided is an excerpt from the Declaration of the Rights of Man and of the Citizen of 1789, which is considered a foundational document in the history of human rights. It outlines the natural and inalienable rights of individuals, such as freedom, property, security, and resistance to oppression. It also emphasizes the principles of equality, the rule of law, and the separation of powers. 

Whether or not this law is considered fair is subjective and can vary depending on individual perspectives and societal norms. However, many consider the principles and rights outlined in this declaration to be fundamental and just. It is important to note that this declaration was a significant step towards establishing principles of equality and individual rights in France and has influenced subsequent human rights documents worldwide.
CPU times: user 85.1 ms, sys: 5.93 ms, total: 91.1 ms
Wall time: 5.11 s
```

```python
%%time
Q = "What are the rights and duties of the man, the citizen and the society ?"
print(f"\n\n{Q}\n")
print(qabot.invoke(dict(query=Q))["result"])
```
```output


What are the rights and duties of the man, the citizen and the society ?

According to the Declaration of the Rights of Man and of the Citizen of 1789, the rights and duties of man, citizen, and society are as follows:

Rights of Man:
1. Men are born and remain free and equal in rights. Social distinctions can only be based on common utility.
2. The purpose of political association is the preservation of the natural and imprescriptible rights of man, which are liberty, property, security, and resistance to oppression.
3. The principle of sovereignty resides essentially in the nation. No body or individual can exercise any authority that does not emanate expressly from it.
4. Liberty consists of being able to do anything that does not harm others. The exercise of natural rights of each man has no limits other than those that ensure the enjoyment of these same rights by other members of society. These limits can only be determined by law.
5. The law has the right to prohibit only actions harmful to society. Anything not prohibited by law cannot be prevented, and no one can be compelled to do what it does not command.
6. The law is the expression of the general will. All citizens have the right to participate personally, or through their representatives, in its formation. It must be the same for all, whether it protects or punishes. All citizens, being equal in its eyes, are equally eligible to all public dignities, places, and employments, according to their abilities, and without other distinction than that of their virtues and talents.
7. No man can be accused, arrested, or detained except in cases determined by law and according to the forms it has prescribed. Those who solicit, expedite, execute, or cause to be executed arbitrary orders must be punished. But any citizen called or seized in virtue of the law must obey instantly; he renders himself culpable by resistance.
8. The law should establish only strictly and evidently necessary penalties, and no one can be punished except in virtue of a law established and promulgated prior to the offense, and legally applied.
9. Every man being presumed innocent until he has been declared guilty, if it is judged indispensable to arrest him, any rigor that is not necessary to secure his person must be severely repressed by the law.
10. No one should be disturbed for his opinions, even religious ones, as long as their manifestation does not disturb the established public order by law.
11. The free communication of ideas and opinions is one of the most precious rights of man. Every citizen may therefore speak, write, and print freely, except to respond to the abuse of this liberty in cases determined by law.
12. The guarantee of the rights of man and of the citizen requires a public force. This force is therefore instituted for the advantage of all and not for the particular utility of those to whom it is entrusted.
13. For the maintenance of the public force and for the expenses of administration, a common contribution is necessary. It must be equally distributed among all citizens, in proportion to their abilities.
14. All citizens have the right to ascertain, by themselves or through their representatives, the necessity of the public contribution, to consent to it freely, to follow its use, and to determine its amount, basis, collection, and duration.
15. Society has the right to ask any public agent for an account of his administration.
16. Any society in which the guarantee of rights is not assured, nor the separation of powers determined, has no constitution.
17. Property being an inviolable and sacred right, no one can be deprived of it, except when public necessity, legally determined, obviously requires it, and under the condition of a just and prior indemnity.

Duties of the Citizen:
The Declaration does not explicitly mention the duties of the citizen, but it emphasizes the importance of the law and the need for citizens to obey it. It also highlights the responsibility of citizens to participate in the formation of the law and to hold public agents accountable for their administration.

Duties of Society:
The Declaration does not explicitly mention the duties of society, but it emphasizes the importance of guaranteeing the rights of man and of the citizen. Society is responsible for ensuring the preservation of these rights and the separation of powers, as well as providing a public force for the advantage of all.
CPU times: user 86.5 ms, sys: 5.45 ms, total: 92 ms
Wall time: 14.9 s
```

```python
%%time
Q = "Is this law practical ?"
print(f"\n\n{Q}\n")
print(qabot.invoke(dict(query=Q))["result"])
```
```output


Is this law practical ?

As an AI language model, I cannot provide personal opinions or subjective judgments on whether a law is practical or not. The texts provided are excerpts from the French Constitution and the Declaration of the Rights of Man and of the Citizen of 1789. These texts outline fundamental rights and principles that form the basis of the French legal system. The practicality of a law is often a matter of interpretation and can vary depending on the context and specific circumstances. It is ultimately up to legal experts, lawmakers, and the judiciary to determine the practicality and application of these laws in specific cases.
CPU times: user 91.4 ms, sys: 5.89 ms, total: 97.3 ms
Wall time: 2.78 s
```
## 清理文档表


```python
# Clean up KDB.AI "documents" table and index for similarity search
# so this notebook could be played again and again
session.table("documents").drop()
```



```output
True
```



## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
