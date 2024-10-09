---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/versions/migrating_chains/map_reduce_chain.ipynb
---
# 从 MapReduceDocumentsChain 迁移

[MapReduceDocumentsChain](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain.html) 实现了一种针对（可能较长）文本的映射-归约策略。该策略如下：

- 将文本拆分为较小的文档；
- 将一个过程映射到较小的文档上；
- 将过程的结果归约或整合为最终结果。

请注意，映射步骤通常在输入文档上并行化。

在这种情况下应用的一个常见过程是摘要，其中映射步骤对单个文档进行摘要，而归约步骤生成摘要的摘要。

在归约步骤中，`MapReduceDocumentsChain` 支持摘要的递归“折叠”：输入将根据令牌限制进行分区，并生成分区的摘要。此步骤将重复进行，直到摘要的总长度在所需限制内，从而允许对任意长度文本进行摘要。这对于具有较小上下文窗口的模型特别有用。

LangGraph 支持 [map-reduce](https://langchain-ai.github.io/langgraph/how-tos/map-reduce/) 工作流，并为此问题提供了许多优势：

- LangGraph 允许单个步骤（例如连续摘要）进行流式处理，从而更好地控制执行；
- LangGraph的[检查点](https://langchain-ai.github.io/langgraph/how-tos/persistence/)支持错误恢复、扩展人机协作工作流，并更容易融入对话应用程序。
- LangGraph的实现更容易扩展，正如我们下面将看到的。

下面我们将介绍`MapReduceDocumentsChain`及其相应的LangGraph实现，首先是一个简单的示例以作说明，其次是一个较长的示例文本以演示递归减少步骤。

让我们首先加载一个聊天模型：

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm" />

## 基本示例（短文档）

让我们使用以下3个文档作为说明。


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Migrating from MapReduceDocumentsChain"}]-->
from langchain_core.documents import Document

documents = [
    Document(page_content="Apples are red", metadata={"title": "apple_book"}),
    Document(page_content="Blueberries are blue", metadata={"title": "blueberry_book"}),
    Document(page_content="Bananas are yelow", metadata={"title": "banana_book"}),
]
```

### 传统

<details open>
    
下面我们展示了一个使用 `MapReduceDocumentsChain` 的实现。我们为映射和归约步骤定义提示词模板，为这些步骤实例化单独的链，最后实例化 `MapReduceDocumentsChain`：


```python
<!--IMPORTS:[{"imported": "MapReduceDocumentsChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.map_reduce.MapReduceDocumentsChain.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "ReduceDocumentsChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.reduce.ReduceDocumentsChain.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "StuffDocumentsChain", "source": "langchain.chains.combine_documents.stuff", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "LLMChain", "source": "langchain.chains.llm", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Migrating from MapReduceDocumentsChain"}]-->
from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import CharacterTextSplitter

# Map
map_template = "Write a concise summary of the following: {docs}."
map_prompt = ChatPromptTemplate([("human", map_template)])
map_chain = LLMChain(llm=llm, prompt=map_prompt)


# Reduce
reduce_template = """
The following is a set of summaries:
{docs}
Take these and distill it into a final, consolidated summary
of the main themes.
"""
reduce_prompt = ChatPromptTemplate([("human", reduce_template)])
reduce_chain = LLMChain(llm=llm, prompt=reduce_prompt)


# Takes a list of documents, combines them into a single string, and passes this to an LLMChain
combine_documents_chain = StuffDocumentsChain(
    llm_chain=reduce_chain, document_variable_name="docs"
)

# Combines and iteratively reduces the mapped documents
reduce_documents_chain = ReduceDocumentsChain(
    # This is final chain that is called.
    combine_documents_chain=combine_documents_chain,
    # If documents exceed context for `StuffDocumentsChain`
    collapse_documents_chain=combine_documents_chain,
    # The maximum number of tokens to group documents into.
    token_max=1000,
)

# Combining documents by mapping a chain over them, then combining results
map_reduce_chain = MapReduceDocumentsChain(
    # Map chain
    llm_chain=map_chain,
    # Reduce chain
    reduce_documents_chain=reduce_documents_chain,
    # The variable name in the llm_chain to put the documents in
    document_variable_name="docs",
    # Return the results of the map steps in the output
    return_intermediate_steps=False,
)
```


```python
result = map_reduce_chain.invoke(documents)

print(result["output_text"])
```
```output
Fruits come in a variety of colors, with apples being red, blueberries being blue, and bananas being yellow.
```
在 [LangSmith trace](https://smith.langchain.com/public/8d88a2c0-5d26-41f6-9176-d06549b17aa6/r) 中，我们观察到四个 LLM 调用：一个对每个输入文档进行总结，一个对总结进行总结。

</details>

### LangGraph

下面我们展示了一个 LangGraph 实现，使用与上述相同的提示词模板。图中包括一个生成摘要的节点，该节点映射到输入文档列表。这个节点然后流向第二个生成最终摘要的节点。

<details open>

我们需要安装 `langgraph`：


```python
% pip install -qU langgraph
```


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "Migrating from MapReduceDocumentsChain"}]-->
import operator
from typing import Annotated, List, TypedDict

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph

map_template = "Write a concise summary of the following: {context}."

reduce_template = """
The following is a set of summaries:
{docs}
Take these and distill it into a final, consolidated summary
of the main themes.
"""

map_prompt = ChatPromptTemplate([("human", map_template)])
reduce_prompt = ChatPromptTemplate([("human", reduce_template)])

map_chain = map_prompt | llm | StrOutputParser()
reduce_chain = reduce_prompt | llm | StrOutputParser()

# Graph components: define the components that will make up the graph


# This will be the overall state of the main graph.
# It will contain the input document contents, corresponding
# summaries, and a final summary.
class OverallState(TypedDict):
    # Notice here we use the operator.add
    # This is because we want combine all the summaries we generate
    # from individual nodes back into one list - this is essentially
    # the "reduce" part
    contents: List[str]
    summaries: Annotated[list, operator.add]
    final_summary: str


# This will be the state of the node that we will "map" all
# documents to in order to generate summaries
class SummaryState(TypedDict):
    content: str


# Here we generate a summary, given a document
async def generate_summary(state: SummaryState):
    response = await map_chain.ainvoke(state["content"])
    return {"summaries": [response]}


# Here we define the logic to map out over the documents
# We will use this an edge in the graph
def map_summaries(state: OverallState):
    # We will return a list of `Send` objects
    # Each `Send` object consists of the name of a node in the graph
    # as well as the state to send to that node
    return [
        Send("generate_summary", {"content": content}) for content in state["contents"]
    ]


# Here we will generate the final summary
async def generate_final_summary(state: OverallState):
    response = await reduce_chain.ainvoke(state["summaries"])
    return {"final_summary": response}


# Construct the graph: here we put everything together to construct our graph
graph = StateGraph(OverallState)
graph.add_node("generate_summary", generate_summary)
graph.add_node("generate_final_summary", generate_final_summary)
graph.add_conditional_edges(START, map_summaries, ["generate_summary"])
graph.add_edge("generate_summary", "generate_final_summary")
graph.add_edge("generate_final_summary", END)
app = graph.compile()
```


```python
from IPython.display import Image

Image(app.get_graph().draw_mermaid_png())
```



![](data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAEvANADASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAUGBAcIAwIBCf/EAFQQAAEDBAADAQkLBwkHAQkAAAECAwQABQYRBxIhEwgUFRYiMUFWlBdRU1VhkpOV0tPUMjdUcXaz0QkjOGJydYGhtDZCUnSRsbLDGCQmJzQ1hcHw/8QAGwEBAQADAQEBAAAAAAAAAAAAAAECAwQFBgf/xAA0EQACAAMDCQYGAwEAAAAAAAAAAQIDERJRkQQTFCExUmGh0RVBU3GxwQUjMjOB4SJC8EP/2gAMAwEAAhEDEQA/AP6p0pSgFKUoBSlKAUpWBerw1ZYYeW25IdWtLTMZgAuPOKPRCQSB75JJASAVEgAkVJxOiBn1HPZFaY6yh25w2lj/AHVyEA/96ifE9V9HbZM6LgpQ/wDtzSlCE1/V5enan0FS/P1ISgHlqQbxCxMp5W7LbkJ3vSYjYG/+lb7MqHVE2/L/AHsXUffjVZfjiB7Sj+NPGqy/HED2lH8aeKtl+J4HsyP4U8VbL8TwPZkfwp8njyLqHjVZfjiB7Sj+NPGqy/HED2lH8aeKtl+J4HsyP4U8VbL8TwPZkfwp8njyGoeNVl+OIHtKP408arL8cQPaUfxp4q2X4ngezI/hTxVsvxPA9mR/CnyePIaj7ayO0vrCW7pCcUfQiQgn/vUjUQ5iNieQUOWW3LQevKqI2R/2qO8SUWQdrjL3gdxPXvEEmE7/AFS15m/7TfKR03zAcpWZUWpNrz/3sTUWilR1kvKLzGcUWXIsllZakRXdc7Kx6DroQQQQR0III89SNaYoXC6MgpSlYgUpSgFKUoBSlKAUpSgFKUoBVXjau/ECYtzSmbPFbaZSfQ89tTive/IS0AfOOZY6bO7RVYso7zzrJI69gym401s66KHIWlAH3wWhv+0PfrolbI33090vSpV3lnpSlc5D8JABJOgK1Q53TmCzsXya8WG4vX4WOA9PW3HgygiQhB5dtOdkQ4kr0krb5wN7PQGtrOBKm1BSedJBBTrex72q5R4aWfI3xlmFYpZMrtXDqTjMxuNbsygd7KtdwcPK3GivK8p1kpWskbWlHKNL66oDbGLd0hil34UWvOLo5NtESSmO0805a5nMJLjSXC0ygshb6fKOltpUlWjo+epb/wBoDh+METmaskYRjXfibeuctl1PYyFOBsNuoKOdohShvnSnlB2dDrWlEZZlsjgfw5s0PH85xyNZ1wLXlYgWh5u5pYbiqSrvTySpxBeQ2FOM7UEq2PTqqWzA727huXWxvFMqEaZxKst5jM3xh6TIfgqXDC3nFqKyrQZcK+ZRUga5+U9KA3TlPdX4xj2S4ZAah3iXbr+uYHZgsdwDjCWWyoFDPe5W7zL0PJHRPlebrW7UKC0JUN6I2NjVaY47IuNj4i8K8yYsd1vtpsU2e3cGrLEVLktJkRFNtuBlG1KSFgAkA63utxQJYnwY8oNOsB5tLgafQUOI2N6Uk9UqG+oPmNAe9KUoCsXLVozq0SkaSi7NuQHx18txCFPNK97olL4+XmHvVZ6rGRp79y3E4qASpiQ/cF6GwEIYWz1Po8qQj9ej8tWet836YHw92V9wpSlaCClKUApSlAKUpQClKUApSlAKhcgtD8l6HcreG/CsEqDQdUUodaXrtGVEeYK5UkHrpSEHRAIM1Ss4YnA6obCCS/Zs9s023TIrUyM6gsTrVPaBUkK6Ft1s76Hr74UOoJBBqqDubOE483DfFh/+IY+zVyvWK2vIFtuzI25LaSluWw4pl9sb2Ql1BC0jejoHXQVHHCHBsN5LfWk73yiShf8AmpBP+dbbMqLWoqefVdC6iCidzrwtgSmZMbh3jDEhlaXGnW7UylSFA7CgQnoQRvdbEqr+JMj1qv30zP3VPEmR61X76Zn7qmbl7/JiivLRSqLkuE33xcuvgPKrt4b70d7x77ea7HvjkPZ8+mt8vNy716N14YZhOS+KVn8Z8qufjF3q34R7wea73745R2nZ7a3y829b9FM3L3+TFFebBrX9y7nzhjeLjKnzuH+NTJ0p1b78h+1srcdcUSpS1KKdkkkkk+cmpjxJketV++mZ+6p4kyPWq/fTM/dUzcvf5MUV5AL7m/hS6oFfDjF1kAJ2q0sHoBoD8n0AAVae0sXDyxwrfFjx7ZCaHYQbbCaCSojqG2Wk+c/IB06k6GzWMMIdI05k19cTveu+G0/5pbB/zrPsuJWuwPLfix1KluJ5Vy5Lq331j3i4slWvk3r5KWZUOtxV8l7voxqPOwWqQmXKu9yQhFylpS32SFcyY7KSShsH0nyiVEecn3gKnKUrVHE43Vh6xSlKwIKUpQClKUApSlAKUpQClKUApSlAKUpQClKUBXeI0a3TOHuUMXec5bLS7a5SJk5n8uOyWlBxxPQ9Up2R0Pm81YPB6HZ7fwqxGLj9zevVjZtcdEG4yN9pJZDYCHFbA6qGj5h5/NUln8lmHgmSSJFpN+Yatslxy1JTzGakNKJYA0d848nWj+V5jWFwomx7jwzxaVEsCsVjPW1hxqyLRyGAkoBDJGhrl/J1oebzUBa6UpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAROWN3Z7Fby3YHWmL6qE8m3uvjbaJBQeyKtg+SF8pPQ9PRWPgTOQR8JsTWVvsScmRCaTcnooAaXI5R2hRoAaKt66D9VefEaNbpnD3KGLvOctlpdtcpEycz+XHZLSg44noeqU7I6HzeasHg9Ds9v4VYjFx+5vXqxs2uOiDcZG+0kshsBDitgdVDR8w8/moC4UpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKVD5DkIsojsssGZcJSiliMFcgIGuZalaPKhII2dHzgAEkA5QwuN2YdoJilUk33LyelvsgHvGY8df49l1r88O5h+gWP2t77uurRY71ii0LvSqR4dzD9Asftb33dPDuYfoFj9re+7posd6xQoXelUjw7mH6BY/a3vu6eHcw/QLH7W993TRY71ihQu9KpHh3MP0Cx+1vfd08O5h+gWP2t77umix3rFChwd/Kj8DFW3IbVxRtkcmNcgm3XcpG+V9CdMuH+02nk35h2SfSqoz+S64KOX/AD65cSprakQLAhcKArRAclutlLhB9IQ0sgg/DJPortjiviV74v8ADy+YferdZO8LpHLRcTKdKmVghTbidt65kLCVDfTaetYvBfBL3wR4a2XDrNBsrsW3tkLkuSXUrkOqJU44rTfnUonp10NDzCmix3rFChu2lUjw7mH6BY/a3vu6eHcw/QLH7W993TRY71ihQu9KpHh3MP0Cx+1vfd08O5h+gWP2t77umix3rFChd6VSPDuYfoFj9re+7p4dzD9Asftb33dNFjvWKFC70qkeHcw/QLH7W993Tw7mHxfYz8nfbw/9Kmix3rFChd6VCY5karwqRFlxu8bnGCS9HC+0QUq3yrQvQ5knRG9AggggembrmjgigdmLaQUpSsAKUpQCqVkR/wDmNZR71qm6+T+ei/8A9/gKutUnIvzj2b+6Zn76NXZkv3Pw/RlRJ0rU3HjOLtjE7CLPb72zicXILouHMyN9ltwQ0oYcdShIdBbC3VICElYIHXoTqtRw+OGdxsLjwItzlZRe73mU6x26+woUQl2DHaKi9GaUpplSj2SgOdZTzFwjmASmtjiSdCHWtK5cu3EPi9i2D3xdxTOty0XazR7Rer/AgCQ8mRLQ1IaeZiurbUlII0pPIohZ1ogKr3zzjHmXBSdnNll3ZWZy49rtc+zypcNhlxp2XMXEKFpa7NC0pUkLTvlP+6VdeYLSB05SuZ4+ZcXsateWSbkxfXbTHxq4TUXXIIFrjuwpzTRWz2aYrziXEK8raVo2ClPlKBNSr2SZXj/BizX+/cRJ4v8AkrdvTDZtliiyFokOIKzHis8g51rB6qdUpKezKtJGwFoHQLjiGW1OOKShCRtSlHQA98mvquM88zPLs27m/i5Z8kn3CLdMauUaOZEqFFYlSY7gjuoQ+20XGkqHa/lNkbCU+bygdkcTczzfEb/iXD2yXW+368TYcu5zr5DgW5dwUy24hKEIbdLMYdXQCrlJASPJJJUFoHQlK13wRuubXPG7gjObdJhzo09bUORMbjtPy4vKhSHHW2HHG0L5itJCVaPIDob1WL3QF4zGx4lbpOId+NgXJpN2lWyEibNjQeVfaOMMLBS4oK7PY0o8pUQkmrXVUGzqVo7COJk++cQeHtug5ajKsfuuO3Kc/PRCbY77eZkR0IWpISC2pAWtCkDlG97SCNCpReJ+dZHklmscXJvBhuWd5BY1y0wGHVtQ4rby2kICka5khsAKUD16q5/MZaQOnqVye/xB4l49hmcZPJznwknCsnFn7xctMZtFzjh2PzKfUlO0ucsjQLXIByDYOzrO4i8QuIUOLxqvtqzDwbFweY2qBbfBkd1t9Hecd5bby1J5iklatcpSoFR2ojlCVoHUVK0GznWSYDnV0s2U5q3OtL2HSMjF1lW1lrwY6y6htfKhoJ529OhQQrmV5GuY7qp4ZxgzuHkV8tVzuF6uEGViM2/2u4X+zRID6HWVIAU22yo7bIdB5XkhYKRvYJpaQOqKVzZEy3iFjPBPEeJ14zF28NON2q53q2It0ZthEB1AEgoKW+fnSl5Dqjza2yrlCUq5a2Zwvy265xl+fT1TA5i0G5Is9pjpbQAXGEDvp7nA5lBTqygbJA7HoBs7qiqC52c64lPD37Qnfy/zx1/3P/WrvVHs/wCct7+6B++NXitWVfWvJGTFKUrjMRSlKAVSci/OPZv7pmfvo1XaqtltrlJudvvcOOqYqI07Gfit67RTThQoqRvzqSW0+TsbBVrZCQerJmlM13P0ZUar7pDCblnOI2yJbbTdL0WLgmQ7FtVxiRXCkIWASmW2tl0AkEJWBo6UCCkVAYPwavuZcOHLLxGdnw3IV1TNx15mXHF0tSEISG1F6M2lrtAou65UkcqgDv0bbVmMdB0q130HXUCyyjr/ABDeq/PHON8WX76kl/dV2ZiNutllssqzvA+DcMRdsN2ybJL6hy5xbqqdcpjbkjtGHW3G0J02EIb20naUoG9qPQndZOXcEMYzu9X64XxqROTerMzZJUNTgSz2LTzjyFp0ApLgW4Tzc3TlToAjZsHjnG+LL99SS/uqeOcb4sv31JL+6q5iPdYsu4q1q4JMQsfv9ouGYZXkUa8W5y1rVeLgh1UdlaVJJbAbSnn0o+WoKUdDZNZuScHrRkmG49j6p1yt5x9cd62XSC8hEuM6y2W0OBRQUElClJIKCkhR6VOeOcb4sv31JL+6p45xviy/fUkv7qmYj3WLLuKVC7nPGmLJmlqmT7zeY2Xtti6quMwOOLdQgp7ZCgkFKyOToPJHZo5UpAIP7cu59t93ttlTMyvKHr9ZnnHYGTd+tJuTCXEhLjXOGghTagkbSpB3rfnq6eOcb4sv31JL+6p45xviy/fUkv7qmYj3WLLuIBNsyzArPAteNRE5mhJcckXDKMgcYklal83nTGcCh1PQBISAABrzY8zH8u4i28xMhU9gKor6JEWbiN/Mh51XKtKkOB2IhPJpQPKQoE6PQpBqwT+IVstUGTNmxLzEhxm1PPyH7PKQ202kEqUpRb0AACST5gK+LVxItN9tkW422Pd7hb5TaXo8qLaJTjTzahtKkKS2QoEdQRTMTN1kssqLPc4Y9bbVjUez3a+WKfYTK73u8KUgy3RJXzyQ8XG1oX2i9KO09CBy8te2K9zvjmIy7FJiXC8SHbPeZ18YVMkpdU4/LaW26HFFHMpIDiiOvNvRKldd3LxzjfFl++pJf3VPHON8WX76kl/dUzEe6y2XcVe5cCLBdMUzHH3ZlyTCym7G8TXEOthxt4lk8rZKNBH8wjooKPVXXza+7zwOsN8s/EK2vy7ihjN1hy4qbcbCmj2DbH8ztBCfJbSfKCupPo6VZfHON8WX76kl/dU8c43xZfvqSX91TMR7rFl3EDlXBbHc0vL9wu3fUkSMfkY07F7QJaXFecbWtXRPMHAWk6UFADr03oiBg9zfaWLo3c5mU5Rebii1ybMZNxmtOFUN5ASWikNBI5SkLCgAoqA5iodKvnjnG+LL99SS/uqeOcb4sv31JL+6pmI91ksu4rOWYrLxrgsnDsasa8qS3a0WJqLNltsczHY9j2jzhABASAVcqdnZ0mpPg5w7Z4T8MMcxNpaXlWyIlt95G9OvnanXBvr5Tilq6+/Un45xviy/fUkv7qnjlGPmtd+J97wJLH/p0zEe2yy2XcZVn/OW9/dA/fGrxVTxW2ypN4lX2XGcgh2OiLHjPa7UIClKUtYG+XmJGk72AnZ0SUi2Vx5S046LuSIxSlK5CClKUApSlAKUpQClKUApSlAKUpQFG46/mR4hfs7cf9M5UR3Lv9HDhl+zsH9ympfjr+ZHiF+ztx/0zlRHcu/0cOGX7Owf3KaA2hSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoCjcdfzI8Qv2duP+mcqI7l3+jhwy/Z2D+5TUvx1/MjxC/Z24/wCmcqI7l3+jhwy/Z2D+5TQG0KUpQClKUApSlAKUpQClKUApSlAKUr5W4hsbWoJH9Y6oD6pXl30z8M384U76Z+Gb+cKtGD1pXl30z8M384U76Z+Gb+cKUYPWleXfTPwzfzhTvpn4Zv5wpRg9aV5d9M/DN/OFO+mfhm/nClGD1pXl30z8M384U76Z+Gb+cKUYOMO7U7sm48IrnkvDWXgBlxL3ZXG4d88L9mFtvsqbUvsuwPVC+ccvP15Qdjm6RncOd2NN4gzMM4SRcCW3HtFnDMu/JuvOG2o7PKHSz2I0FudmjXP0Lg6nXW+fyhnBNri3wWdvluSl3IsV557ARoqdjEDvhv5qQsenbeh+VUR/JucFGuG/CJzL7m2hq/ZUUvoDnRbMJO+xT183OSpzp5wpvfmpRg7CpXl30z8M384U76Z+Gb+cKUYPWleXfTPwzfzhTvpn4Zv5wpRg9aV5d9M/DN/OFO+mfhm/nClGD1pXl30z8M384U76Z+Gb+cKUYPWleXfTPwzfzhTvpn4Zv5wpRg9aV8IdQ5vkWlWvPyndfdQGLdJvg22S5fLzdgyt3l9/lST/APqteWvErVfrdEuV5t8S8XKUyh56TOYS8ragCUp5h5KB5gkaGh7+zV5yr/Zi8f8AJvf+BqvY1/s5av8AlGv/AAFelk7cEtxQujqZbEYXufYt6tWf2Br7NPc+xb1as/sDX2arDPdC4DKy6PjMa+Kl3iRMVAZbjwpC2nH0b7RCXg32aijR5tKPLo82tV7L4+YC3lXi8rIWhcu+xA5uwe72753rsO+OTse0305Ofm301vpW3PzN94kq7yw+59i3q1Z/YGvs09z7FvVqz+wNfZqsS+6G4fQLzItb+QBuXGneDZJ7zkFmNJ5+QNvOhvkaJUQAVqAV6Cay8z444Rw/u5td8vgizkNB95tqK9IEZs70t5TaFBlJ0dFwpGhumfmb7xFXeTnufYt6tWf2Br7NPc+xb1as/sDX2agr7xzwnHb4xZpV5U9dJENq4MRIEKRMW9GdUpKHUBltfMnaFbI3oaJ0CCfwcdsG8dU4mq+dlfFSTCS07EfQ0uQN7aS+pAaUvofJCt/JTPzN94irvJ73PsW9WrP7A19mnufYt6tWf2Br7NU3A+PVrzjiTl2HohTYsqyTu82XlQZPZyAllK3FKcLQbb0pSkpSpXlBIUnYUKkbJx7wLI8kZsVvyFp+e+6tiOosPIjyXE75kMvqQGnVDR6IUo9D71M/M33iKu8sPufYt6tWf2Br7NPc+xb1as/sDX2an65+x7ulncqyTPJMZyPb8TxYOMqEqxXFct5aW2z2pUlASlIW4AWghTnKkq8kEGjnzF/Z4irvNxe59i3q1Z/YGvs09z7FvVqz+wNfZqlW3ugsXtuN4w5kV7juXu7WWPeEs2a3zHkyGnE7LrDQbU7yb2dKHMkaKgKmL1xzwiw41Zr/ACb321pvKC5AfgxH5ZfSACSENIUoAbG9ga9OqZ+ZvvEVd5O+59i3q1Z/YGvs09z7FvVqz+wNfZqoXrjE0/d+Fy8ZkQbtYcvuD0dc0BSj2SIjzwLZChyq52gDzA68oaB82zqqnzH/AGeIq7yA9z7FvVqz+wNfZp7n2LerVn9ga+zUTA4y4fdc3exKHdzJvrLzkdxlqK8WkuoQVra7bk7LnSkElHNsa81e0Ti3ic7GcbyFi689nyKSzDtcnvZ0d8OukhtPKUcydlJ6qAA11Ipn5m+8RV3kh7n2LerVn9ga+zT3PsW9WrP7A19mqbM7pzhpb5C2pOTJYDct2A4+uFJDDcltSkrZW72fIlzaFaQVAqGikEKBMizx6wR3Grvfl34RbZZ5DMW4rmRH47kRx1aEN9q04hLiAouJ0op5dEnegSJn5m+8RV3lh9z7FvVqz+wNfZp7n2LerVn9ga+zVJc7qHhq0qYhd+kokQ0hyRGVaJofaa1vti12POGtde11ydR5XUVMZbx1wfB4tsk3a98ke5Ru/Yr0SI/KQ4xoHtSWULCUaIPMrQ6+emfmb7xFXeT3ufYt6tWf2Br7NPc+xb1as/sDX2ahsk42YViYsXhG9p3fYy5drESO9KM1pIbJLQaQorOnUEJHUg7AIB1kQeLuJ3DGb/kDd0LdqsHaC5uSYrzC4pQ0l1QU2tAXvkWlQ0k7302elXPzN94irvM2VhNogxnH7Tb4tmuDSVLYlwGUMuNq1sdUjqDobSdgjoQRV0xq6m+45arkpKUKmRGpBSnegVoCtDf66hXH0Sbap5sktuNFaSUlJ0RsdD1H+NZPDj83mL/3VF/cprTPbjlWonVp9S7VrM/Kv9mLx/yb3/gar2Nf7OWr/lGv/AVZMjZXIx66NNpKnFxXUpSPSSggVWsXWlzGrSpJ2lURkg++OQVjJ+y/P2J3HInD8PWbIMHw3LBcrBjGNZS+9Y5E3HZjLs6Stx9EZp2UUlgbL6jtCj2nk+Yk1l8LuF0K3Wa38Ps4xjiNOu0e4qbffi3CebFJT3wXW5e0vBhKfyVlOgoKB8kmt+23ueeH1pyZu/R8fHhFqUZrXazJDrDUgkq7VDC3C0heyTzJSCD1FbGrFQXkOWMqwy/SOA3HyA1Yri7cLlk86TAioiOF2UgqjlDjSQNrB5TpSdjyTrzV4ZBh6sX4pcRHMmx/iFeoOQy259tlYbNmiPIbMdDSoz6I7qEIWkoICndApI8oAarq6lWyDSmA4AjEOPj4t1mlw8dg4NbbVBkPIWtCA3JkEsB1W+ZSU9mSOYnXKT6K1Dm8HMMhuQk3u0Z3c8jtWaRp/YRGHvA0a2MzkqbWwhBDb6uxCT0C3Qoq2AAa7JpVcINAwIF3tvEvi7jTtovEY5itEi036PCccgoBtyGSXHkghtSXGiNK0TtOt7qocE8DtTjGDY3kuIcRo2Q4+phbpn3Cc5ZI0qKjaHm1Ke7BTalI8hLYOucDlA3XVteUqKzOjPRpDSH47yC2404naVpI0QR6QRSyD1rSWB49dIdg45NyLbMYcuORXF+EhxhaTKbVBjpStsEeWkqSoAp2CQR6KtQ7nbhakgjh5jII6gi1M/ZrYdWldoOc+BmK3q0Ztw5kT7PPhMxOFkK3SHZEVbaWZSXWSphZIHK4ACSg+UNHpVQxiBl2N4Fw9tFzt2ZW3Ew9e1XKPjEV9Fw7cz3FREOdmA80yptS1BSNA+TshJFdd0qWQch4JjGR4phPCyVJxTIP/hjM7oqfAVHU9Majye+w28ACe1QO+GypaCodVHZ0a68pWvV9zxwvcWpa+HuMqUo7KjamSSfm0SpsBre1i74/x673wqy5Vb7RdLvJdyeHdreU2hQ7NX/v0WQfM4taUeQhRCuYkpSRuqTjcTIIvDbgzgbuG5Ii74xk9v8ACslVscERlpl1wF1L2uVxBBCgpGwB+UU+nrqHDYt8RiLFZRHjMIS00y0kJShCRoJAHmAAA1XtSyDlhOGX73HmIRsVx78HE7wgY/ebnad7eGi52/LrfZ9n5fP5uXrvVfvGTDb9dL3xpXCsVxltXFGJd6KYiOLEkszVKe7PQ8vkToq1vlGt6FdTUpZBp2Vj9wc7oDNLh4Nkqt0nC4kRqV2Ciy68JEsqaSrWlKAUklIO9KHTqK1FYLfl1vxDhzYb9a85YxtnDIzTdvxll5h9d0G0rZlrRyrZSlHZ8oWpDeyrmPTVdf0pZBy3wZw++Q7h3PxuVguURdhxu8QZypcNaRDfBjNpSpRGk8wQvkO/LTsp2K9uNWG3CVx1tONQG0rx/iSiOu+p31QLY4l1xX6nmVNsn+yK6eqvQOH+P23MbllbFtQMiuDSWJFwcWtxfZpCQEI5iQ2nyEkpQACRs7PWpZ1UBOS//pHv7Cv+1evDj83mL/3VF/cprHuDiWYElxauVCGlKUT6AAd1mYAwuLgmNsuDlcbtsZCgfQQ0kGspv2fyvRmXcT9VOVw+T27i7Ze7lY2VqKzFhhhbIUepKUutL5dnrpJA2SddatlK4oJkUv6WStCm+IFw9c739BC/D08QLh653v6CF+Hq5UrdpMzhgugqU3xAuHrne/oIX4eniBcPXO9/QQvw9XKlNJmcMF0FSm+IFw9c739BC/D08QLh653v6CF+Hq5UppMzhgugqU3xAuHrne/oIX4eniBcPXO9/QQvw9XKlNJmcMF0FSm+IFw9c739BC/D08QLh653v6CF+Hq5UppMzhgugqar4k2S84dw7ym/w8vuzsu1WqVOZbfjwy2pbTKlpCgGAdEpG9EdPTWBwbh3ziJwnxDKLjl10Yn3i1Rpz7UaPDDSFuNhSgkKYJA2emyf11auOv5keIX7O3H/AEzlRHcu/wBHDhl+zsH9ymmkzOGC6CpPeIFw9c739BC/D08QLh653v6CF+Hq5UppMzhgugqU3xAuHrne/oIX4eniBcPXO9/QQvw9XKlNJmcMF0FSm+IFw9c739BC/D08QLh653v6CF+Hq5UppMzhgugqU3xAuHrne/oIX4eniBcPXO9/QQvw9XKlNJmcMF0FSm+IFw9c739BC/D08QLh653v6CF+Hq5UppMzhgugqVJrh6l0pTdL3cr1GB2qJLDCGnPMQFhppBUNj8knR8xBHSrbSlao5scz6mK1FKUrUQUpSgFKUoBSlKAUpSgFKUoCjcdfzI8Qv2duP+mcqI7l3+jhwy/Z2D+5TUvx1/MjxC/Z24/6ZyojuXf6OHDL9nYP7lNAbQpSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUBRuOv5keIX7O3H/AEzlRHcu/wBHDhl+zsH9ymuHf5UfgkuyZjauJ1vZJh3kIt9zI68kptGmln+20jl+TsflqM/kvuC7+S8TJ3EaUlxu242hcWGsdA9LebUhQ36Qhpatj33EGgP6i0pSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpXhOmsW2FImSnAzGjtqddcV5kISNkn9QBqpNuiBiX7Irbi9vVNuktuHGB5QpeyVK9CUpGypR0egBNa4nce9vatuOyJDO9drOkJj8w98JAWdfrAPyVr+/ZHMzO6+FpwUgEERIqvNFaOvJ1/xHQKj6T08wSBhV9pkvwaVBAnlCrFdXUsBVI2B7vN49VYf1ur8PT3ebx6qw/rdX4etf0rv7LyLw+cXUlrgZfGbJnuNXDK/YbdcYhsx7mxyIki6KWqO6CFNugdgNlKwk62NgEbG6xeBF3d4D8MLPh1rxqHLTDSVyJpuam1Sn1HbjpT2B1s9ANnSQkbOq/KU7LyLw+cXUWuBsD3ebx6qw/rdX4enu83j1Vh/W6vw9a2RcoblwcgJlMKnNtpeXFDgLqUKJCVlO9hJKVAHzHR96smnZmRP/nzi6i1wNlwePaw7q5Y28yzvXaQZaZBHylKktnX6tn5DWx8eyW2ZVAEy1S0S2N8qtApWhX/CtCgFJPyKANc21lWa+zcUuqLtbhzPoAS8x5hKaB2W1fL5+VX+6T6QVA8OVfBpMcLchWYvPU8S1TOnKViWm6Rr3a4lwhr7SLKaS80vWtpUNjp6D181ZdfFNOF0YFKUqAUpSgFKUoBSlKAUpSgFKUoBVH41PrY4bXQJVyh5yNHWf6jkhtCh/ilRH+NXioLOMdOWYldLUlSUPSGSGVr/ACUOjym1H5AsJP8AhXTk0cMufLji2JpvEq2nO1K82HFON/zjS2HkkodZcGlNrSdKQflBBB/VVfvdyyyNcFt2mwWu4QgByvyruuOsnXUFAjrA6/1v+lfpsUShVX19DAslas4r5tfoOV2PF8dbnJkzYz86RItrEd6QlttSEhKEyFpb6lfUnZAA0OpIsJvWe9NYnY/l3kDv4Ssa64M/xAZgTr80vGL/AG15ZhTbBci660hSQFDnWykEK8xQUEeSDv3uabE5kFmXVPya89dAUg5XxDRGxm23F52xTbhkDlvTMlRIynpEPvVxxK1NoWtCHApJHknW0AkEEpP7L4j5RYmb5jXhFq431vIodjg3iVGQkIRJZQ6HHG0BKVKQkrHQAE8vTz72IjhtDLWPCTc7pcHrJNXPZkTJAcddcUhxBDhKeqdOK0E8utDXQarFvXCCx37xiMpyb2l6lR5y3WnghcV9htCGnGFAbQQEA7O+u/QdVzuTOS/jE68X3U694KxgVquln45ZJHu17cv8nwBBUmW7GbYVy9u/5JS2Ak6OzvQ6ED0bO3q17A4ezcJuUu+2iVNyu+TGGYT3jBcksp7FClqBCm2FaO161y6Pn6He5EXnPNK3iljB101kDvU+yfrrfJ+VDZiT2t9777wXGlVmz3TL5FxZbuePWmDBO+0kRry4+4jodaQYyAdnQ/KGt7661VikPd7sqXyLcI6JQ2OZSyegSkekk6AHvmuqGJRKq6eoN2cD3lOYAy0fyGJclpH9kPKIH+G9f4VfqrnDzG3MTw62218gykIU7IKTsds4ouOaPpAUogfIBVjr80yuOGZlEyODY2/Uze0UpSuQgpSlAKUpQClKUApSlAKUpQClKUBrviHwtOQyF3WzLZi3ZWu2ae2GZQAABUQCUrAAAWAdgaIPklOpptlvVqdLU+wXSOsf7zcVUhv9fO0FJ1+siunaV7eS/Fp2TQKW1aSv2r8l1Pacr7f+L7l9Xv8A2Kbf+L7l9Xv/AGK6opXf29F4fP8ARKI5X2/8X3L6vf8AsU2/8X3L6vf+xXVFKdvReHz/AEKI5X2/8X3L6vf+xTb/AMX3L6vf+xXVFKdvReHz/QojmGDabxdXg1BsN1kLJ0FLhrYb+kcCU/51tXh9wqXZpTV1vimn7i31YiskqZjn/i2QOZevToAdde/WyaVw5V8XnZRC5cKsp44l1LYKUpXhkFKUoBSlKAUpSgP/2Q==)


请注意，以流式模式调用图形允许我们在执行过程中监控步骤并可能对其采取行动。


```python
# Call the graph:
async for step in app.astream({"contents": [doc.page_content for doc in documents]}):
    print(step)
```
```output
{'generate_summary': {'summaries': ['Apples are typically red in color.']}}
{'generate_summary': {'summaries': ['Bananas are yellow in color.']}}
{'generate_summary': {'summaries': ['Blueberries are a type of fruit that are blue in color.']}}
{'generate_final_summary': {'final_summary': 'The main themes are the colors of different fruits: apples are red, blueberries are blue, and bananas are yellow.'}}
```
在 [LangSmith trace](https://smith.langchain.com/public/8ecbe9fd-eb02-4c6e-90ae-659952c9360a/r) 中，我们恢复了之前的四个 LLM 调用。

</details>

## 总结长文档

当文本相对于 LLM 的上下文窗口较长时，映射-归约流程特别有用。`MapReduceDocumentsChain` 支持摘要的递归“折叠”：输入根据令牌限制进行分区，并生成分区的摘要。此步骤重复进行，直到摘要的总长度在所需限制内，从而允许对任意长度的文本进行总结。

这个“合并”步骤在`MapReduceDocumentsChain`中实现为一个`while`循环。我们可以在一篇更长的文本上演示这个步骤，这是一篇由Lilian Weng撰写的[LLM驱动的自主代理](https://lilianweng.github.io/posts/2023-06-23-agent/)博客文章（在[RAG教程](/docs/tutorials/rag)和其他文档中有介绍）。

首先，我们加载帖子并将其分块为更小的“子文档”：


```python
<!--IMPORTS:[{"imported": "WebBaseLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.web_base.WebBaseLoader.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Migrating from MapReduceDocumentsChain"}]-->
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import CharacterTextSplitter

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
documents = loader.load()

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
split_docs = text_splitter.split_documents(documents)
print(f"Generated {len(split_docs)} documents.")
```
```output
USER_AGENT environment variable not set, consider setting it to identify your requests.
Created a chunk of size 1003, which is longer than the specified 1000
``````output
Generated 14 documents.
```
### 传统

<details open>
我们可以像之前一样调用`MapReduceDocumentsChain`：


```python
result = map_reduce_chain.invoke(split_docs)

print(result["output_text"])
```
```output
The article discusses the use of Large Language Models (LLMs) to power autonomous agents in various tasks, showcasing their capabilities in problem-solving beyond generating written content. Key components such as planning, memory optimization, and tool use are explored, with proof-of-concept demos like AutoGPT and GPT-Engineer demonstrating the potential of LLM-powered agents. Challenges include limitations in historical information retention and natural language interface reliability, while the potential of LLMs in enhancing reasoning, problem-solving, and planning proficiency for autonomous agents is highlighted. Overall, the article emphasizes the versatility and power of LLMs in creating intelligent agents for tasks like scientific discovery and experiment design.
```
考虑上述调用的[LangSmith跟踪](https://smith.langchain.com/public/d8b3311d-2220-487a-8eaf-104ef90678dd/r)。在实例化我们的`ReduceDocumentsChain`时，我们设置了`token_max`为1,000个令牌。这导致总共进行了17次LLM调用：

- 14次调用用于总结由我们的文本分割器生成的14个子文档。
- 这生成的摘要总计约为1,000 - 2,000个令牌。因为我们设置了`token_max`为1,000，所以还有两次调用来总结（或“合并”）这些摘要。
- 最后一次调用用于生成两个“合并”摘要的最终摘要。

</details>

### LangGraph

<details open>
我们可以在LangGraph中扩展我们原始的映射-减少实现，以实现相同的递归合并步骤。我们进行以下更改：

- 添加一个 `collapsed_summaries` 键到状态中以存储压缩摘要；
- 更新最终摘要节点以总结压缩摘要；
- 添加一个 `collapse_summaries` 节点，根据令牌长度（这里为1,000个令牌，如之前所述）对文档列表进行分区，并生成每个分区的摘要，将结果存储在 `collapsed_summaries` 中。

我们从 `collapse_summaries` 到自身添加一个条件边以形成循环：如果压缩摘要的总数超过 `token_max`，我们重新运行该节点。


```python
<!--IMPORTS:[{"imported": "acollapse_docs", "source": "langchain.chains.combine_documents.reduce", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.reduce.acollapse_docs.html", "title": "Migrating from MapReduceDocumentsChain"}, {"imported": "split_list_of_docs", "source": "langchain.chains.combine_documents.reduce", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.reduce.split_list_of_docs.html", "title": "Migrating from MapReduceDocumentsChain"}]-->
from typing import Literal

from langchain.chains.combine_documents.reduce import (
    acollapse_docs,
    split_list_of_docs,
)


def length_function(documents: List[Document]) -> int:
    """Get number of tokens for input contents."""
    return sum(llm.get_num_tokens(doc.page_content) for doc in documents)


token_max = 1000


class OverallState(TypedDict):
    contents: List[str]
    summaries: Annotated[list, operator.add]
    collapsed_summaries: List[Document]  # add key for collapsed summaries
    final_summary: str


# Add node to store summaries for collapsing
def collect_summaries(state: OverallState):
    return {
        "collapsed_summaries": [Document(summary) for summary in state["summaries"]]
    }


# Modify final summary to read off collapsed summaries
async def generate_final_summary(state: OverallState):
    response = await reduce_chain.ainvoke(state["collapsed_summaries"])
    return {"final_summary": response}


graph = StateGraph(OverallState)
graph.add_node("generate_summary", generate_summary)  # same as before
graph.add_node("collect_summaries", collect_summaries)
graph.add_node("generate_final_summary", generate_final_summary)


# Add node to collapse summaries
async def collapse_summaries(state: OverallState):
    doc_lists = split_list_of_docs(
        state["collapsed_summaries"], length_function, token_max
    )
    results = []
    for doc_list in doc_lists:
        results.append(await acollapse_docs(doc_list, reduce_chain.ainvoke))

    return {"collapsed_summaries": results}


graph.add_node("collapse_summaries", collapse_summaries)


def should_collapse(
    state: OverallState,
) -> Literal["collapse_summaries", "generate_final_summary"]:
    num_tokens = length_function(state["collapsed_summaries"])
    if num_tokens > token_max:
        return "collapse_summaries"
    else:
        return "generate_final_summary"


graph.add_conditional_edges(START, map_summaries, ["generate_summary"])
graph.add_edge("generate_summary", "collect_summaries")
graph.add_conditional_edges("collect_summaries", should_collapse)
graph.add_conditional_edges("collapse_summaries", should_collapse)
graph.add_edge("generate_final_summary", END)
app = graph.compile()
```

LangGraph 允许绘制图形结构以帮助可视化其功能：


```python
from IPython.display import Image

Image(app.get_graph().draw_mermaid_png())
```



![](data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAHXARsDASIAAhEBAxEB/8QAHQABAAMAAwEBAQAAAAAAAAAAAAUGBwMECAECCf/EAFcQAAEEAQIDAggHCgoJAwMFAAEAAgMEBQYRBxIhEzEIFBYiQVFWlBUXVZOV0dMyQlJTVGGBs9LUCSM3OHF1dpKhtDM0NmJygpGxsiQ1dCZEw3ODheHw/8QAGgEBAQEBAQEBAAAAAAAAAAAAAAECBAMFB//EADMRAQABAgIHBQcFAQEAAAAAAAABAhEDkRIUIVFSYdEEEzFToSNBcbHB0uEVM4Gi8EIy/9oADAMBAAIRAxEAPwD+qaIiAiIgIiICIuhmsxFhaYmfHJYle9sUNaAAyTSOPRjQSB6ySSA0AuJABIsRNU2gd9R02o8TXeWS5SlE8fevsMB/xKifI92dHballGQc4f8At0TnClEN/ueXp2p9Bc/v6kNYDyqRj0jgoW8seFxzG777Nqxgb/8ARe+jhU7Kpmfh/vo1sffKrCfLFD3pn1p5VYT5Yoe9M+tffJbC/JFD3Zn1J5LYX5Ioe7M+pPY8/Q2PnlVhPlih70z608qsJ8sUPemfWvvkthfkih7sz6k8lsL8kUPdmfUnsefobHzyqwnyxQ96Z9aeVWE+WKHvTPrX3yWwvyRQ92Z9SeS2F+SKHuzPqT2PP0Nj9RakxE7w2LKUpHH71lhhP/dSSiZNJYKZhZJhce9h6lrqsZH/AGUb5Eswn8dpmb4Hkb18RBJpS/7pi7o/+KPlI6b8wHKWjhVbImY+Ph/v4TYtCKOwmZZma0jjDJVswvMVirLtzwvHoO3QggggjoQQR3qRXjVTNM2lBERZBERAREQEREBERAREQEREBERAREQEREBERAVYrbZfX9x79nQ4etHFC0+iabd0jvVvyNiAPeOZ46bnezqsYUeJ651JXfuDajrXozt0cOQxOAPrBiG//EPWujC8K599vrEfK6x71nRdTK5ajgsbZyGSuV8fQrMMs9q1K2KKJg73Oe4gNA9ZKpQ8IThYe7iXo8//AM9V+0XOi/Pe2NjnuIa1o3JPoCxat4SsWqOHGpNVaa0hqSanRxU+Sxt29Sjjq5FrNwHRntgeXccxa/kcWgkDdW6vx84ZXJ469biLpOzZlcI4oYs5Vc+RxOwa0CTqSdgAse0Dwo1jNntXVa+lH8M9H5nT9unYwUmYjv035OZ2zbFWOMnsWBpfzbBnNu3zNxugv+h+N+Vy3BrB6tyehdTz5K3BVacfj6kEstt8kDXmeFrZy1sBJOxkcwj0gdN/tnwn9K0eHdrV9rH5ytXpZiPBX8ZJSHj9K2+RjOSSIO67dox3mF27XDl5j0Wb3NHcSc9wd0FpvKaEtNraYnpVczga+crM+H6sVZ8RMcjZABGJBFIYpSzmA2Pd1isHwK1fQ0tqLFVtEVdP1bmvsPqSljqV6u+GGkx9Xtm/dNAfGIHFzQNiXbML+9Bf9aeEVqTA624e42pw41IaudkvizRmip+OyCGEuYIv/Vhjeuz3c5Hmjp16LemO5mNcWlpI35T3hZLxr01qZ+tOHOsdNYPymk03cueNYmO3FWmlisVnRc7HylrN2O5SQSNweinDx84d0ia+W11pbD5SL+Lt461naglqzDo+J47T7prt2n84KDQEVBf4QPC6JwD+JOkGEgO2dnao6Ebg/wCk9IIKuWIzFDUGMr5HF3q2Sx9lnaQW6crZYpW/hNe0kOH5wUEJktsRrrEWWbNZlo5KE46+fJGx00TvV0a2cfn5h6lZ1WNRt8c1bpOqwEugnnyD9huAxkD4ep9HnWG/07H86s66MX/zRPL6z9Fn3CIi50EREBERAREQEREBERAREQEREBERAREQEREBQuoMTPZmp5LHiP4VolwiEri1ksT9u0icR3B3K0g9dnMYdiAQZpFqmqaJvB4IzEZylqGCQRbtmj82xTsN5ZoHfgyM9Hcdj3EdQSCCu18G1PyWD5sfUulmtLYvPyRy3K29mNpbHbgkdDPGCdyGysIe0b7HYHboFHO0PICez1LnYm778otMd/i5hP8AivbRwqtsVW+PX8LsT4x1RpBFaEEdQRGF2FVvIif2pz3z8X2SeRE/tTnvn4vsk7vD4/SVtG9aUVF1LojOeTmV+AtU5b4b8Ul8R8bnj7HxjkPZ8+0W/Lzcu+3o3XX0ZojUnklh/KfVOT8ovFI/hHxCePxfxjlHadnvFvy82+2/oTu8Pj9JLRvaEuu7H1XuLnVoXOJ3JMY3Kr3kRP7U575+L7JPIif2pz3z8X2Sd3h8fpJaN6wfBtT8lg+bH1Lq5fOUNOVojYkbG6Q8letEN5Z3fgRsHVx/MO7vOwBKihoiQjaTUudkbvvsbLG/4tYD/ipDC6TxeBmknq13OtyDlfbsyvnnePUZHku2/Nvt+ZNHCp2zVf4R9Z6SbHHgMVYbbtZfJMYzJW2tj7JjuZteFpJZGD6T5xLiO8n1AKcRF5V1TXN5SdoiIsIIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIK7xGrY65w91RBl70mMxMuLtMuXofu68JicJJG9D1a3cjoe7uXR4P08Pj+FWkaun8nNmsHDi67KORsb9pZhEYDJHbgdXDY9w7+5SOv7MNPQmpLFjEnPQRY2zJJimt5jdaInEwAbHfnHm7bH7ruK6fCm5XyPDPS1qpgHaWrTY2vJFhHs5DQaYwRCW7Dbk+522Hd3ILWiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIInVseWm0rmY8BLFBnXUpm4+WcbxssFh7Iu3B80P5Seh6ehdfQUOfr6JwUWq54LOpmUom5KaqAIn2OUdoWbADYu326D+hcfEatjrnD3VEGXvSYzEy4u0y5eh+7rwmJwkkb0PVrdyOh7u5dHg/Tw+P4VaRq6fyc2awcOLrso5Gxv2lmERgMkduB1cNj3Dv7kFwREQEREBERAREQEREBERAREQEREBERAREQEREBERARFD6h1CMKK8MMBuZC04tgrB3ICBtzPc7Y8rGgjc7HvAAJIB1TTNc6NPiJhFSTnNXk7ihhAPUbUx2/T2fVfPhzWH5Dg/epvs11arXvjOFsu6KkfDmsPyHB+9TfZp8Oaw/IcH71N9mmq174zgsu6KkfDmsPyHB+9TfZp8Oaw/IcH71N9mmq174zgsu6KkfDmsPyHB+9TfZp8Oaw/IcH71N9mmq174zgs8Hfwo3Ax2N1Di+KOMrk1skGY7Llo35Z2N2hkP8AxRt5N+4dk30uUZ/BdcFJM/r7JcSrsbmUMCx9LHu6gSW5Yy2Qg+kMieQQfxzT6F7Y4r6RzfF/h5nNH5rH4TxDKVzEZG2ZS6F4IdHI3ePbmY8NcN+m7eq6vBjQeb4I8NsLo7DU8LLVx8ZD7MliUPsSuJdJI7aPvc4np12Gw7gmq174zgs21FSPhzWH5Dg/epvs0+HNYfkOD96m+zTVa98ZwWXdFSPhzWH5Dg/epvs0+HNYfkOD96m+zTVa98ZwWXdFSPhzWH5Dg/epvs0+HNYfkOD96m+zTVa98ZwWXdFSPhzWH5Dg/epvs0+HNYD/AOxwZ/N41MP/AMaarXvjOCy7ooTTuo3Zh1irareI5OsGmauH9owtdvyvY/YczTykb7AggggembXNXRVROjV4oIiLAIiICIiAiIgIiICIiAiIgKlaiO/EbCj0DFXdvzfx1X/+v+iuqpOov5R8N/VNz9dWXZ2X9z+J+UtQk0WTceNcZbTF7RGHx+bh0nV1BlH07mo54Y5BTayCSVrGiUGMPlcwMaXggdehOyyOnxw13W0XXoVcna1Rm83rK9g8dnaVKoTLRrxFxmrROdFC5x7JwHO8t5jIRzANavSaoibMvWqLyzkeIPGDTuCfWyBv4sWdQ4bH4zN5/H0PGZWWZzFYjlhrSvjIZ5hDm8hPMR023Xc1fxl1hwfHErEXMm7WF7FV8RPhrlqpBDKH3p31yyVsXZxuDHsDh9zvvyl3pTSgemkXmevrLi9prF6ss5KDOy4mvprIXWZXUFDF15aV6KIvh7NtWaRsjHedu17NwWt85wJUrNqTVen+DGGz+e4iXxn9Sx49tOHGYKrYeyxIwvNerDyDne8Hq6Vzmt7Mu2aNwGkPQMkjIY3SSOaxjRu5zjsAPWSv0vGevNZ6u1t4N/FzD6kv5CrlNNZKtXNi1SqwWrNeQV5WMnjiMkTXDtfuoyNw1vd5wOkcTdZ630jn9JcPcJlc7nsxdp28nezlOhjn5B0McjGsYyOUw1h1lALuUkBo80klwaQ9CIs74I5XW2T03kGa5x1mnerX3xU7FyOvFPbq8rHMkljgkkjY/mL2kNdseQHYb7Lq+EBmNY4PSWOs6Q8cjAyUTctaxlJl27Wo8r+0kggeC2Rwd2e42ceUuIaSrfZcaciw7RHEy/nOIPD3HUdWs1Vp/K6dyV6e+ylHB43NDYrsY9zQ0GNzA97HMHKN992gjYVKrxP11qPUmGwdXU3wYclrvUGDfbbQglfFTqxzPiYwOZtzNEYAc4Hr1dz9xmlA9PIvJ8/EHiXp7RmuNT2dc/CTdFanGH8RkxNaNmTriWvzOnc1u7ZOWxsDFyAcg3B3O3e4i8QuIVOrxqzuK1h8G1dD3I3UMb8GV5Y52eJ15nxzPc3mLSXu25S1wLju4jlDWkPUSLA4ddak0DrrKYbVOtY72Jm0dY1GMraxsMXwZLDKyN/KyIN549pQ4MdzO8zbmO6qejOMGu6eos5isnkM1kKNrSN3P4vIZ/DVKE7JYXMAdHHC47xkSg8szQ8Fo33BKaUD1Qi82VNW8QtM8E9I8TsxrGXMRSR4rJ5rGMx1aOBlCVgFgsLY+fna2Zkrjzbbwu5Q1ruVaZwv1bldcav19fdcEmlqOSZh8TXbGwAyQMHjU3OBzODpXlg3JA7HoBud7FVxc8OduJUw9eIbv+f+OO3/AHP/AFV3VHw/8pc39UD9cVeF5dq/9x8IakREXGyIiICIiAiIgIiICIiAiIgKk6i/lHw39U3P11ZXZVbVuLtNyePzdOu646pFLWnqx7do6KQscXM373NdG3zdxuC7bchoPV2aYjE27p+UrDK/CQ0Tktc6RxlTG4nKZowZBtiWrisjUqyFoY8AltuN8MoBIIa8DY7OBBaFAaH4NZ3WXDiTC8Rpb9OSllW3dOzQ264ymKYxjRG4zVo2xdoHGXblaRyuAO/o1t2sYGHZ2KzoO3UDDWjt+kR7L55Z1/krPfQlv7NdncVzN9GV0ZVb4j6NrBVMbldTakzrq+aqZ1tzJ3I5JjNXex8bOkYY2MmMbtY1u+5O4J3XZ1LwR0zrDJ6rt5mKxfj1Ljq2MvVHyARCOB8j43R7AOa8OlJ5uY7FrSNtutg8s6/yVnvoS39mnlnX+Ss99CW/s1e4r4TRncq2K4JQUtP5/EZDWGq9RVsxjpMW92YyDJXV4Xtc0mMCNrefZx89wc47Dcld3UnB7Eak0bp7T7r2Sx50++vNjMpRmYy3WlhjMbJA4sLCSxzmkFhaQ49FOeWdf5Kz30Jb+zTyzr/JWe+hLf2adxXwyaM7lKpeDnpqDCa0xVy/mczW1fHGMq7I3BJI+VjC3tmODQWvI5Og80dmzla0Ag/cl4PuPy+Nwrbmq9UTZ7DTSS0NTeOxNyUDZGhskXOIgx0bg0btcw77b96unlnX+Ss99CW/s08s6/yVnvoS39mncV8MmjO5ANxmrNBYehi9NVG6zY0ySWMhqjUEkFkvc/m721pA4dT0AaGgAAbd3Xuaf1dxFx5qahdNoF1Wdlird0jnzYmldyva5kglqMbybOB5SHAnY9C0FT+Q4hY3FULN27TzNSnWidNPYnw9pkcUbQS5znGPYAAEknuAX4xPEnE57GVcjja2XyGPtxNmr2q2IsyRTRuG7XNcIyHAjqCE7jE4ZTRlUofBw09jcVpqvh8tnMFfwJteL5elaYbcosv57ImMkb2P7R+zju3oQOXlXNpXwd9OaRt4KzUyGYsS4fM3s5A65ZbK6Se3E+OUSOLOZzQJHEdebfYlzuu9y8s6/wAlZ76Et/Zp5Z1/krPfQlv7NO4r4V0Z3KvkuBGAymlNY6fluZJtLVOWOYuyMljEkcxMJ5YyWbBn8Qzo4OPV3Xu2/eZ4HYHOYfiFjZ7eRZBrd4kyLo5Iw6I9hHB/E7sIb5sbT5wd1J9HRWXyzr/JWe+hLf2aeWdf5Kz30Jb+zTuK+E0Z3IHVXBbTutMzPkMt41ZFjT9jTUtXtA2J9WaSN73dG8wkBibs4OAHXpvsRA0fBvxMGUjydzVOqMzkWYuzhjZyN2KQupzMDTEWiINHKWh4cAHFwHMXDor55Z1/krPfQlv7NPLOv8lZ76Et/Zp3FfCmjO5WdWaVt6a4LN0dprBv1U2PFswUVW7bjg5oOx7HtJpCACA0Au5W7nc7NUnwc4dw8J+GGnNJxPbM7GVGxzzM32lnO7pZBv186Rz3dfWpPyzr/JWe+hLf2aeWVc92KzxP9S2h/wDjTuMTx0ZXRnc7WH/lLm/qgfrirwqppXG2rOYtZ23WkoiWuyrXrTbdqGBznOe8DflLiRs3fcBoJ2JLRa1x9pmJrtHuiEkREXIgiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIKNx1/kR4hf2dyP8AlpFEeC7/ADcOGX9naP6lql+Ov8iPEL+zuR/y0iiPBd/m4cMv7O0f1LUGoIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiCjcdf5EeIX9ncj/AJaRRHgu/wA3Dhl/Z2j+papfjr/IjxC/s7kf8tIojwXf5uHDL+ztH9S1BqCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAi432Io3cr5WMPqc4BfnxyD8fH/AHwraRzIuHxyD8fH/fCeOQfj4/74S0jmRcPjkH4+P++E8cg/Hx/3wlpHMi4fHIPx8f8AfCeOQfj4/wC+EtI8Y+Gp4ZGR4RZPUvDa3oA3KmbwskdPOfC3Zh8c8Lo3P7LsD1Y/nHLz9eUHcc3SM8BzwxrvEG5ozhJV0E+OviMOIbeeblecRxV4eUSmHsRsHydmzbn6GQdTt1vn8IXwVg4t8Fpc3jgyXUWlee/AGEF0tcgeMR/3Wh49O8ew+6UT/BwcE4eGnCN+rcoyOLPaq5Z2CQgPhpN/0Le/pz7mQ7d4czfq1LSPYKLh8cg/Hx/3wnjkH4+P++EtI5kXD45B+Pj/AL4TxyD8fH/fCWkcyLh8cg/Hx/3wnjkH4+P++EtI5kXD45B+Pj/vhfplmKRwa2VjnH0BwJS0jkREUBERAREQEREBERAREQEREBERAVa15kbFHF1IK0zq0l+5FUM0Z2exrty4tOx2dytIB9BO6sqqHEb/AEWnv63h/wDCRdPZoicWmJWPFFt4faYA87T2Mld6XzVGSPcfWXOBJP5yd19+L7S3s3iPcIv2VLZLJVMNjrN+/Zip0qsbpp7E7wyOJjRu5znHoAACSSqPp/j9oLU1HJ3aOeDaWNq+O2bVypPVibB+Na+VjQ9n+80kFd/f4nHOZed6xfF9pb2bxHuEX7KfF9pb2bxHuEX7KplnwgNN53Q+ssppLJR38tgcRPkxSv1J6ziGxPfG8xytje6NxZtzN6H0FceL4rZa7q7hZipK9IV9U6ftZW65rH88csUdVzWxHm2Dd537hwcejeo67zWMTjnMvO9d/i+0t7N4j3CL9lPi+0t7N4j3CL9lV6Dj3oKzqluno9QxOyT7Rosd2EwrPsAkGFtgs7J0m4I5A8ncbbb9FyXuOmh8frA6XkzfaZptiOpJDWqTzRwzPIDI5JWMMcbySPNc4HqE7/E45zLzvTvxfaW9m8R7hF+ynxfaW9m8R7hF+yqbwy49YviPrLVmnIqV6nbw2SlpQvfRsiOeOOOJzpHSuibHG7mkcBGXcxDQ4bhwK02zZhpVpbFiVkEETDJJLI4NaxoG5JJ7gB6VYx8SfCucy870J8X2lvZvEe4Rfsp8X2lvZvEe4RfsqrY3wieH2W09lc5Vzr34nGNhfZtOx9pjQyZ/ZxPYHRgyNc7oHMDh0J32Vh1HxK03pLI2qOWyPilqriLGdmj7CR/LSgLRNLu1pB5S9vmjzjv0BTv8TjnMvO92Pi+0t7N4j3CL9lPi+0t7N4j3CL9lUxvhO8Nn2hWj1BLLZki7evDFi7b33I/w64ERNhvp3i5gACe4KTt8etB0sLgcs7Pslo55spxjq1aad9sx7c7GMYwuLwTtybc24I23B2nf4nHOZed6wfF9pb2bxHuEX7KfF9pb2bxHuEX7KqGI8JXhvnbVCClqQSuu2RSje6lZZGywXFogle6MNhlJGwjkLXHcbDqFI5TjtobCaybpW/nPFc0bEdTklqTiETSAGOMz8nZB7g5uzS/c7j1p3+JxzmXnenvi+0t7N4j3CL9lPi+0t7N4j3CL9lQ1/jXo7HaysaTkyc0uoq8sMU1Ctj7M74jK1ro3OMcbg1hD27vJ5RvsSCoLSnHjBWtD5PVebzlBmIjzNjHVJKtK3DKQ1/LHA6CVgldY23DmsYRuDsNgU7/E45zLzvXb4vtLezeI9wi/ZTyA0wAeXTuKYT98ynG0jruNiBuOoBVbHhA6AOlp9QHULG46C2yhIx1acWW2XdWQmsWdtzuHUN5NyOoGyt2ltUYzWeCq5nD2HWcfZ5uzkfC+JxLXFjgWPAc0hzSCCAeivf4k/wDc5l53pHQd6eerlKE877Rxl11Rk0ri+RzOzjlaHuPVxAlDeY7k8oJJJJNnVO4e/wCv6w/rgf5OqriuDtMRGLNuXrEE+IiIuZBERAREQEREBERAREQEREBVDiN/otPf1vD/AOEit6qPEVhNbBP+8jy0BcfVuHNH+LgP0rq7N+9SseKgeEfozK8QOCmp8HhIW2snYiikiqveGCz2c0crodz0HaNY5nXp53XoqHxP1DkOOHCjM4XB6I1RQvVPE8i6jm8YaUdrsLUUr6jXPOz3ObG4Dl3YenndV6GRe8xdHmfUuPznG7WefzOH0xmsHQg0Pk8GJM9SdRlu27RaY4Wsk2JYzkJL/ud3dCe9cmFhzc2W4EZx2mc/Tr1MLe09kGvouFjG2JGVo2SSx97Yuau89p9ztyu7iF6URTRHkDg9wyoUsLpzQms9KcRJc3jLbWTyMyF9+Bc6KUyRWmu7YQchLWP5QOYOP3PTdX3g9nMlwkdk9FZnRupbeSn1DctR5nHY11indis2XSNsyTg8rC1jwHteQ4CPoD0C9BIkU2GLcLZ7+juLPETAZLA5hrc9nnZihloqL3498LqcLSHTjzWPDoXN5XbEkt233Wt52GCxhMhFaqOyFZ9eRstRjeZ07C0gsA6blw3G3518z2AxmqcTYxeYoVspjbAAmqW4hJFIAQ4czT0OxAP6FVsRwM4dYDJ1sjjdDafoX6zxLBZrY2JkkTx3Oa4N3B/OFbTGwecJdPax1Bwx13o/TOG1VNomriac2Go6ro+LXq9mKy176UDnbOmjEUY5S7m2OzQ4hTvEi3l+J2sNU5LFaQ1PXx54Y5vGwzZDETV3T25HwlsDGOHMXnboNvO68vMASvVSLOiMNxunMpHxO4K2nYu42rj9K361uc13hlaV0dINjkdtsxx5H7NOxPK71FUrhpozPY/WHDKWzgsjWr0dSatmnfLUkYyvFM+YwvcSNmtfzDlJ2DtxtvuvU6K6I8sZ3Rmel4K8TqcWCyL79riJ4/VrspyGWaD4Wqv7aNu27mcjXO5x05QTvsCq/wAbMbrHVcevKeSxGustmoMzDNhaWJilbhm42GaGVsnmERzylrZCWu55OflDWjYFex0Umm4yfhphLdXjfxcy8+Os1qmSfiPFbc9d0bbDWU9nBjnAc3K4kEDuO4OxWI5fhvqJjK+fsYLUljF4jiHqC9cx+FknqZGSpZfIyK1XMbmSPDeYHzDu5j3bbglexkVmm48y29EaLs6HymdbpPibFYuZeo4XpfHLOahmrseYLkcc0j5WsZ2j2dW7ncgsLdita4E5TVmY4cUrOs4Z4sx207GPt1m1rE1dsrhBLNC3pHI6MNLmjuJ7h3LQEViLDo8Pf9f1h/XA/wAnVVxVQ4fMItark72S5fdp2PXarXYf8WkfoVvXh2n92fhHyhZERFyoIiICIiAiIgIiICIiAiIgLr5DH1srSmqXIWWK0zeV8bxuCP8A/eldhFYmYm8Cnu4f2mHlg1dnIIh9zHy1JOUermfA5x/pJJ/OvnkBf9s838zR/dlcUXTrOLyyjo1eVO8gL/tnm/maP7snkBf9s838zR/dlcV+ZHiONzyCQ0EkNBJ/QB1Kazicso6F5VDyAv8Atnm/maP7ss1uZqzrDK610foDiFen13p2CJ0jctj4DQimeSRHI9lZpJ2HXlPTmB67OAm6+Ty3hEaOxOU09lNT8M6MGZ7SbxrHsht5KrEdwGCTcxxyO5TuR1Ac0tIK1uKrDXlnkihjjkncHyvY0AyODQ0Fx9J5WtG59AA9Ca1icso6F5UbDcPM/FiqjMrrrJWsk2JoszU6dOGF8m3nFjHQvLW79wLifzru+QF/2zzfzNH92VxRNZxOWUdC8qd5AX/bPN/M0f3ZPIC/7Z5v5mj+7K4oms4nLKOheVO8gL/tnm/maP7suvkeHuakoWWUdcZWvddG4QS2KlOWNj9vNLmCBpcAdtwHDf1jvV5RNZxOWUdC8sAr5q/oGXRWnOJfEO1X1nqWaatWdhcdCKEsrXjkY1z67i0lr2bcxG7ubbZad5AX/bPN/M0f3ZWyerDZdE6aGOV0L+0jL2gljtiOYb9x2JG49ZWUZC9mOAGmdWajzeV1JxHxc2TFuvQrUY5beNryOHaNHLymSNhLndw5WtAA6EprOJyyjoXla/IC/wC2eb+Zo/uyeQF/2zzfzNH92VsqWW3KsNhjZGMlY17WyxujeARvs5rgC0+sEAj0rlTWcTllHQvKneQF/wBs838zR/dl+maBt77S6uzczD3sLKjN+vrbACP0FW9E1nE5ZR0Ly6mLxdXC0IaVKEQVohs1gJPedyST1JJJJJ3JJJJJK7aIuaZmZvLIiIoCIiAiIgIiICIiAiIgIiICIiAiKl8Y9Q6o0pw4y+W0ZhW6i1JW7F1XFvBIsAzMEjehBB7MvIO/QjfY9xDu8QNYWtJ6TzmRw2Gn1XmsdXbPHgqErRYnLjs0de4HZx32JIY7YOI2NdxXDp+rNX6S4i6idlsRqGhiex8m48kX0KliVp7Zxaw8sjwHFnNvykNadtwCJnR/DDTmktR5/U+OxQq6g1G+OfJ2nyvkke5rQAwFxPK0dTyt2G57u7a4ICIiAiIgIiICIiAiIgz/ACfDZmI4g5biNibGXu5yXDOpHA/CJZRuvZ50J5Heax4PM0O6NHaOJG5JMjw01rkdX6Ow2R1FgJ9HZ662QS4O9Mx0rHscWu5SPumnbmB2B5SCQFb1U9Y8LdM69zWm8vmsaLOU07b8dxltkr4pK8nTfZzSN2nYbtO4Ow3HRBbEVH4M6k1Xq3QVXJ61wTdN5+WxYbJjWgjso2zPbEepO5LA07+nfuCvCAiIgIiICIiAiIgIiICIiAiIgIiICIiAqRxqxmZzPDDOU9P6nh0ZmJWRivnLDg1lUiVhJJPraC3/AJld1mHhMeR3xHao+MDxzyQ7OHx/xDftuXt4+Tl26/d8n6N0GlVWubWhD3iV4YA54++O3euVcFHs/Eq/Y79j2beTfv5dun+C50BERAREQEREBERAREQEReEf4Ufgi/P6TxHEzHRF9rCAY7JbdSar3kxP/oZK9w//AHvzIPWXBDFZvC8OqNTUOq4da5Vs1gyZmu4OZK0zPLWgj8BpDP8AlV8X8dv4P7gvPxW4+4rKStkZhtKSR5izMzoDMx4NePf1ukaHbelsb1/YlAREQEREBERAREQEREBERAREQEREBERAVI41ZPM4bhhnLmn9MQ6zzETIzXwdhocy0TKwEEH1NJd/yq7qkcasZmczwwzlPT+p4dGZiVkYr5yw4NZVIlYSST62gt/5kFyquc6tCXsETywFzB96du5cq4qrXNrQh7xK8MAc8ffHbvXKgIiIK3mtV2K199DE48ZO3CAZ3Sz9hBDuAQ1z+VxLiDvytadhsTtu3eO8qNW+zmH+mpf3VdXTp5srqgnv+Fngn0naKID/AAAH6FOL6uhh4dqZoifDfu5TDWyEb5Uat9nMP9NS/uqeVGrfZzD/AE1L+6qSXTOZx7cu3Em9WGUdAbTaJmb25hDg0yBm/NyBxA5tttyAnsvLjOrqX5OHyo1b7OYf6al/dU8qNW+zmH+mpf3Vc2IzOP1Bjochi71bJUJwTFapzNlikAJB5XNJB6gjofQu4nsvLjOrqX5I3yo1b7OYf6al/dU8qNW+zmH+mpf3VSSJbC8uP7dS/JG+VGrfZzD/AE1L+6qL1Q/O6y05k8FltKYW3jMlWkqWYXZuXz43tLXD/Veh2Pf6FZkS2F5cf26l+TDfBi4LZjwZ9CWMDRxeIzF65bfauZN+TkhdMe6NvJ4u7ZrWgDbmPUuPTm2GweVGrfZzD/TUv7qpJEtheXH9upfkjfKjVvs5h/pqX91Tyo1b7OYf6al/dVJIlsLy4/t1L8kb5Uat9nMP9NS/uqeVGrfZzD/TUv7qpJEtheXH9upfkjfKjVvs5h/pqX91Tyo1b7OYf6al/dV2clkqeGx9i/kLUFGjWjMs9mzII4omAblznOIDQB3krnilZPEyWJ7ZI3tDmvYdw4HuIPpCey8uM6upfkj/ACo1b7OYf6al/dV+ma1y+P8A47NYOvVoN/0tihedaMQ/CcwxMPKPSRvsOuykF08y0Ow94OAcDBICCNwfNKsU4VU20IznqXjcZfi/orCaQy2qbGp8bJp/EyCG9fqTizHXkJYAx3Z8xDt5Gebtv5w9aiMtx0wVE6Dkx+OzmoqWszG7HXcNjnzwxRP7LaawTsYWATNcS4bgB3TzSF2+FOgNNaa4fY+ti8BjqFfIwQ3bkUFZjW2J3MYTJINvOduB1PqHqV6a0MaGtAa0DYADYAL5ldOjVNO5mVKxms9TX+JWd0/NomzS07QqiWrqeW7GYbsxEZ7JsI88bc793HpvGR6QqjW4z6j0HpzT9jinpmPEZXO6hiwVZmn5hcrw9q0dlLM9xBa0uEgJAO2zfWtkUFro51ujc2/SzKsmpY6cz8Yy43eF1kMPZtd1bsC7Yb7jbdYE6ih9HTZmxpPDSairw1c+6nCchDXfzxMscg7QMPpbzb7fmUwgIiICIiAsw8JjyO+I7VHxgeOeSHZw+P8AiG/bcvbx8nLt1+75P0brT1SONWTzOG4YZy5p/TEOs8xEyM18HYaHMtEysBBB9TSXf8qC4Uez8Sr9jv2PZt5N+/l26f4LnXFVc51aEvYInlgLmD707dy5UBERBQNOf+6ao/raT9VEs0zGc1jxE4v6l0lp3U/kZi9MUqctm1BQhtWbliyJHtH8cHNbG1sfXZvMST1Gy0vTn/umqP62k/VRKsa04KY3Vuqm6lp5zPaUzrqwpWLun7bIXW4GklrJWvY9ruUuds7YOG52K+ti+OXyWfFSZ8pxC1xr3V2msNrSPTbdHUqML7TMXBMcpdmr9s6SUSBwjhA5Ryx7Hcu87oFC8INey8UOMmhdV2K7atnK8N5bE0Me/K2Tx+AP5d+vLzA7b+jZX/UXg8YjO2zag1JqfCW7GOhxeRsYzIhkmUgiaWs8Zc9ji54DnDtG8r/OPnKYg4Ladx2f0llsSbmEm01Rdi6sNCflimpkN/iJmuB52Asa4dQeYb7rwtKML4f6su4DwZOGGPw+oMnh87lJbEVWrhMVDkLt0Nkmc9kbJj2bA0bOdI/zQBt0Lguzj+L2vtQ8PtI1nZiTBail1/JpTIZB2PrmaSBjLB3dD58bJCGR78hIDmnYlp2Ok1/Bm0/jcbjamKz2osQ/FZCzexVqpcjMuPbYbtNWi543DsXd/K8OIJ6EdNqvrXwbJKOH0ziNKX86+u7W0WocjdkyMZtVAa0zJp45JBu4l5Y4g85Lnu2HLuBm1UQOhqDW/FLT8/EDRuKyUmq85h4cZkqeWjx8HjwpWJXtsN7FobDJMxsT3MHKA7fuJAB6eY43Z+TA6HwOktRZPV2X1DdyEdjL1sRUhyVRlRrXSQGrO6GFk4MjAecDZocQw7hajiuAOMw2GzletqbU7c3mrENi9qY5BvwnIYduyZziPkDGjcBgZy7OcCDuumfBl0v5PQUW5LOR5eHKy5uPUsd0NybbsjQySXtAzk85gDCzk5C0AcvRW0jvcD8try9UzlbW+PvQsq2WfBl/Jw1YLVuFzAXdrHWlkjDmPBG7SA4Fp5Qd1zcfMrrHDaIgs6MbZ8aGQgGQmx9Rlu5BR3PbSV4X+bJIPN2aQehdsCQF2YMHqjh7hYKWnGya5nmmkmtXNV550EzSQ0NDTHWkby9D5oawDbpvuV1reE1lxDpux+oIjoSOF7bEGS0nqJ09l0g3HI5slNjeQhxJB5gSB09K17rCoaS4n38trLhPQx2sPKrC5rH5uW9eNCOs+1JXfXEQfHygxPj7R7HNHLuQd29wFascUdc5bNQ4mlqMY51riRf04LPiMEpiox0nyNY1pbsXNc3cOO5325uZu7TosPg36eoYnA18Zl87icphrVu5Bna1pjrssto72TKZI3Mf2h2JBZt5rdttlyad8HTTumn42SDJZq1LR1FPqZsly0yV8tuWB0LxI4s3czZxO2/NzffbdFLVDIMxr/iZpfSPFDPya7ORHD/LitFWlxFVgycIZBM4WHNYCHcs/IDF2e3Lud99hNcRtccQI8lxwu4fWJw9HQsFe7j6DMZXmbPvj47Ekcr3tLiwuDtuXZwLz5xADRqOa4EYDO6a1/hLFzJMqa0tG5kHxyxiSJ5iij2hJYQ0bQt+6DupPXu27OW4MYTMxcRY5rV9o11A2vkuzkYOxa2qKwMO7DynkG/nc3nfm6JaRn2I19qfR+tKFTVOsIshhczpK3n5LVjHxQtxUsBhLyzswC6HlmJ5XlzvMHnHcqH4R8VtZz8TcVhsxkszm8Bn8LayNG9nMLVxry+F0RD4GQuLuyc2X7mZoePNO53K1rO8FdO6lu0Z8kbdmKrgrWnTVdI0RzVbAjEnPs3m59omgFpG256d20RprwesXpzUmCzsmp9TZnI4avLSqOyl2ORgrSM5DCWNiaNhsx3MAHksbzOcBslpGPxZniFqPwPMnr/Na6fZyVrTcl3xAYag+oQ0F2z2Phdzl7W7PB83zzytGwKl9QcT9fal13l9NaSiztKlpuhQEsunsbjbJmsWK4mHai3NGGxhpaA2Ju5If5w2AWvV+C2ErcFTwwbayBwBxbsT4yZGeNdk5paXc3Jy82x7+Xb8y6Oo+AeJzWoGZzHZ/UOlMu6nHj7dvA3GQOvQxgiMTB0bmlzdzs9oa4bkA7bKaMjL9QcSOJuIuaRu61yE/DTBTYqL4QvUsXBfrMyfbuY+O28l/YROZ2Za4EAF5Bk6L0jlzviLpHd2D/8AxKz7XPAbHcQa8FLJan1RHhxRix9vFV8kBXvxMJP8dzMc4udvs57XNc4bAnotAyrQzDXGtADRXeAB6ByleuHExVF1jxSmhf8AYjT39XV/1TVOKD0L/sRp7+rq/wCqamP11pvLahs4CjqHFXc7WjM0+Mr3YpLMTA4NL3RB3M1oc5oJI23IHpXDjfuVfGSfFOIi62TtvoY23airSXJIYnyNrw7c8pAJDG7+k7bD+leSMy4G0tLady3EPTundSXc7bq6glvZKtc5nDHTWWtkFeN5aA5gA/CcQdwSD0WrKicGH2cpoanqHK6Pq6J1Jnd72VxteMCTtj5odK7la5zyxrN+Ybju3O26vaAiIgIiICpHGrGZnM8MM5T0/qeHRmYlZGK+csODWVSJWEkk+toLf+ZXdZh4THkd8R2qPjA8c8kOzh8f8Q37bl7ePk5duv3fJ+jdBpVVrm1oQ94leGAOePvjt3rlXBR7PxKv2O/Y9m3k37+Xbp/gudAREQUK61+kcxlZbFazNjshY8ajsVa75+zcWMY5j2saXDq3mDtttiQSNhvweXeJ9WR+i7X2a0RF3R2imYjTpvPxt9JavHvZ35d4n1ZH6LtfZp5d4n1ZH6LtfZrREV1jC4Jz/BsZ35d4n1ZH6LtfZp5d4n1ZH6LtfZrRETWMLgnP8Gxnfl3ifVkfou19mnl3ifVkfou19mtERNYwuCc/wbGd+XeJ9WR+i7X2aeXeJ9WR+i7X2a0RE1jC4Jz/AAbGXYbivpjUVBl7FXp8nSeXNbZp0bEsbi0kOAc2Mg7EEH84Xd8u8T6sj9F2vs10fBpyul8zwixlvRunrWlsA6xaEOMub9pG8WJBI47ud908OcOvcVqSaxhcE5/g2M78u8T6sj9F2vs08u8T6sj9F2vs1oiJrGFwTn+DYzvy7xPqyP0Xa+zTy7xPqyP0Xa+zWiImsYXBOf4NjO/LvE+rI/Rdr7NPLvE+rI/Rdr7NaIiaxhcE5/g2M78u8T6sj9F2vs1+LGofKCpNQw9O9YuWGOiY6alNBDFuNud8j2BoA3326k7dAStHRNYojbFM3+P4gvD+XvhwaL496Bs3LFzVGVzHDAu7Co7FSmCvWgJ2jgswx7dWjZokcCHdPO5jyiG/g4Is5p3UnEbXuHwcuqXYXCQY84WnKGW7L7NqNzTHzDl2aytK525B6NAB3O39VbtKvkac9S3BFaqzsMcsEzA9kjCNi1zT0II6EFZvwi8HXRnA3P6ryejqk+Mi1G6u+zju1560Doe02MII5mhxmeSC4gdA0NA2XDMzM3llz5PjdjdO+QMOcwmcxmQ1f2ccFUUXTeIzP7ICKy5m4iIdKBuenmv/AASoDiNq1nFLP5rhTpHVt/Ses8aauQvXYaMo5KrXwyOZFN0ZzObLGOhd0LgQRvtsyKAiIgIiICIiAqRxqyeZw3DDOXNP6Yh1nmImRmvg7DQ5lomVgIIPqaS7/lV3VG43Y/LZThbnq2C1TBonKvjjMOesvDI6m0rC5ziegBaHN/5kF0quc6tCXsETywFzB96du5cq62OmbYx9WVlhlpj4mubPG4ObICBs4EdCD37/AJ12UBERAREQEREBERAREQERfiaaOvE+WV7YomNLnvedmtA6kk+gIKdwgta2uaEpy8QqdKhqkyzieDHkGEMErhERs5w3MfIT17ye5XRZr4O+LoYfhVjauN1q/iFTbPZczPvl7QzkzvJbzczt+Qks7/vfQtKQEREBERAREQEREBERAREQEREBERAREQF0M9gcbqjD3MTl6NfJ4y5GYrFS1GJI5WHvDmnoV30QZhW0fqfh3mtB4DQNHB1OGlCGWpk6Fl0vjULduaOSJ+55jzAgh3UmQk797bboniJpriRjrF7TGbp5urWsSVJpKknN2crDs5rh3g9Nxv3ggjcEFWJUHX2gMzY09aj4d5ejobPWMizJWLjcbHNFdeNg9s7OhdzgNBeDzeaOqC/IqVheLeBzPE3NcP2Pts1NiKkV2eOanJHDLC8N/jInkcrmguDT179wN9jtA8LPCV0Jxm1rqrTOlMm7I29PFna2Whvi9tp3Dn13hxMjGuHKXbAEkFpc1wcQ1NERAREQEREBFlvGPwkdGcC85pPFaoszQ2dSXBUrui7MR1m8zWusWHve0RwtLxu7qdgdgdjtO664p0dC6k0ngpcXl8rkNSXDVrtxlJ0zIGt2Mk0zx0Yxgc0nrvsSQCASAkOInEXT3CnSV3Uup8gzGYioBzzOaXOc4nZrGtaCXOJ6AAKFZQ1VqnXDrc2Qw8/C63hxG3EyUXut25pfunSl+wawM2Abt1Ejg5u4BXJoXQGcwl/VVjVGq59YQ5bJeN0aVqrHHBjYWH+KijaB1I2YS7pu5ocACXF17QRemdMYnRmCp4XBY6vicTTZ2denUjDI42/mA9JO5J7ySSepUoiICIiAiIgIiICIiAiIgIiICIiAi62SutxuOtW3NLmwRPlLR6Q0E7f4LO8fpahqXHVMnnK7crkLULJpH2CXsYXNB5Y2k7MYN9gAB6zuSSenCwYxImqqbRn9YW29pqLOfi50x8hUfmQnxc6Y+QqPzIXvq+FxzlH3LsaMizn4udMfIVH5kJ8XOmPkKj8yE1fC45yj7jY0ZFnPxc6Y+QqPzIT4udMfIVH5kJq+FxzlH3GxlHh88R9b6F4VQ0NA4bLWMtnHyVrmZxlB8/wfTa3+M/jWHeKR5ewMcQfNEpBa5rSv5l+Dxxcv+D7xkweqeynbBWl7DI1Ni101V/SRux23O3nN36czWn0L+xfxc6Y+QqPzIXHNww0lYG0uncdKPU+u0pq+FxzlH3GxoGMyVXNY2pkKM7LVK3CyeCeI7tkjc0Oa4H0ggg/pXaWcM4baWjY1jMBQaxo2DWwgAD1L78XOmPkKj8yE1fC45yj7jY0ZFnPxc6Y+QqPzIT4udMfIVH5kJq+FxzlH3Gxoy4rVmGlWlsWJWQQQsMkksjg1rGgbkknuAHpWffFzpj5Co/MhPi50x8hUfmQmr4XHOUfcbH8hfCk4zW/CF425jPwCWfGNf4hh4GsJIqxuIZs3bfd5LpCPQXkepf0J/g4tVazucJruk9WaZyWIr6cfG3GZTIRTx+OwzGR5jAkGxMXKBuw7cskY5QRu/bIeF+ka42i05joh/uV2j/suX4udMfIVH5kJq+FxzlH3GxoyLOfi50x8hUfmQnxc6Y+QqPzITV8LjnKPuNjRkWc/Fzpj5Co/MhPi50x8hUfmQmr4XHOUfcbGjIs5+LnTHyFR+ZCfFzpj5Co/MhNXwuOco+42NGRZvNo3HYmtLZwtduIvxNL4Zqu7BzDrs5o6OadtiCD0/wCqvGncr8O6fxmS5QzxyrFY5R3DnYHbf4rxxcGKI0qZvHwt9ZS25IIiLlQREQEREBERAREQReqv9mMx/wDDm/8AAqvaZ/2cxX/xIv8AwCsOqv8AZjMf/Dm/8Cq9pn/ZzFf/ABIv/AL6OD+zPx+jXuUuHwhdA2tXV9M1s463mLFx1CGOvSsPiknZv2jGzCPs3Fmx5tnHl2PNtsuZ/HzQMeqvJ52oYhkvGxQ5uwm8W8Z327Dxjk7HtN+nJz82/TbfovOPD8TYbUGh9G6sGSwGmNNapnmwdi7p25DLesvknZWiltFpgG5ncd2OPaeb3EldvhdwupY7DY/h9rjTHEa9lq+RdHPPVyF84Ky3xgyx292zCBrfuXluwcHA+aSsRVMst9t+ENw+oZmxi59QCO3WvfBtk+J2DDWs8/II5pRHyREuIAL3AO9BK7es+OOiOH+XOLzmcFW8yITzRxVZrArRnfZ8zo2OELTsdjIWjYbrE9VaMz1jgNx8oRYLIy5DJanvWaFVlSQy2mF1cskiaBu8HlOzm7jzTt3Lg1Bo92l+KXESTU2n+IWao6htx38ba0bduivYjNdkTq07K8rGMe0sIDpdgWkecANk0pG5Z3jnonTucgw1rMumylinFkIKlClYuPmrSuc1krBDG/mbux25G+w2J2BBPwcdtDeWrdJuznZZx1k0mxS1J2RPsDfeJs7mCJz+h80O3/MqjoHQDNIcfJxjsNbp6do6GxuKo2JmPexgjs2CYBK7fmc1vZkjmJ25SfQsh1vR1hqHJCzm8RrvJ6jxWtK1/sKkE3wNWxkN5ro3wMYRHO7sQ09A+UOLtwACrNUwN40Hx6xeuOJOrtHspXatrCXvE4ZnUbPZ2A2Fr5HOkMQjj2c5zWtc7zg0ObuHBSOE496C1HqSHBY/UMU9+eV8FdxgmZXsyN35mQzuYIpXDY9GOceh9SoNChl8bxL4u6alxGYrHWL2WMTnq9KSSiwHHMhJkmaCI3NkiI2dsTu3bfdVDgnoPFSQaG03qXSHEatqHT7oHym/kL0mErWqrN2TRudN2Do3OZ5jYwducDlA3S8j1avP2nvCWl1VqTXlmtJXx+k9LCSFwtYLIvtzPbHGe1LmsDWtD5ADEGOk5Wl3mggr0CsS0Hp7KU8BxyjsY25BJkdRZGekySB7TajdRrta+MEee0ua4At3BII9C1NxM43wgtL43TemJNRZuvJm8tha+YbDhsfcmbYikbuZYIhG6Xk33OzhzNGxcApjNcc9EYHTWGz9nN9ticywyUJ6NSe2Z2gAkhkTHOAG433A29Oyy/gZpXNYjW3Dmxfw9+lDU4WUsdYlsVXxthtNlhLoHkgcsgAJLD5w2PRVDTFDV2m9BcPcRk8drLG6TE2bdkq+mKs7Mh25vyOqMk7MCaKF0bnuDmbA+buQ0hY0pG25rjFFPl+Fz9M2KOWwOr8hNXfdAc49kypNMDGQ4crueIA8wO3nDYHu05eQ9CaY1HpTRPCy1Z0pqD/6Y1nlHX6Dq7prkVez42I5gAT2rB4xGXPYXDq47nYr14tUzfxFKocZdH5XW82kqeXNnOwzSV5IYqsxibKxhe+LtuTsudrQSWc2427lzVOLek72mdN6hgyvPh9RWYaeLs+LSjxiWUkRt5SzmbuWnq4ADbqQskxYy+n+PXi+isLqrH4jKZezLqenlseW4hw7N3/rqtg90j3tZ5jHEO5iS1pG6pOm6moKvDbgzoOXRupGZfTGp8f8K2XYyQVIYoZZAZWzbcsjCCHBzNwB90W+maUjb7nhOcNMfYfFZ1M2AR25aEk76VkQR2Y3Oa+F8vZ8jZN2O2YXAuGxaCHAmRh49aEl01l88/PCrjMPYhq5F9ypPXkqSSvYyPtYpGNkYHGRuzi3l2JO+wJGMN0ZnviegpHBZHxwcTvhA1/E5O08W+GjJ2/Ltv2fZ+fz93L132X3jJo3PZTN8aX0sFkbcWRZpLxR0FSR4smG6503Z7Dz+RuxdtvyjbfYKaUjUZPCh4axOuMfnrLLFNoksVnYi6J4ott+2MXY84i269rtydR53UKY1bx10PoerjLOWzfJXyVbx2rNUqT2mSQbA9qTCx4azYg8zth171WrWn8hJ4QGtMh8G2XY6zoupUitdg4wyzCxbLomu22c4BzSWg77OHTqFkWAx+rsfpDhzgc9i9cwabh0ZWijx+mYZoJ35QbtfDbezlfC1rOz5Q9zI9y7mPTZW8j0PqTjZorSYwXwjm2752s+3ixUrzWjdiaIyTEImOLztKwho6kHcAgHbsUeLuk8hpnP6gjyhjxWA7QZOSzVmgfVLImyuDo3sD9+R7XDZp336bnosL4M6PzlPIeD8clgMlUfgdN5ijedbpvaKc4NaNrXOI2bzBj+Q7+e3ct3C5uNWjcha464nTVCNr9P8SWV351u/VgxkjZZHf0TQujhP/CE0ptcelJZ2WcY+aMkxyQl7SWlp2Ldx0PUfpXb4c/ye6X/AKrq/qmrguf6nP8A/pu/7Ln4c/ye6X/qur+qatYv7P8AMfKWvcsSIi+cyIiICIiAiIgIiII3UsbptOZWNgLnuqStAHpJYVW9LvEmmcQ5p3a6nCQR6RyBXZVCfQU1eVww+bs4mo4lwpiGKWKMnv5OZu7Rv97vsPQAOi7cDEpimaKpt7/9ZqPCyi43weeH2J1NHnq+nx8IxWjdi7W5YlgisEl3asgfIYmP3JPM1oIPULRlH+RWc9rJvcIfqTyKzntZN7hD9S947qPCuMp6FuaQRR/kVnPayb3CH6k8is57WTe4Q/Ul8LzI9ehbmkEUf5FZz2sm9wh+pPIrOe1k3uEP1JfC8yPXoW5pBcVqrDerTVrETJ68zDHJFI3dr2kbEEekELqeRWc9rJvcIfqTyKzntZN7hD9SXwvMj16FuamDwduFrSCOHmmQR1BGKh/ZWhqP8is57WTe4Q/UnkVnPayb3CH6k9lH/cZT0S0b0gip/EPHah0ZoDU2oINTPsT4nGWb8cMlGINe6KJzw07DfYluy6PCIaj4jcLdJ6ptakdUs5nGV78kENGIsjdJGHFrSRvsN/Sl8LzI9ei25r8s9f4PHC+R7nv4e6Zc5x3LjioSSf7quXkVnPayb3CH6k8is57WTe4Q/Unsp/7jKeiWje7VOnBj6kFWrCyvWgY2KKGJoa1jGjYNAHcAABsuZR/kVnPayb3CH6k8is57WTe4Q/Ul8LzI9ei25pBFH+RWc9rJvcIfqTyKzntZN7hD9SXwvMj16FuaQRR/kVnPayb3CH6k8is57WTe4Q/Ul8LzI9ehbmkFXqHD/T+N1jktVwY1g1FkImwWMhI98j+zaGgMZzEiNvmNJawAEjc7nqpHyKzntZN7hD9SeRWc9rJvcIfqS+FxxlPRLRvdnIPbHQsvcQ1rYnEk+gbFdrh9E6HQWmo3gtezGVmuB9BETVHx6Bnt7xZjOWcpSd0kp9hFFHMPwZOVu5b62ggEEg7gkK4LxxsSnQ0KZvtv/rr7rCIi4WRERAREQEREBERAREQEREBERAREQEREBERBRuOv8iPEL+zuR/y0iiPBd/m4cMv7O0f1LVL8df5EeIX9ncj/AJaRRHgu/wA3Dhl/Z2j+pag1BERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQUbjr/IjxC/s7kf8tIojwXf5uHDL+ztH9S1S/HX+RHiF/Z3I/wCWkUR4Lv8ANw4Zf2do/qWoNQREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARdLMZqhgKEl3JW4aVSP7qWZ4aNz3AesnuAHUnuWd3uPNBspbjsLkL0YOwnl5K7XfnAcef/q0LrweyY/aP2qZn5ZrZqKLIfj7sey8vvzP2U+Pux7Ly+/M/ZXX+lds4PWOpZ4g/hQ+CcunuIGP4l0mPfj9QNZTvk9RFbijDY+voD4mDYD0xPPpUf8AwYHCO7qbixc13K6SHD6aicyLYkNntzRPiDdu4hsT5SfSC5nrXrXjfqCpxx4YZzRuU05LWiyEQ7G220x7q0zSHRygbDflcBuNxuNxuN11PB/yNTwf+F2L0djdPSXjWL5rV82GROtzvO7pC3Y7dOVoG52a1o3OyfpXbOD1jqWeo0WQ/H3Y9l5ffmfsp8fdj2Xl9+Z+yn6V2zg9Y6lmvIsto8eab5Wtv4PIU4ydjLC5k7W/nIBDtv6AVoeEz2P1Jj2XcZbiu1XHYSRO32PpaR3gj0g7ELkxuyY/Z9uLTMR6ZlnfREXIgiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIC4rVqKlWmsTyNighYZJJHHYNaBuSf6AuVUfjVZfW4a5UMO3bvr1X/nZLPHG8fpa8j9K98DD77Fow+KYjOVjbLI9Saqta3yYyNnnjrN3NOo8bdgw+kj8Nw6k+jfYdB1jURfpuHh04VMUURaIYmbiIss4r62z1HVeD0vp2O82zdrT3rFjGwV5rDY43MaGsbYe2PqX9SdyABsOpImJiRhU6Uo1NFhp1XxDZW0zjcjNLgruQ1BJj23LVSs6axT8Vkka90bHvYyQOaR5p23YCQQS0/bfEfVGChzmmvhGLI52PUVPB0cxarMaGMswslEkkbA1rnMaXjoACeXp378+t0+MxMdbXsraGZKnJkJKDbUDr0cbZn1RIDK1jiQ15bvuGktcAe47H1LsrIdBYrKYfjlqSvls3Jn7PwBRc23LWjgdy9vP5pbGA07Hc77DoQPRudeXvhVziUzMxbbKC7uB1Hd0dlRlKHPJsNrNNp821GPvSO7nH3ru8Hp3FwPSRbropxKZori8SsTZ6ex9+vlaFa7VkE1axG2WKQffNcNwf+hXYVC4IWXTcP68Tvua1qzAz/hEz+UfoBA/Qr6vzLtGF3ONXh7pmG58RERc6CIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAoHXennaq0hlMXGWieeHeAu7hK0h0ZP5g9rVPIt0Vzh1xXT4xtHlaCUzRNc6N8T+50cg2cxw6FpHoIO4P9Cr2byWrK2QfHicBi8hSAHLPay767yduoLBXeB1/3v+i9AcQ+FkmXsy5bBdlHkJPOsVZXFsdg7AcwOx5X7D1bO6b7fdLJb1a9iZTFkcVkKEgOxE1Z5b+h7QWO/Q4r9E7P2zC7ZRE0VWn3xsv6+7mW3KWc1r3ptpPB/n31BL+6LrZXQ0/ECGhez0T9MZ/GzPNK7gMkZZYmOaA4c74Wgh3cWFhHmg7+q4fCtb8J/wA076k+Fa34T/mnfUuucLSi1czMfx0TRncrrOG1MxaeFnJ5TITYS6+/DYuWBJLLI5kjCJCW9W7SO2DeXbYbdBsurmuEGDz3lEbUl3tM1ar3nyxTBj6s8EbGRSQOA3YQGA7nfrv6DsrZ8K1vwn/NO+pPhWt+E/5p31Kzg0TFpj/Wt8jRncpFDh7d0TkredxFq7qvOXIIaU3lBkmwt7FjnuBDo4HbHd+23Lse/od95EZnXmzt9KYMHbptqCXqfdP6VZvhWt+E/wCad9SfCtb8J/zTvqUjC0dlEzEfx9YNGdyEw+U1fYyMMeT09iaNE79pYrZmSeRnQ7bMNZgO52H3Q23367bKx2Jm14HyuDnBg35WDdx/MB6SfQFyUYbeWlbHj8bfvSE7bQVXlo/pcQGgfnJC1Th9woloXIMvqBsZtwnnrUI3c7IXeh73dznj0Aea09fOPKW8vaO14XY6JnEqvO7Zf0+a6O9beHWnpdL6NxtCwALYa6awBt0lkcXvHT1FxH6FZERfneJXOLXNdXjM3PEREXmCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiD/2Q==)


如之前所述，我们可以流式传输图形以观察其步骤序列。下面，我们将简单打印出步骤的名称。

请注意，由于图中存在循环，指定执行时的 [recursion_limit](https://langchain-ai.github.io/langgraph/reference/errors/#langgraph.errors.GraphRecursionError) 可能会很有帮助。这类似于 [ReduceDocumentsChain.token_max](https://python.langchain.com/api_reference/langchain/chains/langchain.chains.combine_documents.reduce.ReduceDocumentsChain.html#langchain.chains.combine_documents.reduce.ReduceDocumentsChain.token_max)，当超过指定限制时将引发特定错误。


```python
async for step in app.astream(
    {"contents": [doc.page_content for doc in split_docs]},
    {"recursion_limit": 10},
):
    print(list(step.keys()))
```
```output
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['generate_summary']
['collect_summaries']
['collapse_summaries']
['generate_final_summary']
```

```python
print(step)
```
```output
{'generate_final_summary': {'final_summary': 'The summaries discuss the use of Large Language Models (LLMs) to power autonomous agents in various tasks such as problem-solving, planning, and tool use. Key components like planning, memory, and task decomposition are highlighted, along with challenges such as inefficient planning and hallucination. Techniques like Algorithm Distillation and Maximum Inner Product Search are explored for optimization, while frameworks like ReAct and Reflexion show improvements in knowledge-intensive tasks. The importance of accurate interpretation of user input and well-structured code for functional autonomy is emphasized, along with the potential of LLMs in prompting, reasoning, and emergent social behavior in simulation environments. Challenges in real-world scenarios and the use of LLMs with expert-designed tools for tasks like organic synthesis and drug discovery are also discussed.'}}
```
在相应的 [LangSmith 跟踪](https://smith.langchain.com/public/9d7b1d50-e1d6-44c9-9ab2-eabef621c883/r) 中，我们可以看到与之前相同的17个LLM调用，这次按各自的节点分组。

</details>

## 下一步

查看 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) 以获取有关使用 LangGraph 的详细信息，包括关于 LangGraph 中 map-reduce 细节的 [本指南](https://langchain-ai.github.io/langgraph/how-tos/map-reduce/)。

请查看[这个教程](/docs/tutorials/summarization/)以获取更多基于大型语言模型的摘要策略。
