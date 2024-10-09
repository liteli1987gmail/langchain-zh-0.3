---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/cube_semantic.ipynb
---
# Cube 语义层

本笔记本演示了以适合传递给大型语言模型（LLMs）作为嵌入的格式检索 Cube 数据模型元数据的过程，从而增强上下文信息。

### 关于 Cube

[Cube](https://cube.dev/) 是构建数据应用的语义层。它帮助数据工程师和应用开发人员从现代数据存储中访问数据，将其组织成一致的定义，并将其交付给每个应用程序。

Cube 的数据模型提供了结构和定义，这些结构和定义被用作 LLM 理解数据和生成正确查询的上下文。LLM 不需要导航复杂的连接和度量计算，因为 Cube 抽象了这些内容，并提供了一个简单的接口，该接口在业务级术语上操作，而不是 SQL 表和列名。这种简化有助于 LLM 减少错误并避免幻觉。

### 示例

**输入参数（必填）**

`Cube 语义加载器` 需要 2 个参数：

- `cube_api_url`: 您的 Cube 部署 REST API 的 URL。有关配置基本路径的更多信息，请参阅 [Cube 文档](https://cube.dev/docs/http-api/rest#configuration-base-path)。

- `cube_api_token`: 基于您的 Cube API 密钥生成的身份验证令牌。有关生成 JSON Web 令牌（JWT）的说明，请参阅 [Cube 文档](https://cube.dev/docs/security#generating-json-web-tokens-jwt)。

**输入参数（可选）**

- `load_dimension_values`: 是否为每个字符串维度加载维度值。

- `dimension_values_limit`: 要加载的维度值的最大数量。

- `dimension_values_max_retries`: 加载维度值的最大重试次数。

- `dimension_values_retry_delay`: 加载维度值时重试之间的延迟。


```python
<!--IMPORTS:[{"imported": "CubeSemanticLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.cube_semantic.CubeSemanticLoader.html", "title": "Cube Semantic Layer"}]-->
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

返回具有以下属性的文档列表：

- `页面内容`
- `元数据`
- `表名`
- `列名`
- `列数据类型`
- `列标题`
- `列描述`
- `列值`
- `立方体数据对象类型`


```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
