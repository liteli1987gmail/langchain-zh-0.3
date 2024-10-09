---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/databricks.ipynb
---
# Databricks

> [Databricks](https://www.databricks.com/) Lakehouse 平台将数据、分析和人工智能统一在一个平台上。


本笔记本提供了一个快速概述，帮助您开始使用 Databricks [大型语言模型](https://python.langchain.com/docs/concepts/#llms)。有关所有功能和配置的详细文档，请访问 [API 参考](https://python.langchain.com/api_reference/community/llms/langchain_community.llms.databricks.Databricks.html)。

## 概述

`Databricks` LLM 类封装了一个完成端点，该端点托管为以下两种端点类型之一：

* [Databricks 模型服务](https://docs.databricks.com/en/machine-learning/model-serving/index.html)，推荐用于生产和开发，
* 集群驱动程序代理应用，推荐用于交互式开发。

本示例笔记本展示了如何封装您的 LLM 端点并在您的 LangChain 应用中将其用作 LLM。

## 限制

`Databricks` LLM 类是 *遗留* 实现，并在功能兼容性方面存在若干限制。

* 仅支持同步调用。不支持流式或异步 API。
* 不支持 `batch` API。

要使用这些功能，请改用新的 [ChatDatabricks](https://python.langchain.com/docs/integrations/chat/databricks) 类。`ChatDatabricks` 支持 `ChatModel` 的所有 API，包括流式、异步、批处理等。


## 设置

要访问 Databricks 模型，您需要创建一个 Databricks 账户，设置凭据（仅当您在 Databricks 工作区外时），并安装所需的包。

### 凭据（仅当您在 Databricks 工作区外时）

如果您在 Databricks 内运行 LangChain 应用，可以跳过此步骤。

否则，您需要手动将 Databricks 工作区主机名和个人访问令牌分别设置为 `DATABRICKS_HOST` 和 `DATABRICKS_TOKEN` 环境变量。有关如何获取访问令牌，请参见 [身份验证文档](https://docs.databricks.com/en/dev-tools/auth/index.html#databricks-personal-access-tokens)。


```python
import getpass
import os

os.environ["DATABRICKS_HOST"] = "https://your-workspace.cloud.databricks.com"
if "DATABRICKS_TOKEN" not in os.environ:
    os.environ["DATABRICKS_TOKEN"] = getpass.getpass(
        "Enter your Databricks access token: "
    )
```

或者，您可以在初始化 `Databricks` 类时传递这些参数。


```python
<!--IMPORTS:[{"imported": "Databricks", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.databricks.Databricks.html", "title": "Databricks"}]-->
from langchain_community.llms import Databricks

databricks = Databricks(
    host="https://your-workspace.cloud.databricks.com",
    # We strongly recommend NOT to hardcode your access token in your code, instead use secret management tools
    # or environment variables to store your access token securely. The following example uses Databricks Secrets
    # to retrieve the access token that is available within the Databricks notebook.
    token=dbutils.secrets.get(scope="YOUR_SECRET_SCOPE", key="databricks-token"),  # noqa: F821
)
```

### 安装

LangChain Databricks 集成位于 `langchain-community` 包中。此外，运行此笔记本中的代码需要 `mlflow >= 2.9`。


```python
%pip install -qU langchain-community mlflow>=2.9.0
```

## 包装模型服务端点

### 先决条件：

* 一个 LLM 已注册并部署到 [Databricks 服务端点](https://docs.databricks.com/machine-learning/model-serving/index.html)。
* 您对该端点拥有 [\

预期的 MLflow 模型签名是：

* 输入：`[{`
* 输出：`[{`


### 调用


```python
<!--IMPORTS:[{"imported": "Databricks", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.databricks.Databricks.html", "title": "Databricks"}]-->
from langchain_community.llms import Databricks

llm = Databricks(endpoint_name="YOUR_ENDPOINT_NAME")
llm.invoke("How are you?")
```



```output
'I am happy to hear that you are in good health and as always, you are appreciated.'
```



```python
llm.invoke("How are you?", stop=["."])
```



```output
'Good'
```


### 转换输入和输出

有时您可能想要包装一个具有不兼容模型签名的服务端点，或者您想插入额外的配置。您可以使用 `transform_input_fn` 和 `transform_output_fn` 参数来定义额外的前/后处理。


```python
# Use `transform_input_fn` and `transform_output_fn` if the serving endpoint
# expects a different input schema and does not return a JSON string,
# respectively, or you want to apply a prompt template on top.


def transform_input(**request):
    full_prompt = f"""{request["prompt"]}
    Be Concise.
    """
    request["prompt"] = full_prompt
    return request


def transform_output(response):
    return response.upper()


llm = Databricks(
    endpoint_name="YOUR_ENDPOINT_NAME",
    transform_input_fn=transform_input,
    transform_output_fn=transform_output,
)

llm.invoke("How are you?")
```



```output
'I AM DOING GREAT THANK YOU.'
```



## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
