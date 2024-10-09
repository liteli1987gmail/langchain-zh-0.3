# Shale Protocol

[Shale Protocol](https://shaleprotocol.com) 提供用于开放大型语言模型的生产就绪推理API。它是一个即插即用的API，因为它托管在高度可扩展的GPU云基础设施上。

我们的免费套餐支持每个密钥每天最多1K的请求，因为我们希望消除任何人开始使用大型语言模型构建生成AI应用的障碍。

通过Shale Protocol，开发者/研究人员可以免费创建应用并探索开放大型语言模型的能力。

本页面介绍了如何将Shale-Serve API与LangChain结合使用。

截至2023年6月，API默认支持Vicuna-13B。我们将在未来的版本中支持更多大型语言模型，如Falcon-40B。


## 如何

### 1. 在 https://shaleprotocol.com 找到我们Discord的链接。通过我们Discord上的“Shale Bot”生成API密钥。无需信用卡，也没有免费试用。这是一个永久免费的套餐，每个API密钥每天限制1K。

### 2. 使用 https://shale.live/v1 作为OpenAI API的替代品

例如
```python
from langchain_openai import OpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

import os
os.environ['OPENAI_API_BASE'] = "https://shale.live/v1"
os.environ['OPENAI_API_KEY'] = "ENTER YOUR API KEY"

llm = OpenAI()

template = """Question: {question}

# Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)


llm_chain = prompt | llm | StrOutputParser()

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.invoke(question)

```
