---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/tensorflow_datasets.ipynb
---
# TensorFlow 数据集

>[TensorFlow 数据集](https://www.tensorflow.org/datasets) 是一个可供使用的数据集集合，适用于 TensorFlow 或其他 Python 机器学习框架，如 Jax。所有数据集都以 [tf.data.Datasets](https://www.tensorflow.org/api_docs/python/tf/data/Dataset) 的形式呈现，使得输入管道易于使用且高效。要开始使用，请参见 [指南](https://www.tensorflow.org/datasets/overview) 和 [数据集列表](https://www.tensorflow.org/datasets/catalog/overview#all_datasets)。

本笔记本展示了如何将 `TensorFlow 数据集` 加载为我们可以在后续使用的文档格式。

## 安装

您需要安装 `tensorflow` 和 `tensorflow-datasets` Python 包。


```python
%pip install --upgrade --quiet  tensorflow
```


```python
%pip install --upgrade --quiet  tensorflow-datasets
```

## 示例

作为示例，我们使用[`mlqa/en`数据集](https://www.tensorflow.org/datasets/catalog/mlqa#mlqaen)。

`MLQA`（`多语言问答数据集`）是评估多语言问答性能的基准数据集。该数据集包含7种语言：阿拉伯语、德语、西班牙语、英语、印地语、越南语和中文。
>
>- 主页: https://github.com/facebookresearch/MLQA
>- 源代码: `tfds.datasets.mlqa.Builder`
>- 下载大小: 72.21 MiB



```python
# Feature structure of `mlqa/en` dataset:

FeaturesDict(
    {
        "answers": Sequence(
            {
                "answer_start": int32,
                "text": Text(shape=(), dtype=string),
            }
        ),
        "context": Text(shape=(), dtype=string),
        "id": string,
        "question": Text(shape=(), dtype=string),
        "title": Text(shape=(), dtype=string),
    }
)
```


```python
import tensorflow as tf
import tensorflow_datasets as tfds
```


```python
# try directly access this dataset:
ds = tfds.load("mlqa/en", split="test")
ds = ds.take(1)  # Only take a single example
ds
```



```output
<_TakeDataset element_spec={'answers': {'answer_start': TensorSpec(shape=(None,), dtype=tf.int32, name=None), 'text': TensorSpec(shape=(None,), dtype=tf.string, name=None)}, 'context': TensorSpec(shape=(), dtype=tf.string, name=None), 'id': TensorSpec(shape=(), dtype=tf.string, name=None), 'question': TensorSpec(shape=(), dtype=tf.string, name=None), 'title': TensorSpec(shape=(), dtype=tf.string, name=None)}>
```


现在我们需要创建一个自定义函数，将数据集样本转换为文档。

这是一个要求。TF数据集没有标准格式，因此我们需要制作一个自定义转换函数。

我们将使用`context`字段作为`Document.page_content`，并将其他字段放入`Document.metadata`。



```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "TensorFlow Datasets"}]-->
from langchain_core.documents import Document


def decode_to_str(item: tf.Tensor) -> str:
    return item.numpy().decode("utf-8")


def mlqaen_example_to_document(example: dict) -> Document:
    return Document(
        page_content=decode_to_str(example["context"]),
        metadata={
            "id": decode_to_str(example["id"]),
            "title": decode_to_str(example["title"]),
            "question": decode_to_str(example["question"]),
            "answer": decode_to_str(example["answers"]["text"][0]),
        },
    )


for example in ds:
    doc = mlqaen_example_to_document(example)
    print(doc)
    break
```
```output
page_content='After completing the journey around South America, on 23 February 2006, Queen Mary 2 met her namesake, the original RMS Queen Mary, which is permanently docked at Long Beach, California. Escorted by a flotilla of smaller ships, the two Queens exchanged a "whistle salute" which was heard throughout the city of Long Beach. Queen Mary 2 met the other serving Cunard liners Queen Victoria and Queen Elizabeth 2 on 13 January 2008 near the Statue of Liberty in New York City harbour, with a celebratory fireworks display; Queen Elizabeth 2 and Queen Victoria made a tandem crossing of the Atlantic for the meeting. This marked the first time three Cunard Queens have been present in the same location. Cunard stated this would be the last time these three ships would ever meet, due to Queen Elizabeth 2\'s impending retirement from service in late 2008. However this would prove not to be the case, as the three Queens met in Southampton on 22 April 2008. Queen Mary 2 rendezvoused with Queen Elizabeth 2  in Dubai on Saturday 21 March 2009, after the latter ship\'s retirement, while both ships were berthed at Port Rashid. With the withdrawal of Queen Elizabeth 2 from Cunard\'s fleet and its docking in Dubai, Queen Mary 2 became the only ocean liner left in active passenger service.' metadata={'id': '5116f7cccdbf614d60bcd23498274ffd7b1e4ec7', 'title': 'RMS Queen Mary 2', 'question': 'What year did Queen Mary 2 complete her journey around South America?', 'answer': '2006'}
``````output
2023-08-03 14:27:08.482983: W tensorflow/core/kernels/data/cache_dataset_ops.cc:854] The calling iterator did not fully read the dataset being cached. In order to avoid unexpected truncation of the dataset, the partially cached contents of the dataset  will be discarded. This can happen if you have an input pipeline similar to `dataset.cache().take(k).repeat()`. You should use `dataset.take(k).cache().repeat()` instead.
```

```python
<!--IMPORTS:[{"imported": "TensorflowDatasetLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.tensorflow_datasets.TensorflowDatasetLoader.html", "title": "TensorFlow Datasets"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "TensorFlow Datasets"}]-->
from langchain_community.document_loaders import TensorflowDatasetLoader
from langchain_core.documents import Document

loader = TensorflowDatasetLoader(
    dataset_name="mlqa/en",
    split_name="test",
    load_max_docs=3,
    sample_to_document_function=mlqaen_example_to_document,
)
```

`TensorflowDatasetLoader` 具有以下参数：
- `dataset_name`: 要加载的数据集名称
- `split_name`: 要加载的分割名称。默认为 "train"。
- `load_max_docs`: 加载文档的数量限制。默认为 100。
- `sample_to_document_function`: 将数据集样本转换为文档的函数



```python
docs = loader.load()
len(docs)
```
```output
2023-08-03 14:27:22.998964: W tensorflow/core/kernels/data/cache_dataset_ops.cc:854] The calling iterator did not fully read the dataset being cached. In order to avoid unexpected truncation of the dataset, the partially cached contents of the dataset  will be discarded. This can happen if you have an input pipeline similar to `dataset.cache().take(k).repeat()`. You should use `dataset.take(k).cache().repeat()` instead.
```


```output
3
```



```python
docs[0].page_content
```



```output
'After completing the journey around South America, on 23 February 2006, Queen Mary 2 met her namesake, the original RMS Queen Mary, which is permanently docked at Long Beach, California. Escorted by a flotilla of smaller ships, the two Queens exchanged a "whistle salute" which was heard throughout the city of Long Beach. Queen Mary 2 met the other serving Cunard liners Queen Victoria and Queen Elizabeth 2 on 13 January 2008 near the Statue of Liberty in New York City harbour, with a celebratory fireworks display; Queen Elizabeth 2 and Queen Victoria made a tandem crossing of the Atlantic for the meeting. This marked the first time three Cunard Queens have been present in the same location. Cunard stated this would be the last time these three ships would ever meet, due to Queen Elizabeth 2\'s impending retirement from service in late 2008. However this would prove not to be the case, as the three Queens met in Southampton on 22 April 2008. Queen Mary 2 rendezvoused with Queen Elizabeth 2  in Dubai on Saturday 21 March 2009, after the latter ship\'s retirement, while both ships were berthed at Port Rashid. With the withdrawal of Queen Elizabeth 2 from Cunard\'s fleet and its docking in Dubai, Queen Mary 2 became the only ocean liner left in active passenger service.'
```



```python
docs[0].metadata
```



```output
{'id': '5116f7cccdbf614d60bcd23498274ffd7b1e4ec7',
 'title': 'RMS Queen Mary 2',
 'question': 'What year did Queen Mary 2 complete her journey around South America?',
 'answer': '2006'}
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
