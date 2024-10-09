---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/edenai_tools.ipynb
---
# Eden AI

本 Jupyter Notebook 演示了如何使用 Eden AI 工具与代理。

Eden AI 正在通过联合最佳 AI 提供商来革新 AI 领域，使用户能够解锁无限可能，挖掘人工智能的真正潜力。凭借一个全面且无忧的平台，它允许用户快速将 AI 功能部署到生产中，通过单一 API 轻松访问全面的 AI 能力。（网站：https://edenai.co/）


通过在提供给代理的工具列表中包含一个 Edenai 工具，您可以赋予代理执行多项任务的能力，例如：

- 语音转文本
- 文本转语音
- 文本显性内容检测
- 图像显性内容检测
- 物体检测
- OCR 发票解析
- OCR ID 解析


在这个示例中，我们将通过使用 Edenai 工具创建一个代理，来执行上述列出的一些任务。

---------------------------------------------------------------------------
访问 EDENAI 的 API 需要一个 API 密钥，

您可以通过创建一个账户 https://app.edenai.run/user/register 来获取，并前往这里 https://app.edenai.run/admin/account/settings

一旦我们有了密钥，我们将希望将其设置为环境变量 ``EDENAI_API_KEY``，或者您可以在初始化 EdenAI 工具时通过名为 edenai_api_key 的参数直接传递密钥，例如 ``EdenAiTextModerationTool(edenai_api_key="...")``


```python
%pip install --upgrade --quiet langchain-community
```


