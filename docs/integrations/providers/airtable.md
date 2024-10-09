# Airtable

> [Airtable](https://en.wikipedia.org/wiki/Airtable) 是一个云协作服务。
`Airtable` 是一个电子表格-数据库混合体，具有数据库的特性，但应用于电子表格。
> Airtable 表格中的字段类似于电子表格中的单元格，但具有 '复选框' 等类型，
> '电话号码' 和 '下拉列表'，并可以引用文件附件，如图像。

> 用户可以创建数据库，设置列类型，添加记录，链接表格，协作，排序记录
> 并将视图发布到外部网站。

## 安装和设置

```bash
pip install pyairtable
```

* 获取您的 [API 密钥](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)。
* 获取您的 [基础 ID](https://airtable.com/developers/web/api/introduction)。
* 从表格网址获取 [表格 ID](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)。

## 文档加载器


```python
from langchain_community.document_loaders import AirtableLoader
```

查看 [示例](/docs/integrations/document_loaders/airtable)。
