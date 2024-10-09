# Fireworks AI

>[Fireworks AI](https://fireworks.ai) 是一个生成式AI推理平台，用于运行和
> 自定义模型，具有行业领先的速度和生产就绪性。



## 安装和设置

- 安装Fireworks集成包。

  ```
  pip install langchain-fireworks
  ```

- 通过在 [fireworks.ai](https://fireworks.ai) 注册获取 Fireworks API 密钥。
- 通过设置 FIREWORKS_API_KEY 环境变量进行身份验证。

### 身份验证

使用 Fireworks API 密钥进行身份验证有两种方法：

1. 设置 `FIREWORKS_API_KEY` 环境变量。

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<KEY>"
    ```

2. 在 Fireworks LLM 模块中设置 `api_key` 字段。

    ```python
    llm = Fireworks(api_key="<KEY>")
    ```
## 聊天模型

查看 [使用示例](/docs/integrations/chat/fireworks)。

```python
from langchain_fireworks import ChatFireworks
```

## 大型语言模型

查看 [使用示例](/docs/integrations/llms/fireworks)。

```python
from langchain_fireworks import Fireworks 
```

## 嵌入模型

查看[使用示例](/docs/integrations/text_embedding/fireworks)。

```python
from langchain_fireworks import FireworksEmbeddings 
```
