---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/you.ipynb
---
# You.com 搜索

You.com API 是一套工具，旨在帮助开发者将大型语言模型的输出与最新、最准确、最相关的信息结合起来，这些信息可能未包含在其训练数据集中。

## 设置

该工具位于 `langchain-community` 包中。

您还需要设置您的 you.com API 密钥。


```python
%pip install --upgrade --quiet langchain-community
```


```python
import os

os.environ["YDC_API_KEY"] = ""

# For use in Chaining section
os.environ["OPENAI_API_KEY"] = ""

## ALTERNATIVE: load YDC_API_KEY from a .env file

# !pip install --quiet -U python-dotenv
# import dotenv
# dotenv.load_dotenv()
```

为了获得最佳的可观察性，设置 [LangSmith](https://smith.langchain.com/) 也是有帮助的（但不是必需的）


```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 工具使用


```python
<!--IMPORTS:[{"imported": "YouSearchTool", "source": "langchain_community.tools.you", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.you.tool.YouSearchTool.html", "title": "You.com Search"}, {"imported": "YouSearchAPIWrapper", "source": "langchain_community.utilities.you", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.you.YouSearchAPIWrapper.html", "title": "You.com Search"}]-->
from langchain_community.tools.you import YouSearchTool
from langchain_community.utilities.you import YouSearchAPIWrapper

api_wrapper = YouSearchAPIWrapper(num_web_results=1)
tool = YouSearchTool(api_wrapper=api_wrapper)

tool
```



```output
YouSearchTool(api_wrapper=YouSearchAPIWrapper(ydc_api_key='054da371-e73b-47c1-a6d9-3b0cddf0fa3e<__>1Obt7EETU8N2v5f4MxaH0Zhx', num_web_results=1, safesearch=None, country=None, k=None, n_snippets_per_hit=None, endpoint_type='search', n_hits=None))
```



```python
# .invoke wraps utility.results
response = tool.invoke("What is the weather in NY")

# .invoke should have a Document for each `snippet`
print(len(response))

for item in response:
    print(item)
```
```output
7
page_content='10 Day Weather-Manhattan, NY\nToday43°/39°1%\nToday\nSun 31 | Day\nGenerally cloudy. High 43F. Winds W at 10 to 15 mph.\n- Humidity54%\n- UV Index0 of 11\n- Sunrise7:19 am\n- Sunset4:38 pm\nSun 31 | Night\nCloudy. Low 39F. Winds light and variable.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:13 pmWaning Gibbous\n- Moonset10:28 am\nMon 0145°/33°7%\nMon 01\nMon 01 | Day\nConsiderable cloudiness. High around 45F. Winds light and variable.\n- Humidity71%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:39 pm\nMon 01 | Night\nA few clouds. Low 33F. Winds NNW at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise10:14 pmWaning Gibbous\n- Moonset10:49 am\nTue 0246°/35°4%\nTue 02\nTue 02 | Day\nMainly sunny. High 46F. Winds NW at 5 to 10 mph.\n- Humidity52%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:40 pm\nTue 02 | Night\nA few clouds overnight. Low around 35F. Winds W at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise11:13 pmWaning Gibbous\n- Moonset11:08 am\nWed 0346°/38°4%\nWed 03\nWed 03 | Day' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='Radar\nLatest News\nOur Changing World\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nChoose how my information is shared' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='- Humidity82%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nCloudy with light rain developing after midnight. Low 47F. Winds light and variable. Chance of rain 80%.\n- Humidity90%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2754°/49°93%\nWed 27\nWed 27 | Day\nRain. High 54F. Winds E at 5 to 10 mph. Chance of rain 90%. Rainfall near a half an inch.\n- Humidity93%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nSteady light rain in the evening. Showers continuing late. Low 49F. Winds light and variable. Chance of rain 70%.\n- Humidity91%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:12 am\nThu 2853°/42°19%\nThu 28\nThu 28 | Day\nCloudy skies early will become partly cloudy later in the day. Slight chance of a rain shower. High 53F. Winds WSW at 5 to 10 mph.\n- Humidity77%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:36 pm\nThu 28 | Night\nPartly cloudy skies. Low 42F. Winds W at 5 to 10 mph.\n- Humidity71%\n- UV Index0 of 11' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='- Moonrise2:20 amWaning Crescent\n- Moonset12:33 pm\nSun 0740°/29°19%\nSun 07\nSun 07 | Day\nIntervals of clouds and sunshine. High around 40F. Winds NW at 5 to 10 mph.\n- Humidity57%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:44 pm\nSun 07 | Night\nA few clouds from time to time. Low 29F. Winds NNW at 5 to 10 mph.\n- Humidity60%\n- UV Index0 of 11\n- Moonrise3:28 amWaning Crescent\n- Moonset1:04 pm\nMon 0840°/32°35%\nMon 08\nMon 08 | Day\nPartly cloudy early followed mostly cloudy skies and a few snow showers later in the day. High near 40F. Winds N at 5 to 10 mph. Chance of snow 40%.\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:45 pm\nMon 08 | Night\nVariable clouds with snow showers or flurries. Low 32F. Winds NNE at 5 to 10 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise4:40 amWaning Crescent\n- Moonset1:43 pm\nLatest News\nOur Changing World\nYour Privacy' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='- Humidity91%\n- UV Index0 of 11\n- Moonrise5:50 amWaning Crescent\n- Moonset2:35 pm\nWed 1056°/39°34%\nWed 10\nWed 10 | Day\nA shower or two possible early with partly cloudy skies in the afternoon. Morning high of 56F with temps falling to near 45. Winds SW at 15 to 25 mph. Chance of rain 30%.\n- Humidity66%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:47 pm\nWed 10 | Night\nA few clouds from time to time. Low 39F. Winds WSW at 10 to 20 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise6:56 amWaning Crescent\n- Moonset3:38 pm\nThu 1147°/38°5%\nThu 11\nThu 11 | Day\nPartly cloudy. High 47F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:48 pm\nThu 11 | Night\nMostly clear skies. Low 38F. Winds W at 5 to 10 mph.\n- Humidity66%\n- UV Index0 of 11\n- Moonrise7:52 amNew Moon\n- Moonset4:53 pm\nFri 1248°/42°19%\nFri 12\nFri 12 | Day\nIntervals of clouds and sunshine. High 48F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:18 am\n- Sunset4:49 pm' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='Sat 1346°/36°53%\nSat 13\nSat 13 | Day\nCloudy with showers. High 46F. Winds WSW at 10 to 15 mph. Chance of rain 50%.\n- Humidity73%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:50 pm\nSat 13 | Night\nRain showers early transitioning to snow showers late. Low 36F. Winds W at 10 to 15 mph. Chance of precip 50%.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:14 amWaxing Crescent\n- Moonset7:33 pm\nSun 1442°/34°37%\nSun 14\nSun 14 | Day\nSnow showers early will transition to a few showers later. High 42F. Winds WSW at 10 to 15 mph. Chance of rain 40%.\n- Humidity63%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:51 pm\nSun 14 | Night\nVariable clouds with snow showers. Low 34F. Winds W at 10 to 15 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise9:44 amWaxing Crescent\n- Moonset8:52 pm\nMon 1540°/31°51%\nMon 15\nMon 15 | Day' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
page_content='- Humidity70%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nMon 25 | Night\nOvercast with showers at times. Low 43F. Winds light and variable. Chance of rain 40%.\n- Humidity80%\n- UV Index0 of 11\n- Moonrise3:08 pmWaxing Gibbous\n- Moonset6:14 am\nTue 2653°/45°58%\nTue 26\nTue 26 | Day\nOvercast with rain showers at times. High 53F. Winds E at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nShowers early then scattered thunderstorms developing late. Low near 45F. Winds ESE at 5 to 10 mph. Chance of rain 60%.\n- Humidity93%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2751°/41°58%\nWed 27\nWed 27 | Day\nCloudy with showers. High 51F. Winds WSW at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nCloudy with showers. Low 41F. Winds NW at 5 to 10 mph. Chance of rain 60%.\n- Humidity72%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:13 am' metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': None, 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Some sun in the morning with increasing clouds during the afternoon. High around 45F. Winds SSE at 5 to 10 mph. ... Cloudy with showers. Low near 40F. Winds SSE at 5 to 10 mph. Chance of rain 60%. ... A steady rain in the morning. Showers continuing in the afternoon.'}
```
## 链接

我们在这里展示如何将其作为 [代理](/docs/tutorials/agents) 的一部分使用。我们使用 OpenAI 函数代理，因此我们需要设置和安装所需的依赖项。我们还将使用 [LangSmith Hub](https://smith.langchain.com/hub) 来提取提示，因此我们需要安装它。


```python
# you need a model to use in the chain
!pip install --upgrade --quiet langchain langchain-openai langchainhub langchain-community
```


```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent.AgentExecutor.html", "title": "You.com Search"}, {"imported": "create_openai_functions_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.openai_functions_agent.base.create_openai_functions_agent.html", "title": "You.com Search"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "You.com Search"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
llm = ChatOpenAI(temperature=0)
you_tool = YouSearchTool(api_wrapper=YouSearchAPIWrapper(num_web_results=1))
tools = [you_tool]
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)
```


```python
agent_executor.invoke({"input": "What is the weather in NY today?"})
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `you_search` with `{'query': 'weather in NY today'}`


