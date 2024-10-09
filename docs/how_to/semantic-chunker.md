---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/semantic-chunker.ipynb
---
# 如何根据语义相似性分割文本

摘自 Greg Kamradt 的精彩笔记本：
[5_Levels_Of_Text_Splitting](https://github.com/FullStackRetrieval-com/RetrievalTutorials/blob/main/tutorials/LevelsOfTextSplitting/5_Levels_Of_Text_Splitting.ipynb)

所有荣誉归于他。

本指南涵盖如何根据语义相似性分割块。如果嵌入足够远离，则会进行分割。

从高层次来看，这将文本分割为句子，然后分组为 3 个句子一组。
然后合并在嵌入空间中相似的句子。

## 安装依赖


```python
!pip install --quiet langchain_experimental langchain_openai
```

## 加载示例数据


```python
# This is a long document we can split up.
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
```

## 创建文本分割器

要实例化一个 [SemanticChunker](https://python.langchain.com/api_reference/experimental/text_splitter/langchain_experimental.text_splitter.SemanticChunker.html)，我们必须指定一个嵌入模型。下面我们将使用 [OpenAIEmbeddings](https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.openai.OpenAIEmbeddings.html)。


```python
<!--IMPORTS:[{"imported": "SemanticChunker", "source": "langchain_experimental.text_splitter", "docs": "https://python.langchain.com/api_reference/experimental/text_splitter/langchain_experimental.text_splitter.SemanticChunker.html", "title": "How to split text based on semantic similarity"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai.embeddings", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to split text based on semantic similarity"}]-->
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai.embeddings import OpenAIEmbeddings

text_splitter = SemanticChunker(OpenAIEmbeddings())
```

## 分割文本

我们以通常的方式分割文本，例如，通过调用 `.create_documents` 来创建 LangChain [文档](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html) 对象：


```python
docs = text_splitter.create_documents([state_of_the_union])
print(docs[0].page_content)
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans. Last year COVID-19 kept us apart. This year we are finally together again. Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. With a duty to one another to the American people to the Constitution. And with an unwavering resolve that freedom will always triumph over tyranny. Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos. They keep moving.
```
## 断点

这个分割器通过确定何时“断开”句子来工作。这是通过查看任何两个句子之间的嵌入差异来完成的。当该差异超过某个阈值时，它们就会被分割。

有几种方法可以确定该阈值，这些方法由 `breakpoint_threshold_type` 关键字参数控制。

### 百分位

默认的分割方式是基于百分位。在这种方法中，计算句子之间的所有差异，然后将任何大于 X 百分位的差异进行分割。


```python
text_splitter = SemanticChunker(
    OpenAIEmbeddings(), breakpoint_threshold_type="percentile"
)
```


```python
docs = text_splitter.create_documents([state_of_the_union])
print(docs[0].page_content)
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans. Last year COVID-19 kept us apart. This year we are finally together again. Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. With a duty to one another to the American people to the Constitution. And with an unwavering resolve that freedom will always triumph over tyranny. Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos. They keep moving.
```

```python
print(len(docs))
```
```output
26
```
### 标准差

在此方法中，任何大于 X 个标准差的差异都会被拆分。


```python
text_splitter = SemanticChunker(
    OpenAIEmbeddings(), breakpoint_threshold_type="standard_deviation"
)
```


```python
docs = text_splitter.create_documents([state_of_the_union])
print(docs[0].page_content)
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans. Last year COVID-19 kept us apart. This year we are finally together again. Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. With a duty to one another to the American people to the Constitution. And with an unwavering resolve that freedom will always triumph over tyranny. Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos. They keep moving. And the costs and the threats to America and the world keep rising. That’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. The United States is a member along with 29 other nations. It matters. American diplomacy matters. American resolve matters. Putin’s latest attack on Ukraine was premeditated and unprovoked. He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready. Here is what we did. We prepared extensively and carefully. We spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. I spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression. We countered Russia’s lies with truth. And now that he has acted the free world is holding him accountable. Along with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland. We are inflicting pain on Russia and supporting the people of Ukraine. Putin is now isolated from the world more than ever. Together with our allies –we are right now enforcing powerful economic sanctions. We are cutting off Russia’s largest banks from the international financial system. Preventing Russia’s central bank from defending the Russian Ruble making Putin’s $630 Billion “war fund” worthless. We are choking off Russia’s access to technology that will sap its economic strength and weaken its military for years to come. Tonight I say to the Russian oligarchs and corrupt leaders who have bilked billions of dollars off this violent regime no more. The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value. The Russian stock market has lost 40% of its value and trading remains suspended. Russia’s economy is reeling and Putin alone is to blame. Together with our allies we are providing support to the Ukrainians in their fight for freedom. Military assistance. Economic assistance. Humanitarian assistance. We are giving more than $1 Billion in direct assistance to Ukraine. And we will continue to aid the Ukrainian people as they defend their country and to help ease their suffering. Let me be clear, our forces are not engaged and will not engage in conflict with Russian forces in Ukraine. Our forces are not going to Europe to fight in Ukraine, but to defend our NATO Allies – in the event that Putin decides to keep moving west. For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to protect NATO countries including Poland, Romania, Latvia, Lithuania, and Estonia. As I have made crystal clear the United States and our Allies will defend every inch of territory of NATO countries with the full force of our collective power. And we remain clear-eyed. The Ukrainians are fighting back with pure courage. But the next few days weeks, months, will be hard on them. Putin has unleashed violence and chaos. But while he may make gains on the battlefield – he will pay a continuing high price over the long run. And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards. To all Americans, I will be honest with you, as I’ve always promised. A Russian dictator, invading a foreign country, has costs around the world. And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers. Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world. America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies. These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.
```

```python
print(len(docs))
```
```output
4
```
### 四分位数

在此方法中，使用四分位距来拆分块。


```python
text_splitter = SemanticChunker(
    OpenAIEmbeddings(), breakpoint_threshold_type="interquartile"
)
```


```python
docs = text_splitter.create_documents([state_of_the_union])
print(docs[0].page_content)
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans. Last year COVID-19 kept us apart. This year we are finally together again. Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. With a duty to one another to the American people to the Constitution. And with an unwavering resolve that freedom will always triumph over tyranny. Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. He met the Ukrainian people. From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos. They keep moving.
```

```python
print(len(docs))
```
```output
25
```
### 梯度

在此方法中，使用距离的梯度与百分位法一起拆分块。
当块之间高度相关或特定于某个领域（例如法律或医学）时，此方法非常有用。其思想是对梯度数组应用异常检测，以便分布变得更宽，从而更容易识别高度语义数据中的边界。


```python
text_splitter = SemanticChunker(
    OpenAIEmbeddings(), breakpoint_threshold_type="gradient"
)
```


```python
docs = text_splitter.create_documents([state_of_the_union])
print(docs[0].page_content)
```
```output
Madam Speaker, Madam Vice President, our First Lady and Second Gentleman.
```

```python
print(len(docs))
```
```output
26
```