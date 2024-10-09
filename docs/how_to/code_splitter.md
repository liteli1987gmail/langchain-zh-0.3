---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/how_to/code_splitter.ipynb
---
# 如何分割代码

[递归字符文本分割器](https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html) 包含用于在特定编程语言中分割文本的预构建分隔符列表。

支持的语言存储在 `langchain_text_splitters.Language` 枚举中。它们包括：

```
"cpp",
"go",
"java",
"kotlin",
"js",
"ts",
"php",
"proto",
"python",
"rst",
"ruby",
"rust",
"scala",
"swift",
"markdown",
"latex",
"html",
"sol",
"csharp",
"cobol",
"c",
"lua",
"perl",
"haskell"
```

要查看给定语言的分隔符列表，请将此枚举中的值传入
```python
RecursiveCharacterTextSplitter.get_separators_for_language`
```

要实例化一个针对特定语言的分割器，请将枚举中的值传入
```python
RecursiveCharacterTextSplitter.from_language
```

下面我们展示了各种语言的示例。


```python
%pip install -qU langchain-text-splitters
```


```python
<!--IMPORTS:[{"imported": "Language", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/base/langchain_text_splitters.base.Language.html", "title": "How to split code"}, {"imported": "RecursiveCharacterTextSplitter", "source": "langchain_text_splitters", "docs": "https://python.langchain.com/api_reference/text_splitters/character/langchain_text_splitters.character.RecursiveCharacterTextSplitter.html", "title": "How to split code"}]-->
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)
```

要查看支持的语言的完整列表：


```python
[e.value for e in Language]
```



```output
['cpp',
 'go',
 'java',
 'kotlin',
 'js',
 'ts',
 'php',
 'proto',
 'python',
 'rst',
 'ruby',
 'rust',
 'scala',
 'swift',
 'markdown',
 'latex',
 'html',
 'sol',
 'csharp',
 'cobol',
 'c',
 'lua',
 'perl',
 'haskell']
```


您还可以查看给定语言使用的分隔符：


```python
RecursiveCharacterTextSplitter.get_separators_for_language(Language.PYTHON)
```



```output
['\nclass ', '\ndef ', '\n\tdef ', '\n\n', '\n', ' ', '']
```


## Python

这是一个使用 PythonTextSplitter 的示例：




```python
PYTHON_CODE = """
def hello_world():
    print("Hello, World!")

# Call the function
hello_world()
"""
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON, chunk_size=50, chunk_overlap=0
)
python_docs = python_splitter.create_documents([PYTHON_CODE])
python_docs
```



```output
[Document(page_content='def hello_world():\n    print("Hello, World!")'),
 Document(page_content='# Call the function\nhello_world()')]
```


## JS
这是一个使用 JS 文本分割器的示例：


```python
JS_CODE = """
function helloWorld() {
  console.log("Hello, World!");
}

// Call the function
helloWorld();
"""

js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=60, chunk_overlap=0
)
js_docs = js_splitter.create_documents([JS_CODE])
js_docs
```



```output
[Document(page_content='function helloWorld() {\n  console.log("Hello, World!");\n}'),
 Document(page_content='// Call the function\nhelloWorld();')]
```


## TS
这是一个使用文本分割器的示例：


```python
TS_CODE = """
function helloWorld(): void {
  console.log("Hello, World!");
}

// Call the function
helloWorld();
"""

ts_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.TS, chunk_size=60, chunk_overlap=0
)
ts_docs = ts_splitter.create_documents([TS_CODE])
ts_docs
```



```output
[Document(page_content='function helloWorld(): void {'),
 Document(page_content='console.log("Hello, World!");\n}'),
 Document(page_content='// Call the function\nhelloWorld();')]
```


## Markdown

这是一个使用Markdown文本分割器的示例：



```python
markdown_text = """
# 🦜️🔗 LangChain

⚡ Building applications with LLMs through composability ⚡

## Quick Install

# Hopefully this code block isn't split
pip install langchain

As an open-source project in a rapidly developing field, we are extremely open to contributions.
"""
```


```python
md_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.MARKDOWN, chunk_size=60, chunk_overlap=0
)
md_docs = md_splitter.create_documents([markdown_text])
md_docs
```



```output
[Document(page_content='# 🦜️🔗 LangChain'),
 Document(page_content='⚡ Building applications with LLMs through composability ⚡'),
 Document(page_content='## Quick Install'),
 Document(page_content="# Hopefully this code block isn't split"),
 Document(page_content='pip install langchain'),
 Document(page_content='As an open-source project in a rapidly developing field, we'),
 Document(page_content='are extremely open to contributions.')]
