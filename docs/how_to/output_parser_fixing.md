---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_fixing.ipynb
---
# 如何使用输出修复解析器

这个输出解析器包装了另一个输出解析器，如果第一个解析器失败，它会调用另一个大型语言模型来修复任何错误。

但我们可以做其他事情，而不仅仅是抛出错误。具体来说，我们可以将格式错误的输出和格式化的指令一起传递给模型，并要求它进行修复。

在这个例子中，我们将使用上面的 Pydantic 输出解析器。如果我们传递一个不符合模式的结果，会发生以下情况：


```python
<!--IMPORTS:[{"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "How to use the output-fixing parser"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to use the output-fixing parser"}]-->
from typing import List

from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```


```python
class Actor(BaseModel):
    name: str = Field(description="name of an actor")
    film_names: List[str] = Field(description="list of names of films they starred in")


actor_query = "Generate the filmography for a random actor."

parser = PydanticOutputParser(pydantic_object=Actor)
```


```python
misformatted = "{'name': 'Tom Hanks', 'film_names': ['Forrest Gump']}"
```


```python
parser.parse(misformatted)
```

```output
---------------------------------------------------------------------------
``````output
JSONDecodeError                           Traceback (most recent call last)
``````output
File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:29, in PydanticOutputParser.parse(self, text)
     28     json_str = match.group()
---> 29 json_object = json.loads(json_str, strict=False)
     30 return self.pydantic_object.parse_obj(json_object)
``````output
File ~/.pyenv/versions/3.10.1/lib/python3.10/json/__init__.py:359, in loads(s, cls, object_hook, parse_float, parse_int, parse_constant, object_pairs_hook, **kw)
    358     kw['parse_constant'] = parse_constant
--> 359 return cls(**kw).decode(s)
``````output
File ~/.pyenv/versions/3.10.1/lib/python3.10/json/decoder.py:337, in JSONDecoder.decode(self, s, _w)
    333 """Return the Python representation of ``s`` (a ``str`` instance
    334 containing a JSON document).
    335 
    336 """
--> 337 obj, end = self.raw_decode(s, idx=_w(s, 0).end())
    338 end = _w(s, end).end()
``````output
File ~/.pyenv/versions/3.10.1/lib/python3.10/json/decoder.py:353, in JSONDecoder.raw_decode(self, s, idx)
    352 try:
--> 353     obj, end = self.scan_once(s, idx)
    354 except StopIteration as err:
``````output
JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
``````output

During handling of the above exception, another exception occurred:
``````output
OutputParserException                     Traceback (most recent call last)
``````output
Cell In[4], line 1
----> 1 parser.parse(misformatted)
``````output
File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:35, in PydanticOutputParser.parse(self, text)
     33 name = self.pydantic_object.__name__
     34 msg = f"Failed to parse {name} from completion {text}. Got: {e}"
---> 35 raise OutputParserException(msg, llm_output=text)
``````output
OutputParserException: Failed to parse Actor from completion {'name': 'Tom Hanks', 'film_names': ['Forrest Gump']}. Got: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```

现在我们可以构建并使用 `OutputFixingParser`。这个输出解析器接受另一个输出解析器作为参数，同时也接受一个大型语言模型（LLM），用于尝试纠正任何格式错误。


```python
<!--IMPORTS:[{"imported": "OutputFixingParser", "source": "langchain.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.fix.OutputFixingParser.html", "title": "How to use the output-fixing parser"}]-->
from langchain.output_parsers import OutputFixingParser

new_parser = OutputFixingParser.from_llm(parser=parser, llm=ChatOpenAI())
```


```python
new_parser.parse(misformatted)
```



```output
Actor(name='Tom Hanks', film_names=['Forrest Gump'])
```


查找 [OutputFixingParser](https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.fix.OutputFixingParser.html#langchain.output_parsers.fix.OutputFixingParser) 的API文档。
