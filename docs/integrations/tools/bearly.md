---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/bearly.ipynb
---
# Bearly 代码解释器

> Bearly 代码解释器允许远程执行代码。这使其成为代理的代码沙箱，允许安全地实现诸如代码解释器之类的功能。

在这里获取您的 API 密钥: https://bearly.ai/dashboard/developers


```python
%pip install --upgrade --quiet langchain-community
```

在这个笔记本中，我们将创建一个使用 Bearly 与数据交互的代理示例


```python
<!--IMPORTS:[{"imported": "BearlyInterpreterTool", "source": "langchain_community.tools", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.bearly.tool.BearlyInterpreterTool.html", "title": "Bearly Code Interpreter"}]-->
from langchain_community.tools import BearlyInterpreterTool
```


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "Bearly Code Interpreter"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "Bearly Code Interpreter"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Bearly Code Interpreter"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_openai import ChatOpenAI
```

初始化解释器


```python
bearly_tool = BearlyInterpreterTool(api_key="...")
```

让我们向沙箱中添加一些文件


```python
bearly_tool.add_file(
    source_path="sample_data/Bristol.pdf", target_path="Bristol.pdf", description=""
)
bearly_tool.add_file(
    source_path="sample_data/US_GDP.csv", target_path="US_GDP.csv", description=""
)
```

现在创建一个 `Tool` 对象。这是必要的，因为我们添加了文件，我们希望工具描述能够反映这一点


```python
tools = [bearly_tool.as_tool()]
```


```python
tools[0].name
```



```output
'bearly_interpreter'
```



```python
print(tools[0].description)
```
```output
Evaluates python code in a sandbox environment. The environment resets on every execution. You must send the whole script every time and print your outputs. Script should be pure python code that can be evaluated. It should be in python format NOT markdown. The code should NOT be wrapped in backticks. All python packages including requests, matplotlib, scipy, numpy, pandas, etc are available. If you have any files outputted write them to "output/" relative to the execution 
path. Output can only be read from the directory, stdout, and stdin. Do not use things like plot.show() as it will 
not work instead write them out `output/` and a link to the file will be returned. print() any output and results so you can capture the output.

The following files available in the evaluation environment:
- path: `Bristol.pdf` 
 first four lines: [] 
 description: ``
- path: `US_GDP.csv` 
 first four lines: ['DATE,GDP\n', '1947-01-01,243.164\n', '1947-04-01,245.968\n', '1947-07-01,249.585\n'] 
 description: ``
