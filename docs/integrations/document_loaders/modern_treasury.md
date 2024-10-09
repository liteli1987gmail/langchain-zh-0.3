---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/modern_treasury.ipynb
---
# 现代财政

>[现代财政](https://www.moderntreasury.com/) 简化复杂的支付操作。它是一个统一的平台，用于支持移动资金的产品和流程。
>- 连接到银行和支付系统
>- 实时跟踪交易和余额
>- 自动化支付操作以实现规模化

本笔记本涵盖如何从 `现代财政 REST API` 加载数据到可以被 LangChain 吞吐的格式，以及向量化的示例用法。


```python
<!--IMPORTS:[{"imported": "VectorstoreIndexCreator", "source": "langchain.indexes", "docs": "https://python.langchain.com/api_reference/langchain/indexes/langchain.indexes.vectorstore.VectorstoreIndexCreator.html", "title": "Modern Treasury"}, {"imported": "ModernTreasuryLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.modern_treasury.ModernTreasuryLoader.html", "title": "Modern Treasury"}]-->
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import ModernTreasuryLoader
```

现代财政 API 需要一个组织 ID 和 API 密钥，这可以在现代财政仪表板的开发者设置中找到。

此文档加载器还需要一个 `resource` 选项，用于定义您想要加载的数据。

以下资源可用：

`payment_orders` [文档](https://docs.moderntreasury.com/reference/payment-order-object)

`expected_payments` [文档](https://docs.moderntreasury.com/reference/expected-payment-object)

`returns` [文档](https://docs.moderntreasury.com/reference/return-object)

`incoming_payment_details` [文档](https://docs.moderntreasury.com/reference/incoming-payment-detail-object)

`counterparties` [文档](https://docs.moderntreasury.com/reference/counterparty-object)

`internal_accounts` [文档](https://docs.moderntreasury.com/reference/internal-account-object)

`external_accounts` [文档](https://docs.moderntreasury.com/reference/external-account-object)

`transactions` [文档](https://docs.moderntreasury.com/reference/transaction-object)

`ledgers` [文档](https://docs.moderntreasury.com/reference/ledger-object)

`ledger_accounts` [文档](https://docs.moderntreasury.com/reference/ledger-account-object)

`ledger_transactions` [文档](https://docs.moderntreasury.com/reference/ledger-transaction-object)

`events` [文档](https://docs.moderntreasury.com/reference/events)

`invoices` [文档](https://docs.moderntreasury.com/reference/invoices)



```python
modern_treasury_loader = ModernTreasuryLoader("payment_orders")
```


```python
# Create a vectorstore retriever from the loader
# see https://python.langchain.com/en/latest/modules/data_connection/getting_started.html for more details

index = VectorstoreIndexCreator().from_loaders([modern_treasury_loader])
modern_treasury_doc_retriever = index.vectorstore.as_retriever()
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
