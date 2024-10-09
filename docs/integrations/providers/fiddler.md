# Fiddler

> [Fiddler](https://www.fiddler.ai/) 提供一个统一的平台来监控、解释、分析，
> 并改善企业级的机器学习部署。

## 安装和设置

通过 [Fiddler](https://demo.fiddler.ai/) 设置您的模型：

* 您用来连接 Fiddler 的 URL
* 您的组织 ID
* 您的授权令牌

安装 Python 包：

```bash
pip install fiddler-client
```

## 回调


```python
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

查看一个[示例](/docs/integrations/callbacks/fiddler)。
