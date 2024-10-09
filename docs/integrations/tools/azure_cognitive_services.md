---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/azure_cognitive_services.ipynb
---
# Azure 认知服务工具包

该工具包用于与 `Azure 认知服务 API` 交互，以实现一些多模态功能。

目前该工具包中捆绑了四个工具：
- AzureCogsImageAnalysisTool：用于从图像中提取标题、对象、标签和文本。（注意：由于依赖于仅在 Windows 和 Linux 上支持的 `azure-ai-vision` 包，该工具目前在 Mac OS 上不可用。）
- AzureCogsFormRecognizerTool：用于从文档中提取文本、表格和键值对。
- AzureCogsSpeech2TextTool：用于将语音转录为文本。
- AzureCogsText2SpeechTool：用于将文本合成语音。
- AzureCogsTextAnalyticsHealthTool：用于提取医疗实体。

首先，您需要设置一个 Azure 账户并创建一个认知服务资源。您可以按照 [这里](https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-apis-create-account?tabs=multiservice%2Cwindows) 的说明创建资源。

然后，您需要获取资源的端点、密钥和区域，并将它们设置为环境变量。您可以在资源的“密钥和端点”页面找到它们。


```python
%pip install --upgrade --quiet  azure-ai-formrecognizer > /dev/null
%pip install --upgrade --quiet  azure-cognitiveservices-speech > /dev/null
%pip install --upgrade --quiet  azure-ai-textanalytics > /dev/null

# For Windows/Linux
%pip install --upgrade --quiet  azure-ai-vision > /dev/null
```


```python
%pip install -qU langchain-community
```


```python
import os

os.environ["OPENAI_API_KEY"] = "sk-"
os.environ["AZURE_COGS_KEY"] = ""
os.environ["AZURE_COGS_ENDPOINT"] = ""
os.environ["AZURE_COGS_REGION"] = ""
```

## 创建工具包


```python
<!--IMPORTS:[{"imported": "AzureCognitiveServicesToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.azure_cognitive_services.AzureCognitiveServicesToolkit.html", "title": "Azure Cognitive Services Toolkit"}]-->
from langchain_community.agent_toolkits import AzureCognitiveServicesToolkit

toolkit = AzureCognitiveServicesToolkit()
```


```python
[tool.name for tool in toolkit.get_tools()]
```



```output
['Azure Cognitive Services Image Analysis',
 'Azure Cognitive Services Form Recognizer',
 'Azure Cognitive Services Speech2Text',
 'Azure Cognitive Services Text2Speech']
```


