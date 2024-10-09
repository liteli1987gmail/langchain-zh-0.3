---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/upstash.ipynb
---
# Upstash 向量

> [Upstash 向量](https://upstash.com/docs/vector/overall/whatisvector) 是一个无服务器的向量数据库，旨在处理向量嵌入。
>
> 向量 LangChain 集成是对 [upstash-vector](https://github.com/upstash/vector-py) 包的封装。
>
> 该 Python 包在后台使用 [向量 REST API](https://upstash.com/docs/vector/api/get-started)。

## 安装

从 [upstash 控制台](https://console.upstash.com/vector) 创建一个免费的向量数据库，设置所需的维度和距离度量。

然后，您可以通过以下方式创建 `UpstashVectorStore` 实例：

- 提供环境变量 `UPSTASH_VECTOR_URL` 和 `UPSTASH_VECTOR_TOKEN`

- 将它们作为参数传递给构造函数

- 将一个 Upstash 向量 `Index` 实例传递给构造函数

此外，还需要一个 `Embeddings` 实例将给定文本转换为嵌入。在这里，我们使用 `OpenAIEmbeddings` 作为示例


```python
%pip install langchain-openai langchain langchain-community upstash-vector
```


```python
<!--IMPORTS:[{"imported": "UpstashVectorStore", "source": "langchain_community.vectorstores.upstash", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.upstash.UpstashVectorStore.html", "title": "Upstash Vector"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Upstash Vector"}]-->
import os

from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings

os.environ["OPENAI_API_KEY"] = "<YOUR_OPENAI_KEY>"
os.environ["UPSTASH_VECTOR_REST_URL"] = "<YOUR_UPSTASH_VECTOR_URL>"
os.environ["UPSTASH_VECTOR_REST_TOKEN"] = "<YOUR_UPSTASH_VECTOR_TOKEN>"

# Create an embeddings instance
embeddings = OpenAIEmbeddings()

# Create a vector store instance
store = UpstashVectorStore(embedding=embeddings)
```

创建 `UpstashVectorStore` 的另一种方法是通过 [选择一个模型来创建 Upstash 向量索引](https://upstash.com/docs/vector/features/embeddingmodels#using-a-model) 并传递 `embedding=True`。在这种配置中，文档或查询将作为文本发送到 Upstash，并在那里进行嵌入。

```python
store = UpstashVectorStore(embedding=True)
```

如果您有兴趣尝试这种方法，可以像上面那样更新 `store` 的初始化，并运行其余的教程。

## 加载文档

加载一个示例文本文件并将其拆分为可以转换为向量嵌入的块。


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "Upstash Vector"}, {"imported": "CharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "Upstash Vector"}]-->
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../how_to/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

docs[:3]
```



```output
[Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  \n\nLast year COVID-19 kept us apart. This year we are finally together again. \n\nTonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. \n\nWith a duty to one another to the American people to the Constitution. \n\nAnd with an unwavering resolve that freedom will always triumph over tyranny. \n\nSix days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. \n\nHe thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. \n\nHe met the Ukrainian people. \n\nFrom President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland. \n\nIn this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight. \n\nLet each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world. \n\nPlease rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people. \n\nThroughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.   \n\nThey keep moving.   \n\nAnd the costs and the threats to America and the world keep rising.   \n\nThat’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2. \n\nThe United States is a member along with 29 other nations. \n\nIt matters. American diplomacy matters. American resolve matters.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.')]
```


## 插入文档

向量存储使用嵌入对象嵌入文本块，并将它们批量插入数据库。这将返回插入向量的 ID 数组。


```python
inserted_vectors = store.add_documents(docs)

inserted_vectors[:5]
```



```output
['247aa3ae-9be9-43e2-98e4-48f94f920749',
 'c4dfc886-0a2d-497c-b2b7-d923a5cb3832',
 '0350761d-ca68-414e-b8db-7eca78cb0d18',
 '902fe5eb-8543-486a-bd5f-79858a7a8af1',
 '28875612-c672-4de4-b40a-3b658c72036a']
```


## 查询

可以使用向量或文本提示查询数据库。
如果使用文本提示，首先将其转换为嵌入，然后进行查询。

参数 `k` 指定从查询中返回多少结果。


```python
result = store.similarity_search("technology", k=5)
result
```



```output
[Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land. \n\nIt won’t look like much, but if you stop and look closely, you’ll see a “Field of dreams,” the ground on which America’s future will be built. \n\nThis is where Intel, the American company that helped build Silicon Valley, is going to build its $20 billion semiconductor “mega site”. \n\nUp to eight state-of-the-art factories in one place. 10,000 new good-paying jobs. \n\nSome of the most sophisticated manufacturing in the world to make computer chips the size of a fingertip that power the world and our everyday lives. \n\nSmartphones. The Internet. Technology we have yet to invent. \n\nBut that’s just the beginning. \n\nIntel’s CEO, Pat Gelsinger, who is here tonight, told me they are ready to increase their investment from  \n$20 billion to $100 billion. \n\nThat would be one of the biggest investments in manufacturing in American history. \n\nAnd all they’re waiting for is for you to pass this bill.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='So let’s not wait any longer. Send it to my desk. I’ll sign it.  \n\nAnd we will really take off. \n\nAnd Intel is not alone. \n\nThere’s something happening in America. \n\nJust look around and you’ll see an amazing story. \n\nThe rebirth of the pride that comes from stamping products “Made In America.” The revitalization of American manufacturing.   \n\nCompanies are choosing to build new factories here, when just a few years ago, they would have built them overseas. \n\nThat’s what is happening. Ford is investing $11 billion to build electric vehicles, creating 11,000 jobs across the country. \n\nGM is making the largest investment in its history—$7 billion to build electric vehicles, creating 4,000 jobs in Michigan. \n\nAll told, we created 369,000 new manufacturing jobs in America just last year. \n\nPowered by people I’ve met like JoJo Burgess, from generations of union steelworkers from Pittsburgh, who’s here with us tonight.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='When we use taxpayer dollars to rebuild America – we are going to Buy American: buy American products to support American jobs. \n\nThe federal government spends about $600 Billion a year to keep the country safe and secure. \n\nThere’s been a law on the books for almost a century \nto make sure taxpayers’ dollars support American jobs and businesses. \n\nEvery Administration says they’ll do it, but we are actually doing it. \n\nWe will buy American to make sure everything from the deck of an aircraft carrier to the steel on highway guardrails are made in America. \n\nBut to compete for the best jobs of the future, we also need to level the playing field with China and other competitors. \n\nThat’s why it is so important to pass the Bipartisan Innovation Act sitting in Congress that will make record investments in emerging technologies and American manufacturing. \n\nLet me give you one example of why it’s so important to pass it.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families. \n\nTo get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. \n\nIt’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.  \n\nARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more. \n\nA unity agenda for the nation. \n\nWe can do this. \n\nMy fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy. \n\nIn this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. \n\nWe have fought for freedom, expanded liberty, defeated totalitarianism and terror.'),
 Document(metadata={'source': '../../how_to/state_of_the_union.txt'}, page_content='And based on the projections, more of the country will reach that point across the next couple of weeks. \n\nThanks to the progress we have made this past year, COVID-19 need no longer control our lives.  \n\nI know some are talking about “living with COVID-19”. Tonight – I say that we will never just accept living with COVID-19. \n\nWe will continue to combat the virus as we do other diseases. And because this is a virus that mutates and spreads, we will stay on guard. \n\nHere are four common sense steps as we move forward safely.  \n\nFirst, stay protected with vaccines and treatments. We know how incredibly effective vaccines are. If you’re vaccinated and boosted you have the highest degree of protection. \n\nWe will never give up on vaccinating more Americans. Now, I know parents with kids under 5 are eager to see a vaccine authorized for their children. \n\nThe scientists are working hard to get that done and we’ll be ready with plenty of vaccines when they do.')]
```


## 使用分数查询

查询的分数可以包含在每个结果中。

> 查询请求中返回的分数是一个在0和1之间的标准化值，其中1表示最高相似度，0表示最低相似度，无论使用何种相似度函数。有关更多信息，请查看[文档](https://upstash.com/docs/vector/overall/features#vector-similarity-functions)。


```python
result = store.similarity_search_with_score("technology", k=5)

for doc, score in result:
    print(f"{doc.metadata} - {score}")
```
```output
{'source': '../../how_to/state_of_the_union.txt'} - 0.8968438
{'source': '../../how_to/state_of_the_union.txt'} - 0.8895128
{'source': '../../how_to/state_of_the_union.txt'} - 0.88626665
{'source': '../../how_to/state_of_the_union.txt'} - 0.88538057
{'source': '../../how_to/state_of_the_union.txt'} - 0.88432854
```
## 命名空间

命名空间可用于区分不同类型的文档。这可以提高查询的效率，因为搜索空间被缩小。当未提供命名空间时，将使用默认命名空间。


```python
store_books = UpstashVectorStore(embedding=embeddings, namespace="books")
```


```python
store_books.add_texts(
    [
        "A timeless tale set in the Jazz Age, this novel delves into the lives of affluent socialites, their pursuits of wealth, love, and the elusive American Dream. Amidst extravagant parties and glittering opulence, the story unravels the complexities of desire, ambition, and the consequences of obsession.",
        "Set in a small Southern town during the 1930s, this novel explores themes of racial injustice, moral growth, and empathy through the eyes of a young girl. It follows her father, a principled lawyer, as he defends a black man accused of assaulting a white woman, confronting deep-seated prejudices and challenging societal norms along the way.",
        "A chilling portrayal of a totalitarian regime, this dystopian novel offers a bleak vision of a future world dominated by surveillance, propaganda, and thought control. Through the eyes of a disillusioned protagonist, it explores the dangers of totalitarianism and the erosion of individual freedom in a society ruled by fear and oppression.",
        "Set in the English countryside during the early 19th century, this novel follows the lives of the Bennet sisters as they navigate the intricate social hierarchy of their time. Focusing on themes of marriage, class, and societal expectations, the story offers a witty and insightful commentary on the complexities of romantic relationships and the pursuit of happiness.",
        "Narrated by a disillusioned teenager, this novel follows his journey of self-discovery and rebellion against the phoniness of the adult world. Through a series of encounters and reflections, it explores themes of alienation, identity, and the search for authenticity in a society marked by conformity and hypocrisy.",
        "In a society where emotion is suppressed and individuality is forbidden, one man dares to defy the oppressive regime. Through acts of rebellion and forbidden love, he discovers the power of human connection and the importance of free will.",
        "Set in a future world devastated by environmental collapse, this novel follows a group of survivors as they struggle to survive in a harsh, unforgiving landscape. Amidst scarcity and desperation, they must confront moral dilemmas and question the nature of humanity itself.",
    ],
    [
        {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": 1925},
        {"title": "To Kill a Mockingbird", "author": "Harper Lee", "year": 1960},
        {"title": "1984", "author": "George Orwell", "year": 1949},
        {"title": "Pride and Prejudice", "author": "Jane Austen", "year": 1813},
        {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "year": 1951},
        {"title": "Brave New World", "author": "Aldous Huxley", "year": 1932},
        {"title": "The Road", "author": "Cormac McCarthy", "year": 2006},
    ],
)
```



```output
['928a5f12-900f-40b7-9406-3861741cc9d6',
 '4908670e-0b9c-455b-96b8-e0f83bc59204',
 '7083ff98-d900-4435-a67c-d9690fc555ba',
 'b910f9b1-2be0-4e0a-8b6c-93ba9b367df5',
 '7c40e950-4d2b-4293-9fb8-623a49e72607',
 '25a70e79-4905-42af-8b08-09f13bd48512',
 '695e2bcf-23d9-44d4-af26-a7b554c0c375']
```



```python
result = store_books.similarity_search("dystopia", k=3)
result
```



```output
[Document(metadata={'title': '1984', 'author': 'George Orwell', 'year': 1949}, page_content='A chilling portrayal of a totalitarian regime, this dystopian novel offers a bleak vision of a future world dominated by surveillance, propaganda, and thought control. Through the eyes of a disillusioned protagonist, it explores the dangers of totalitarianism and the erosion of individual freedom in a society ruled by fear and oppression.'),
 Document(metadata={'title': 'The Road', 'author': 'Cormac McCarthy', 'year': 2006}, page_content='Set in a future world devastated by environmental collapse, this novel follows a group of survivors as they struggle to survive in a harsh, unforgiving landscape. Amidst scarcity and desperation, they must confront moral dilemmas and question the nature of humanity itself.'),
 Document(metadata={'title': 'Brave New World', 'author': 'Aldous Huxley', 'year': 1932}, page_content='In a society where emotion is suppressed and individuality is forbidden, one man dares to defy the oppressive regime. Through acts of rebellion and forbidden love, he discovers the power of human connection and the importance of free will.')]
```


## 元数据过滤

元数据可用于过滤查询结果。您可以参考[文档](https://upstash.com/docs/vector/features/filtering)以查看更复杂的过滤方式。


```python
result = store_books.similarity_search("dystopia", k=3, filter="year < 2000")
result
```



```output
[Document(metadata={'title': '1984', 'author': 'George Orwell', 'year': 1949}, page_content='A chilling portrayal of a totalitarian regime, this dystopian novel offers a bleak vision of a future world dominated by surveillance, propaganda, and thought control. Through the eyes of a disillusioned protagonist, it explores the dangers of totalitarianism and the erosion of individual freedom in a society ruled by fear and oppression.'),
 Document(metadata={'title': 'Brave New World', 'author': 'Aldous Huxley', 'year': 1932}, page_content='In a society where emotion is suppressed and individuality is forbidden, one man dares to defy the oppressive regime. Through acts of rebellion and forbidden love, he discovers the power of human connection and the importance of free will.'),
 Document(metadata={'title': 'The Catcher in the Rye', 'author': 'J.D. Salinger', 'year': 1951}, page_content='Narrated by a disillusioned teenager, this novel follows his journey of self-discovery and rebellion against the phoniness of the adult world. Through a series of encounters and reflections, it explores themes of alienation, identity, and the search for authenticity in a society marked by conformity and hypocrisy.')]
```


## 获取向量数据库信息

您可以使用info函数获取有关数据库的信息，例如距离度量维度。

> 当插入发生时，数据库会进行索引。在此期间，无法查询新的向量。`pendingVectorCount`表示当前正在索引的向量数量。


```python
store.info()
```



```output
InfoResult(vector_count=49, pending_vector_count=0, index_size=2978163, dimension=1536, similarity_function='COSINE', namespaces={'': NamespaceInfo(vector_count=42, pending_vector_count=0), 'books': NamespaceInfo(vector_count=7, pending_vector_count=0)})
```


## 删除向量

可以通过它们的ID删除向量


```python
store.delete(inserted_vectors)
```

## 清空向量数据库

这将清空向量数据库


```python
store.delete(delete_all=True)
store_books.delete(delete_all=True)
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [操作指南](/docs/how_to/#vector-stores)
