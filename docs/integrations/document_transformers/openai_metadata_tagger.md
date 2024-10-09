---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/openai_metadata_tagger.ipynb
---
# OpenAI 元数据标记器

将摄取的文档标记为结构化元数据（例如文档的标题、语气或长度）通常是有用的，以便后续进行更有针对性的相似性搜索。然而，对于大量文档，手动执行此标记过程可能会很繁琐。

`OpenAIMetadataTagger` 文档转换器通过根据提供的模式从每个提供的文档中提取元数据来自动化此过程。它在底层使用可配置的 `OpenAI Functions` 驱动的链，因此如果您传递自定义的 LLM 实例，它必须是支持函数的 `OpenAI` 模型。

**注意：** 此文档转换器在处理完整文档时效果最佳，因此最好在进行任何其他分割或处理之前，先用完整文档运行它！

例如，假设您想要索引一组电影评论。您可以使用有效的 `JSON Schema` 对象初始化文档转换器，如下所示：


```python
<!--IMPORTS:[{"imported": "create_metadata_tagger", "source": "langchain_community.document_transformers.openai_functions", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.openai_functions.create_metadata_tagger.html", "title": "OpenAI metadata tagger"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "OpenAI metadata tagger"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "OpenAI metadata tagger"}]-->
from langchain_community.document_transformers.openai_functions import (
    create_metadata_tagger,
)
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
```


```python
schema = {
    "properties": {
        "movie_title": {"type": "string"},
        "critic": {"type": "string"},
        "tone": {"type": "string", "enum": ["positive", "negative"]},
        "rating": {
            "type": "integer",
            "description": "The number of stars the critic rated the movie",
        },
    },
    "required": ["movie_title", "critic", "tone"],
}

# Must be an OpenAI model that supports functions
llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo-0613")

document_transformer = create_metadata_tagger(metadata_schema=schema, llm=llm)
```

然后您可以简单地将文档转换器传递一个文档列表，它将从内容中提取元数据：


```python
original_documents = [
    Document(
        page_content="Review of The Bee Movie\nBy Roger Ebert\n\nThis is the greatest movie ever made. 4 out of 5 stars."
    ),
    Document(
        page_content="Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
        metadata={"reliable": False},
    ),
]

enhanced_documents = document_transformer.transform_documents(original_documents)
```


```python
import json

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```
```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```
新文档可以在加载到向量存储之前通过文本分割器进一步处理。提取的字段不会覆盖现有的元数据。

您还可以使用Pydantic模式初始化文档转换器：


```python
from typing import Literal

from pydantic import BaseModel, Field


class Properties(BaseModel):
    movie_title: str
    critic: str
    tone: Literal["positive", "negative"]
    rating: int = Field(description="Rating out of 5 stars")


document_transformer = create_metadata_tagger(Properties, llm)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```
```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Anonymous", "tone": "negative", "rating": 1, "reliable": false}
```


## 自定义

您可以在文档转换器构造函数中传递标准LLMChain参数给底层标记链。例如，如果您想让LLM关注输入文档中的特定细节，或以某种风格提取元数据，您可以传入自定义提示：


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "OpenAI metadata tagger"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    """Extract relevant information from the following text.
Anonymous critics are actually Roger Ebert.

{input}
"""
)

document_transformer = create_metadata_tagger(schema, llm, prompt=prompt)
enhanced_documents = document_transformer.transform_documents(original_documents)

print(
    *[d.page_content + "\n\n" + json.dumps(d.metadata) for d in enhanced_documents],
    sep="\n\n---------------\n\n",
)
```
```output
Review of The Bee Movie
By Roger Ebert

This is the greatest movie ever made. 4 out of 5 stars.

{"movie_title": "The Bee Movie", "critic": "Roger Ebert", "tone": "positive", "rating": 4}

---------------

Review of The Godfather
By Anonymous

This movie was super boring. 1 out of 5 stars.

{"movie_title": "The Godfather", "critic": "Roger Ebert", "tone": "negative", "rating": 1, "reliable": false}
```