---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/fallbacks.ipynb
keywords: [LCEL, fallbacks]
---
# 如何为可运行对象添加后备方案

在使用语言模型时，您可能经常会遇到来自底层API的问题，无论是速率限制还是停机。因此，当您将大型语言模型应用程序投入生产时，保护这些问题变得越来越重要。这就是我们引入后备方案概念的原因。

**后备方案**是在紧急情况下可以使用的替代计划。

至关重要的是，后备方案不仅可以应用于大型语言模型级别，还可以应用于整个可运行对象级别。这一点很重要，因为不同的模型通常需要不同的提示词。因此，如果您对OpenAI的调用失败，您不仅想将相同的提示词发送给Anthropic - 您可能想使用不同的提示词模板并发送不同的版本。

## 针对大型语言模型API错误的后备方案

这可能是后备方案最常见的用例。对大型语言模型API的请求可能因多种原因而失败 - API可能宕机，您可能达到了速率限制，或者其他任何原因。因此，使用后备方案可以帮助防范这些类型的问题。

重要提示：默认情况下，许多大型语言模型包装器会捕获错误并重试。在使用后备方案时，您很可能希望关闭这些功能。否则，第一个包装器将不断重试而不会失败。


```python
%pip install --upgrade --quiet  langchain langchain-openai
```


```python
<!--IMPORTS:[{"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "How to add fallbacks to a runnable"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "How to add fallbacks to a runnable"}]-->
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
```

首先，让我们模拟一下如果我们遇到来自OpenAI的RateLimitError会发生什么


```python
from unittest.mock import patch

import httpx
from openai import RateLimitError

request = httpx.Request("GET", "/")
response = httpx.Response(200, request=request)
error = RateLimitError("rate limit", response=response, body="")
```


```python
# Note that we set max_retries = 0 to avoid retrying on RateLimits, etc
openai_llm = ChatOpenAI(model="gpt-4o-mini", max_retries=0)
anthropic_llm = ChatAnthropic(model="claude-3-haiku-20240307")
llm = openai_llm.with_fallbacks([anthropic_llm])
```


```python
# Let's use just the OpenAI LLm first, to show that we run into an error
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(openai_llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```
```output
Hit error
```

```python
# Now let's try with fallbacks to Anthropic
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(llm.invoke("Why did the chicken cross the road?"))
    except RateLimitError:
        print("Hit error")
```
```output
content=' I don\'t actually know why the chicken crossed the road, but here are some possible humorous answers:\n\n- To get to the other side!\n\n- It was too chicken to just stand there. \n\n- It wanted a change of scenery.\n\n- It wanted to show the possum it could be done.\n\n- It was on its way to a poultry farmers\' convention.\n\nThe joke plays on the double meaning of "the other side" - literally crossing the road to the other side, or the "other side" meaning the afterlife. So it\'s an anti-joke, with a silly or unexpected pun as the answer.' additional_kwargs={} example=False
```
我们可以像使用普通大型语言模型一样使用我们的“带回退的LLM”。


```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "How to add fallbacks to a runnable"}]-->
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
chain = prompt | llm
with patch("openai.resources.chat.completions.Completions.create", side_effect=error):
    try:
        print(chain.invoke({"animal": "kangaroo"}))
    except RateLimitError:
        print("Hit error")
```
```output
content=" I don't actually know why the kangaroo crossed the road, but I can take a guess! Here are some possible reasons:\n\n- To get to the other side (the classic joke answer!)\n\n- It was trying to find some food or water \n\n- It was trying to find a mate during mating season\n\n- It was fleeing from a predator or perceived threat\n\n- It was disoriented and crossed accidentally \n\n- It was following a herd of other kangaroos who were crossing\n\n- It wanted a change of scenery or environment \n\n- It was trying to reach a new habitat or territory\n\nThe real reason is unknown without more context, but hopefully one of those potential explanations does the joke justice! Let me know if you have any other animal jokes I can try to decipher." additional_kwargs={} example=False
```
## 序列的回退

