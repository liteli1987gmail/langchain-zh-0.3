---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/vectorstores/vlite.ipynb
---
# vlite

VLite 是一个简单且快速的向量数据库，允许您使用嵌入语义地存储和检索数据。Vlite 使用 numpy 制作，是一个轻量级的全功能数据库，可将 RAG、相似性搜索和嵌入集成到您的项目中。

您需要使用 `pip install -qU langchain-community` 安装 `langchain-community` 才能使用此集成。

## 安装

要在 LangChain 中使用 VLite，您需要安装 `vlite` 包：

```bash
!pip install vlite
```

## 导入 VLite

```python
<!--IMPORTS:[{"imported": "VLite", "source": "langchain_community.vectorstores", "docs": "https://python.langchain.com/api_reference/community/vectorstores/langchain_community.vectorstores.vlite.VLite.html", "title": "vlite"}]-->
from langchain_community.vectorstores import VLite
```

## 基本示例

在这个基本示例中，我们加载一个文本文档，并将其存储在 VLite 向量数据库中。然后，我们执行相似性搜索，以根据查询检索相关文档。

VLite 为您处理文本的分块和嵌入，您可以通过预先分块文本和/或将这些块嵌入 VLite 数据库来更改这些参数。

```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "vlite"}, {"imported": "CharacterTextSplitter", "source": "langchain.text_splitter", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.CharacterTextSplitter.html", "title": "vlite"}]-->
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Load the document and split it into chunks
loader = TextLoader("path/to/document.txt")
documents = loader.load()

# Create a VLite instance
vlite = VLite(collection="my_collection")

# Add documents to the VLite vector database
vlite.add_documents(documents)

# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query)

# Print the most relevant document
print(docs[0].page_content)
```

## 添加文本和文档

您可以使用 `add_texts` 和 `add_documents` 方法分别将文本或文档添加到 VLite 向量数据库中。

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## 相似性搜索

VLite 提供了对存储文档执行相似性搜索的方法。

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## 最大边际相关性搜索

VLite 还支持最大边际相关性 (MMR) 搜索，该搜索优化了与查询的相似性和检索文档之间的多样性。

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## 更新和删除文档

您可以使用 `update_document` 和 `delete` 方法在 VLite 向量数据库中更新或删除文档。

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## 检索文档

您可以使用 `get` 方法根据文档的 ID 或元数据从 VLite 向量数据库中检索文档。

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## 创建 VLite 实例

您可以使用各种方法创建 VLite 实例：

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## 其他功能

VLite 提供了管理向量数据库的其他功能：

```python
from langchain.vectorstores import VLite
vlite = VLite(collection="my_collection")

# Get the number of items in the collection
count = vlite.count()

# Save the collection
vlite.save()

# Clear the collection
vlite.clear()

# Get collection information
vlite.info()

# Dump the collection data
data = vlite.dump()
```


## 相关

- 向量存储 [概念指南](/docs/concepts/#vector-stores)
- 向量存储 [使用指南](/docs/how_to/#vector-stores)