```


## Latex

这是一个关于Latex文本的示例：



```python
latex_text = """
\documentclass{article}

\begin{document}

\maketitle

\section{Introduction}
Large language models (LLMs) are a type of machine learning model that can be trained on vast amounts of text data to generate human-like language. In recent years, LLMs have made significant advances in a variety of natural language processing tasks, including language translation, text generation, and sentiment analysis.

\subsection{History of LLMs}
The earliest LLMs were developed in the 1980s and 1990s, but they were limited by the amount of data that could be processed and the computational power available at the time. In the past decade, however, advances in hardware and software have made it possible to train LLMs on massive datasets, leading to significant improvements in performance.

\subsection{Applications of LLMs}
LLMs have many applications in industry, including chatbots, content creation, and virtual assistants. They can also be used in academia for research in linguistics, psychology, and computational linguistics.

\end{document}
"""
```


```python
latex_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.MARKDOWN, chunk_size=60, chunk_overlap=0
)
latex_docs = latex_splitter.create_documents([latex_text])
latex_docs
```



```output
[Document(page_content='\\documentclass{article}\n\n\x08egin{document}\n\n\\maketitle'),
 Document(page_content='\\section{Introduction}'),
 Document(page_content='Large language models (LLMs) are a type of machine learning'),
 Document(page_content='model that can be trained on vast amounts of text data to'),
 Document(page_content='generate human-like language. In recent years, LLMs have'),
 Document(page_content='made significant advances in a variety of natural language'),
 Document(page_content='processing tasks, including language translation, text'),
 Document(page_content='generation, and sentiment analysis.'),
 Document(page_content='\\subsection{History of LLMs}'),
 Document(page_content='The earliest LLMs were developed in the 1980s and 1990s,'),
 Document(page_content='but they were limited by the amount of data that could be'),
 Document(page_content='processed and the computational power available at the'),
 Document(page_content='time. In the past decade, however, advances in hardware and'),
 Document(page_content='software have made it possible to train LLMs on massive'),
 Document(page_content='datasets, leading to significant improvements in'),
 Document(page_content='performance.'),
 Document(page_content='\\subsection{Applications of LLMs}'),
 Document(page_content='LLMs have many applications in industry, including'),
 Document(page_content='chatbots, content creation, and virtual assistants. They'),
 Document(page_content='can also be used in academia for research in linguistics,'),
 Document(page_content='psychology, and computational linguistics.'),
 Document(page_content='\\end{document}')]
```


## HTML

这是一个使用HTML文本分割器的示例：



```python
html_text = """
<!DOCTYPE html>
<html>
    <head>
        <title>🦜️🔗 LangChain</title>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            h1 {
                color: darkblue;
            }
        </style>
    </head>
    <body>
        <div>
            <h1>🦜️🔗 LangChain</h1>
            <p>⚡ Building applications with LLMs through composability ⚡</p>
        </div>
        <div>
            As an open-source project in a rapidly developing field, we are extremely open to contributions.
        </div>
    </body>
</html>
"""
```


```python
html_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.HTML, chunk_size=60, chunk_overlap=0
)
html_docs = html_splitter.create_documents([html_text])
html_docs
```



```output
[Document(page_content='<!DOCTYPE html>\n<html>'),
 Document(page_content='<head>\n        <title>🦜️🔗 LangChain</title>'),
 Document(page_content='<style>\n            body {\n                font-family: Aria'),
 Document(page_content='l, sans-serif;\n            }\n            h1 {'),
 Document(page_content='color: darkblue;\n            }\n        </style>\n    </head'),
 Document(page_content='>'),
 Document(page_content='<body>'),
 Document(page_content='<div>\n            <h1>🦜️🔗 LangChain</h1>'),
 Document(page_content='<p>⚡ Building applications with LLMs through composability ⚡'),
 Document(page_content='</p>\n        </div>'),
 Document(page_content='<div>\n            As an open-source project in a rapidly dev'),
 Document(page_content='eloping field, we are extremely open to contributions.'),
 Document(page_content='</div>\n    </body>\n</html>')]
