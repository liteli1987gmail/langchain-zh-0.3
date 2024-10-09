---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/tomarkdown.ipynb
---
# 2Markdown

>[2markdown](https://2markdown.com/) 服务将网站内容转换为结构化的markdown文件。



```python
# You will need to get your own API key. See https://2markdown.com/login

api_key = ""
```


```python
<!--IMPORTS:[{"imported": "ToMarkdownLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.tomarkdown.ToMarkdownLoader.html", "title": "2Markdown"}]-->
from langchain_community.document_loaders import ToMarkdownLoader
```


```python
loader = ToMarkdownLoader(url="/docs/get_started/introduction", api_key=api_key)
```


```python
docs = loader.load()
```


```python
print(docs[0].page_content)
```
```output
**LangChain** is a framework for developing applications powered by language models. It enables applications that:

- **Are context-aware**: connect a language model to sources of context (prompt instructions, few shot examples, content to ground its response in, etc.)
- **Reason**: rely on a language model to reason (about how to answer based on provided context, what actions to take, etc.)

This framework consists of several parts.

- **LangChain Libraries**: The Python and JavaScript libraries. Contains interfaces and integrations for a myriad of components, a basic run time for combining these components into chains and agents, and off-the-shelf implementations of chains and agents.
- **[LangChain Templates](/docs/templates)**: A collection of easily deployable reference architectures for a wide variety of tasks.
- **[LangServe](/docs/langserve)**: A library for deploying LangChain chains as a REST API.
- **[LangSmith](https://docs.smith.langchain.com)**: A developer platform that lets you debug, test, evaluate, and monitor chains built on any LLM framework and seamlessly integrates with LangChain.

![Diagram outlining the hierarchical organization of the LangChain framework, displaying the interconnected parts across multiple layers.](https://python.langchain.com/assets/images/langchain_stack-f21828069f74484521f38199910007c1.svg)

Together, these products simplify the entire application lifecycle:

- **Develop**: Write your applications in LangChain/LangChain.js. Hit the ground running using Templates for reference.
- **Productionize**: Use LangSmith to inspect, test and monitor your chains, so that you can constantly improve and deploy with confidence.
- **Deploy**: Turn any chain into an API with LangServe.

## LangChain Libraries [​](\#langchain-libraries "Direct link to LangChain Libraries")

The main value props of the LangChain packages are:

1. **Components**: composable tools and integrations for working with language models. Components are modular and easy-to-use, whether you are using the rest of the LangChain framework or not
2. **Off-the-shelf chains**: built-in assemblages of components for accomplishing higher-level tasks

Off-the-shelf chains make it easy to get started. Components make it easy to customize existing chains and build new ones.

The LangChain libraries themselves are made up of several different packages.

- **`langchain-core`**: Base abstractions and LangChain Expression Language.
- **`langchain-community`**: Third party integrations.
- **`langchain`**: Chains, agents, and retrieval strategies that make up an application's cognitive architecture.

## Get started [​](\#get-started "Direct link to Get started")

[Here’s](/docs/installation) how to install LangChain, set up your environment, and start building.

We recommend following our [Quickstart](/docs/tutorials/llm_chain) guide to familiarize yourself with the framework by building your first LangChain application.

Read up on our [Security](/docs/security) best practices to make sure you're developing safely with LangChain.

note

These docs focus on the Python LangChain library. [Head here](https://js.langchain.com) for docs on the JavaScript LangChain library.

## LangChain Expression Language (LCEL) [​](\#langchain-expression-language-lcel "Direct link to LangChain Expression Language (LCEL)")

LCEL is a declarative way to compose chains. LCEL was designed from day 1 to support putting prototypes in production, with no code changes, from the simplest “prompt + LLM” chain to the most complex chains.

- **[Overview](/docs/concepts#langchain-expression-language-lcel)**: LCEL and its benefits
- **[Interface](/docs/concepts#interface)**: The standard interface for LCEL objects
- **[How-to](/docs/expression_language/how_to)**: Key features of LCEL
- **[Cookbook](/docs/expression_language/cookbook)**: Example code for accomplishing common tasks

## Modules [​](\#modules "Direct link to Modules")

LangChain provides standard, extendable interfaces and integrations for the following modules:

#### [Model I/O](/docs/modules/model_io/) [​](\#model-io "Direct link to model-io")

Interface with language models

#### [Retrieval](/docs/modules/data_connection/) [​](\#retrieval "Direct link to retrieval")

Interface with application-specific data

#### [Agents](/docs/tutorials/agents) [​](\#agents "Direct link to agents")

Let models choose which tools to use given high-level directives

## Examples, ecosystem, and resources [​](\#examples-ecosystem-and-resources "Direct link to Examples, ecosystem, and resources")

### [Use cases](/docs/how_to#qa-with-rag) [​](\#use-cases "Direct link to use-cases")

Walkthroughs and techniques for common end-to-end use cases, like:

- [Document question answering](/docs/how_to#qa-with-rag)
- [Chatbots](/docs/use_cases/chatbots/)
- [Analyzing structured data](/docs/how_to#qa-over-sql--csv)
- and much more...

### [Integrations](/docs/integrations/providers/) [​](\#integrations "Direct link to integrations")

LangChain is part of a rich ecosystem of tools that integrate with our framework and build on top of it. Check out our growing list of [integrations](/docs/integrations/providers/).

### [Guides](/docs/how_to/debugging) [​](\#guides "Direct link to guides")

Best practices for developing with LangChain.

### [API reference](https://api.python.langchain.com) [​](\#api-reference "Direct link to api-reference")

Head to the reference section for full documentation of all classes and methods in the LangChain and LangChain Experimental Python packages.

### [Developer's guide](/docs/contributing) [​](\#developers-guide "Direct link to developers-guide")

Check out the developer's guide for guidelines on contributing and help getting your dev environment set up.

Head to the [Community navigator](/docs/community) to find places to ask questions, share feedback, meet other developers, and dream about the future of LLM’s.
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
