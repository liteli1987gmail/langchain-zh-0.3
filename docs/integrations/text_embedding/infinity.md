---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/infinity.ipynb
---
# 无限

`Infinity` 允许使用 MIT 许可的嵌入服务器创建 `Embeddings`。

本笔记本介绍了如何使用 LangChain 与嵌入结合使用 [Infinity Github 项目](https://github.com/michaelfeil/infinity)。


## 导入


```python
<!--IMPORTS:[{"imported": "InfinityEmbeddings", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.infinity.InfinityEmbeddings.html", "title": "Infinity"}, {"imported": "InfinityEmbeddingsLocal", "source": "langchain_community.embeddings", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.infinity_local.InfinityEmbeddingsLocal.html", "title": "Infinity"}]-->
from langchain_community.embeddings import InfinityEmbeddings, InfinityEmbeddingsLocal
```

# 选项 1：使用 Python 的 infinity

#### 可选：安装 infinity

要安装 infinity，请使用以下命令。有关更多详细信息，请查看 [Github 文档](https://github.com/michaelfeil/infinity)。
安装 torch 和 onnx 依赖项。

```bash
pip install infinity_emb[torch,optimum]
```


```python
documents = [
    "Baguette is a dish.",
    "Paris is the capital of France.",
    "numpy is a lib for linear algebra",
    "You escaped what I've escaped - You'd be in Paris getting fucked up too",
]
query = "Where is Paris?"
```


```python
embeddings = InfinityEmbeddingsLocal(
    model="sentence-transformers/all-MiniLM-L6-v2",
    # revision
    revision=None,
    # best to keep at 32
    batch_size=32,
    # for AMD/Nvidia GPUs via torch
    device="cuda",
    # warm up model before execution
)


async def embed():
    # TODO: This function is just to showcase that your call can run async.

    # important: use engine inside of `async with` statement to start/stop the batching engine.
    async with embeddings:
        # avoid closing and starting the engine often.
        # rather keep it running.
        # you may call `await embeddings.__aenter__()` and `__aexit__()
        # if you are sure when to manually start/stop execution` in a more granular way

        documents_embedded = await embeddings.aembed_documents(documents)
        query_result = await embeddings.aembed_query(query)
        print("embeddings created successful")
    return documents_embedded, query_result
```
```output
/home/michael/langchain/libs/langchain/.venv/lib/python3.10/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
The BetterTransformer implementation does not support padding during training, as the fused kernels do not support attention masks. Beware that passing padded batched data during training may result in unexpected outputs. Please refer to https://huggingface.co/docs/optimum/bettertransformer/overview for more details.
/home/michael/langchain/libs/langchain/.venv/lib/python3.10/site-packages/optimum/bettertransformer/models/encoder_models.py:301: UserWarning: The PyTorch API of nested tensors is in prototype stage and will change in the near future. (Triggered internally at ../aten/src/ATen/NestedTensorImpl.cpp:177.)
  hidden_states = torch._nested_tensor_from_mask(hidden_states, ~attention_mask)
```

```python
# run the async code however you would like
# if you are in a jupyter notebook, you can use the following
documents_embedded, query_result = await embed()
```


```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```

# 选项 2：运行服务器，并通过 API 连接

#### 可选：确保启动 Infinity 实例

要安装 infinity，请使用以下命令。有关更多详细信息，请查看 [Github 文档](https://github.com/michaelfeil/infinity)。
```bash
pip install infinity_emb[all]
```

# 安装 infinity 包
%pip install --upgrade --quiet infinity_emb[all]

启动服务器 - 最好在单独的终端中完成，而不是在 Jupyter Notebook 内部

```bash
model=sentence-transformers/all-MiniLM-L6-v2
port=7797
infinity_emb --port $port --model-name-or-path $model
```

或者可以直接使用 Docker：
```bash
model=sentence-transformers/all-MiniLM-L6-v2
port=7797
docker run -it --gpus all -p $port:$port michaelf34/infinity:latest --model-name-or-path $model --port $port
```

## 使用您的 Infinity 实例嵌入文档


```python
documents = [
    "Baguette is a dish.",
    "Paris is the capital of France.",
    "numpy is a lib for linear algebra",
    "You escaped what I've escaped - You'd be in Paris getting fucked up too",
]
query = "Where is Paris?"
```


```python
#
infinity_api_url = "http://localhost:7797/v1"
# model is currently not validated.
embeddings = InfinityEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2", infinity_api_url=infinity_api_url
)
try:
    documents_embedded = embeddings.embed_documents(documents)
    query_result = embeddings.embed_query(query)
    print("embeddings created successful")
except Exception as ex:
    print(
        "Make sure the infinity instance is running. Verify by clicking on "
        f"{infinity_api_url.replace('v1','docs')} Exception: {ex}. "
    )
```
```output
Make sure the infinity instance is running. Verify by clicking on http://localhost:7797/docs Exception: HTTPConnectionPool(host='localhost', port=7797): Max retries exceeded with url: /v1/embeddings (Caused by NewConnectionError('<urllib3.connection.HTTPConnection object at 0x7f91c35dbd30>: Failed to establish a new connection: [Errno 111] Connection refused')).
```

```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```



```output
{'Baguette is a dish.': 0.31344215908661155,
 'Paris is the capital of France.': 0.8148670296896388,
 'numpy is a lib for linear algebra': 0.004429399861302009,
 "You escaped what I've escaped - You'd be in Paris getting fucked up too": 0.5088476180154582}
```



## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [操作指南](/docs/how_to/#embedding-models)
