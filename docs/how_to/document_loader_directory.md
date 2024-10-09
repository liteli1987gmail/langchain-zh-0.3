---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/document_loader_directory.ipynb
---
# 如何从目录加载文档

LangChain 的 [DirectoryLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.directory.DirectoryLoader.html) 实现了从磁盘读取文件到 LangChain [Document](https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html#langchain_core.documents.base.Document) 对象的功能。这里我们演示：

- 如何从文件系统加载，包括使用通配符模式；
- 如何使用多线程进行文件 I/O；
- 如何使用自定义加载器类解析特定文件类型（例如，代码）；
- 如何处理错误，例如由于解码引起的错误。


```python
<!--IMPORTS:[{"imported": "DirectoryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.directory.DirectoryLoader.html", "title": "How to load documents from a directory"}]-->
from langchain_community.document_loaders import DirectoryLoader
```

`DirectoryLoader` 接受一个 `loader_cls` 关键字参数，默认为 [UnstructuredLoader](/docs/integrations/document_loaders/unstructured_file)。[Unstructured](https://unstructured-io.github.io/unstructured/) 支持解析多种格式，如 PDF 和 HTML。在这里我们用它来读取一个 markdown (.md) 文件。

我们可以使用 `glob` 参数来控制加载哪些文件。请注意，这里不会加载 `.rst` 文件或 `.html` 文件。


```python
loader = DirectoryLoader("../", glob="**/*.md")
docs = loader.load()
len(docs)
```



```output
20
```



```python
print(docs[0].page_content[:100])
```
```output
Security

LangChain has a large ecosystem of integrations with various external resources like local
```
## 显示进度条

默认情况下不会显示进度条。要显示进度条，请安装 `tqdm` 库（例如 `pip install tqdm`），并将 `show_progress` 参数设置为 `True`。


```python
loader = DirectoryLoader("../", glob="**/*.md", show_progress=True)
docs = loader.load()
```
```output
100%|█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 20/20 [00:00<00:00, 54.56it/s]
```
## 使用多线程

默认情况下加载在一个线程中进行。为了利用多个线程，请将 `use_multithreading` 标志设置为 true。


```python
loader = DirectoryLoader("../", glob="**/*.md", use_multithreading=True)
docs = loader.load()
```

## 更改加载器类
默认情况下使用 `UnstructuredLoader` 类。要自定义加载器，请在 `loader_cls` 关键字参数中指定加载器类。下面我们展示一个使用 [TextLoader](https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html) 的示例：


```python
<!--IMPORTS:[{"imported": "TextLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader.html", "title": "How to load documents from a directory"}]-->
from langchain_community.document_loaders import TextLoader

loader = DirectoryLoader("../", glob="**/*.md", loader_cls=TextLoader)
docs = loader.load()
```


```python
print(docs[0].page_content[:100])
```
```output
# Security

LangChain has a large ecosystem of integrations with various external resources like loc
```
请注意，虽然 `UnstructuredLoader` 解析 Markdown 头部，`TextLoader` 则不解析。

如果您需要加载 Python 源代码文件，请使用 `PythonLoader`：


```python
<!--IMPORTS:[{"imported": "PythonLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.python.PythonLoader.html", "title": "How to load documents from a directory"}]-->
from langchain_community.document_loaders import PythonLoader

loader = DirectoryLoader("../../../../../", glob="**/*.py", loader_cls=PythonLoader)
```

## 使用TextLoader自动检测文件编码

`DirectoryLoader`可以帮助管理由于文件编码差异而导致的错误。下面我们将尝试加载一组文件，其中一个文件包含非UTF8编码。


```python
path = "../../../../libs/langchain/tests/unit_tests/examples/"

loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader)
```

### A. 默认行为

默认情况下，我们会引发一个错误：


```python
loader.load()
```
```output
Error loading file ../../../../libs/langchain/tests/unit_tests/examples/example-non-utf8.txt
```
```output
---------------------------------------------------------------------------
``````output
UnicodeDecodeError                        Traceback (most recent call last)
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/text.py:43, in TextLoader.lazy_load(self)
     42     with open(self.file_path, encoding=self.encoding) as f:
---> 43         text = f.read()
     44 except UnicodeDecodeError as e:
``````output
File ~/.pyenv/versions/3.10.4/lib/python3.10/codecs.py:322, in BufferedIncrementalDecoder.decode(self, input, final)
    321 data = self.buffer + input
--> 322 (result, consumed) = self._buffer_decode(data, self.errors, final)
    323 # keep undecoded input until the next call
``````output
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xca in position 0: invalid continuation byte
``````output

The above exception was the direct cause of the following exception:
``````output
RuntimeError                              Traceback (most recent call last)
``````output
Cell In[10], line 1
----> 1 loader.load()
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/directory.py:117, in DirectoryLoader.load(self)
    115 def load(self) -> List[Document]:
    116     """Load documents."""
--> 117     return list(self.lazy_load())
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/directory.py:182, in DirectoryLoader.lazy_load(self)
    180 else:
    181     for i in items:
--> 182         yield from self._lazy_load_file(i, p, pbar)
    184 if pbar:
    185     pbar.close()
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/directory.py:220, in DirectoryLoader._lazy_load_file(self, item, path, pbar)
    218     else:
    219         logger.error(f"Error loading file {str(item)}")
--> 220         raise e
    221 finally:
    222     if pbar:
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/directory.py:210, in DirectoryLoader._lazy_load_file(self, item, path, pbar)
    208 loader = self.loader_cls(str(item), **self.loader_kwargs)
    209 try:
--> 210     for subdoc in loader.lazy_load():
    211         yield subdoc
    212 except NotImplementedError:
``````output
File ~/repos/langchain/libs/community/langchain_community/document_loaders/text.py:56, in TextLoader.lazy_load(self)
     54                 continue
     55     else:
---> 56         raise RuntimeError(f"Error loading {self.file_path}") from e
     57 except Exception as e:
     58     raise RuntimeError(f"Error loading {self.file_path}") from e
``````output
RuntimeError: Error loading ../../../../libs/langchain/tests/unit_tests/examples/example-non-utf8.txt
```

文件 `example-non-utf8.txt` 使用了不同的编码，因此 `load()` 函数失败，并提供了一个有用的消息，指示哪个文件解码失败。

在 `TextLoader` 的默认行为下，任何文档加载失败都会导致整个加载过程失败，且没有文档被加载。

### B. 静默失败

我们可以将参数 `silent_errors` 传递给 `DirectoryLoader`，以跳过无法加载的文件并继续加载过程。


```python
loader = DirectoryLoader(
    path, glob="**/*.txt", loader_cls=TextLoader, silent_errors=True
)
docs = loader.load()
```
```output
Error loading file ../../../../libs/langchain/tests/unit_tests/examples/example-non-utf8.txt: Error loading ../../../../libs/langchain/tests/unit_tests/examples/example-non-utf8.txt
```

```python
doc_sources = [doc.metadata["source"] for doc in docs]
doc_sources
```



```output
['../../../../libs/langchain/tests/unit_tests/examples/example-utf8.txt']
```


### C. 自动检测编码

我们还可以要求 `TextLoader` 在失败之前自动检测文件编码，通过将 `autodetect_encoding` 传递给加载器类。


```python
text_loader_kwargs = {"autodetect_encoding": True}
loader = DirectoryLoader(
    path, glob="**/*.txt", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs
)
docs = loader.load()
```


```python
doc_sources = [doc.metadata["source"] for doc in docs]
doc_sources
```



```output
['../../../../libs/langchain/tests/unit_tests/examples/example-utf8.txt',
 '../../../../libs/langchain/tests/unit_tests/examples/example-non-utf8.txt']
```

