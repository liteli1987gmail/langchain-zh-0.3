---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/alpha_vantage.ipynb
---
# Alpha Vantage

>[Alpha Vantage](https://www.alphavantage.co) Alpha Vantage 提供通过一套强大且开发者友好的数据 API 和电子表格获取实时和历史金融市场数据。

使用 ``AlphaVantageAPIWrapper`` 获取货币汇率。


```python
import getpass
import os

os.environ["ALPHAVANTAGE_API_KEY"] = getpass.getpass()
```


```python
<!--IMPORTS:[{"imported": "AlphaVantageAPIWrapper", "source": "langchain_community.utilities.alpha_vantage", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.alpha_vantage.AlphaVantageAPIWrapper.html", "title": "Alpha Vantage"}]-->
from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
```


```python
alpha_vantage = AlphaVantageAPIWrapper()
alpha_vantage._get_exchange_rate("USD", "JPY")
```



```output
{'Realtime Currency Exchange Rate': {'1. From_Currency Code': 'USD',
  '2. From_Currency Name': 'United States Dollar',
  '3. To_Currency Code': 'JPY',
  '4. To_Currency Name': 'Japanese Yen',
  '5. Exchange Rate': '148.19900000',
  '6. Last Refreshed': '2023-11-30 21:43:02',
  '7. Time Zone': 'UTC',
  '8. Bid Price': '148.19590000',
  '9. Ask Price': '148.20420000'}}
```


 `_get_time_series_daily` 方法返回指定全球股票的日期、每日开盘价、每日最高价、每日最低价、每日收盘价和每日成交量，涵盖最新的100个数据点。


```python
alpha_vantage._get_time_series_daily("IBM")
```

 `_get_time_series_weekly` 方法返回指定全球股票的最后一个交易日的周开盘价、周最高价、周最低价、周收盘价和周成交量，涵盖超过20年的历史数据。


```python
alpha_vantage._get_time_series_weekly("IBM")
```

 `_get_quote_endpoint` 方法是时间序列API的轻量级替代方案，返回指定符号的最新价格和成交量信息。


```python
alpha_vantage._get_quote_endpoint("IBM")
```



```output
{'Global Quote': {'01. symbol': 'IBM',
  '02. open': '156.9000',
  '03. high': '158.6000',
  '04. low': '156.8900',
  '05. price': '158.5400',
  '06. volume': '6640217',
  '07. latest trading day': '2023-11-30',
  '08. previous close': '156.4100',
  '09. change': '2.1300',
  '10. change percent': '1.3618%'}}
```


 `search_symbol` 方法根据输入的文本返回符号列表和匹配的公司信息。


```python
alpha_vantage.search_symbols("IB")
```

 `_get_market_news_sentiment` 方法返回给定资产的实时和历史市场新闻情绪。


```python
alpha_vantage._get_market_news_sentiment("IBM")
```

 `_get_top_gainers_losers` 方法返回美国市场的前20名涨幅股、跌幅股和最活跃股票。


```python
alpha_vantage._get_top_gainers_losers()
```

包装器的 `run` 方法接受以下参数：from_currency, to_currency。

获取给定货币对的汇率。


```python
alpha_vantage.run("USD", "JPY")
```



```output
{'1. From_Currency Code': 'USD',
 '2. From_Currency Name': 'United States Dollar',
 '3. To_Currency Code': 'JPY',
 '4. To_Currency Name': 'Japanese Yen',
 '5. Exchange Rate': '148.19900000',
 '6. Last Refreshed': '2023-11-30 21:43:02',
 '7. Time Zone': 'UTC',
 '8. Bid Price': '148.19590000',
 '9. Ask Price': '148.20420000'}
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
