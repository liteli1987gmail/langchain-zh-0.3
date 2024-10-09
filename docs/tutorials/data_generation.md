---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/tutorials/data_generation.ipynb
sidebar_class_name: hidden
---
[![在 Colab 中打开](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/data_generation.ipynb)

# 生成合成数据

合成数据是人工生成的数据，而不是从现实世界事件中收集的数据。它用于模拟真实数据，而不影响隐私或遇到现实世界的限制。

合成数据的好处：

1. **隐私和安全**：没有真实个人数据面临泄露风险。
2. **数据增强**：扩展机器学习的数据集。
3. **灵活性**：创建特定或稀有场景。
4. **成本效益**：通常比现实世界的数据收集更便宜。
5. **合规性**：帮助应对严格的数据保护法律。
6. **模型鲁棒性**：可以导致更好的通用化AI模型。
7. **快速原型开发**: 允许在没有真实数据的情况下进行快速测试。
8. **受控实验**: 模拟特定条件。
9. **数据访问**: 当真实数据不可用时的替代方案。

注意: 尽管有好处，合成数据应谨慎使用，因为它可能无法始终捕捉现实世界的复杂性。

## 快速入门

在这个笔记本中，我们将深入探讨如何使用LangChain库生成合成医疗账单记录。这个工具在您想要开发或测试算法但由于隐私问题或数据可用性问题不想使用真实患者数据时特别有用。

### 设置
首先，您需要安装LangChain库及其依赖项。由于我们使用的是OpenAI生成器链，因此我们也将安装它。由于这是一个实验性库，我们需要在安装中包含`langchain_experimental`。然后我们将导入必要的模块。


```python
<!--IMPORTS:[{"imported": "FewShotPromptTemplate", "source": "langchain.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.few_shot.FewShotPromptTemplate.html", "title": "Generate Synthetic Data"}, {"imported": "PromptTemplate", "source": "langchain.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Generate Synthetic Data"}, {"imported": "OPENAI_TEMPLATE", "source": "langchain_experimental.tabular_synthetic_data.openai", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.OPENAI_TEMPLATE.html", "title": "Generate Synthetic Data"}, {"imported": "create_openai_data_generator", "source": "langchain_experimental.tabular_synthetic_data.openai", "docs": "https://python.langchain.com/api_reference/experimental/tabular_synthetic_data/langchain_experimental.tabular_synthetic_data.openai.create_openai_data_generator.html", "title": "Generate Synthetic Data"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Generate Synthetic Data"}]-->
%pip install --upgrade --quiet  langchain langchain_experimental langchain-openai
# Set env var OPENAI_API_KEY or load from a .env file:
# import dotenv
# dotenv.load_dotenv()

from langchain.prompts import FewShotPromptTemplate, PromptTemplate
from langchain_experimental.tabular_synthetic_data.openai import (
    OPENAI_TEMPLATE,
    create_openai_data_generator,
)
from langchain_experimental.tabular_synthetic_data.prompts import (
    SYNTHETIC_FEW_SHOT_PREFIX,
    SYNTHETIC_FEW_SHOT_SUFFIX,
)
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
```

## 1. 定义您的数据模型
每个数据集都有一个结构或“模式”。下面的 MedicalBilling 类作为我们合成数据的模式。通过定义这一点，我们在向合成数据生成器说明我们期望的数据的形状和性质。


```python
class MedicalBilling(BaseModel):
    patient_id: int
    patient_name: str
    diagnosis_code: str
    procedure_code: str
    total_charge: float
    insurance_claim_amount: float
```

例如，每条记录将有一个 `patient_id`，它是一个整数，一个 `patient_name`，它是一个字符串，等等。

## 2. 示例数据
为了指导合成数据生成器，提供一些类似真实世界的示例是有用的。这些示例作为“种子” - 它们代表了您想要的数据类型，生成器将使用它们创建更多看起来相似的数据。

以下是一些虚构的医疗账单记录：


```python
examples = [
    {
        "example": """Patient ID: 123456, Patient Name: John Doe, Diagnosis Code: 
        J20.9, Procedure Code: 99203, Total Charge: $500, Insurance Claim Amount: $350"""
    },
    {
        "example": """Patient ID: 789012, Patient Name: Johnson Smith, Diagnosis 
        Code: M54.5, Procedure Code: 99213, Total Charge: $150, Insurance Claim Amount: $120"""
    },
    {
        "example": """Patient ID: 345678, Patient Name: Emily Stone, Diagnosis Code: 
        E11.9, Procedure Code: 99214, Total Charge: $300, Insurance Claim Amount: $250"""
    },
]
```

## 3. 制作提示词模板
生成器并不会神奇地知道如何创建我们的数据；我们需要引导它。我们通过创建一个提示词模板来做到这一点。这个模板帮助指导底层语言模型如何以所需格式生成合成数据。


```python
OPENAI_TEMPLATE = PromptTemplate(input_variables=["example"], template="{example}")

prompt_template = FewShotPromptTemplate(
    prefix=SYNTHETIC_FEW_SHOT_PREFIX,
    examples=examples,
    suffix=SYNTHETIC_FEW_SHOT_SUFFIX,
    input_variables=["subject", "extra"],
    example_prompt=OPENAI_TEMPLATE,
)
```

`FewShotPromptTemplate` 包含：

- `prefix` 和 `suffix`：这些可能包含指导上下文或说明。
- `examples`: 我们之前定义的示例数据。
- `input_variables`: 这些变量（"subject", "extra"）是占位符，您可以在稍后动态填充。例如，"subject" 可能会被填充为 "medical_billing" 以进一步引导模型。
- `example_prompt`: 这个提示词模板是我们希望每个示例行在提示中采用的格式。

## 4. 创建数据生成器
在模式和提示准备好后，下一步是创建数据生成器。这个对象知道如何与底层语言模型进行通信以获取合成数据。


```python
synthetic_data_generator = create_openai_data_generator(
    output_schema=MedicalBilling,
    llm=ChatOpenAI(
        temperature=1
    ),  # You'll need to replace with your actual Language Model instance
    prompt=prompt_template,
)
```

## 5. 生成合成数据
最后，让我们获取我们的合成数据！


```python
synthetic_results = synthetic_data_generator.generate(
    subject="medical_billing",
    extra="the name must be chosen at random. Make it something you wouldn't normally choose.",
    runs=10,
)
```

这个命令要求生成器生成10条合成的医疗账单记录。结果存储在 `synthetic_results` 中。输出将是医疗账单 pydantic 模型的列表。

### 其他实现



```python
<!--IMPORTS:[{"imported": "DatasetGenerator", "source": "langchain_experimental.synthetic_data", "docs": "https://python.langchain.com/api_reference/experimental/synthetic_data/langchain_experimental.synthetic_data.DatasetGenerator.html", "title": "Generate Synthetic Data"}, {"imported": "create_data_generation_chain", "source": "langchain_experimental.synthetic_data", "docs": "https://python.langchain.com/api_reference/experimental/synthetic_data/langchain_experimental.synthetic_data.create_data_generation_chain.html", "title": "Generate Synthetic Data"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Generate Synthetic Data"}]-->
from langchain_experimental.synthetic_data import (
    DatasetGenerator,
    create_data_generation_chain,
)
from langchain_openai import ChatOpenAI
```


```python
# LLM
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
chain = create_data_generation_chain(model)
```


```python
chain({"fields": ["blue", "yellow"], "preferences": {}})
```



```output
{'fields': ['blue', 'yellow'],
 'preferences': {},
 'text': 'The vibrant blue sky contrasted beautifully with the bright yellow sun, creating a stunning display of colors that instantly lifted the spirits of all who gazed upon it.'}
```



```python
chain(
    {
        "fields": {"colors": ["blue", "yellow"]},
        "preferences": {"style": "Make it in a style of a weather forecast."},
    }
)
```



```output
{'fields': {'colors': ['blue', 'yellow']},
 'preferences': {'style': 'Make it in a style of a weather forecast.'},
 'text': "Good morning! Today's weather forecast brings a beautiful combination of colors to the sky, with hues of blue and yellow gently blending together like a mesmerizing painting."}
```



```python
chain(
    {
        "fields": {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
        "preferences": None,
    }
)
```



```output
{'fields': {'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
 'preferences': None,
 'text': 'Tom Hanks, the renowned actor known for his incredible versatility and charm, has graced the silver screen in unforgettable movies such as "Forrest Gump" and "Green Mile".'}
```



```python
chain(
    {
        "fields": [
            {"actor": "Tom Hanks", "movies": ["Forrest Gump", "Green Mile"]},
            {"actor": "Mads Mikkelsen", "movies": ["Hannibal", "Another round"]},
        ],
        "preferences": {"minimum_length": 200, "style": "gossip"},
    }
)
```



```output
{'fields': [{'actor': 'Tom Hanks', 'movies': ['Forrest Gump', 'Green Mile']},
  {'actor': 'Mads Mikkelsen', 'movies': ['Hannibal', 'Another round']}],
 'preferences': {'minimum_length': 200, 'style': 'gossip'},
 'text': 'Did you know that Tom Hanks, the beloved Hollywood actor known for his roles in "Forrest Gump" and "Green Mile", has shared the screen with the talented Mads Mikkelsen, who gained international acclaim for his performances in "Hannibal" and "Another round"? These two incredible actors have brought their exceptional skills and captivating charisma to the big screen, delivering unforgettable performances that have enthralled audiences around the world. Whether it\'s Hanks\' endearing portrayal of Forrest Gump or Mikkelsen\'s chilling depiction of Hannibal Lecter, these movies have solidified their places in cinematic history, leaving a lasting impact on viewers and cementing their status as true icons of the silver screen.'}
```


正如我们所看到的，创建的示例多样化，并具有我们希望它们拥有的信息。此外，它们的风格很好地反映了给定的偏好。

## 生成示例数据集以进行提取基准测试


```python
inp = [
    {
        "Actor": "Tom Hanks",
        "Film": [
            "Forrest Gump",
            "Saving Private Ryan",
            "The Green Mile",
            "Toy Story",
            "Catch Me If You Can",
        ],
    },
    {
        "Actor": "Tom Hardy",
        "Film": [
            "Inception",
            "The Dark Knight Rises",
            "Mad Max: Fury Road",
            "The Revenant",
            "Dunkirk",
        ],
    },
]

generator = DatasetGenerator(model, {"style": "informal", "minimal length": 500})
dataset = generator(inp)
```


```python
dataset
```



```output
[{'fields': {'Actor': 'Tom Hanks',
   'Film': ['Forrest Gump',
    'Saving Private Ryan',
    'The Green Mile',
    'Toy Story',
    'Catch Me If You Can']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hanks, the versatile and charismatic actor, has graced the silver screen in numerous iconic films including the heartwarming and inspirational "Forrest Gump," the intense and gripping war drama "Saving Private Ryan," the emotionally charged and thought-provoking "The Green Mile," the beloved animated classic "Toy Story," and the thrilling and captivating true story adaptation "Catch Me If You Can." With his impressive range and genuine talent, Hanks continues to captivate audiences worldwide, leaving an indelible mark on the world of cinema.'},
 {'fields': {'Actor': 'Tom Hardy',
   'Film': ['Inception',
    'The Dark Knight Rises',
    'Mad Max: Fury Road',
    'The Revenant',
    'Dunkirk']},
  'preferences': {'style': 'informal', 'minimal length': 500},
  'text': 'Tom Hardy, the versatile actor known for his intense performances, has graced the silver screen in numerous iconic films, including "Inception," "The Dark Knight Rises," "Mad Max: Fury Road," "The Revenant," and "Dunkirk." Whether he\'s delving into the depths of the subconscious mind, donning the mask of the infamous Bane, or navigating the treacherous wasteland as the enigmatic Max Rockatansky, Hardy\'s commitment to his craft is always evident. From his breathtaking portrayal of the ruthless Eames in "Inception" to his captivating transformation into the ferocious Max in "Mad Max: Fury Road," Hardy\'s dynamic range and magnetic presence captivate audiences and leave an indelible mark on the world of cinema. In his most physically demanding role to date, he endured the harsh conditions of the freezing wilderness as he portrayed the rugged frontiersman John Fitzgerald in "The Revenant," earning him critical acclaim and an Academy Award nomination. In Christopher Nolan\'s war epic "Dunkirk," Hardy\'s stoic and heroic portrayal of Royal Air Force pilot Farrier showcases his ability to convey deep emotion through nuanced performances. With his chameleon-like ability to inhabit a wide range of characters and his unwavering commitment to his craft, Tom Hardy has undoubtedly solidified his place as one of the most talented and sought-after actors of his generation.'}]
```


## 从生成的示例中提取
好的，让我们看看现在是否可以从这些生成的数据中提取输出，以及它与我们的案例相比如何！


```python
<!--IMPORTS:[{"imported": "create_extraction_chain_pydantic", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.openai_functions.extraction.create_extraction_chain_pydantic.html", "title": "Generate Synthetic Data"}, {"imported": "PydanticOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html", "title": "Generate Synthetic Data"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Generate Synthetic Data"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Generate Synthetic Data"}]-->
from typing import List

from langchain.chains import create_extraction_chain_pydantic
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from pydantic import BaseModel, Field
```


```python
class Actor(BaseModel):
    Actor: str = Field(description="name of an actor")
    Film: List[str] = Field(description="list of names of films they starred in")
```

### 解析器


```python
llm = OpenAI()
parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Extract fields from a given text.\n{format_instructions}\n{text}\n",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

_input = prompt.format_prompt(text=dataset[0]["text"])
output = llm(_input.to_string())

parsed = parser.parse(output)
parsed
```



```output
Actor(Actor='Tom Hanks', Film=['Forrest Gump', 'Saving Private Ryan', 'The Green Mile', 'Toy Story', 'Catch Me If You Can'])
```



```python
(parsed.Actor == inp[0]["Actor"]) & (parsed.Film == inp[0]["Film"])
```



```output
True
```


### 提取器


```python
extractor = create_extraction_chain_pydantic(pydantic_schema=Actor, llm=model)
extracted = extractor.run(dataset[1]["text"])
extracted
```



```output
[Actor(Actor='Tom Hardy', Film=['Inception', 'The Dark Knight Rises', 'Mad Max: Fury Road', 'The Revenant', 'Dunkirk'])]
```



```python
(extracted[0].Actor == inp[1]["Actor"]) & (extracted[0].Film == inp[1]["Film"])
```



```output
True
```

