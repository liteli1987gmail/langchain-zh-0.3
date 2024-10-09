---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_retry.ipynb
---
# 如何在解析错误发生时重试

虽然在某些情况下，仅通过查看输出就可以修复任何解析错误，但在其他情况下则不行。一个例子是当输出不仅格式不正确，而且部分完成时。考虑下面的例子。


```python
<!--IMPORTS:[{"imported": "OutputFixingParser", "source": "langchain.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.fix.OutputFixingParser.html", "title": "How to retry when a parsing error occurs"}, {"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "How to retry when a parsing error occurs"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to retry when a parsing error occurs"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to retry when a parsing error occurs"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to retry when a parsing error occurs"}]-->
from langchain.output_parsers import OutputFixingParser
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAI
from pydantic import BaseModel, Field
```


```python
template = """Based on the user question, provide an Action and Action Input for what step should be taken.
{format_instructions}
Question: {query}
Response:"""


class Action(BaseModel):
    action: str = Field(description="action to take")
    action_input: str = Field(description="input to the action")


parser = PydanticOutputParser(pydantic_object=Action)
```


```python
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
```


```python
prompt_value = prompt.format_prompt(query="who is leo di caprios gf?")
```


```python
bad_response = '{"action": "search"}'
```

如果我们尝试按原样解析此响应，将会出现错误：


```python
parser.parse(bad_response)
```

```output
---------------------------------------------------------------------------
``````output
ValidationError                           Traceback (most recent call last)
``````output
File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:30, in PydanticOutputParser.parse(self, text)
     29     json_object = json.loads(json_str, strict=False)
---> 30     return self.pydantic_object.parse_obj(json_object)
     32 except (json.JSONDecodeError, ValidationError) as e:
``````output
File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:526, in pydantic.main.BaseModel.parse_obj()
``````output
File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:341, in pydantic.main.BaseModel.__init__()
``````output
ValidationError: 1 validation error for Action
action_input
  field required (type=value_error.missing)
``````output

During handling of the above exception, another exception occurred:
``````output
OutputParserException                     Traceback (most recent call last)
``````output
Cell In[6], line 1
----> 1 parser.parse(bad_response)
``````output
File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:35, in PydanticOutputParser.parse(self, text)
     33 name = self.pydantic_object.__name__
     34 msg = f"Failed to parse {name} from completion {text}. Got: {e}"
---> 35 raise OutputParserException(msg, llm_output=text)
``````output
OutputParserException: Failed to parse Action from completion {"action": "search"}. Got: 1 validation error for Action
action_input
  field required (type=value_error.missing)
```

如果我们尝试使用 `OutputFixingParser` 来修复这个错误，它会感到困惑 - 也就是说，它不知道实际应该为 action input 放什么。


```python
fix_parser = OutputFixingParser.from_llm(parser=parser, llm=ChatOpenAI())
```


```python
fix_parser.parse(bad_response)
```



```output
Action(action='search', action_input='input')
```


相反，我们可以使用 RetryOutputParser，它将提示（以及原始输出）传入，以再次尝试获得更好的响应。


```python
<!--IMPORTS:[{"imported": "RetryOutputParser", "source": "langchain.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.retry.RetryOutputParser.html", "title": "How to retry when a parsing error occurs"}]-->
from langchain.output_parsers import RetryOutputParser
```


```python
retry_parser = RetryOutputParser.from_llm(parser=parser, llm=OpenAI(temperature=0))
```


```python
retry_parser.parse_with_prompt(bad_response, prompt_value)
```



```output
Action(action='search', action_input='leo di caprio girlfriend')
```


我们还可以通过自定义链轻松添加 RetryOutputParser，该链将原始 LLM/ChatModel 输出转换为更可用的格式。


```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "How to retry when a parsing error occurs"}, {"imported": "RunnableParallel", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.base.RunnableParallel.html", "title": "How to retry when a parsing error occurs"}]-->
from langchain_core.runnables import RunnableLambda, RunnableParallel

completion_chain = prompt | OpenAI(temperature=0)

main_chain = RunnableParallel(
    completion=completion_chain, prompt_value=prompt
) | RunnableLambda(lambda x: retry_parser.parse_with_prompt(**x))


main_chain.invoke({"query": "who is leo di caprios gf?"})
```
```output
Action(action='search', action_input='leo di caprio girlfriend')
```
查找 [RetryOutputParser](https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.retry.RetryOutputParser.html#langchain.output_parsers.retry.RetryOutputParser) 的 API 文档。