## 在代理中使用


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Azure Cognitive Services Toolkit"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Azure Cognitive Services Toolkit"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Azure Cognitive Services Toolkit"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI
```


```python
llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)
```


```python
agent.run(
    "What can I make with these ingredients?"
    "https://images.openai.com/blob/9ad5a2ab-041f-475f-ad6a-b51899c50182/ingredients.png"
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Action:
\`\`\`
{
  "action": "Azure Cognitive Services Image Analysis",
  "action_input": "https://images.openai.com/blob/9ad5a2ab-041f-475f-ad6a-b51899c50182/ingredients.png"
}
\`\`\`

[0m
Observation: [36;1m[1;3mCaption: a group of eggs and flour in bowls
Objects: Egg, Egg, Food
Tags: dairy, ingredient, indoor, thickening agent, food, mixing bowl, powder, flour, egg, bowl[0m
Thought:[32;1m[1;3m I can use the objects and tags to suggest recipes
Action:
\`\`\`
{
  "action": "Final Answer",
  "action_input": "You can make pancakes, omelettes, or quiches with these ingredients!"
}
\`\`\`[0m

[1m> Finished chain.[0m
```


```output
'You can make pancakes, omelettes, or quiches with these ingredients!'
```



```python
audio_file = agent.run("Tell me a joke and read it out for me.")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction:
\`\`\`
{
  "action": "Azure Cognitive Services Text2Speech",
  "action_input": "Why did the chicken cross the playground? To get to the other slide!"
}
\`\`\`

[0m
Observation: [31;1m[1;3m/tmp/tmpa3uu_j6b.wav[0m
Thought:[32;1m[1;3m I have the audio file of the joke
Action:
\`\`\`
{
  "action": "Final Answer",
  "action_input": "/tmp/tmpa3uu_j6b.wav"
}
\`\`\`[0m

[1m> Finished chain.[0m
```


```output
'/tmp/tmpa3uu_j6b.wav'
```



```python
from IPython import display

audio = display.Audio(audio_file)
display.display(audio)
```


```python
agent.run(
    """The patient is a 54-year-old gentleman with a history of progressive angina over the past several months.
The patient had a cardiac catheterization in July of this year revealing total occlusion of the RCA and 50% left main disease ,
with a strong family history of coronary artery disease with a brother dying at the age of 52 from a myocardial infarction and
another brother who is status post coronary artery bypass grafting. The patient had a stress echocardiogram done on July , 2001 ,
which showed no wall motion abnormalities , but this was a difficult study due to body habitus. The patient went for six minutes with
minimal ST depressions in the anterior lateral leads , thought due to fatigue and wrist pain , his anginal equivalent. Due to the patient's
increased symptoms and family history and history left main disease with total occasional of his RCA was referred for revascularization with open heart surgery.

List all the diagnoses.
"""
)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mAction:
\`\`\`
{
  "action": "azure_cognitive_services_text_analyics_health",
  "action_input": "The patient is a 54-year-old gentleman with a history of progressive angina over the past several months. The patient had a cardiac catheterization in July of this year revealing total occlusion of the RCA and 50% left main disease, with a strong family history of coronary artery disease with a brother dying at the age of 52 from a myocardial infarction and another brother who is status post coronary artery bypass grafting. The patient had a stress echocardiogram done on July, 2001, which showed no wall motion abnormalities, but this was a difficult study due to body habitus. The patient went for six minutes with minimal ST depressions in the anterior lateral leads, thought due to fatigue and wrist pain, his anginal equivalent. Due to the patient's increased symptoms and family history and history left main disease with total occasional of his RCA was referred for revascularization with open heart surgery."
}
\`\`\`
[0m
Observation: [36;1m[1;3mThe text conatins the following healthcare entities: 54-year-old is a healthcare entity of type Age, gentleman is a healthcare entity of type Gender, progressive angina is a healthcare entity of type Diagnosis, past several months is a healthcare entity of type Time, cardiac catheterization is a healthcare entity of type ExaminationName, July of this year is a healthcare entity of type Time, total is a healthcare entity of type ConditionQualifier, occlusion is a healthcare entity of type SymptomOrSign, RCA is a healthcare entity of type BodyStructure, 50 is a healthcare entity of type MeasurementValue, % is a healthcare entity of type MeasurementUnit, left main is a healthcare entity of type BodyStructure, disease is a healthcare entity of type Diagnosis, family is a healthcare entity of type FamilyRelation, coronary artery disease is a healthcare entity of type Diagnosis, brother is a healthcare entity of type FamilyRelation, dying is a healthcare entity of type Diagnosis, 52 is a healthcare entity of type Age, myocardial infarction is a healthcare entity of type Diagnosis, brother is a healthcare entity of type FamilyRelation, coronary artery bypass grafting is a healthcare entity of type TreatmentName, stress echocardiogram is a healthcare entity of type ExaminationName, July, 2001 is a healthcare entity of type Time, wall motion abnormalities is a healthcare entity of type SymptomOrSign, body habitus is a healthcare entity of type SymptomOrSign, six minutes is a healthcare entity of type Time, minimal is a healthcare entity of type ConditionQualifier, ST depressions in the anterior lateral leads is a healthcare entity of type SymptomOrSign, fatigue is a healthcare entity of type SymptomOrSign, wrist pain is a healthcare entity of type SymptomOrSign, anginal equivalent is a healthcare entity of type SymptomOrSign, increased is a healthcare entity of type Course, symptoms is a healthcare entity of type SymptomOrSign, family is a healthcare entity of type FamilyRelation, left is a healthcare entity of type Direction, main is a healthcare entity of type BodyStructure, disease is a healthcare entity of type Diagnosis, occasional is a healthcare entity of type Course, RCA is a healthcare entity of type BodyStructure, revascularization is a healthcare entity of type TreatmentName, open heart surgery is a healthcare entity of type TreatmentName[0m
Thought:[32;1m[1;3m I know what to respond
Action:
\`\`\`
{
  "action": "Final Answer",
  "action_input": "The text contains the following diagnoses: progressive angina, coronary artery disease, myocardial infarction, and coronary artery bypass grafting."
}
\`\`\`[0m

[1m> Finished chain.[0m
```


```output
'The text contains the following diagnoses: progressive angina, coronary artery disease, myocardial infarction, and coronary artery bypass grafting.'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
