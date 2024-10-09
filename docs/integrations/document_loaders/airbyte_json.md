---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/airbyte_json.ipynb
sidebar_class_name: hidden
---
# Airbyte JSON (已弃用)

注意：`AirbyteJSONLoader` 已弃用。请使用 [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) 替代。

>[Airbyte](https://github.com/airbytehq/airbyte) 是一个用于从 API、数据库和文件到数据仓库和数据湖的 ELT 管道的数据集成平台。它拥有最大的 ELT 连接器目录，支持数据仓库和数据库。

这部分介绍如何将 Airbyte 的任何源加载到可以作为文档读取的本地 JSON 文件中。

前提条件：
安装 Docker Desktop

步骤：

1) 从 GitHub 克隆 Airbyte - `git clone https://github.com/airbytehq/airbyte.git`

2) 切换到 Airbyte 目录 - `cd airbyte`

3) 启动 Airbyte - `docker compose up`

4) 在您的浏览器中，访问 `http://localhost:8000`。系统会要求您输入用户名和密码。默认情况下，用户名是 `airbyte`，密码是 `password`。

5) 设置您希望的任何数据源。

6) 将目标设置为本地 JSON，并指定目标路径 - 比如说 `/json_data`。设置手动同步。

7) 运行连接。

7) 要查看创建了哪些文件，您可以导航到: `file:///tmp/airbyte_local`

8) 找到您的数据并复制路径。该路径应保存在下面的文件变量中。它应以 `/tmp/airbyte_local` 开头。



```python
<!--IMPORTS:[{"imported": "AirbyteJSONLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.airbyte_json.AirbyteJSONLoader.html", "title": "Airbyte JSON (Deprecated)"}]-->
from langchain_community.document_loaders import AirbyteJSONLoader
```


```python
!ls /tmp/airbyte_local/json_data/
```
```output
_airbyte_raw_pokemon.jsonl
```

```python
loader = AirbyteJSONLoader("/tmp/airbyte_local/json_data/_airbyte_raw_pokemon.jsonl")
```


```python
data = loader.load()
```


```python
print(data[0].page_content[:500])
```
```output
abilities: 
ability: 
name: blaze
url: https://pokeapi.co/api/v2/ability/66/

is_hidden: False
slot: 1


ability: 
name: solar-power
url: https://pokeapi.co/api/v2/ability/94/

is_hidden: True
slot: 3

base_experience: 267
forms: 
name: charizard
url: https://pokeapi.co/api/v2/pokemon-form/6/

game_indices: 
game_index: 180
version: 
name: red
url: https://pokeapi.co/api/v2/version/1/



game_index: 180
version: 
name: blue
url: https://pokeapi.co/api/v2/version/2/



game_index: 180
version: 
n
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
