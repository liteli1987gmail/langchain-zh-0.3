---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/sparkllm.ipynb
---
# SparkLLM
[SparkLLM](https://xinghuo.xfyun.cn/spark) 是由科大讯飞独立开发的大规模认知模型。
它通过学习大量文本、代码和图像，具备跨领域知识和语言理解能力。
它可以理解并基于自然对话执行任务。

## 前提条件
- 从 [iFlyTek SparkLLM API 控制台](https://console.xfyun.cn/services/bm3) 获取 SparkLLM 的 app_id、api_key 和 api_secret（更多信息，请参见 [iFlyTek SparkLLM 介绍](https://xinghuo.xfyun.cn/sparkapi)），然后设置环境变量 `IFLYTEK_SPARK_APP_ID`、`IFLYTEK_SPARK_API_KEY` 和 `IFLYTEK_SPARK_API_SECRET`，或者在创建 `ChatSparkLLM` 时传递参数，如上面的示例所示。

## 使用 SparkLLM


```python
import os

os.environ["IFLYTEK_SPARK_APP_ID"] = "app_id"
os.environ["IFLYTEK_SPARK_API_KEY"] = "api_key"
os.environ["IFLYTEK_SPARK_API_SECRET"] = "api_secret"
```


```python
<!--IMPORTS:[{"imported": "SparkLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.sparkllm.SparkLLM.html", "title": "SparkLLM"}]-->
from langchain_community.llms import SparkLLM

# Load the model
llm = SparkLLM()

res = llm.invoke("What's your name?")
print(res)
```
```output
/Users/liugddx/code/langchain/libs/core/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
``````output
My name is iFLYTEK Spark. How can I assist you today?
```

```python
res = llm.generate(prompts=["hello!"])
res
```



```output
LLMResult(generations=[[Generation(text='Hello! How can I assist you today?')]], llm_output=None, run=[RunInfo(run_id=UUID('d8cdcd41-a698-4cbf-a28d-e74f9cd2037b'))])
```



```python
for res in llm.stream("foo:"):
    print(res)
```
```output
Hello! How can I assist you today?
```

## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
