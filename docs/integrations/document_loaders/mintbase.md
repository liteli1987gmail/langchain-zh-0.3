---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/mintbase.ipynb
---
# Near Blockchain

## 概述

本笔记本的目的是提供一种测试LangChain文档加载器在Near Blockchain中功能的方法。

最初，这个加载器支持：

* 从NFT智能合约（NEP-171和NEP-177）加载NFT作为文档
* Near主网，Near测试网（默认是主网）
* Mintbase的图形API

如果社区发现这个加载器有价值，可以进行扩展。具体来说：

* 可以添加额外的API（例如，与交易相关的API）

这个文档加载器需要：

*   免费的 [Mintbase API 密钥](https://docs.mintbase.xyz/dev/mintbase-graph/)

输出采用以下格式：

- pageContent= 单个 NFT
- metadata=\

## 将 NFT 加载到文档加载器中


```python
# get MINTBASE_API_KEY from https://docs.mintbase.xyz/dev/mintbase-graph/

mintbaseApiKey = "..."
```

### 选项 1：以太坊主网（默认区块链类型）


```python
from MintbaseLoader import MintbaseDocumentLoader

contractAddress = "nft.yearofchef.near"  # Year of chef contract address


blockchainLoader = MintbaseDocumentLoader(
    contract_address=contractAddress, blockchain_type="mainnet", api_key="omni-site"
)

nfts = blockchainLoader.load()

print(nfts[:1])

for doc in blockchainLoader.lazy_load():
    print()
    print(type(doc))
    print(doc)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