```


## Solidity
这是一个使用Solidity文本分割器的示例：


```python
SOL_CODE = """
pragma solidity ^0.8.20;
contract HelloWorld {
   function add(uint a, uint b) pure public returns(uint) {
       return a + b;
   }
}
"""

sol_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.SOL, chunk_size=128, chunk_overlap=0
)
sol_docs = sol_splitter.create_documents([SOL_CODE])
sol_docs
```



```output
[Document(page_content='pragma solidity ^0.8.20;'),
 Document(page_content='contract HelloWorld {\n   function add(uint a, uint b) pure public returns(uint) {\n       return a + b;\n   }\n}')]
```


## C#
这是一个使用C#文本分割器的示例：



```python
C_CODE = """
using System;
class Program
{
    static void Main()
    {
        int age = 30; // Change the age value as needed

        // Categorize the age without any console output
        if (age < 18)
        {
            // Age is under 18
        }
        else if (age >= 18 && age < 65)
        {
            // Age is an adult
        }
        else
        {
            // Age is a senior citizen
        }
    }
}
"""
c_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.CSHARP, chunk_size=128, chunk_overlap=0
)
c_docs = c_splitter.create_documents([C_CODE])
c_docs
```



```output
[Document(page_content='using System;'),
 Document(page_content='class Program\n{\n    static void Main()\n    {\n        int age = 30; // Change the age value as needed'),
 Document(page_content='// Categorize the age without any console output\n        if (age < 18)\n        {\n            // Age is under 18'),
 Document(page_content='}\n        else if (age >= 18 && age < 65)\n        {\n            // Age is an adult\n        }\n        else\n        {'),
 Document(page_content='// Age is a senior citizen\n        }\n    }\n}')]
```


## Haskell
这是一个使用Haskell文本分割器的示例：


```python
HASKELL_CODE = """
main :: IO ()
main = do
    putStrLn "Hello, World!"
-- Some sample functions
add :: Int -> Int -> Int
add x y = x + y
"""
haskell_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.HASKELL, chunk_size=50, chunk_overlap=0
)
haskell_docs = haskell_splitter.create_documents([HASKELL_CODE])
haskell_docs
```



```output
[Document(page_content='main :: IO ()'),
 Document(page_content='main = do\n    putStrLn "Hello, World!"\n-- Some'),
 Document(page_content='sample functions\nadd :: Int -> Int -> Int\nadd x y'),
 Document(page_content='= x + y')]
```


## PHP
这是一个使用PHP文本分割器的示例：


```python
PHP_CODE = """<?php
namespace foo;
class Hello {
    public function __construct() { }
}
function hello() {
    echo "Hello World!";
}
interface Human {
    public function breath();
}
trait Foo { }
enum Color
{
    case Red;
    case Blue;
}"""
php_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PHP, chunk_size=50, chunk_overlap=0
)
php_docs = php_splitter.create_documents([PHP_CODE])
php_docs
```



```output
[Document(page_content='<?php\nnamespace foo;'),
 Document(page_content='class Hello {'),
 Document(page_content='public function __construct() { }\n}'),
 Document(page_content='function hello() {\n    echo "Hello World!";\n}'),
 Document(page_content='interface Human {\n    public function breath();\n}'),
 Document(page_content='trait Foo { }\nenum Color\n{\n    case Red;'),
 Document(page_content='case Blue;\n}')]
```


## PowerShell
这是一个使用PowerShell文本分割器的示例：


```python
POWERSHELL_CODE = """
$directoryPath = Get-Location

$items = Get-ChildItem -Path $directoryPath

$files = $items | Where-Object { -not $_.PSIsContainer }

$sortedFiles = $files | Sort-Object LastWriteTime

foreach ($file in $sortedFiles) {
    Write-Output ("Name: " + $file.Name + " | Last Write Time: " + $file.LastWriteTime)
}
"""
powershell_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.POWERSHELL, chunk_size=100, chunk_overlap=0
)
powershell_docs = powershell_splitter.create_documents([POWERSHELL_CODE])
powershell_docs
```
