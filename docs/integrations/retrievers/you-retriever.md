---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/retrievers/you-retriever.ipynb
---
# You.com

>[you.com API](https://api.you.com) 是一套工具，旨在帮助开发者将大型语言模型的输出与最新、最准确、最相关的信息结合起来，这些信息可能未包含在其训练数据集中。

## 设置

检索器位于 `langchain-community` 包中。

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
# os.environ["LANGCHAIN_PROJECT"] = 'Experimentz'
```

## 实用工具使用


```python
<!--IMPORTS:[{"imported": "YouSearchAPIWrapper", "source": "langchain_community.utilities", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.you.YouSearchAPIWrapper.html", "title": "You.com"}]-->
from langchain_community.utilities import YouSearchAPIWrapper

utility = YouSearchAPIWrapper(num_web_results=1)

utility
```


```python
import json

# .raw_results returns the unaltered response from the API
response = utility.raw_results(query="What is the weather in NY")
# API returns an object with a `hits` key containing a list of hits
hits = response["hits"]

# with `num_web_results=1`, `hits` should be len of 1
print(len(hits))

print(json.dumps(hits, indent=2))
```
```output
1
[
  {
    "description": "Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com",
    "snippets": [
      "10 Day Weather-Manhattan, NY\nToday43\u00b0/39\u00b01%\nToday\nSun 31 | Day\nGenerally cloudy. High 43F. Winds W at 10 to 15 mph.\n- Humidity54%\n- UV Index0 of 11\n- Sunrise7:19 am\n- Sunset4:38 pm\nSun 31 | Night\nCloudy. Low 39F. Winds light and variable.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:13 pmWaning Gibbous\n- Moonset10:28 am\nMon 0145\u00b0/33\u00b07%\nMon 01\nMon 01 | Day\nConsiderable cloudiness. High around 45F. Winds light and variable.\n- Humidity71%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:39 pm\nMon 01 | Night\nA few clouds. Low 33F. Winds NNW at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise10:14 pmWaning Gibbous\n- Moonset10:49 am\nTue 0246\u00b0/35\u00b04%\nTue 02\nTue 02 | Day\nMainly sunny. High 46F. Winds NW at 5 to 10 mph.\n- Humidity52%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:40 pm\nTue 02 | Night\nA few clouds overnight. Low around 35F. Winds W at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise11:13 pmWaning Gibbous\n- Moonset11:08 am\nWed 0346\u00b0/38\u00b04%\nWed 03\nWed 03 | Day",
      "Radar\nLatest News\nOur Changing World\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nChoose how my information is shared",
      "- Humidity82%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nCloudy with light rain developing after midnight. Low 47F. Winds light and variable. Chance of rain 80%.\n- Humidity90%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2754\u00b0/49\u00b093%\nWed 27\nWed 27 | Day\nRain. High 54F. Winds E at 5 to 10 mph. Chance of rain 90%. Rainfall near a half an inch.\n- Humidity93%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nSteady light rain in the evening. Showers continuing late. Low 49F. Winds light and variable. Chance of rain 70%.\n- Humidity91%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:12 am\nThu 2853\u00b0/42\u00b019%\nThu 28\nThu 28 | Day\nCloudy skies early will become partly cloudy later in the day. Slight chance of a rain shower. High 53F. Winds WSW at 5 to 10 mph.\n- Humidity77%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:36 pm\nThu 28 | Night\nPartly cloudy skies. Low 42F. Winds W at 5 to 10 mph.\n- Humidity71%\n- UV Index0 of 11",
      "- Moonrise2:20 amWaning Crescent\n- Moonset12:33 pm\nSun 0740\u00b0/29\u00b019%\nSun 07\nSun 07 | Day\nIntervals of clouds and sunshine. High around 40F. Winds NW at 5 to 10 mph.\n- Humidity57%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:44 pm\nSun 07 | Night\nA few clouds from time to time. Low 29F. Winds NNW at 5 to 10 mph.\n- Humidity60%\n- UV Index0 of 11\n- Moonrise3:28 amWaning Crescent\n- Moonset1:04 pm\nMon 0840\u00b0/32\u00b035%\nMon 08\nMon 08 | Day\nPartly cloudy early followed mostly cloudy skies and a few snow showers later in the day. High near 40F. Winds N at 5 to 10 mph. Chance of snow 40%.\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:45 pm\nMon 08 | Night\nVariable clouds with snow showers or flurries. Low 32F. Winds NNE at 5 to 10 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise4:40 amWaning Crescent\n- Moonset1:43 pm\nLatest News\nOur Changing World\nYour Privacy",
      "- Humidity91%\n- UV Index0 of 11\n- Moonrise5:50 amWaning Crescent\n- Moonset2:35 pm\nWed 1056\u00b0/39\u00b034%\nWed 10\nWed 10 | Day\nA shower or two possible early with partly cloudy skies in the afternoon. Morning high of 56F with temps falling to near 45. Winds SW at 15 to 25 mph. Chance of rain 30%.\n- Humidity66%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:47 pm\nWed 10 | Night\nA few clouds from time to time. Low 39F. Winds WSW at 10 to 20 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise6:56 amWaning Crescent\n- Moonset3:38 pm\nThu 1147\u00b0/38\u00b05%\nThu 11\nThu 11 | Day\nPartly cloudy. High 47F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:48 pm\nThu 11 | Night\nMostly clear skies. Low 38F. Winds W at 5 to 10 mph.\n- Humidity66%\n- UV Index0 of 11\n- Moonrise7:52 amNew Moon\n- Moonset4:53 pm\nFri 1248\u00b0/42\u00b019%\nFri 12\nFri 12 | Day\nIntervals of clouds and sunshine. High 48F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:18 am\n- Sunset4:49 pm",
      "Sat 1346\u00b0/36\u00b053%\nSat 13\nSat 13 | Day\nCloudy with showers. High 46F. Winds WSW at 10 to 15 mph. Chance of rain 50%.\n- Humidity73%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:50 pm\nSat 13 | Night\nRain showers early transitioning to snow showers late. Low 36F. Winds W at 10 to 15 mph. Chance of precip 50%.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:14 amWaxing Crescent\n- Moonset7:33 pm\nSun 1442\u00b0/34\u00b037%\nSun 14\nSun 14 | Day\nSnow showers early will transition to a few showers later. High 42F. Winds WSW at 10 to 15 mph. Chance of rain 40%.\n- Humidity63%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:51 pm\nSun 14 | Night\nVariable clouds with snow showers. Low 34F. Winds W at 10 to 15 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise9:44 amWaxing Crescent\n- Moonset8:52 pm\nMon 1540\u00b0/31\u00b051%\nMon 15\nMon 15 | Day",
      "- Humidity70%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nMon 25 | Night\nOvercast with showers at times. Low 43F. Winds light and variable. Chance of rain 40%.\n- Humidity80%\n- UV Index0 of 11\n- Moonrise3:08 pmWaxing Gibbous\n- Moonset6:14 am\nTue 2653\u00b0/45\u00b058%\nTue 26\nTue 26 | Day\nOvercast with rain showers at times. High 53F. Winds E at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nShowers early then scattered thunderstorms developing late. Low near 45F. Winds ESE at 5 to 10 mph. Chance of rain 60%.\n- Humidity93%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2751\u00b0/41\u00b058%\nWed 27\nWed 27 | Day\nCloudy with showers. High 51F. Winds WSW at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nCloudy with showers. Low 41F. Winds NW at 5 to 10 mph. Chance of rain 60%.\n- Humidity72%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:13 am"
    ],
    "thumbnail_url": "https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw",
    "title": "10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...",
    "url": "https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US"
  }
]
```

```python
# .results returns parsed results with each snippet in a Document
response = utility.results(query="What is the weather in NY")

# .results should have a Document for each `snippet`
print(len(response))

print(response)
```
```output
7
[Document(page_content='10 Day Weather-Manhattan, NY\nToday43°/39°1%\nToday\nSun 31 | Day\nGenerally cloudy. High 43F. Winds W at 10 to 15 mph.\n- Humidity54%\n- UV Index0 of 11\n- Sunrise7:19 am\n- Sunset4:38 pm\nSun 31 | Night\nCloudy. Low 39F. Winds light and variable.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:13 pmWaning Gibbous\n- Moonset10:28 am\nMon 0145°/33°7%\nMon 01\nMon 01 | Day\nConsiderable cloudiness. High around 45F. Winds light and variable.\n- Humidity71%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:39 pm\nMon 01 | Night\nA few clouds. Low 33F. Winds NNW at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise10:14 pmWaning Gibbous\n- Moonset10:49 am\nTue 0246°/35°4%\nTue 02\nTue 02 | Day\nMainly sunny. High 46F. Winds NW at 5 to 10 mph.\n- Humidity52%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:40 pm\nTue 02 | Night\nA few clouds overnight. Low around 35F. Winds W at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise11:13 pmWaning Gibbous\n- Moonset11:08 am\nWed 0346°/38°4%\nWed 03\nWed 03 | Day', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='Radar\nLatest News\nOur Changing World\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nChoose how my information is shared', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity82%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nCloudy with light rain developing after midnight. Low 47F. Winds light and variable. Chance of rain 80%.\n- Humidity90%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2754°/49°93%\nWed 27\nWed 27 | Day\nRain. High 54F. Winds E at 5 to 10 mph. Chance of rain 90%. Rainfall near a half an inch.\n- Humidity93%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nSteady light rain in the evening. Showers continuing late. Low 49F. Winds light and variable. Chance of rain 70%.\n- Humidity91%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:12 am\nThu 2853°/42°19%\nThu 28\nThu 28 | Day\nCloudy skies early will become partly cloudy later in the day. Slight chance of a rain shower. High 53F. Winds WSW at 5 to 10 mph.\n- Humidity77%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:36 pm\nThu 28 | Night\nPartly cloudy skies. Low 42F. Winds W at 5 to 10 mph.\n- Humidity71%\n- UV Index0 of 11', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Moonrise2:20 amWaning Crescent\n- Moonset12:33 pm\nSun 0740°/29°19%\nSun 07\nSun 07 | Day\nIntervals of clouds and sunshine. High around 40F. Winds NW at 5 to 10 mph.\n- Humidity57%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:44 pm\nSun 07 | Night\nA few clouds from time to time. Low 29F. Winds NNW at 5 to 10 mph.\n- Humidity60%\n- UV Index0 of 11\n- Moonrise3:28 amWaning Crescent\n- Moonset1:04 pm\nMon 0840°/32°35%\nMon 08\nMon 08 | Day\nPartly cloudy early followed mostly cloudy skies and a few snow showers later in the day. High near 40F. Winds N at 5 to 10 mph. Chance of snow 40%.\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:45 pm\nMon 08 | Night\nVariable clouds with snow showers or flurries. Low 32F. Winds NNE at 5 to 10 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise4:40 amWaning Crescent\n- Moonset1:43 pm\nLatest News\nOur Changing World\nYour Privacy', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity91%\n- UV Index0 of 11\n- Moonrise5:50 amWaning Crescent\n- Moonset2:35 pm\nWed 1056°/39°34%\nWed 10\nWed 10 | Day\nA shower or two possible early with partly cloudy skies in the afternoon. Morning high of 56F with temps falling to near 45. Winds SW at 15 to 25 mph. Chance of rain 30%.\n- Humidity66%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:47 pm\nWed 10 | Night\nA few clouds from time to time. Low 39F. Winds WSW at 10 to 20 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise6:56 amWaning Crescent\n- Moonset3:38 pm\nThu 1147°/38°5%\nThu 11\nThu 11 | Day\nPartly cloudy. High 47F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:48 pm\nThu 11 | Night\nMostly clear skies. Low 38F. Winds W at 5 to 10 mph.\n- Humidity66%\n- UV Index0 of 11\n- Moonrise7:52 amNew Moon\n- Moonset4:53 pm\nFri 1248°/42°19%\nFri 12\nFri 12 | Day\nIntervals of clouds and sunshine. High 48F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:18 am\n- Sunset4:49 pm', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='Sat 1346°/36°53%\nSat 13\nSat 13 | Day\nCloudy with showers. High 46F. Winds WSW at 10 to 15 mph. Chance of rain 50%.\n- Humidity73%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:50 pm\nSat 13 | Night\nRain showers early transitioning to snow showers late. Low 36F. Winds W at 10 to 15 mph. Chance of precip 50%.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:14 amWaxing Crescent\n- Moonset7:33 pm\nSun 1442°/34°37%\nSun 14\nSun 14 | Day\nSnow showers early will transition to a few showers later. High 42F. Winds WSW at 10 to 15 mph. Chance of rain 40%.\n- Humidity63%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:51 pm\nSun 14 | Night\nVariable clouds with snow showers. Low 34F. Winds W at 10 to 15 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise9:44 amWaxing Crescent\n- Moonset8:52 pm\nMon 1540°/31°51%\nMon 15\nMon 15 | Day', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity70%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nMon 25 | Night\nOvercast with showers at times. Low 43F. Winds light and variable. Chance of rain 40%.\n- Humidity80%\n- UV Index0 of 11\n- Moonrise3:08 pmWaxing Gibbous\n- Moonset6:14 am\nTue 2653°/45°58%\nTue 26\nTue 26 | Day\nOvercast with rain showers at times. High 53F. Winds E at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nShowers early then scattered thunderstorms developing late. Low near 45F. Winds ESE at 5 to 10 mph. Chance of rain 60%.\n- Humidity93%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2751°/41°58%\nWed 27\nWed 27 | Day\nCloudy with showers. High 51F. Winds WSW at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nCloudy with showers. Low 41F. Winds NW at 5 to 10 mph. Chance of rain 60%.\n- Humidity72%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:13 am', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'})]
```
## 检索器使用


```python
<!--IMPORTS:[{"imported": "YouRetriever", "source": "langchain_community.retrievers.you", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.you.YouRetriever.html", "title": "You.com"}]-->
from langchain_community.retrievers.you import YouRetriever

retriever = YouRetriever(num_web_results=1)

retriever
```


```python
# .invoke wraps utility.results
response = retriever.invoke("What is the weather in NY")

# .invoke should have a Document for each `snippet`
print(len(response))

print(response)
```
```output
7
[Document(page_content='10 Day Weather-Manhattan, NY\nToday43°/39°1%\nToday\nSun 31 | Day\nGenerally cloudy. High 43F. Winds W at 10 to 15 mph.\n- Humidity54%\n- UV Index0 of 11\n- Sunrise7:19 am\n- Sunset4:38 pm\nSun 31 | Night\nCloudy. Low 39F. Winds light and variable.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:13 pmWaning Gibbous\n- Moonset10:28 am\nMon 0145°/33°7%\nMon 01\nMon 01 | Day\nConsiderable cloudiness. High around 45F. Winds light and variable.\n- Humidity71%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:39 pm\nMon 01 | Night\nA few clouds. Low 33F. Winds NNW at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise10:14 pmWaning Gibbous\n- Moonset10:49 am\nTue 0246°/35°4%\nTue 02\nTue 02 | Day\nMainly sunny. High 46F. Winds NW at 5 to 10 mph.\n- Humidity52%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:40 pm\nTue 02 | Night\nA few clouds overnight. Low around 35F. Winds W at 5 to 10 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise11:13 pmWaning Gibbous\n- Moonset11:08 am\nWed 0346°/38°4%\nWed 03\nWed 03 | Day', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='Radar\nLatest News\nOur Changing World\nYour Privacy\nTo personalize your product experience, we collect data from your device. We also may use or disclose to specific data vendors your precise geolocation data to provide the Services. To learn more please refer to our Privacy Policy.\nChoose how my information is shared', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity82%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nCloudy with light rain developing after midnight. Low 47F. Winds light and variable. Chance of rain 80%.\n- Humidity90%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2754°/49°93%\nWed 27\nWed 27 | Day\nRain. High 54F. Winds E at 5 to 10 mph. Chance of rain 90%. Rainfall near a half an inch.\n- Humidity93%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nSteady light rain in the evening. Showers continuing late. Low 49F. Winds light and variable. Chance of rain 70%.\n- Humidity91%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:12 am\nThu 2853°/42°19%\nThu 28\nThu 28 | Day\nCloudy skies early will become partly cloudy later in the day. Slight chance of a rain shower. High 53F. Winds WSW at 5 to 10 mph.\n- Humidity77%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:36 pm\nThu 28 | Night\nPartly cloudy skies. Low 42F. Winds W at 5 to 10 mph.\n- Humidity71%\n- UV Index0 of 11', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Moonrise2:20 amWaning Crescent\n- Moonset12:33 pm\nSun 0740°/29°19%\nSun 07\nSun 07 | Day\nIntervals of clouds and sunshine. High around 40F. Winds NW at 5 to 10 mph.\n- Humidity57%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:44 pm\nSun 07 | Night\nA few clouds from time to time. Low 29F. Winds NNW at 5 to 10 mph.\n- Humidity60%\n- UV Index0 of 11\n- Moonrise3:28 amWaning Crescent\n- Moonset1:04 pm\nMon 0840°/32°35%\nMon 08\nMon 08 | Day\nPartly cloudy early followed mostly cloudy skies and a few snow showers later in the day. High near 40F. Winds N at 5 to 10 mph. Chance of snow 40%.\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:45 pm\nMon 08 | Night\nVariable clouds with snow showers or flurries. Low 32F. Winds NNE at 5 to 10 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise4:40 amWaning Crescent\n- Moonset1:43 pm\nLatest News\nOur Changing World\nYour Privacy', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity91%\n- UV Index0 of 11\n- Moonrise5:50 amWaning Crescent\n- Moonset2:35 pm\nWed 1056°/39°34%\nWed 10\nWed 10 | Day\nA shower or two possible early with partly cloudy skies in the afternoon. Morning high of 56F with temps falling to near 45. Winds SW at 15 to 25 mph. Chance of rain 30%.\n- Humidity66%\n- UV Index1 of 11\n- Sunrise7:19 am\n- Sunset4:47 pm\nWed 10 | Night\nA few clouds from time to time. Low 39F. Winds WSW at 10 to 20 mph.\n- Humidity64%\n- UV Index0 of 11\n- Moonrise6:56 amWaning Crescent\n- Moonset3:38 pm\nThu 1147°/38°5%\nThu 11\nThu 11 | Day\nPartly cloudy. High 47F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:19 am\n- Sunset4:48 pm\nThu 11 | Night\nMostly clear skies. Low 38F. Winds W at 5 to 10 mph.\n- Humidity66%\n- UV Index0 of 11\n- Moonrise7:52 amNew Moon\n- Moonset4:53 pm\nFri 1248°/42°19%\nFri 12\nFri 12 | Day\nIntervals of clouds and sunshine. High 48F. Winds WSW at 5 to 10 mph.\n- Humidity62%\n- UV Index2 of 11\n- Sunrise7:18 am\n- Sunset4:49 pm', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='Sat 1346°/36°53%\nSat 13\nSat 13 | Day\nCloudy with showers. High 46F. Winds WSW at 10 to 15 mph. Chance of rain 50%.\n- Humidity73%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:50 pm\nSat 13 | Night\nRain showers early transitioning to snow showers late. Low 36F. Winds W at 10 to 15 mph. Chance of precip 50%.\n- Humidity70%\n- UV Index0 of 11\n- Moonrise9:14 amWaxing Crescent\n- Moonset7:33 pm\nSun 1442°/34°37%\nSun 14\nSun 14 | Day\nSnow showers early will transition to a few showers later. High 42F. Winds WSW at 10 to 15 mph. Chance of rain 40%.\n- Humidity63%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:51 pm\nSun 14 | Night\nVariable clouds with snow showers. Low 34F. Winds W at 10 to 15 mph. Chance of snow 60%. Snow accumulations less than one inch.\n- UV Index0 of 11\n- Moonrise9:44 amWaxing Crescent\n- Moonset8:52 pm\nMon 1540°/31°51%\nMon 15\nMon 15 | Day', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'}), Document(page_content='- Humidity70%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nMon 25 | Night\nOvercast with showers at times. Low 43F. Winds light and variable. Chance of rain 40%.\n- Humidity80%\n- UV Index0 of 11\n- Moonrise3:08 pmWaxing Gibbous\n- Moonset6:14 am\nTue 2653°/45°58%\nTue 26\nTue 26 | Day\nOvercast with rain showers at times. High 53F. Winds E at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:34 pm\nTue 26 | Night\nShowers early then scattered thunderstorms developing late. Low near 45F. Winds ESE at 5 to 10 mph. Chance of rain 60%.\n- Humidity93%\n- UV Index0 of 11\n- Moonrise4:00 pmFull Moon\n- Moonset7:17 am\nWed 2751°/41°58%\nWed 27\nWed 27 | Day\nCloudy with showers. High 51F. Winds WSW at 5 to 10 mph. Chance of rain 60%.\n- Humidity79%\n- UV Index1 of 11\n- Sunrise7:18 am\n- Sunset4:35 pm\nWed 27 | Night\nCloudy with showers. Low 41F. Winds NW at 5 to 10 mph. Chance of rain 60%.\n- Humidity72%\n- UV Index0 of 11\n- Moonrise4:59 pmFull Moon\n- Moonset8:13 am', metadata={'url': 'https://weather.com/weather/tenday/l/New+York+NY+USNY0996:1:US', 'thumbnail_url': 'https://imgs.search.brave.com/9xHc5-Bh2lvLyRJwQqeegm3gzoF6hawlpF8LZEjFLo8/rs:fit:200:200:1/g:ce/aHR0cHM6Ly9zLnct/eC5jby8yNDB4MTgw/X3R3Y19kZWZhdWx0/LnBuZw', 'title': '10-Day Weather Forecast for Manhattan, NY - The Weather Channel ...', 'description': 'Be prepared with the most accurate 10-day forecast for Manhattan, NY with highs, lows, chance of precipitation from The Weather Channel and Weather.com'})]
```
## 链接


```python
# you need a model to use in the chain
!pip install --upgrade --quiet langchain-openai
```


```python
<!--IMPORTS:[{"imported": "YouRetriever", "source": "langchain_community.retrievers.you", "docs": "https://python.langchain.com/api_reference/community/retrievers/langchain_community.retrievers.you.YouRetriever.html", "title": "You.com"}, {"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "You.com"}, {"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "You.com"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "You.com"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "You.com"}]-->
from langchain_community.retrievers.you import YouRetriever
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

# set up runnable
runnable = RunnablePassthrough

# set up retriever, limit sources to one
retriever = YouRetriever(num_web_results=1)

# set up model
model = ChatOpenAI(model="gpt-3.5-turbo-16k")

# set up output parser
output_parser = StrOutputParser()
```

### 调用


```python
# set up prompt that expects one question
prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

# set up chain
chain = (
    runnable.assign(context=(lambda x: x["question"]) | retriever)
    | prompt
    | model
    | output_parser
)

output = chain.invoke({"question": "what is the weather in NY today"})

print(output)
```
```output
The weather in New York City today is 43° with a high/low of --/39°. The wind is 3 mph, humidity is 63%, and the air quality is considered good.
```
### 流式处理


```python
# set up prompt that expects one question
prompt = ChatPromptTemplate.from_template(
    """Answer the question based only on the context provided.

Context: {context}

Question: {question}"""
)

# set up chain - same as above
chain = (
    runnable.assign(context=(lambda x: x["question"]) | retriever)
    | prompt
    | model
    | output_parser
)

for s in chain.stream({"question": "what is the weather in NY today"}):
    print(s, end="", flush=True)
```
```output
The weather in New York City today is a high of 39°F and a low of 31°F with a feels like temperature of 43°F. The wind speed is 3 mph, humidity is 63%, and the air quality is considered to be good.
```
### 批处理


```python
chain = (
    runnable.assign(context=(lambda x: x["question"]) | retriever)
    | prompt
    | model
    | output_parser
)

output = chain.batch(
    [
        {"question": "what is the weather in NY today"},
        {"question": "what is the weather in sf today"},
    ]
)

for o in output:
    print(o)
```
```output
Based on the provided context, the weather in New York City today is 43° with a high/low of --/39°.
Based on the provided context, the current weather in San Francisco is partly cloudy with a temperature of 61°F and a humidity of 57%.
```

## 相关

- 检索器 [概念指南](/docs/concepts/#retrievers)
- 检索器 [使用指南](/docs/how_to/#retrievers)
