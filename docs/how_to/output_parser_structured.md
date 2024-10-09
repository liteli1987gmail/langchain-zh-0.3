---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/output_parser_structured.ipynb
sidebar_position: 3
---
# 如何使用输出解析器将LLM响应解析为结构化格式

语言模型输出文本。但有时您希望获得比仅仅文本更结构化的信息。虽然一些大模型供应商支持[内置方式返回结构化输出](/docs/how_to/structured_output)，但并非所有都支持。

输出解析器是帮助结构化语言模型响应的类。输出解析器必须实现两个主要方法：

- "获取格式说明": 一个返回字符串的方法，包含有关语言模型输出应如何格式化的说明。
- "解析": 一个接受字符串（假定为来自语言模型的响应）并将其解析为某种结构的方法。

然后是一个可选的方法：

- "使用提示解析": 一个接受字符串（假定为来自语言模型的响应）和一个提示（假定为生成该响应的提示）并将其解析为某种结构的方法。提示主要是在输出解析器希望以某种方式重试或修复输出时提供的，并需要提示中的信息来做到这一点。

## 开始使用

下面我们将介绍主要的输出解析器类型，`PydanticOutputParser`。


```python
<!--IMPORTS:[{"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "How to use output parsers to parse an LLM response into structured format"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to use output parsers to parse an LLM response into structured format"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to use output parsers to parse an LLM response into structured format"}]-->
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field, model_validator

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @model_validator(mode="before")
    @classmethod
    def question_ends_with_question_mark(cls, values: dict) -> dict:
        setup = values["setup"]
        if setup[-1] != "?":
            raise ValueError("Badly formed question!")
        return values


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```



```output
Joke(setup='Why did the tomato turn red?', punchline='Because it saw the salad dressing!')
```


## LCEL

输出解析器实现了[运行接口](/docs/concepts#interface)，这是[LangChain表达式 (LCEL)](/docs/concepts#langchain-expression-language-lcel)的基本构建块。这意味着它们支持`invoke`、`ainvoke`、`stream`、`astream`、`batch`、`abatch`、`astream_log`调用。

输出解析器接受一个字符串或`BaseMessage`作为输入，并可以返回任意类型。


```python
parser.invoke(output)
```



```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```


我们也可以将解析器直接添加到我们的`Runnable`序列中，而不是手动调用它：


```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```



```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```


虽然所有解析器都支持流式接口，但只有某些解析器可以通过部分解析的对象进行流式处理，因为这高度依赖于输出类型。无法构建部分对象的解析器将简单地返回完全解析的输出。

例如，`SimpleJsonOutputParser`可以通过部分输出进行流式处理：


```python
<!--IMPORTS:[{"imported": "SimpleJsonOutputParser", "source": "langchain.output_parsers.json", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.json.SimpleJsonOutputParser.html", "title": "How to use output parsers to parse an LLM response into structured format"}]-->
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```


```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```



```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```


而`PydanticOutputParser`则不能：


```python
list(chain.stream({"query": "Tell me a joke."}))
```



```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```

