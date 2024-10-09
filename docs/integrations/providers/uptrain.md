# UpTrain

>[UpTrain](https://uptrain.ai/) 是一个开源统一平台，用于评估和
>改进生成式AI应用。它提供20多个预配置评估的评分
>(涵盖语言、代码、嵌入用例)，对失败案例进行根本原因分析
>并提供解决方案的见解。

## 安装和设置

```bash
pip install uptrain
```

## 回调

```python
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

查看一个[示例](/docs/integrations/callbacks/uptrain)。
