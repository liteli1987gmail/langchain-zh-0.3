---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/text_embedding/laser.ipynb
---
# LASER 语言无关的句子表示嵌入，由Meta AI提供

>[LASER](https://github.com/facebookresearch/LASER/) 是由Meta AI研究团队开发的Python库，用于创建超过147种语言的多语言句子嵌入，截至2024年2月25日
>- 支持的语言列表请查看 https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200

## 依赖

要在LangChain中使用LaserEmbed，请安装`laser_encoders` Python包。


```python
%pip install laser_encoders
```

## 导入


```python
<!--IMPORTS:[{"imported": "LaserEmbeddings", "source": "langchain_community.embeddings.laser", "docs": "https://python.langchain.com/api_reference/community/embeddings/langchain_community.embeddings.laser.LaserEmbeddings.html", "title": "LASER Language-Agnostic SEntence Representations Embeddings by Meta AI"}]-->
from langchain_community.embeddings.laser import LaserEmbeddings
```

## 实例化 LASER
   
### 参数
- `lang: 可选[str]`
>如果为空，将默认为使用多语言 LASER 编码器模型（称为 "laser2"）。
您可以在 [这里](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200) 找到支持的语言和 lang_codes 列表
和 [这里](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py)
。
。


```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## 用法

### 生成文档嵌入


```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### 生成查询嵌入


```python
query_embeddings = embeddings.embed_query("This is a query")
```


## 相关

- 嵌入模型 [概念指南](/docs/concepts/#embedding-models)
- 嵌入模型 [使用指南](/docs/how_to/#embedding-models)
