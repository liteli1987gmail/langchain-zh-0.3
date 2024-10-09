---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/query_constructing_filters.ipynb
sidebar_position: 6
---
# 如何构建查询分析的过滤器

我们可能希望进行查询分析，以提取过滤器并传递给检索器。我们要求大型语言模型（LLM）表示这些过滤器的一种方式是将其作为Pydantic模型表示。然后就出现了将该Pydantic模型转换为可以传递给检索器的过滤器的问题。

这可以手动完成，但LangChain还提供了一些“翻译器”，能够将通用语法转换为特定于每个检索器的过滤器。在这里，我们将介绍如何使用这些翻译器。


```python
<!--IMPORTS:[{"imported": "Comparator", "source": "langchain.chains.query_constructor.ir", "docs": "https://python.langchain.com/api_reference/core/structured_query/langchain_core.structured_query.Comparator.html", "title": "How to construct filters for query analysis"}, {"imported": "Comparison", "source": "langchain.chains.query_constructor.ir", "docs": "https://python.langchain.com/api_reference/core/structured_query/langchain_core.structured_query.Comparison.html", "title": "How to construct filters for query analysis"}, {"imported": "Operation", "source": "langchain.chains.query_constructor.ir", "docs": "https://python.langchain.com/api_reference/core/structured_query/langchain_core.structured_query.Operation.html", "title": "How to construct filters for query analysis"}, {"imported": "Operator", "source": "langchain.chains.query_constructor.ir", "docs": "https://python.langchain.com/api_reference/core/structured_query/langchain_core.structured_query.Operator.html", "title": "How to construct filters for query analysis"}, {"imported": "StructuredQuery", "source": "langchain.chains.query_constructor.ir", "docs": "https://python.langchain.com/api_reference/core/structured_query/langchain_core.structured_query.StructuredQuery.html", "title": "How to construct filters for query analysis"}, {"imported": "ChromaTranslator", "source": "langchain_community.query_constructors.chroma", "docs": "https://python.langchain.com/api_reference/community/query_constructors/langchain_community.query_constructors.chroma.ChromaTranslator.html", "title": "How to construct filters for query analysis"}, {"imported": "ElasticsearchTranslator", "source": "langchain_community.query_constructors.elasticsearch", "docs": "https://python.langchain.com/api_reference/community/query_constructors/langchain_community.query_constructors.elasticsearch.ElasticsearchTranslator.html", "title": "How to construct filters for query analysis"}]-->
from typing import Optional

from langchain.chains.query_constructor.ir import (
    Comparator,
    Comparison,
    Operation,
    Operator,
    StructuredQuery,
)
from langchain_community.query_constructors.chroma import ChromaTranslator
from langchain_community.query_constructors.elasticsearch import ElasticsearchTranslator
from pydantic import BaseModel
```

在这个例子中，`year` 和 `author` 都是用于过滤的属性。


```python
class Search(BaseModel):
    query: str
    start_year: Optional[int]
    author: Optional[str]
```


```python
search_query = Search(query="RAG", start_year=2022, author="LangChain")
```


```python
def construct_comparisons(query: Search):
    comparisons = []
    if query.start_year is not None:
        comparisons.append(
            Comparison(
                comparator=Comparator.GT,
                attribute="start_year",
                value=query.start_year,
            )
        )
    if query.author is not None:
        comparisons.append(
            Comparison(
                comparator=Comparator.EQ,
                attribute="author",
                value=query.author,
            )
        )
    return comparisons
```


```python
comparisons = construct_comparisons(search_query)
```


```python
_filter = Operation(operator=Operator.AND, arguments=comparisons)
```


```python
ElasticsearchTranslator().visit_operation(_filter)
```



```output
{'bool': {'must': [{'range': {'metadata.start_year': {'gt': 2022}}},
   {'term': {'metadata.author.keyword': 'LangChain'}}]}}
```



```python
ChromaTranslator().visit_operation(_filter)
```



```output
{'$and': [{'start_year': {'$gt': 2022}}, {'author': {'$eq': 'LangChain'}}]}
```