```
初始化代理


```python
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
    handle_parsing_errors=True,
)
```


```python
# Extract pdf content
agent.run("What is the text on page 3 of the pdf?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `bearly_interpreter` with `{'python_code': "import PyPDF2\n\n# Open the PDF file in read-binary mode\npdf_file = open('Bristol.pdf', 'rb')\n\n# Create a PDF file reader object\npdf_reader = PyPDF2.PdfFileReader(pdf_file)\n\n# Get the text from page 3\npage_obj = pdf_reader.getPage(2)\npage_text = page_obj.extractText()\n\n# Close the PDF file\npdf_file.close()\n\nprint(page_text)"}`


[0m[36;1m[1;3m{'stdout': '', 'stderr': 'Traceback (most recent call last):\n  File "/tmp/project/main.py", line 7, in <module>\n    pdf_reader = PyPDF2.PdfFileReader(pdf_file)\n  File "/venv/lib/python3.10/site-packages/PyPDF2/_reader.py", line 1974, in __init__\n    deprecation_with_replacement("PdfFileReader", "PdfReader", "3.0.0")\n  File "/venv/lib/python3.10/site-packages/PyPDF2/_utils.py", line 369, in deprecation_with_replacement\n    deprecation(DEPR_MSG_HAPPENED.format(old_name, removed_in, new_name))\n  File "/venv/lib/python3.10/site-packages/PyPDF2/_utils.py", line 351, in deprecation\n    raise DeprecationError(msg)\nPyPDF2.errors.DeprecationError: PdfFileReader is deprecated and was removed in PyPDF2 3.0.0. Use PdfReader instead.\n', 'fileLinks': [], 'exitCode': 1}[0m[32;1m[1;3m
Invoking: `bearly_interpreter` with `{'python_code': "from PyPDF2 import PdfReader\n\n# Open the PDF file\npdf = PdfReader('Bristol.pdf')\n\n# Get the text from page 3\npage = pdf.pages[2]\npage_text = page.extract_text()\n\nprint(page_text)"}`


[0m[36;1m[1;3m{'stdout': '1 COVID-19 at Work: \nExposing h ow risk is assessed and its consequences in England and Sweden \nPeter Andersson and Tonia Novitz* \n1.Introduction\nT\nhe crisis which arose suddenly at the beginning of 2020 relating to coronavirus was immediately \ncentred on risk. Predictions ha d to be made swiftly regarding how it would spread, who it might \naffect and what measures could be taken to prevent exposure in everyday so cial interaction, \nincluding in the workplace. This was in no way a straightforward assessment, because initially so \nmuch was unknown. Those gaps in our knowledge have since, partially, been ameliorated. It is \nevident that not all those exposed to COVID-19 become ill, and many who contract the virus remain \nasymptomatic, so that the odds on becoming seriously ill may seem small. But those odds are also stacked against certain segments of the population. The likelihood of mortality and morbidity are associated  with age and ethnicity as well as pre -existing medical conditions (such as diabetes), but \nalso with poverty which correlates to the extent of exposure in certain occupations.\n1 Some risks \narise which remain  less predictable, as previously healthy people with no signs of particular \nvulnerability can experience serious long term illness as well and in rare cases will even die.2 \nPerceptions of risk in different countries have led to particular measures taken, ranging from handwashing to social distancing, use of personal protective equipment (PPE) such as face coverings, and even ‘lockdowns’ which have taken various forms.\n3 Use of testing and vaccines \nalso bec ame part of the remedial landscape, with their availability and administration  being \n*This paper is part of the project An  i nclusive and sustainable Swedish labour law – the way\nahead, dnr. 2017-03134 financed by the Swedish research council led by Petra Herzfeld Olssonat Stockholm University. The authors would like to thank her and other participants, Niklas\nBruun and Erik Sjödin for their helpful comments on earlier drafts. A much shorter article titled\n‘Risk Assessment and COVID -19: Systems at work (or not) in England and Sweden’ is published\nin the (2021) Comparative Labour and Social Security Review /\n Revue de droit comparé du\ntravail et de la sécurité sociale.\n1 Public Health England, Disparities in the risk and outcomes of COVID-19 (2 June 2020 -\nhttps://assets.publishing.service.gov.uk/government/uploads/ system /uploads/attachment_data/file\n/890258/disparities_review.pdf.\n2 Nisreen A. Alwan, ‘Track COVID- 19 sickness, not just positive tests and deaths’ ( 2020)\n584.7820 Nature  170- 171; Elisabeth Mahase, ‘Covid-19: What do we know about “long covid”?’\n(2020) BMJ  370.\n3 Sarah Dryhurst, Claudia R. Schneider, John Kerr, Alexandra LJ Freeman, Gabriel Recchia,\nAnne Marthe Van Der Bles, David Spiegelhalter, and Sander van der Linden, ‘Risk perceptionsof COVID-19 around the world’ (2020) 23(7- 8) Journal of Risk Research  994; Wändi Bruine de\nBruin, and Daniel Bennett, ‘Relationships between initial COVID -19 risk perceptions and\nprotective health behaviors: A national survey’ (2020) 59(2) American Journal of Prev entive\nMedicine  157; and Simon Deakin and Gaofeng Meng, ‘The Governance of Covid- 19:\nAnthropogenic Risk, Evolutionary Learning, and the Future of the Social State’ (2020)49(4) Industrial Law Journal  539.\n', 'stderr': '', 'fileLinks': [], 'exitCode': 0}[0m[32;1m[1;3mThe text on page 3 of the PDF is:

"1 COVID-19 at Work: 
Exposing how risk is assessed and its consequences in England and Sweden 
Peter Andersson and Tonia Novitz* 
1.Introduction
The crisis which arose suddenly at the beginning of 2020 relating to coronavirus was immediately 
centred on risk. Predictions had to be made swiftly regarding how it would spread, who it might 
affect and what measures could be taken to prevent exposure in everyday social interaction, 
including in the workplace. This was in no way a straightforward assessment, because initially so 
much was unknown. Those gaps in our knowledge have since, partially, been ameliorated. It is 
evident that not all those exposed to COVID-19 become ill, and many who contract the virus remain 
asymptomatic, so that the odds on becoming seriously ill may seem small. But those odds are also stacked against certain segments of the population. The likelihood of mortality and morbidity are associated  with age and ethnicity as well as pre-existing medical conditions (such as diabetes), but 
also with poverty which correlates to the extent of exposure in certain occupations.
1 Some risks 
arise which remain  less predictable, as previously healthy people with no signs of particular 
vulnerability can experience serious long term illness as well and in rare cases will even die.2 
Perceptions of risk in different countries have led to particular measures taken, ranging from handwashing to social distancing, use of personal protective equipment (PPE) such as face coverings, and even ‘lockdowns’ which have taken various forms.
3 Use of testing and vaccines 
also became part of the remedial landscape, with their availability and administration  being 
*This paper is part of the project An  inclusive and sustainable Swedish labour law – the way
ahead, dnr. 2017-03134 financed by the Swedish research council led by Petra Herzfeld Olssonat Stockholm University. The authors would like to thank her and other participants, Niklas
Bruun and Erik Sjödin for their helpful comments on earlier drafts. A much shorter article titled
‘Risk Assessment and COVID -19: Systems at work (or not) in England and Sweden’ is published
in the (2021) Comparative Labour and Social Security Review /
 Revue de droit comparé du
travail et de la sécurité sociale.
1 Public Health England, Disparities in the risk and outcomes of COVID-19 (2 June 2020 -
https://assets.publishing.service.gov.uk/government/uploads/ system /uploads/attachment_data/file
/890258/disparities_review.pdf.
2 Nisreen A. Alwan, ‘Track COVID- 19 sickness, not just positive tests and deaths’ ( 2020)
584.7820 Nature  170- 171; Elisabeth Mahase, ‘Covid-19: What do we know about “long covid”?’
(2020) BMJ  370.
3 Sarah Dryhurst, Claudia R. Schneider, John Kerr, Alexandra LJ Freeman, Gabriel Recchia,
Anne Marthe Van Der Bles, David Spiegelhalter, and Sander van der Linden, ‘Risk perceptionsof COVID-19 around the world’ (2020) 23(7- 8) Journal of Risk Research  994; Wändi Bruine de
Bruin, and Daniel Bennett, ‘Relationships between initial COVID -19 risk perceptions and
protective health behaviors: A national survey’ (2020) 59(2) American Journal of Preventive
Medicine  157; and Simon Deakin and Gaofeng Meng, ‘The Governance of Covid- 19:
Anthropogenic Risk, Evolutionary Learning, and the Future of the Social State’ (2020)49(4) Industrial Law Journal  539."[0m

[1m> Finished chain.[0m
```


```output
'The text on page 3 of the PDF is:\n\n"1 COVID-19 at Work: \nExposing how risk is assessed and its consequences in England and Sweden \nPeter Andersson and Tonia Novitz* \n1.Introduction\nThe crisis which arose suddenly at the beginning of 2020 relating to coronavirus was immediately \ncentred on risk. Predictions had to be made swiftly regarding how it would spread, who it might \naffect and what measures could be taken to prevent exposure in everyday social interaction, \nincluding in the workplace. This was in no way a straightforward assessment, because initially so \nmuch was unknown. Those gaps in our knowledge have since, partially, been ameliorated. It is \nevident that not all those exposed to COVID-19 become ill, and many who contract the virus remain \nasymptomatic, so that the odds on becoming seriously ill may seem small. But those odds are also stacked against certain segments of the population. The likelihood of mortality and morbidity are associated  with age and ethnicity as well as pre-existing medical conditions (such as diabetes), but \nalso with poverty which correlates to the extent of exposure in certain occupations.\n1 Some risks \narise which remain  less predictable, as previously healthy people with no signs of particular \nvulnerability can experience serious long term illness as well and in rare cases will even die.2 \nPerceptions of risk in different countries have led to particular measures taken, ranging from handwashing to social distancing, use of personal protective equipment (PPE) such as face coverings, and even ‘lockdowns’ which have taken various forms.\n3 Use of testing and vaccines \nalso became part of the remedial landscape, with their availability and administration  being \n*This paper is part of the project An  inclusive and sustainable Swedish labour law – the way\nahead, dnr. 2017-03134 financed by the Swedish research council led by Petra Herzfeld Olssonat Stockholm University. The authors would like to thank her and other participants, Niklas\nBruun and Erik Sjödin for their helpful comments on earlier drafts. A much shorter article titled\n‘Risk Assessment and COVID -19: Systems at work (or not) in England and Sweden’ is published\nin the (2021) Comparative Labour and Social Security Review /\n Revue de droit comparé du\ntravail et de la sécurité sociale.\n1 Public Health England, Disparities in the risk and outcomes of COVID-19 (2 June 2020 -\nhttps://assets.publishing.service.gov.uk/government/uploads/ system /uploads/attachment_data/file\n/890258/disparities_review.pdf.\n2 Nisreen A. Alwan, ‘Track COVID- 19 sickness, not just positive tests and deaths’ ( 2020)\n584.7820 Nature  170- 171; Elisabeth Mahase, ‘Covid-19: What do we know about “long covid”?’\n(2020) BMJ  370.\n3 Sarah Dryhurst, Claudia R. Schneider, John Kerr, Alexandra LJ Freeman, Gabriel Recchia,\nAnne Marthe Van Der Bles, David Spiegelhalter, and Sander van der Linden, ‘Risk perceptionsof COVID-19 around the world’ (2020) 23(7- 8) Journal of Risk Research  994; Wändi Bruine de\nBruin, and Daniel Bennett, ‘Relationships between initial COVID -19 risk perceptions and\nprotective health behaviors: A national survey’ (2020) 59(2) American Journal of Preventive\nMedicine  157; and Simon Deakin and Gaofeng Meng, ‘The Governance of Covid- 19:\nAnthropogenic Risk, Evolutionary Learning, and the Future of the Social State’ (2020)49(4) Industrial Law Journal  539."'
```



```python
# Simple Queries
agent.run("What was the US GDP in 2019?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `bearly_interpreter` with `{'python_code': "import pandas as pd\n\n# Load the data\nus_gdp = pd.read_csv('US_GDP.csv')\n\n# Convert the 'DATE' column to datetime\nus_gdp['DATE'] = pd.to_datetime(us_gdp['DATE'])\n\n# Filter the data for the year 2019\nus_gdp_2019 = us_gdp[us_gdp['DATE'].dt.year == 2019]\n\n# Print the GDP for 2019\nprint(us_gdp_2019['GDP'].values)"}`


[0m[36;1m[1;3m{'stdout': '[21104.133 21384.775 21694.282 21902.39 ]\n', 'stderr': '', 'fileLinks': [], 'exitCode': 0}[0m[32;1m[1;3mThe US GDP for each quarter in 2019 was as follows:

- Q1: 21104.133 billion dollars
- Q2: 21384.775 billion dollars
- Q3: 21694.282 billion dollars
- Q4: 21902.39 billion dollars[0m

[1m> Finished chain.[0m
```


```output
'The US GDP for each quarter in 2019 was as follows:\n\n- Q1: 21104.133 billion dollars\n- Q2: 21384.775 billion dollars\n- Q3: 21694.282 billion dollars\n- Q4: 21902.39 billion dollars'
```



```python
# Calculations
agent.run("What would the GDP be in 2030 if the latest GDP number grew by 50%?")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `bearly_interpreter` with `{'python_code': "import pandas as pd\n\n# Load the data\nus_gdp = pd.read_csv('US_GDP.csv')\n\n# Get the latest GDP\nlatest_gdp = us_gdp['GDP'].iloc[-1]\n\n# Calculate the GDP in 2030 if the latest GDP number grew by 50%\ngdp_2030 = latest_gdp * 1.5\nprint(gdp_2030)"}`


[0m[36;1m[1;3m{'stdout': '40594.518\n', 'stderr': '', 'fileLinks': [], 'exitCode': 0}[0m[32;1m[1;3mIf the latest GDP number grew by 50%, the GDP in 2030 would be approximately 40,594.518 billion dollars.[0m

[1m> Finished chain.[0m
```


```output
'If the latest GDP number grew by 50%, the GDP in 2030 would be approximately 40,594.518 billion dollars.'
```



```python
# Chart output
agent.run("Create a nice and labeled chart of the GDP growth over time")
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mCould not parse tool input: {'name': 'bearly_interpreter', 'arguments': '{\n  "python_code": "\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Load the data\ndf = pd.read_csv(\'US_GDP.csv\')\n\n# Convert the \'DATE\' column to datetime format\ndf[\'DATE\'] = pd.to_datetime(df[\'DATE\'])\n\n# Plot the data\nplt.figure(figsize=(10,6))\nplt.plot(df[\'DATE\'], df[\'GDP\'], label=\'US GDP\')\nplt.xlabel(\'Year\')\nplt.ylabel(\'GDP (in billions)\')\nplt.title(\'US GDP Over Time\')\nplt.legend()\nplt.grid(True)\nplt.savefig(\'output/US_GDP.png\')\n"\n}'} because the `arguments` is not valid JSON.[0mInvalid or incomplete response[32;1m[1;3m
Invoking: `bearly_interpreter` with `{'python_code': "\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Load the data\ndf = pd.read_csv('US_GDP.csv')\n\n# Convert the 'DATE' column to datetime format\ndf['DATE'] = pd.to_datetime(df['DATE'])\n\n# Plot the data\nplt.figure(figsize=(10,6))\nplt.plot(df['DATE'], df['GDP'], label='US GDP')\nplt.xlabel('Year')\nplt.ylabel('GDP (in billions)')\nplt.title('US GDP Over Time')\nplt.legend()\nplt.grid(True)\nplt.savefig('output/US_GDP.png')\n"}`


[0m[36;1m[1;3m{'stdout': '', 'stderr': '', 'fileLinks': [{'pathname': 'US_GDP.png', 'tempLink': 'https://bearly-cubby.c559ae877a0a39985f534614a037d899.r2.cloudflarestorage.com/prod/bearly-cubby/temp/interpreter/2023_10/089daf37e9e343ba5ff21afaaa78b967c3466a550b3b11bd5c710c052b559e97/sxhM8gop2AYP88n5uHCsOJ6yTYNQm-HimZ70DcwQ4VI.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=c058d02de50a3cf0bb7e21c8e2d062c5%2F20231010%2F%2Fs3%2Faws4_request&X-Amz-Date=20231010T000000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=104dc0d4a4b71eeea1030dda1830059920cb0f354fa00197b439eb8565bf141a', 'size': 34275}], 'exitCode': 0}[0m[32;1m[1;3mHere is the chart of the US GDP growth over time:

![US GDP Over Time](https://bearly-cubby.c559ae877a0a39985f534614a037d899.r2.cloudflarestorage.com/prod/bearly-cubby/temp/interpreter/2023_10/089daf37e9e343ba5ff21afaaa78b967c3466a550b3b11bd5c710c052b559e97/sxhM8gop2AYP88n5uHCsOJ6yTYNQm-HimZ70DcwQ4VI.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=c058d02de50a3cf0bb7e21c8e2d062c5%2F20231010%2F%2Fs3%2Faws4_request&X-Amz-Date=20231010T000000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=104dc0d4a4b71eeea1030dda1830059920cb0f354fa00197b439eb8565bf141a)

The x-axis represents the year and the y-axis represents the GDP in billions. The line plot shows the growth of the US GDP over time.[0m

[1m> Finished chain.[0m
```


```output
'Here is the chart of the US GDP growth over time:\n\n![US GDP Over Time](https://bearly-cubby.c559ae877a0a39985f534614a037d899.r2.cloudflarestorage.com/prod/bearly-cubby/temp/interpreter/2023_10/089daf37e9e343ba5ff21afaaa78b967c3466a550b3b11bd5c710c052b559e97/sxhM8gop2AYP88n5uHCsOJ6yTYNQm-HimZ70DcwQ4VI.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=c058d02de50a3cf0bb7e21c8e2d062c5%2F20231010%2F%2Fs3%2Faws4_request&X-Amz-Date=20231010T000000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=104dc0d4a4b71eeea1030dda1830059920cb0f354fa00197b439eb8565bf141a)\n\nThe x-axis represents the year and the y-axis represents the GDP in billions. The line plot shows the growth of the US GDP over time.'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
