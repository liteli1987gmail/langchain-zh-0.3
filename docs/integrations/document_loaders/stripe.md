---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/stripe.ipynb
---
# Stripe

>[Stripe](https://stripe.com/en-ca) 是一家爱尔兰-美国金融服务和软件即服务 (SaaS) 公司。它为电子商务网站和移动应用提供支付处理软件和应用程序编程接口。

本笔记本涵盖如何将数据从 `Stripe REST API` 加载到可以被 LangChain 吞吐的格式，以及向量化的示例用法。


```python
<!--IMPORTS:[{"imported": "VectorstoreIndexCreator", "source": "langchain.indexes", "docs": "https://python.langchain.com/api_reference/langchain/indexes/langchain.indexes.vectorstore.VectorstoreIndexCreator.html", "title": "Stripe"}, {"imported": "StripeLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.stripe.StripeLoader.html", "title": "Stripe"}]-->
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import StripeLoader
```

Stripe API 需要一个访问令牌，可以在 Stripe 仪表板中找到。

此文档加载器还需要一个 `resource` 选项，用于定义您想要加载的数据。

以下资源可用：

`balance_transations` [文档](https://stripe.com/docs/api/balance_transactions/list)

`charges` [文档](https://stripe.com/docs/api/charges/list)

`customers` [文档](https://stripe.com/docs/api/customers/list)

`events` [文档](https://stripe.com/docs/api/events/list)

`refunds` [文档](https://stripe.com/docs/api/refunds/list)

`disputes` [文档](https://stripe.com/docs/api/disputes/list)


```python
stripe_loader = StripeLoader("charges")
```


```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([stripe_loader])
stripe_doc_retriever = index.vectorstore.as_retriever()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
