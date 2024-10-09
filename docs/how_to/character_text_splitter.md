---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/character_text_splitter.ipynb
keywords: [charactertextsplitter]
---
# 如何按字符分割

这是最简单的方法。它基于给定的字符序列进行分割，默认值为`"\n\n"`。块长度以字符数来衡量。

1. 文本是如何分割的：按单个字符分隔符。
2. 块大小是如何衡量的：按字符数。

要直接获取字符串内容，请使用`.split_text`。

要创建LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 对象（例如，用于下游任务），请使用`.create_documents`。


```python
%pip install -qU langchain-text-splitters
```


```python
<!--IMPORTS:[{"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "How to split by character"}]-->
from langchain_text_splitters import CharacterTextSplitter

# Load an example document
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()

text_splitter = CharacterTextSplitter(
    separator="\n\n",
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)
texts = text_splitter.create_documents([state_of_the_union])
print(texts[0])
```
```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.'
```
使用 `.create_documents` 将与每个文档相关的元数据传播到输出块：


```python
metadatas = [{"document": 1}, {"document": 2}]
documents = text_splitter.create_documents(
    [state_of_the_union, state_of_the_union], metadatas=metadatas
)
print(documents[0])
```
```output
page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.' metadata={'document': 1}
```
使用 `.split_text` 直接获取字符串内容：


```python
text_splitter.split_text(state_of_the_union)[0]
```



```output
'Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.'
```

