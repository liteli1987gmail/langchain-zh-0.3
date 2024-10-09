---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/clarifai.ipynb
---
# Clarifai

>[Clarifai](https://www.clarifai.com/) 是一个人工智能平台，提供完整的人工智能生命周期，包括数据探索、数据标注、模型训练、评估和推理。

本示例介绍如何使用 LangChain 与 `Clarifai` [模型](https://clarifai.com/explore/models) 进行交互。

要使用 Clarifai，您必须拥有一个账户和一个个人访问令牌 (PAT) 密钥。
[在这里查看](https://clarifai.com/settings/security) 以获取或创建 PAT。

# 依赖项


```python
# Install required dependencies
%pip install --upgrade --quiet  clarifai
```


```python
# Declare clarifai pat token as environment variable or you can pass it as argument in clarifai class.
import os

os.environ["CLARIFAI_PAT"] = "CLARIFAI_PAT_TOKEN"
```

# 导入
在这里我们将设置个人访问令牌。您可以在您的Clarifai帐户的[设置/安全](https://clarifai.com/settings/security)中找到您的PAT。


```python
# Please login and get your API key from  https://clarifai.com/settings/security
from getpass import getpass

CLARIFAI_PAT = getpass()
```


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "Clarifai"}, {"imported": "Clarifai", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.clarifai.Clarifai.html", "title": "Clarifai"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "Clarifai"}]-->
# Import the required modules
from langchain.chains import LLMChain
from langchain_community.llms import Clarifai
from langchain_core.prompts import PromptTemplate
```

# 输入
创建一个提示词模板以用于LLM链：


```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

# 设置
设置模型所在的用户ID和应用ID。您可以在https://clarifai.com/explore/models上找到公共模型的列表。

您还需要初始化模型ID，如果需要，还要初始化模型版本ID。一些模型有多个版本，您可以选择适合您任务的版本。
                                                              
或者，您可以使用model_url（例如：“https://clarifai.com/anthropic/completion/models/claude-v2”）进行初始化。


```python
USER_ID = "openai"
APP_ID = "chat-completion"
MODEL_ID = "GPT-3_5-turbo"

# You can provide a specific model version as the model_version_id arg.
# MODEL_VERSION_ID = "MODEL_VERSION_ID"
# or

MODEL_URL = "https://clarifai.com/openai/chat-completion/models/GPT-4"
```


```python
# Initialize a Clarifai LLM
clarifai_llm = Clarifai(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)
# or
# Initialize through Model URL
clarifai_llm = Clarifai(model_url=MODEL_URL)
```


```python
# Create LLM chain
llm_chain = LLMChain(prompt=prompt, llm=clarifai_llm)
```

# 运行链


```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```



```output
' Okay, here are the steps to figure this out:\n\n1. Justin Bieber was born on March 1, 1994.\n\n2. The Super Bowl that took place in the year of his birth was Super Bowl XXVIII. \n\n3. Super Bowl XXVIII was played on January 30, 1994.\n\n4. The two teams that played in Super Bowl XXVIII were the Dallas Cowboys and the Buffalo Bills. \n\n5. The Dallas Cowboys defeated the Buffalo Bills 30-13 to win Super Bowl XXVIII.\n\nTherefore, the NFL team that won the Super Bowl in the year Justin Bieber was born was the Dallas Cowboys.'
```


## 使用推理参数进行模型预测（GPT）。
或者，您可以使用带有推理参数（如温度、最大令牌等）的GPT模型


```python
# Initialize the parameters as dict.
params = dict(temperature=str(0.3), max_tokens=100)
```


```python
clarifai_llm = Clarifai(user_id=USER_ID, app_id=APP_ID, model_id=MODEL_ID)
llm_chain = LLMChain(
    prompt=prompt, llm=clarifai_llm, llm_kwargs={"inference_params": params}
)
```


```python
question = "How many 3 digit even numbers you can form that if one of the digits is 5 then the following digit must be 7?"

llm_chain.run(question)
```



```output
'Step 1: The first digit can be any even number from 1 to 9, except for 5. So there are 4 choices for the first digit.\n\nStep 2: If the first digit is not 5, then the second digit must be 7. So there is only 1 choice for the second digit.\n\nStep 3: The third digit can be any even number from 0 to 9, except for 5 and 7. So there are '
```


为提示列表生成响应


```python
# We can use _generate to generate the response for list of prompts.
clarifai_llm._generate(
    [
        "Help me summarize the events of american revolution in 5 sentences",
        "Explain about rocket science in a funny way",
        "Create a script for welcome speech for the college sports day",
    ],
    inference_params=params,
)
```



```output
LLMResult(generations=[[Generation(text=' Here is a 5 sentence summary of the key events of the American Revolution:\n\nThe American Revolution began with growing tensions between American colonists and the British government over issues of taxation without representation. In 1775, fighting broke out between British troops and American militiamen in Lexington and Concord, starting the Revolutionary War. The Continental Congress appointed George Washington as commander of the Continental Army, which went on to win key victories over the British. In 1776, the Declaration of Independence was adopted, formally declaring the 13 American colonies free from British rule. After years of fighting, the Revolutionary War ended with the British defeat at Yorktown in 1781 and recognition of American independence.')], [Generation(text=" Here's a humorous take on explaining rocket science:\n\nRocket science is so easy, it's practically child's play! Just strap a big metal tube full of explosive liquid to your butt and light the fuse. What could go wrong? Blastoff!  Whoosh, you'll be zooming to the moon in no time. Just remember your helmet or your head might go pop like a zit when you leave the atmosphere. \n\nMaking rockets is a cinch too. Simply mix together some spicy spices, garlic powder, chili powder, a dash of gunpowder and voila - rocket fuel! Add a pinch of baking soda and vinegar if you want an extra kick. Shake well and pour into your DIY soda bottle rocket. Stand back and watch that baby soar!\n\nGuiding a rocket is fun for the whole family. Just strap in, push some random buttons and see where you end up. It's like the ultimate surprise vacation! You never know if you'll wind up on Venus, crash land on Mars, or take a quick dip through the rings of Saturn. \n\nAnd if anything goes wrong, don't sweat it. Rocket science is easy breezy. Just troubleshoot on the fly with some duct tape and crazy glue and you'll be back on course in a jiffy. Who needs mission control when you've got this!")], [Generation(text=" Here is a draft welcome speech for a college sports day:\n\nGood morning everyone and welcome to our college's annual sports day! It's wonderful to see so many students, faculty, staff, alumni, and guests gathered here today to celebrate sportsmanship and athletic achievement at our college. \n\nLet's begin by thanking all the organizers, volunteers, coaches, and staff members who worked tirelessly behind the scenes to make this event possible. Our sports day would not happen without your dedication and commitment. \n\nI also want to recognize all the student-athletes with us today. You inspire us with your talent, spirit, and determination. Sports have a unique power to unite and energize our community. Through both individual and team sports, you demonstrate focus, collaboration, perseverance and resilience – qualities that will serve you well both on and off the field.\n\nThe spirit of competition and fair play are core values of any sports event. I encourage all of you to compete enthusiastically today. Play to the best of your ability and have fun. Applaud the effort and sportsmanship of your fellow athletes, regardless of the outcome. \n\nWin or lose, this sports day is a day for us to build camaraderie and create lifelong memories. Let's make it a day of fitness and friendship for all. With that, let the games begin. Enjoy the day!")]], llm_output=None, run=None)
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