我们还可以为序列创建回退，这些序列本身就是序列。在这里，我们使用两个不同的模型：ChatOpenAI和普通的OpenAI（不使用聊天模型）。因为OpenAI不是聊天模型，所以你可能想要一个不同的提示。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "How to add fallbacks to a runnable"}]-->
# First let's create a chain with a ChatModel
# We add in a string output parser here so the outputs between the two are the same type
from langchain_core.output_parsers import StrOutputParser

chat_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're a nice assistant who always includes a compliment in your response",
        ),
        ("human", "Why did the {animal} cross the road"),
    ]
)
# Here we're going to use a bad model name to easily create a chain that will error
chat_model = ChatOpenAI(model="gpt-fake")
bad_chain = chat_prompt | chat_model | StrOutputParser()
```


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to add fallbacks to a runnable"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "How to add fallbacks to a runnable"}]-->
# Now lets create a chain with the normal OpenAI model
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

prompt_template = """Instructions: You should always include a compliment in your response.

Question: Why did the {animal} cross the road?"""
prompt = PromptTemplate.from_template(prompt_template)
llm = OpenAI()
good_chain = prompt | llm
```


```python
# We can now create a final chain which combines the two
chain = bad_chain.with_fallbacks([good_chain])
chain.invoke({"animal": "turtle"})
```



```output
'\n\nAnswer: The turtle crossed the road to get to the other side, and I have to say he had some impressive determination.'
```


## 长输入的回退

大型语言模型的一个主要限制因素是它们的上下文窗口。通常，在将提示发送到大型语言模型之前，你可以计算和跟踪提示的长度，但在那些困难/复杂的情况下，你可以回退到一个具有更长上下文长度的模型。


```python
short_llm = ChatOpenAI()
long_llm = ChatOpenAI(model="gpt-3.5-turbo-16k")
llm = short_llm.with_fallbacks([long_llm])
```


```python
inputs = "What is the next number: " + ", ".join(["one", "two"] * 3000)
```


```python
try:
    print(short_llm.invoke(inputs))
except Exception as e:
    print(e)
```
```output
This model's maximum context length is 4097 tokens. However, your messages resulted in 12012 tokens. Please reduce the length of the messages.
```

```python
try:
    print(llm.invoke(inputs))
except Exception as e:
    print(e)
```
```output
content='The next number in the sequence is two.' additional_kwargs={} example=False
```
## 回退到更好的模型

我们经常要求模型以特定格式（如JSON）输出格式。像GPT-3.5这样的模型可以做到这一点，但有时会遇到困难。这自然指向回退 - 我们可以尝试使用GPT-3.5（更快，更便宜），但如果解析失败，我们可以使用GPT-4。


```python
<!--IMPORTS:[{"imported": "DatetimeOutputParser", "source": "langchain.output_parsers", "docs": "https://python.langchain.com/api_reference/langchain/output_parsers/langchain.output_parsers.datetime.DatetimeOutputParser.html", "title": "How to add fallbacks to a runnable"}]-->
from langchain.output_parsers import DatetimeOutputParser
```


```python
prompt = ChatPromptTemplate.from_template(
    "what time was {event} (in %Y-%m-%dT%H:%M:%S.%fZ format - only return this value)"
)
```


```python
# In this case we are going to do the fallbacks on the LLM + output parser level
# Because the error will get raised in the OutputParser
openai_35 = ChatOpenAI() | DatetimeOutputParser()
openai_4 = ChatOpenAI(model="gpt-4") | DatetimeOutputParser()
```


```python
only_35 = prompt | openai_35
fallback_4 = prompt | openai_35.with_fallbacks([openai_4])
```


```python
try:
    print(only_35.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```
```output
Error: Could not parse datetime string: The Super Bowl in 1994 took place on January 30th at 3:30 PM local time. Converting this to the specified format (%Y-%m-%dT%H:%M:%S.%fZ) results in: 1994-01-30T15:30:00.000Z
```

```python
try:
    print(fallback_4.invoke({"event": "the superbowl in 1994"}))
except Exception as e:
    print(f"Error: {e}")
```
```output
1994-01-30 15:30:00
```