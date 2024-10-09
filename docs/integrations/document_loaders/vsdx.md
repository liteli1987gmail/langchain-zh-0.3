---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/vsdx.ipynb
---
# Vsdx

> 一个 [Visio 文件](https://fr.wikipedia.org/wiki/Microsoft_Visio)（扩展名为 .vsdx）与 Microsoft Visio 相关，这是一个图表创建软件。它存储有关图表的结构、布局和图形元素的信息。此格式便于在商业、工程和计算机科学等领域创建和共享可视化内容。

一个 Visio 文件可以包含多个页面。其中一些页面可能作为其他页面的背景，并且这可以跨多个层次发生。这个 **加载器** 提取每个页面及其相关页面的文本内容，使得能够提取每个页面上所有可见文本，类似于 OCR 算法的工作方式。

**警告**：只有扩展名为 **.vsdx** 的 Visio 文件与此加载器兼容。扩展名为 .vsd 等文件不兼容，因为它们无法转换为压缩的 XML。


```python
<!--IMPORTS:[{"imported": "VsdxLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.vsdx.VsdxLoader.html", "title": "Vsdx"}]-->
from langchain_community.document_loaders import VsdxLoader
```


```python
loader = VsdxLoader(file_path="./example_data/fake.vsdx")
documents = loader.load()
```

**显示加载的文档**


```python
for i, doc in enumerate(documents):
    print(f"\n------ Page {doc.metadata['page']} ------")
    print(f"Title page : {doc.metadata['page_name']}")
    print(f"Source : {doc.metadata['source']}")
    print("\n==> CONTENT <== ")
    print(doc.page_content)
```
```output

------ Page 0 ------
Title page : Summary
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Best Caption of the worl
This is an arrow
This is Earth
This is a bounded arrow

------ Page 1 ------
Title page : Glossary
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 2 ------
Title page : blanket page
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
This file is a vsdx file
First text
Second text
Third text

------ Page 3 ------
Title page : BLABLABLA
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
This is a page with something...

WAW I have learned something !
This is a page with something...

WAW I have learned something !

X2

------ Page 4 ------
Title page : What a page !!
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !

------ Page 5 ------
Title page : next page after previous one
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0-\u00a0incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in


voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
*


qui officia deserunt mollit anim id est laborum.

------ Page 6 ------
Title page : Connector Page
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"

------ Page 7 ------
Title page : Useful ↔ Useless page
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Title of this document : BLABLABLA

------ Page 8 ------
Title page : Alone page
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Black cloud
Unidirectional traffic primary path
Unidirectional traffic backup path
Encapsulation
User
Captions
Bidirectional traffic
Alone, sad
Test of another page
This is a \"bannier\"
Tests of some exotics characters :\u00a0\u00e3\u00e4\u00e5\u0101\u0103 \u00fc\u2554\u00a0 \u00a0\u00bc \u00c7 \u25d8\u25cb\u2642\u266b\u2640\u00ee\u2665
This is ethernet
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
This is an empty case
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0-\u00a0 incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in


 voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa 
*


qui officia deserunt mollit anim id est laborum.

------ Page 9 ------
Title page : BG
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Best Caption of the worl
This is an arrow
This is Earth
This is a bounded arrow
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 10 ------
Title page : BG  + caption1
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Useful\u2194 Useless page\u00a0

Tests of some exotics characters :\u00a0\u00e3\u00e4\u00e5\u0101\u0103 \u00fc\u2554\u00a0\u00a0\u00bc \u00c7 \u25d8\u25cb\u2642\u266b\u2640\u00ee\u2665

------ Page 11 ------
Title page : BG+
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title

------ Page 12 ------
Title page : BG WITH CONTENT
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.





Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. - Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
This is a page with a lot of text

------ Page 13 ------
Title page : 2nd caption with ____________________________________________________________________ content
Source : ./example_data/fake.vsdx

==> CONTENT <== 
Created by
Created the
Modified by
Modified the
Version
Title
Florian MOREL
2024-01-14
FLORIAN Morel
Today
0.0.0.0.0.1
This is a title
Another RED arrow wow
Arrow with point but red
Green line
User
Captions
Red arrow magic !
Something white
Something Red
This a a completly useless diagramm, cool !!

But this is for example !
This diagramm is a base of many pages in this file. But it is editable in file \"BG WITH CONTENT\"
Only connectors on this page. This is the CoNNeCtor page
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
