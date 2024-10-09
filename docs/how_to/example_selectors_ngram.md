---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/example_selectors_ngram.ipynb
---
# 如何通过 n-gram 重叠选择示例

`NGramOverlapExampleSelector` 根据与输入的 ngram 重叠分数选择和排序示例。ngram 重叠分数是一个介于 0.0 和 1.0 之间的浮点数（包括 0.0 和 1.0）。

选择器允许设置阈值分数。ngram 重叠分数小于或等于阈值的示例将被排除。默认情况下，阈值设置为 -1.0，因此不会排除任何示例，只会重新排序。将阈值设置为 0.0 将排除与输入没有 ngram 重叠的示例。



```python
<!--IMPORTS:[{"imported": "NGramOverlapExampleSelector", "source": "langchain_community.example_selectors", "docs": "https://python.langchain.com/api_reference/community/example_selectors/langchain_community.example_selectors.ngram_overlap.NGramOverlapExampleSelector.html", "title": "How to select examples by n-gram overlap"}, {"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to select examples by n-gram overlap"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to select examples by n-gram overlap"}]-->
from langchain_community.example_selectors import NGramOverlapExampleSelector
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="Input: {input}\nOutput: {output}",
)

# Examples of a fictional translation task.
examples = [
    {"input": "See Spot run.", "output": "Ver correr a Spot."},
    {"input": "My dog barks.", "output": "Mi perro ladra."},
    {"input": "Spot can run.", "output": "Spot puede correr."},
]
```


```python
example_selector = NGramOverlapExampleSelector(
    # The examples it has available to choose from.
    examples=examples,
    # The PromptTemplate being used to format the examples.
    example_prompt=example_prompt,
    # The threshold, at which selector stops.
    # It is set to -1.0 by default.
    threshold=-1.0,
    # For negative threshold:
    # Selector sorts examples by ngram overlap score, and excludes none.
    # For threshold greater than 1.0:
    # Selector excludes all examples, and returns an empty list.
    # For threshold equal to 0.0:
    # Selector sorts examples by ngram overlap score,
    # and excludes those with no ngram overlap with input.
)
dynamic_prompt = FewShotPromptTemplate(
    # We provide an ExampleSelector instead of examples.
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="Give the Spanish translation of every input",
    suffix="Input: {sentence}\nOutput:",
    input_variables=["sentence"],
)
```


```python
# An example input with large ngram overlap with "Spot can run."
# and no overlap with "My dog barks."
print(dynamic_prompt.format(sentence="Spot can run fast."))
```
```output
Give the Spanish translation of every input

Input: Spot can run.
Output: Spot puede correr.

Input: See Spot run.
Output: Ver correr a Spot.

Input: My dog barks.
Output: Mi perro ladra.

Input: Spot can run fast.
Output:
```

```python
# You can add examples to NGramOverlapExampleSelector as well.
new_example = {"input": "Spot plays fetch.", "output": "Spot juega a buscar."}

example_selector.add_example(new_example)
print(dynamic_prompt.format(sentence="Spot can run fast."))
```
```output
Give the Spanish translation of every input

Input: Spot can run.
Output: Spot puede correr.

Input: See Spot run.
Output: Ver correr a Spot.

Input: Spot plays fetch.
Output: Spot juega a buscar.

Input: My dog barks.
Output: Mi perro ladra.

Input: Spot can run fast.
Output:
```

```python
# You can set a threshold at which examples are excluded.
# For example, setting threshold equal to 0.0
# excludes examples with no ngram overlaps with input.
# Since "My dog barks." has no ngram overlaps with "Spot can run fast."
# it is excluded.
example_selector.threshold = 0.0
print(dynamic_prompt.format(sentence="Spot can run fast."))
```
```output
Give the Spanish translation of every input

Input: Spot can run.
Output: Spot puede correr.

Input: See Spot run.
Output: Ver correr a Spot.

Input: Spot plays fetch.
Output: Spot juega a buscar.

Input: Spot can run fast.
Output:
```

```python
# Setting small nonzero threshold
example_selector.threshold = 0.09
print(dynamic_prompt.format(sentence="Spot can play fetch."))
```
```output
Give the Spanish translation of every input

Input: Spot can run.
Output: Spot puede correr.

Input: Spot plays fetch.
Output: Spot juega a buscar.

Input: Spot can play fetch.
Output:
```

```python
# Setting threshold greater than 1.0
example_selector.threshold = 1.0 + 1e-9
print(dynamic_prompt.format(sentence="Spot can play fetch."))
```
```output
Give the Spanish translation of every input

Input: Spot can play fetch.
Output:
```