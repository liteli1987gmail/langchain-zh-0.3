---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/example_selectors_similarity.ipynb
---
# 如何通过相似性选择示例

该对象根据与输入的相似性选择示例。它通过找到与输入具有最大余弦相似度的嵌入示例来实现这一点。



```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to select examples by similarity"}, {"imported": "SemanticSimilarityExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html", "title": "How to select examples by similarity"}, {"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to select examples by similarity"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to select examples by similarity"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to select examples by similarity"}]-->
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_openai import OpenAIEmbeddings

example_prompt = PromptTemplate(
    input_variables=["input", "output"],
    template="Input: {input}\nOutput: {output}",
)

# Examples of a pretend task of creating antonyms.
examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
    {"input": "energetic", "output": "lethargic"},
    {"input": "sunny", "output": "gloomy"},
    {"input": "windy", "output": "calm"},
]
```


```python
example_selector = SemanticSimilarityExampleSelector.from_examples(
    # The list of examples available to select from.
    examples,
    # The embedding class used to produce embeddings which are used to measure semantic similarity.
    OpenAIEmbeddings(),
    # The VectorStore class that is used to store the embeddings and do a similarity search over.
    Chroma,
    # The number of examples to produce.
    k=1,
)
similar_prompt = FewShotPromptTemplate(
    # We provide an ExampleSelector instead of examples.
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="Give the antonym of every input",
    suffix="Input: {adjective}\nOutput:",
    input_variables=["adjective"],
)
```


```python
# Input is a feeling, so should select the happy/sad example
print(similar_prompt.format(adjective="worried"))
```
```output
Give the antonym of every input

Input: happy
Output: sad

Input: worried
Output:
```

```python
# Input is a measurement, so should select the tall/short example
print(similar_prompt.format(adjective="large"))
```
```output
Give the antonym of every input

Input: tall
Output: short

Input: large
Output:
```

```python
# You can add new examples to the SemanticSimilarityExampleSelector as well
similar_prompt.example_selector.add_example(
    {"input": "enthusiastic", "output": "apathetic"}
)
print(similar_prompt.format(adjective="passionate"))
```
```output
Give the antonym of every input

Input: enthusiastic
Output: apathetic

Input: passionate
Output:
```