[0m[36;1m[1;3m[Document(page_content="New York City, NY Forecast\nWeather Today in New York City, NY\nFeels Like43°\n7:17 am\n4:32 pm\nHigh / Low\n--/39°\nWind\n3 mph\nHumidity\n63%\nDew Point\n31°\nPressure\n30.44 in\nUV Index\n0 of 11\nVisibility\n10 mi\nMoon Phase\nWaxing Gibbous\nAdvertisement\nLatest News\nHealth & Activities\nAdvertisement\nAir Quality Index\nGood\nAir quality is considered satisfactory, and air pollution poses little or no risk.\nAdvertisement\nHappening Near New York City, NY\nPopular Nextdoor posts\nHas anyone announced --in which case I apologize--that Bo's Bagels--opened yesterday where Tommy's pizza once was on uptown side of Broadway, bet 155 and 156.They have been incredibly successful in Harlem ( W.116th) and are now spreading their wings. Open 8-3 now, will go later soon, delivers and has many varieties baked on site!!! Just had lunch there!!\nWash Hts S (W155-W159-Bdway)\nNeighbor\n4d ago", metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'}), Document(page_content='time hearing racial slurs in my life and in NYC. So I don’t know why tonight’s encounter makes me feel so helpless and sad. Her apartment is on our usual route for walks, and now I’m already thinking about how I need to behave if this situation repeats again. This just doesn’t feel fair. How would you handle it? Thanks for reading!', metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'}), Document(page_content="Hell's Kitchen\nNeighbor\n4d ago\nJust curious.Are the M100/M100 and BX19 buses free? It seems like I'm the only one who pays. Even had a group of non-payers give attitude because I held up the line to pay my fare. Non-payers being whole families, men and women of all ages. I remember when you used to be scared to walk on for free but do understand the drivers are told not to intervene. Still it should either be free or paid fare.\nHamilton Hts (W148St-Broadway)\nNeighbor\n4d ago\nHey there, I am a journalism student at Craig Newmark School of Journalism looking for stories in the Lower East Side and East Village.Any ideas?\nAlphabet City\nNeighbor\n8d ago\nProvided by\nAdvertisement\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nReview All Privacy and Ad Settings\nChoose how my information is shared", metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'}), Document(page_content='Review All Privacy and Ad Settings\nChoose how my information is shared', metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'}), Document(page_content='2d ago\nProvided by\nAdvertisement\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nReview All Privacy and Ad Settings\nChoose how my information is shared', metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'}), Document(page_content="Lenox Hill\nNeighbor\n8d ago\nParking.It is getting worst. What happened to resident-only neighborhood parking program? With this upcoming congested traffic tolling below 96th Street, competition for parking bordering the zone is going to get tougher. This should be part of the congested traffic agenda.\nCent Harlem S (120-FDouglass)\nNeighbor\n9d ago\nI thought these sites were much more localized.If there is one for the UWS I'll join it but have no reason to be reading about Yorkville or Union NJ.\nLincoln Sq (W70-Amst-66-WEnd)\nNeighbor\n10d ago\nProvided by\nAdvertisement\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nReview All Privacy and Ad Settings\nChoose how my information is shared", metadata={'url': 'https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84', 'thumbnail_url': None, 'title': 'Weather Forecast and Conditions for New York City, NY - The Weather ...', 'description': 'Today’s and tonight’s New York City, NY weather forecast, weather conditions and Doppler radar from The Weather Channel and Weather.com'})][0m[32;1m[1;3mThe weather in New York City today is as follows:
- Feels Like: 43°F
- High/Low: --/39°F
- Wind: 3 mph
- Humidity: 63%
- Dew Point: 31°F
- Pressure: 30.44 in
- UV Index: 0 of 11
- Visibility: 10 mi
- Moon Phase: Waxing Gibbous

For more details, you can visit [The Weather Channel](https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84).[0m

[1m> Finished chain.[0m
```


```output
{'input': 'What is the weather in NY today?',
 'output': 'The weather in New York City today is as follows:\n- Feels Like: 43°F\n- High/Low: --/39°F\n- Wind: 3 mph\n- Humidity: 63%\n- Dew Point: 31°F\n- Pressure: 30.44 in\n- UV Index: 0 of 11\n- Visibility: 10 mi\n- Moon Phase: Waxing Gibbous\n\nFor more details, you can visit [The Weather Channel](https://weather.com/weather/today/l/96f2f84af9a5f5d452eb0574d4e4d8a840c71b05e22264ebdc0056433a642c84).'}
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
