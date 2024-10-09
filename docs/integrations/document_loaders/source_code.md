---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/source_code.ipynb
---
# 源代码

本笔记本介绍了如何使用一种特殊的方法加载源代码文件，采用语言解析：代码中的每个顶层函数和类被加载到单独的文档中。任何剩余的顶层代码（不在已加载的函数和类中）将被加载到一个单独的文档中。

这种方法有可能提高源代码的QA模型的准确性。

支持的代码解析语言包括：

- C (*)
- C++ (*)
- C# (*)
- COBOL
- Elixir
- Go (*)
- Java (*)
- JavaScript (需要包 `esprima`)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

标记为 (*) 的项目需要 `tree_sitter` 和 `tree_sitter_languages` 包。
使用 `tree_sitter` 添加对其他语言的支持是简单直接的，
尽管这目前需要修改 LangChain。

用于解析的语言可以配置，以及激活基于语法的分割所需的最小行数。
如果未明确指定语言，`LanguageParser` 将从

文件名扩展名中推断出一种语言（如果存在）。
文件名扩展，如果存在。


```python
%pip install -qU esprima esprima tree_sitter tree_sitter_languages
```


```python
<!--IMPORTS:[{"imported": "GenericLoader", "source": "langchain_community.document_loaders.generic", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.generic.GenericLoader.html", "title": "Source Code"}, {"imported": "LanguageParser", "source": "langchain_community.document_loaders.parsers", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.parsers.language.language_parser.LanguageParser.html", "title": "Source Code"}, {"imported": "Language", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.Language.html", "title": "Source Code"}]-->
import warnings

warnings.filterwarnings("ignore")
from pprint import pprint

from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language
```


```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py", ".js"],
    parser=LanguageParser(),
)
docs = loader.load()
```


```python
len(docs)
```



```output
6
```



```python
for document in docs:
    pprint(document.metadata)
```
```output
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'simplified_code',
 'language': <Language.PYTHON: 'python'>,
 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'functions_classes',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
{'content_type': 'simplified_code',
 'language': <Language.JS: 'js'>,
 'source': 'example_data/source_code/example.js'}
```

```python
print("\n\n--8<--\n\n".join([document.page_content for document in docs]))
```
```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")

--8<--

def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()

--8<--

# Code for: class MyClass:


# Code for: def main():


if __name__ == "__main__":
    main()

--8<--

class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");
  const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

main();
```
对于小文件，可以禁用解析器。

参数 `parser_threshold` 指示源代码文件必须具有的最小行数，以便使用解析器进行分段。


```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py"],
    parser=LanguageParser(language=Language.PYTHON, parser_threshold=1000),
)
docs = loader.load()
```


```python
len(docs)
```



```output
1
```



```python
print(docs[0].page_content)
```
```output
class MyClass:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")


def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()


if __name__ == "__main__":
    main()
```
## 分割

对于那些过大的函数、类或脚本，可能需要额外的分割。


```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".js"],
    parser=LanguageParser(language=Language.JS),
)
docs = loader.load()
```


```python
<!--IMPORTS:[{"imported": "Language", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.Language.html", "title": "Source Code"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "Source Code"}]-->
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)
```


```python
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=60, chunk_overlap=0
)
```


```python
result = js_splitter.split_documents(docs)
```


```python
len(result)
```



```output
7
```



```python
print("\n\n--8<--\n\n".join([document.page_content for document in result]))
```
```output
class MyClass {
  constructor(name) {
    this.name = name;

--8<--

}

--8<--

greet() {
    console.log(`Hello, ${this.name}!`);
  }
}

--8<--

function main() {
  const name = prompt("Enter your name:");

--8<--

const obj = new MyClass(name);
  obj.greet();
}

--8<--

// Code for: class MyClass {

// Code for: function main() {

--8<--

main();
```
## 使用 Tree-sitter 模板添加语言

使用 Tree-Sitter 模板扩展语言支持涉及几个基本步骤：

1. **创建新语言文件**：
- 首先在指定目录中创建一个新文件 (langchain/libs/community/langchain_community/document_loaders/parsers/language)。
- 根据现有语言文件（如 **`cpp.py`**）的结构和解析逻辑来构建此文件。
- 您还需要在 langchain 目录中创建一个文件 (langchain/libs/langchain/langchain/document_loaders/parsers/language)。
2. **解析语言细节**：
- 模仿 **`cpp.py`** 文件中使用的结构，调整以适应您正在集成的语言。
- 主要的修改涉及调整块查询数组，以适应您正在解析的语言的语法和结构。
3. **测试语言解析器**：
- 为了进行全面验证，生成一个特定于新语言的测试文件。在指定目录中创建 **`test_language.py`** (langchain/libs/community/tests/unit_tests/document_loaders/parsers/language)。
- 按照 **`test_cpp.py`** 的示例，为新语言中解析的元素建立基本测试。
4. **集成到解析器和文本分割器中**：
- 在 **`language_parser.py`** 文件中集成您的新语言。确保更新 LANGUAGE_EXTENSIONS 和 LANGUAGE_SEGMENTERS，以及 LanguageParser 的文档字符串，以识别和处理添加的语言。
- 同时，确认您的语言已包含在 **`text_splitter.py`** 的 Language 类中，以便正确解析。

通过遵循这些步骤并确保全面的测试和集成，您将成功使用 Tree-Sitter 模板扩展语言支持。

祝您好运！


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
