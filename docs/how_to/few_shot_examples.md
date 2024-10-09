---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/few_shot_examples.ipynb
sidebar_position: 3
---
# 如何使用少量示例

:::info Prerequisites

本指南假设您熟悉以下概念：
- [提示词模板](/docs/concepts/#prompt-templates)
- [示例选择器](/docs/concepts/#example-selectors)
- [大型语言模型](/docs/concepts/#llms)
- [向量存储](/docs/concepts/#vector-stores)

:::

在本指南中，我们将学习如何创建一个简单的提示词模板，在生成时为模型提供示例输入和输出。为大型语言模型提供少量这样的示例称为少量示例提示，这是引导生成的一种简单而强大的方法，在某些情况下可以显著提高模型性能。

少量示例提示模板可以从一组示例构建，也可以从负责从定义的集合中选择子集的 [示例选择器](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.base.BaseExampleSelector.html) 类构建。

本指南将涵盖使用字符串提示模板的少量示例提示。有关使用聊天模型的聊天消息进行少量示例提示的指南，请参见 [这里](/docs/how_to/few_shot_examples_chat/)。

## 为少量示例创建格式化器

配置一个格式化器，将少量示例格式化为字符串。该格式化器应为 `PromptTemplate` 对象。


```python
<!--IMPORTS:[{"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "How to use few shot examples"}]-->
from langchain_core.prompts import PromptTemplate

example_prompt = PromptTemplate.from_template("Question: {question}\n{answer}")
```

## 创建示例集

接下来，我们将创建一个少量示例的列表。每个示例应该是一个字典，表示我们上面定义的格式化提示的示例输入。


```python
examples = [
    {
        "question": "Who lived longer, Muhammad Ali or Alan Turing?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali
""",
    },
    {
        "question": "When was the founder of craigslist born?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952
""",
    },
    {
        "question": "Who was the maternal grandfather of George Washington?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball
""",
    },
    {
        "question": "Are both the directors of Jaws and Casino Royale from the same country?",
        "answer": """
Are follow up questions needed here: Yes.
Follow up: Who is the director of Jaws?
Intermediate Answer: The director of Jaws is Steven Spielberg.
Follow up: Where is Steven Spielberg from?
Intermediate Answer: The United States.
Follow up: Who is the director of Casino Royale?
Intermediate Answer: The director of Casino Royale is Martin Campbell.
Follow up: Where is Martin Campbell from?
Intermediate Answer: New Zealand.
So the final answer is: No
""",
    },
]
```

让我们用我们的一个示例来测试格式化提示：


```python
print(example_prompt.invoke(examples[0]).to_string())
```
```output
Question: Who lived longer, Muhammad Ali or Alan Turing?

Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali
```
### 将示例和格式化器传递给 `FewShotPromptTemplate`

最后，创建一个 [`FewShotPromptTemplate`](https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html) 对象。该对象接受少量示例和少量示例的格式化器。当这个 `FewShotPromptTemplate` 被格式化时，它使用 `example_prompt` 格式化传递的示例，然后将它们添加到最终提示的 `suffix` 之前：


```python
<!--IMPORTS:[{"imported": "FewShotPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "How to use few shot examples"}]-->
from langchain_core.prompts import FewShotPromptTemplate

prompt = FewShotPromptTemplate(
    examples=examples,
    example_prompt=example_prompt,
    suffix="Question: {input}",
    input_variables=["input"],
)

print(
    prompt.invoke({"input": "Who was the father of Mary Ball Washington?"}).to_string()
)
```
```output
Question: Who lived longer, Muhammad Ali or Alan Turing?

Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali


Question: When was the founder of craigslist born?

Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952


Question: Who was the maternal grandfather of George Washington?

Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball


Question: Are both the directors of Jaws and Casino Royale from the same country?

Are follow up questions needed here: Yes.
Follow up: Who is the director of Jaws?
Intermediate Answer: The director of Jaws is Steven Spielberg.
Follow up: Where is Steven Spielberg from?
Intermediate Answer: The United States.
Follow up: Who is the director of Casino Royale?
Intermediate Answer: The director of Casino Royale is Martin Campbell.
Follow up: Where is Martin Campbell from?
Intermediate Answer: New Zealand.
So the final answer is: No


Question: Who was the father of Mary Ball Washington?
```
通过向模型提供这样的示例，我们可以引导模型产生更好的响应。

## 使用示例选择器

我们将重用上一节的示例集和格式化器。然而，我们将不直接将示例输入到 `FewShotPromptTemplate` 对象中，而是将它们输入到一个名为 [`SemanticSimilarityExampleSelector`](https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html) 的 `ExampleSelector` 实现实例中。该类根据输入与初始集中的少量示例的相似性选择少量示例。它使用嵌入模型计算输入与少量示例之间的相似性，并使用向量存储执行最近邻搜索。

为了展示它的样子，让我们初始化一个实例并单独调用它：


```python
<!--IMPORTS:[{"imported": "Chroma", "source": "langchain_chroma", "docs": "https://python.langchain.com/api_reference/chroma/vectorstores/langchain_chroma.vectorstores.Chroma.html", "title": "How to use few shot examples"}, {"imported": "SemanticSimilarityExampleSelector", "source": "langchain_core.example_selectors", "docs": "https://python.langchain.com/api_reference/core/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html", "title": "How to use few shot examples"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "How to use few shot examples"}]-->
from langchain_chroma import Chroma
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    # This is the list of examples available to select from.
    examples,
    # This is the embedding class used to produce embeddings which are used to measure semantic similarity.
    OpenAIEmbeddings(),
    # This is the VectorStore class that is used to store the embeddings and do a similarity search over.
    Chroma,
    # This is the number of examples to produce.
    k=1,
)

# Select the most similar example to the input.
question = "Who was the father of Mary Ball Washington?"
selected_examples = example_selector.select_examples({"question": question})
print(f"Examples most similar to the input: {question}")
for example in selected_examples:
    print("\n")
    for k, v in example.items():
        print(f"{k}: {v}")
```
```output
Examples most similar to the input: Who was the father of Mary Ball Washington?


answer: 
Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball

question: Who was the maternal grandfather of George Washington?
```
现在，让我们创建一个 `FewShotPromptTemplate` 对象。该对象接受示例选择器和少量示例的格式化提示。


```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    suffix="Question: {input}",
    input_variables=["input"],
)

print(
    prompt.invoke({"input": "Who was the father of Mary Ball Washington?"}).to_string()
)
```
```output
Question: Who was the maternal grandfather of George Washington?

Are follow up questions needed here: Yes.
Follow up: Who was the mother of George Washington?
Intermediate answer: The mother of George Washington was Mary Ball Washington.
Follow up: Who was the father of Mary Ball Washington?
Intermediate answer: The father of Mary Ball Washington was Joseph Ball.
So the final answer is: Joseph Ball


Question: Who was the father of Mary Ball Washington?
```
## 下一步

您现在已经学习了如何在提示词中添加少量示例。

接下来，请查看本节中关于提示词模板的其他使用指南，相关的关于[使用聊天模型进行少量示例提示](/docs/how_to/few_shot_examples_chat)的使用指南，或其他[示例选择器使用指南](/docs/how_to/example_selectors/)。
