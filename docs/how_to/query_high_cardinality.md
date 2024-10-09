---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_high_cardinality.ipynb
sidebar_position: 7
---
# 如何在进行查询分析时处理高基数分类变量

您可能希望进行查询分析，以便在分类列上创建过滤器。这里的一个困难是，您通常需要指定确切的分类值。问题在于，您需要确保大型语言模型（LLM）准确生成该分类值。当有效值只有少数时，这可以通过提示相对容易地完成。当有效值数量较多时，这就变得更加困难，因为这些值可能无法适应LLM的上下文，或者（如果可以）可能有太多值让LLM无法正确处理。

在这个笔记本中，我们将看看如何处理这个问题。

## 设置
#### 安装依赖


```python
%pip install -qU langchain langchain-community langchain-openai faker langchain-chroma
```
```output
Note: you may need to restart the kernel to use updated packages.
```
#### 设置环境变量

在这个例子中我们将使用OpenAI：


```python
import getpass
import os

if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

#### 设置数据

我们将生成一堆虚假的名字


```python
from faker import Faker

fake = Faker()

names = [fake.name() for _ in range(10000)]
```

让我们看看一些名字


```python
names[0]
```



```output
'Jacob Adams'
```



```python
names[567]
```



```output
'Eric Acevedo'
```


## 查询分析

我们现在可以设置一个基线查询分析


```python
from pydantic import BaseModel, Field, model_validator
```


```python
class Search(BaseModel):
    query: str
    author: str
```


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How deal with high cardinality categoricals when doing query analysis"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "How deal with high cardinality categoricals when doing query analysis"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How deal with high cardinality categoricals when doing query analysis"}]-->
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

我们可以看到，如果我们准确拼写名字，它知道如何处理


```python
query_analyzer.invoke("what are books about aliens by Jesse Knight")
```



```output
Search(query='aliens', author='Jesse Knight')
```


问题是你想要过滤的值可能没有被准确拼写


```python
query_analyzer.invoke("what are books about aliens by jess knight")
```



```output
Search(query='aliens', author='Jess Knight')
```


### 添加所有值

解决这个问题的一种方法是将所有可能的值添加到提示中。这通常会引导查询朝着正确的方向进行。


```python
system = """Generate a relevant search query for a library system.

`author` attribute MUST be one of:

{authors}

Do NOT hallucinate author name!"""
base_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
prompt = base_prompt.partial(authors=", ".join(names))
```


```python
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm
```

然而……如果分类列表足够长，可能会出错！


```python
try:
    res = query_analyzer_all.invoke("what are books about aliens by jess knight")
except Exception as e:
    print(e)
```

我们可以尝试使用更长的上下文窗口……但在这么多信息的情况下，不能保证可靠地提取。


```python
llm_long = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)
structured_llm_long = llm_long.with_structured_output(Search)
query_analyzer_all = {"question": RunnablePassthrough()} | prompt | structured_llm_long
```


```python
query_analyzer_all.invoke("what are books about aliens by jess knight")
```



```output
Search(query='aliens', author='jess knight')
```


### 查找所有相关值

相反，我们可以做的是在相关值上创建一个索引，然后查询N个最相关的值。


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How deal with high cardinality categoricals when doing query analysis"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How deal with high cardinality categoricals when doing query analysis"}]-->
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(names, embeddings, collection_name="author_names")
```


```python
def select_names(question):
    _docs = vectorstore.similarity_search(question, k=10)
    _names = [d.page_content for d in _docs]
    return ", ".join(_names)
```


```python
create_prompt = {
    "question": RunnablePassthrough(),
    "authors": select_names,
} | base_prompt
```


```python
query_analyzer_select = create_prompt | structured_llm
```


```python
create_prompt.invoke("what are books by jess knight")
```



```output
ChatPromptValue(messages=[SystemMessage(content='Generate a relevant search query for a library system.\n\n`author` attribute MUST be one of:\n\nJennifer Knight, Jill Knight, John Knight, Dr. Jeffrey Knight, Christopher Knight, Andrea Knight, Brandy Knight, Jennifer Keller, Becky Chambers, Sarah Knapp\n\nDo NOT hallucinate author name!'), HumanMessage(content='what are books by jess knight')])
```



```python
query_analyzer_select.invoke("what are books about aliens by jess knight")
```



```output
Search(query='books about aliens', author='Jennifer Knight')
```


### 选择后替换

另一种方法是让大型语言模型填入任何值，但随后将该值转换为有效值。
这实际上可以通过Pydantic类本身来完成！


```python
class Search(BaseModel):
    query: str
    author: str

    @model_validator(mode="before")
    @classmethod
    def double(cls, values: dict) -> dict:
        author = values["author"]
        closest_valid_author = vectorstore.similarity_search(author, k=1)[
            0
        ].page_content
        values["author"] = closest_valid_author
        return values
```


```python
system = """Generate a relevant search query for a library system"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
corrective_structure_llm = llm.with_structured_output(Search)
corrective_query_analyzer = (
    {"question": RunnablePassthrough()} | prompt | corrective_structure_llm
)
```


```python
corrective_query_analyzer.invoke("what are books about aliens by jes knight")
```



```output
Search(query='aliens', author='John Knight')
```



```python
# TODO: show trigram similarity
```
