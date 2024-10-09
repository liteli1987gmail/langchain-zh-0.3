---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/chat_loaders/langsmith_llm_runs.ipynb
---
# LangSmith LLM 运行

本笔记本演示如何直接从 LangSmith 的 LLM 运行加载数据并在该数据上微调模型。
这个过程很简单，包括 3 个步骤。

1. 选择要训练的 LLM 运行。
2. 使用 LangSmithRunChatLoader 将运行加载为聊天会话。
3. 微调你的模型。

然后你可以在你的 LangChain 应用中使用微调后的模型。

在深入之前，让我们安装我们的先决条件。

## 先决条件

确保你已安装 langchain >= 0.0.311，并已使用你的 LangSmith API 密钥配置你的环境。


```python
%pip install --upgrade --quiet  langchain langchain-openai
```


```python
import os
import uuid

uid = uuid.uuid4().hex[:6]
project_name = f"Run Fine-tuning Walkthrough {uid}"
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "YOUR API KEY"
os.environ["LANGCHAIN_PROJECT"] = project_name
```

## 1. 选择运行
第一步是选择要进行微调的运行。一个常见的情况是选择在
收到积极用户反馈的跟踪中的大型语言模型运行。您可以在[LangSmith 使用手册](https://github.com/langchain-ai/langsmith-cookbook/blob/main/exploratory-data-analysis/exporting-llm-runs-and-feedback/llm_run_etl.ipynb)和[文档](https://docs.smith.langchain.com/tracing/use-cases/export-runs/local)中找到相关示例。

为了本教程的目的，我们将为您生成一些运行以供使用。让我们尝试微调一个
简单的函数调用链。


```python
from enum import Enum

from pydantic import BaseModel, Field


class Operation(Enum):
    add = "+"
    subtract = "-"
    multiply = "*"
    divide = "/"


class Calculator(BaseModel):
    """A calculator function"""

    num1: float
    num2: float
    operation: Operation = Field(..., description="+,-,*,/")

    def calculate(self):
        if self.operation == Operation.add:
            return self.num1 + self.num2
        elif self.operation == Operation.subtract:
            return self.num1 - self.num2
        elif self.operation == Operation.multiply:
            return self.num1 * self.num2
        elif self.operation == Operation.divide:
            if self.num2 != 0:
                return self.num1 / self.num2
            else:
                return "Cannot divide by zero"
```


```python
<!--IMPORTS:[{"imported": "convert_pydantic_to_openai_function", "source": "langchain_core.utils.function_calling", "docs": "https://python.langchain.com/api_reference/core/utils/langchain_core.utils.function_calling.convert_pydantic_to_openai_function.html", "title": "LangSmith LLM Runs"}]-->
from pprint import pprint

from langchain_core.utils.function_calling import convert_pydantic_to_openai_function
from pydantic import BaseModel

openai_function_def = convert_pydantic_to_openai_function(Calculator)
pprint(openai_function_def)
```
```output
{'description': 'A calculator function',
 'name': 'Calculator',
 'parameters': {'description': 'A calculator function',
                'properties': {'num1': {'title': 'Num1', 'type': 'number'},
                               'num2': {'title': 'Num2', 'type': 'number'},
                               'operation': {'allOf': [{'description': 'An '
                                                                       'enumeration.',
                                                        'enum': ['+',
                                                                 '-',
                                                                 '*',
                                                                 '/'],
                                                        'title': 'Operation'}],
                                             'description': '+,-,*,/'}},
                'required': ['num1', 'num2', 'operation'],
                'title': 'Calculator',
                'type': 'object'}}
```

```python
<!--IMPORTS:[{"imported": "PydanticOutputFunctionsParser", "source": "langchain_core.output_parsers.openai_functions", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.openai_functions.PydanticOutputFunctionsParser.html", "title": "LangSmith LLM Runs"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "LangSmith LLM Runs"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LangSmith LLM Runs"}]-->
from langchain_core.output_parsers.openai_functions import PydanticOutputFunctionsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an accounting assistant."),
        ("user", "{input}"),
    ]
)
chain = (
    prompt
    | ChatOpenAI().bind(functions=[openai_function_def])
    | PydanticOutputFunctionsParser(pydantic_schema=Calculator)
    | (lambda x: x.calculate())
)
```


```python
math_questions = [
    "What's 45/9?",
    "What's 81/9?",
    "What's 72/8?",
    "What's 56/7?",
    "What's 36/6?",
    "What's 64/8?",
    "What's 12*6?",
    "What's 8*8?",
    "What's 10*10?",
    "What's 11*11?",
    "What's 13*13?",
    "What's 45+30?",
    "What's 72+28?",
    "What's 56+44?",
    "What's 63+37?",
    "What's 70-35?",
    "What's 60-30?",
    "What's 50-25?",
    "What's 40-20?",
    "What's 30-15?",
]
results = chain.batch([{"input": q} for q in math_questions], return_exceptions=True)
```

#### 加载没有错误的运行

现在我们可以选择成功的运行进行微调。


```python
from langsmith.client import Client

client = Client()
```


```python
successful_traces = {
    run.trace_id
    for run in client.list_runs(
        project_name=project_name,
        execution_order=1,
        error=False,
    )
}

llm_runs = [
    run
    for run in client.list_runs(
        project_name=project_name,
        run_type="llm",
    )
    if run.trace_id in successful_traces
]
```

## 2. 准备数据
现在我们可以创建一个LangSmithRunChatLoader的实例，并使用其lazy_load()方法加载聊天会话。


```python
<!--IMPORTS:[{"imported": "LangSmithRunChatLoader", "source": "langchain_community.chat_loaders.langsmith", "docs": "https://python.langchain.com/api_reference/community/chat_loaders/langchain_community.chat_loaders.langsmith.LangSmithRunChatLoader.html", "title": "LangSmith LLM Runs"}]-->
from langchain_community.chat_loaders.langsmith import LangSmithRunChatLoader

loader = LangSmithRunChatLoader(runs=llm_runs)

chat_sessions = loader.lazy_load()
```

#### 加载聊天会话后，将其转换为适合微调的格式。


```python
<!--IMPORTS:[{"imported": "convert_messages_for_finetuning", "source": "langchain_community.adapters.openai", "docs": "https://python.langchain.com/api_reference/community/adapters/langchain_community.adapters.openai.convert_messages_for_finetuning.html", "title": "LangSmith LLM Runs"}]-->
from langchain_community.adapters.openai import convert_messages_for_finetuning

training_data = convert_messages_for_finetuning(chat_sessions)
```

## 3. 微调模型
现在，使用 OpenAI 库启动微调过程。


```python
import json
import time
from io import BytesIO

import openai

my_file = BytesIO()
for dialog in training_data:
    my_file.write((json.dumps({"messages": dialog}) + "\n").encode("utf-8"))

my_file.seek(0)
training_file = openai.files.create(file=my_file, purpose="fine-tune")

job = openai.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-3.5-turbo",
)

# Wait for the fine-tuning to complete (this may take some time)
status = openai.fine_tuning.jobs.retrieve(job.id).status
start_time = time.time()
while status != "succeeded":
    print(f"Status=[{status}]... {time.time() - start_time:.2f}s", end="\r", flush=True)
    time.sleep(5)
    status = openai.fine_tuning.jobs.retrieve(job.id).status

# Now your model is fine-tuned!
```
```output
Status=[running]... 349.84s. 17.72s
```
## 4. 在 LangChain 中使用

微调后，在您的 LangChain 应用中使用生成的模型 ID 和 ChatOpenAI 模型类。


```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LangSmith LLM Runs"}]-->
# Get the fine-tuned model ID
job = openai.fine_tuning.jobs.retrieve(job.id)
model_id = job.fine_tuned_model

# Use the fine-tuned model in LangChain
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=model_id,
    temperature=1,
)
```


```python
(prompt | model).invoke({"input": "What's 56/7?"})
```



```output
AIMessage(content='Let me calculate that for you.')
```


现在您已经成功使用 LangSmith LLM 运行的数据微调了一个模型！