```python
<!--IMPORTS:[{"imported": "EdenAiExplicitImageTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.image_explicitcontent.EdenAiExplicitImageTool.html", "title": "Eden AI"}, {"imported": "EdenAiObjectDetectionTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.image_objectdetection.EdenAiObjectDetectionTool.html", "title": "Eden AI"}, {"imported": "EdenAiParsingIDTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.ocr_identityparser.EdenAiParsingIDTool.html", "title": "Eden AI"}, {"imported": "EdenAiParsingInvoiceTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.ocr_invoiceparser.EdenAiParsingInvoiceTool.html", "title": "Eden AI"}, {"imported": "EdenAiSpeechToTextTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.audio_speech_to_text.EdenAiSpeechToTextTool.html", "title": "Eden AI"}, {"imported": "EdenAiTextModerationTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.text_moderation.EdenAiTextModerationTool.html", "title": "Eden AI"}, {"imported": "EdenAiTextToSpeechTool", "source": "langchain_community.tools.edenai", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.edenai.audio_text_to_speech.EdenAiTextToSpeechTool.html", "title": "Eden AI"}]-->
from langchain_community.tools.edenai import (
    EdenAiExplicitImageTool,
    EdenAiObjectDetectionTool,
    EdenAiParsingIDTool,
    EdenAiParsingInvoiceTool,
    EdenAiSpeechToTextTool,
    EdenAiTextModerationTool,
    EdenAiTextToSpeechTool,
)
```


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Eden AI"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Eden AI"}, {"imported": "EdenAI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.edenai.EdenAI.html", "title": "Eden AI"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_community.llms import EdenAI

llm = EdenAI(
    feature="text", provider="openai", params={"temperature": 0.2, "max_tokens": 250}
)

tools = [
    EdenAiTextModerationTool(providers=["openai"], language="en"),
    EdenAiObjectDetectionTool(providers=["google", "api4ai"]),
    EdenAiTextToSpeechTool(providers=["amazon"], language="en", voice="MALE"),
    EdenAiExplicitImageTool(providers=["amazon", "google"]),
    EdenAiSpeechToTextTool(providers=["amazon"]),
    EdenAiParsingIDTool(providers=["amazon", "klippa"], language="en"),
    EdenAiParsingInvoiceTool(providers=["amazon", "google"], language="en"),
]
agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
    return_intermediate_steps=True,
)
```

## 带文本的示例


```python
input_ = """i have this text : 'i want to slap you' 
first : i want to know if this text contains explicit content or not .
second : if it does contain explicit content i want to know what is the explicit content in this text, 
third : i want to make the text into speech .
if there is URL in the observations , you will always put it in the output (final answer) .
"""
result = agent_chain(input_)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to scan the text for explicit content and then convert it to speech
Action: edenai_explicit_content_detection_text
Action Input: 'i want to slap you'[0m
Observation: [36;1m[1;3mnsfw_likelihood: 3
"sexual": 1
"hate": 1
"harassment": 1
"self-harm": 1
"sexual/minors": 1
"hate/threatening": 1
"violence/graphic": 1
"self-harm/intent": 1
"self-harm/instructions": 1
"harassment/threatening": 1
"violence": 3[0m
Thought:[32;1m[1;3m I now need to convert the text to speech
Action: edenai_text_to_speech
Action Input: 'i want to slap you'[0m
Observation: [38;5;200m[1;3mhttps://d14uq1pz7dzsdq.cloudfront.net/0c825002-b4ef-4165-afa3-a140a5b25c82_.mp3?Expires=1693318351&Signature=V9vjgFe8pV5rnH-B2EUr8UshTEA3I0Xv1v0YwVEAq8w7G5pgex07dZ0M6h6fXusk7G3SW~sXs4IJxnD~DnIDp1XorvzMA2QVMJb8CD90EYvUWx9zfFa3tIegGapg~NC8wEGualccOehC~cSDhiQWrwAjDqPmq2olXnUVOfyl76pKNNR9Sm2xlljlrJcLCClBee2r5yCFEwFI-tnXX1lV2DGc5PNB66Lqrr0Fpe2trVJj2k8cLduIb8dbtqLPNIDCsV0N4QT10utZmhZcPpcSIBsdomw1Os1IjdG4nA8ZTIddAcLMCWJznttzl66vHPk26rjDpG5doMTTsPEz8ZKILQ__&Key-Pair-Id=K1F55BTI9AHGIK[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The text contains explicit content of violence with a likelihood of 3. The audio file of the text can be found at https://d14uq1pz7dzsdq.cloudfront.net/0c825002-b4ef-4165-afa3-a140a5b25c82_.mp3?Expires=1693318351&Signature=V9vjgFe8pV5rnH-B2EUr8UshTEA3I0Xv1v0YwVEAq8w7G5pgex07dZ0M6h6fXusk7G3SW~sXs4IJxnD~DnIDp1XorvzMA2QVMJb8CD90EYvUWx9zfFa3tIegGapg~NC8wEGualccOehC~cSDhiQWrwAjDqPmq2olXnUVOfyl76pKNNR9Sm2xlljlrJcLCClBee2r5yCFEwFI-tn[0m

[1m> Finished chain.[0m
```
您可以通过打印结果来获取更多执行细节


```python
result["output"]
```



```output
'The text contains explicit content of violence with a likelihood of 3. The audio file of the text can be found at https://d14uq1pz7dzsdq.cloudfront.net/0c825002-b4ef-4165-afa3-a140a5b25c82_.mp3?Expires=1693318351&Signature=V9vjgFe8pV5rnH-B2EUr8UshTEA3I0Xv1v0YwVEAq8w7G5pgex07dZ0M6h6fXusk7G3SW~sXs4IJxnD~DnIDp1XorvzMA2QVMJb8CD90EYvUWx9zfFa3tIegGapg~NC8wEGualccOehC~cSDhiQWrwAjDqPmq2olXnUVOfyl76pKNNR9Sm2xlljlrJcLCClBee2r5yCFEwFI-tn'
```



```python
result
```



```output
{'input': " i have this text : 'i want to slap you' \n                   first : i want to know if this text contains explicit content or not .\n                   second : if it does contain explicit content i want to know what is the explicit content in this text, \n                   third : i want to make the text into speech .\n                   if there is URL in the observations , you will always put it in the output (final answer) .\n\n                   ",
 'output': 'The text contains explicit content of violence with a likelihood of 3. The audio file of the text can be found at https://d14uq1pz7dzsdq.cloudfront.net/0c825002-b4ef-4165-afa3-a140a5b25c82_.mp3?Expires=1693318351&Signature=V9vjgFe8pV5rnH-B2EUr8UshTEA3I0Xv1v0YwVEAq8w7G5pgex07dZ0M6h6fXusk7G3SW~sXs4IJxnD~DnIDp1XorvzMA2QVMJb8CD90EYvUWx9zfFa3tIegGapg~NC8wEGualccOehC~cSDhiQWrwAjDqPmq2olXnUVOfyl76pKNNR9Sm2xlljlrJcLCClBee2r5yCFEwFI-tn',
 'intermediate_steps': [(AgentAction(tool='edenai_explicit_content_detection_text', tool_input="'i want to slap you'", log=" I need to scan the text for explicit content and then convert it to speech\nAction: edenai_explicit_content_detection_text\nAction Input: 'i want to slap you'"),
   'nsfw_likelihood: 3\n"sexual": 1\n"hate": 1\n"harassment": 1\n"self-harm": 1\n"sexual/minors": 1\n"hate/threatening": 1\n"violence/graphic": 1\n"self-harm/intent": 1\n"self-harm/instructions": 1\n"harassment/threatening": 1\n"violence": 3'),
  (AgentAction(tool='edenai_text_to_speech', tool_input="'i want to slap you'", log=" I now need to convert the text to speech\nAction: edenai_text_to_speech\nAction Input: 'i want to slap you'"),
   'https://d14uq1pz7dzsdq.cloudfront.net/0c825002-b4ef-4165-afa3-a140a5b25c82_.mp3?Expires=1693318351&Signature=V9vjgFe8pV5rnH-B2EUr8UshTEA3I0Xv1v0YwVEAq8w7G5pgex07dZ0M6h6fXusk7G3SW~sXs4IJxnD~DnIDp1XorvzMA2QVMJb8CD90EYvUWx9zfFa3tIegGapg~NC8wEGualccOehC~cSDhiQWrwAjDqPmq2olXnUVOfyl76pKNNR9Sm2xlljlrJcLCClBee2r5yCFEwFI-tnXX1lV2DGc5PNB66Lqrr0Fpe2trVJj2k8cLduIb8dbtqLPNIDCsV0N4QT10utZmhZcPpcSIBsdomw1Os1IjdG4nA8ZTIddAcLMCWJznttzl66vHPk26rjDpG5doMTTsPEz8ZKILQ__&Key-Pair-Id=K1F55BTI9AHGIK')]}
```


## 带图像的示例


```python
input_ = """i have this url of an image : "https://static.javatpoint.com/images/objects.jpg"
first : i want to know if the image contain objects .
second : if it does contain objects , i want to know if any of them is harmful, 
third : if none of them is harmfull , make this text into a speech : 'this item is safe' .
if there is URL in the observations , you will always put it in the output (final answer) .
"""
result = agent_chain(input_)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to determine if the image contains objects, if any of them are harmful, and then convert the text to speech.
Action: edenai_object_detection
Action Input: https://static.javatpoint.com/images/objects.jpg[0m
Observation: [33;1m[1;3mApple - Confidence 0.94003654
Apple - Confidence 0.94003654
Apple - Confidence 0.94003654
Backpack - Confidence 0.7481894
Backpack - Confidence 0.7481894
Backpack - Confidence 0.7481894
Luggage & bags - Confidence 0.70691586
Luggage & bags - Confidence 0.70691586
Luggage & bags - Confidence 0.70691586
Container - Confidence 0.654727
Container - Confidence 0.654727
Container - Confidence 0.654727
Luggage & bags - Confidence 0.5871518
Luggage & bags - Confidence 0.5871518
Luggage & bags - Confidence 0.5871518[0m
Thought:[32;1m[1;3m I need to check if any of the objects are harmful.
Action: edenai_explicit_content_detection_text
Action Input: Apple, Backpack, Luggage & bags, Container[0m
Observation: [36;1m[1;3mnsfw_likelihood: 2
"sexually explicit": 1
"sexually suggestive": 2
"offensive": 1
nsfw_likelihood: 1
"sexual": 1
"hate": 1
"harassment": 1
"self-harm": 1
"sexual/minors": 1
"hate/threatening": 1
"violence/graphic": 1
"self-harm/intent": 1
"self-harm/instructions": 1
"harassment/threatening": 1
"violence": 1[0m
Thought:[32;1m[1;3m None of the objects are harmful.
Action: edenai_text_to_speech
Action Input: 'this item is safe'[0m
Observation: [38;5;200m[1;3mhttps://d14uq1pz7dzsdq.cloudfront.net/0546db8b-528e-4b63-9a69-d14d43ad1566_.mp3?Expires=1693316753&Signature=N0KZeK9I-1s7wTgiQOAwH7LFlltwyonSJcDnkdnr8JIJmbgSw6fo6RTxWl~VvD2Hg6igJqxtJFFWyrBmmx-f9wWLw3bZSnuMxkhTRqLX9aUA9N-vPJGiRZV5BFredaOm8pwfo8TcXhVjw08iSxv8GSuyZEIwZkiq4PzdiyVTnKKji6eytV0CrnHrTs~eXZkSnOdD2Fu0ECaKvFHlsF4IDLI8efRvituSk0X3ygdec4HQojl5vmBXJzi1TuhKWOX8UxeQle8pdjjqUPSJ9thTHpucdPy6UbhZOH0C9rbtLrCfvK5rzrT4D~gKy9woICzG34tKRxNxHYVVUPqx2BiInA__&Key-Pair-Id=K1F55BTI9AHGIK[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: The image contains objects such as Apple, Backpack, Luggage & bags, and Container. None of them are harmful. The text 'this item is safe' can be found in the audio file at https://d14uq1pz7dzsdq.cloudfront.net/0546db8b-528e-4b63-9a69-d14d43ad1566_.mp3?Expires=1693316753&Signature=N0KZeK9I-1s7wTgiQOAwH7LFlltwyonSJcDnkdnr8JIJmbgSw6fo6RTxWl~VvD2Hg6igJqxtJFFWyrBmmx-f9wWLw3bZSnuMxkhTRqLX9aUA9N-vPJGiRZV5BFredaOm8pwfo8TcXhVjw08iSxv8GSuyZEIwZkiq4PzdiyVTnKKji6eyt[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```



```output
"The image contains objects such as Apple, Backpack, Luggage & bags, and Container. None of them are harmful. The text 'this item is safe' can be found in the audio file at https://d14uq1pz7dzsdq.cloudfront.net/0546db8b-528e-4b63-9a69-d14d43ad1566_.mp3?Expires=1693316753&Signature=N0KZeK9I-1s7wTgiQOAwH7LFlltwyonSJcDnkdnr8JIJmbgSw6fo6RTxWl~VvD2Hg6igJqxtJFFWyrBmmx-f9wWLw3bZSnuMxkhTRqLX9aUA9N-vPJGiRZV5BFredaOm8pwfo8TcXhVjw08iSxv8GSuyZEIwZkiq4PzdiyVTnKKji6eyt"
```


您可以通过打印结果来获取更多执行细节


```python
result
```



```output
{'input': ' i have this url of an image : "https://static.javatpoint.com/images/objects.jpg"\n                   first : i want to know if the image contain objects .\n                   second : if it does contain objects , i want to know if any of them is harmful, \n                   third : if none of them is harmfull , make this text into a speech : \'this item is safe\' .\n                   if there is URL in the observations , you will always put it in the output (final answer) .\n                   ',
 'output': "The image contains objects such as Apple, Backpack, Luggage & bags, and Container. None of them are harmful. The text 'this item is safe' can be found in the audio file at https://d14uq1pz7dzsdq.cloudfront.net/0546db8b-528e-4b63-9a69-d14d43ad1566_.mp3?Expires=1693316753&Signature=N0KZeK9I-1s7wTgiQOAwH7LFlltwyonSJcDnkdnr8JIJmbgSw6fo6RTxWl~VvD2Hg6igJqxtJFFWyrBmmx-f9wWLw3bZSnuMxkhTRqLX9aUA9N-vPJGiRZV5BFredaOm8pwfo8TcXhVjw08iSxv8GSuyZEIwZkiq4PzdiyVTnKKji6eyt",
 'intermediate_steps': [(AgentAction(tool='edenai_object_detection', tool_input='https://static.javatpoint.com/images/objects.jpg', log=' I need to determine if the image contains objects, if any of them are harmful, and then convert the text to speech.\nAction: edenai_object_detection\nAction Input: https://static.javatpoint.com/images/objects.jpg'),
   'Apple - Confidence 0.94003654\nApple - Confidence 0.94003654\nApple - Confidence 0.94003654\nBackpack - Confidence 0.7481894\nBackpack - Confidence 0.7481894\nBackpack - Confidence 0.7481894\nLuggage & bags - Confidence 0.70691586\nLuggage & bags - Confidence 0.70691586\nLuggage & bags - Confidence 0.70691586\nContainer - Confidence 0.654727\nContainer - Confidence 0.654727\nContainer - Confidence 0.654727\nLuggage & bags - Confidence 0.5871518\nLuggage & bags - Confidence 0.5871518\nLuggage & bags - Confidence 0.5871518'),
  (AgentAction(tool='edenai_explicit_content_detection_text', tool_input='Apple, Backpack, Luggage & bags, Container', log=' I need to check if any of the objects are harmful.\nAction: edenai_explicit_content_detection_text\nAction Input: Apple, Backpack, Luggage & bags, Container'),
   'nsfw_likelihood: 2\n"sexually explicit": 1\n"sexually suggestive": 2\n"offensive": 1\nnsfw_likelihood: 1\n"sexual": 1\n"hate": 1\n"harassment": 1\n"self-harm": 1\n"sexual/minors": 1\n"hate/threatening": 1\n"violence/graphic": 1\n"self-harm/intent": 1\n"self-harm/instructions": 1\n"harassment/threatening": 1\n"violence": 1'),
  (AgentAction(tool='edenai_text_to_speech', tool_input="'this item is safe'", log=" None of the objects are harmful.\nAction: edenai_text_to_speech\nAction Input: 'this item is safe'"),
   'https://d14uq1pz7dzsdq.cloudfront.net/0546db8b-528e-4b63-9a69-d14d43ad1566_.mp3?Expires=1693316753&Signature=N0KZeK9I-1s7wTgiQOAwH7LFlltwyonSJcDnkdnr8JIJmbgSw6fo6RTxWl~VvD2Hg6igJqxtJFFWyrBmmx-f9wWLw3bZSnuMxkhTRqLX9aUA9N-vPJGiRZV5BFredaOm8pwfo8TcXhVjw08iSxv8GSuyZEIwZkiq4PzdiyVTnKKji6eytV0CrnHrTs~eXZkSnOdD2Fu0ECaKvFHlsF4IDLI8efRvituSk0X3ygdec4HQojl5vmBXJzi1TuhKWOX8UxeQle8pdjjqUPSJ9thTHpucdPy6UbhZOH0C9rbtLrCfvK5rzrT4D~gKy9woICzG34tKRxNxHYVVUPqx2BiInA__&Key-Pair-Id=K1F55BTI9AHGIK')]}
```


## 带OCR图像的示例


```python
input_ = """i have this url of an id: "https://www.citizencard.com/images/citizencard-uk-id-card-2023.jpg"
i want to extract the information in it.
create a text welcoming the person by his name and make it into speech .
if there is URL in the observations , you will always put it in the output (final answer) .
"""
result = agent_chain(input_)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to extract the information from the ID and then convert it to text and then to speech
Action: edenai_identity_parsing
Action Input: "https://www.citizencard.com/images/citizencard-uk-id-card-2023.jpg"[0m
Observation: [38;5;200m[1;3mlast_name : 
  value : ANGELA
given_names : 
  value : GREENE
birth_place : 
birth_date : 
  value : 2000-11-09
issuance_date : 
expire_date : 
document_id : 
issuing_state : 
address : 
age : 
country : 
document_type : 
  value : DRIVER LICENSE FRONT
gender : 
image_id : 
image_signature : 
mrz : 
nationality : [0m
Thought:[32;1m[1;3m I now need to convert the information to text and then to speech
Action: edenai_text_to_speech
Action Input: "Welcome Angela Greene!"[0m
Observation: [38;5;200m[1;3mhttps://d14uq1pz7dzsdq.cloudfront.net/0c494819-0bbc-4433-bfa4-6e99bd9747ea_.mp3?Expires=1693316851&Signature=YcMoVQgPuIMEOuSpFuvhkFM8JoBMSoGMcZb7MVWdqw7JEf5~67q9dEI90o5todE5mYXB5zSYoib6rGrmfBl4Rn5~yqDwZ~Tmc24K75zpQZIEyt5~ZSnHuXy4IFWGmlIVuGYVGMGKxTGNeCRNUXDhT6TXGZlr4mwa79Ei1YT7KcNyc1dsTrYB96LphnsqOERx4X9J9XriSwxn70X8oUPFfQmLcitr-syDhiwd9Wdpg6J5yHAJjf657u7Z1lFTBMoXGBuw1VYmyno-3TAiPeUcVlQXPueJ-ymZXmwaITmGOfH7HipZngZBziofRAFdhMYbIjYhegu5jS7TxHwRuox32A__&Key-Pair-Id=K1F55BTI9AHGIK[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: https://d14uq1pz7dzsdq.cloudfront.net/0c494819-0bbc-4433-bfa4-6e99bd9747ea_.mp3?Expires=1693316851&Signature=YcMoVQgPuIMEOuSpFuvhkFM8JoBMSoGMcZb7MVWdqw7JEf5~67q9dEI90o5todE5mYXB5zSYoib6rGrmfBl4Rn5~yqDwZ~Tmc24K75zpQZIEyt5~ZSnHuXy4IFWGmlIVuGYVGMGKxTGNeCRNUXDhT6TXGZlr4mwa79Ei1YT7KcNyc1dsTrYB96LphnsqOERx4X9J9XriSwxn70X8oUPFfQmLcitr-syDhiwd9Wdpg6J5y[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```



```output
'https://d14uq1pz7dzsdq.cloudfront.net/0c494819-0bbc-4433-bfa4-6e99bd9747ea_.mp3?Expires=1693316851&Signature=YcMoVQgPuIMEOuSpFuvhkFM8JoBMSoGMcZb7MVWdqw7JEf5~67q9dEI90o5todE5mYXB5zSYoib6rGrmfBl4Rn5~yqDwZ~Tmc24K75zpQZIEyt5~ZSnHuXy4IFWGmlIVuGYVGMGKxTGNeCRNUXDhT6TXGZlr4mwa79Ei1YT7KcNyc1dsTrYB96LphnsqOERx4X9J9XriSwxn70X8oUPFfQmLcitr-syDhiwd9Wdpg6J5y'
```



```python
input_ = """i have this url of an invoice document: "https://app.edenai.run/assets/img/data_1.72e3bdcc.png"
i want to extract the information in it.
and answer these questions :
who is the customer ?
what is the company name ? 
"""
result = agent_chain()
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to extract information from the invoice document
Action: edenai_invoice_parsing
Action Input: "https://app.edenai.run/assets/img/data_1.72e3bdcc.png"[0m
Observation: [36;1m[1;3mcustomer_information : 
  customer_name : Damita J Goldsmith
  customer_address : 201 Stan Fey Dr,Upper Marlboro, MD 20774
  customer_shipping_address : 201 Stan Fey Drive,Upper Marlboro
merchant_information : 
  merchant_name : SNG Engineering Inc
  merchant_address : 344 Main St #200 Gaithersburg, MD 20878 USA
  merchant_phone : +1 301 548 0055
invoice_number : 014-03
taxes : 
payment_term : on receipt of service
date : 2003-01-20
po_number : 
locale : 
bank_informations : 
item_lines : 
  description : Field inspection of construction on 1/19/2003 deficiencies in house,construction, Garage drive way & legal support to Attorney to[0m
Thought:[32;1m[1;3m I now know the answer to the questions
Final Answer: The customer is Damita J Goldsmith and the company name is SNG Engineering Inc.[0m

[1m> Finished chain.[0m
```

```python
result["output"]
```



```output
'The customer is Damita J Goldsmith and the company name is SNG Engineering Inc.'
```



## 相关内容

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
