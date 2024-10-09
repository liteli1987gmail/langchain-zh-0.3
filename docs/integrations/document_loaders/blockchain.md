---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/blockchain.ipynb
---
# 区块链

## 概述

本笔记本的目的是提供一种测试LangChain文档加载器在区块链上功能的方法。

最初，这个加载器支持：

* 从NFT智能合约（ERC721和ERC1155）加载NFT作为文档
* 以太坊主网，以太坊测试网，Polygon主网，Polygon测试网（默认是eth-mainnet）
* Alchemy的getNFTsForCollection API

如果社区发现这个加载器有价值，可以进行扩展。具体来说：

* 可以添加额外的API（例如，与交易相关的API）

这个文档加载器需要：

*   免费的 [Alchemy API Key](https://www.alchemy.com/)

输出格式如下：

- pageContent= 单个 NFT
- metadata=\

## 将 NFT 加载到文档加载器中


```python
# get ALCHEMY_API_KEY from https://www.alchemy.com/

alchemyApiKey = "..."
```

### 选项 1：以太坊主网（默认区块链类型）


```python
<!--IMPORTS:[{"imported": "BlockchainDocumentLoader", "source": "langchain_community.document_loaders.blockchain", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.blockchain.BlockchainDocumentLoader.html", "title": "Blockchain"}, {"imported": "BlockchainType", "source": "langchain_community.document_loaders.blockchain", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.blockchain.BlockchainType.html", "title": "Blockchain"}]-->
from langchain_community.document_loaders.blockchain import (
    BlockchainDocumentLoader,
    BlockchainType,
)

contractAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"  # Bored Ape Yacht Club contract address

blockchainType = BlockchainType.ETH_MAINNET  # default value, optional parameter

blockchainLoader = BlockchainDocumentLoader(
    contract_address=contractAddress, api_key=alchemyApiKey
)

nfts = blockchainLoader.load()

nfts[:2]
```

### 选项 2：Polygon 主网


```python
contractAddress = (
    "0x448676ffCd0aDf2D85C1f0565e8dde6924A9A7D9"  # Polygon Mainnet contract address
)

blockchainType = BlockchainType.POLYGON_MAINNET

blockchainLoader = BlockchainDocumentLoader(
    contract_address=contractAddress,
    blockchainType=blockchainType,
    api_key=alchemyApiKey,
)

nfts = blockchainLoader.load()

nfts[:2]
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
