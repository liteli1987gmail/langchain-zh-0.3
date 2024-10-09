---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/example_selectors_length_based.ipynb
---
# 如何按长度选择示例

此示例选择器根据长度选择要使用的示例。当您担心构建的提示会超出上下文窗口的长度时，这非常有用。对于较长的输入，它将选择较少的示例进行包含，而对于较短的输入，它将选择更多的示例。


```python
<!--IMPORTS:[{"imported": "LengthBasedExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.length_based.LengthBasedExampleSelector.html", "title": "How to select examples by length"}, {"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to select examples by length"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to select examples by length"}]-->
from langchain_core.example_selectors import LengthBasedExampleSelector
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

# Examples of a pretend task of creating antonyms.
examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
    {"input": "energetic", "output": "lethargic"},
    {"input": "sunny", "output": "gloomy"},
    {"input": "windy", "output": "calm"},
]

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="Input: {input}\nOutput: {output}",
)
example_selector = LengthBasedExampleSelector(
    # The examples it has available to choose from.
    examples=examples,
    # The PromptTemplate being used to format the examples.
    example_prompt=example_prompt,
    # The maximum length that the formatted examples should be.
    # Length is measured by the get_text_length function below.
    max_length=25,
    # The function used to get the length of a string, which is used
    # to determine which examples to include. It is commented out because
    # it is provided as a default value if none is specified.
    # get_text_length: Callable[[str], int] = lambda x: len(re.split("\n| ", x))
)
dynamic_prompt = FewShotPromptTemplate(
    # We provide an ExampleSelector instead of examples.
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="Give the antonym of every input",
    suffix="Input: {adjective}\nOutput:",
    input_variables=["adjective"],
)
```


```python
# An example with small input, so it selects all examples.
print(dynamic_prompt.format(adjective="big"))
```
```output
Give the antonym of every input

Input: happy
Output: sad

Input: tall
Output: short

Input: energetic
Output: lethargic

Input: sunny
Output: gloomy

Input: windy
Output: calm

Input: big
Output:
```

```python
# An example with long input, so it selects only one example.
long_string = "big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else"
print(dynamic_prompt.format(adjective=long_string))
```
```output
Give the antonym of every input

Input: happy
Output: sad

Input: big and huge and massive and large and gigantic and tall and much much much much much bigger than everything else
Output:
```

```python
# You can add an example to an example selector as well.
new_example = {"input": "big", "output": "small"}
dynamic_prompt.example_selector.add_example(new_example)
print(dynamic_prompt.format(adjective="enthusiastic"))
```
```output
Give the antonym of every input

Input: happy
Output: sad

Input: tall
Output: short

Input: energetic
Output: lethargic

Input: sunny
Output: gloomy

Input: windy
Output: calm

Input: big
Output: small

Input: enthusiastic
Output:
```