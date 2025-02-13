---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/pyspark_dataframe.ipynb
---
# PySpark

本笔记介绍如何从一个 [PySpark](https://spark.apache.org/docs/latest/api/python/) 数据框加载数据。


```python
%pip install --upgrade --quiet  pyspark
```


```python
from pyspark.sql import SparkSession
```


```python
spark = SparkSession.builder.getOrCreate()
```
```output
Setting default log level to "WARN".
To adjust logging level use sc.setLogLevel(newLevel). For SparkR, use setLogLevel(newLevel).
23/05/31 14:08:33 WARN NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
```

```python
df = spark.read.csv("example_data/mlb_teams_2012.csv", header=True)
```


```python
<!--IMPORTS:[{"imported": "PySparkDataFrameLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pyspark_dataframe.PySparkDataFrameLoader.html", "title": "PySpark"}]-->
from langchain_community.document_loaders import PySparkDataFrameLoader
```


```python
loader = PySparkDataFrameLoader(spark, df, page_content_column="Team")
```


```python
loader.load()
```
```output
[Stage 8:>                                                          (0 + 1) / 1]
```


```output
[Document(page_content='Nationals', metadata={' "Payroll (millions)"': '     81.34', ' "Wins"': ' 98'}),
 Document(page_content='Reds', metadata={' "Payroll (millions)"': '          82.20', ' "Wins"': ' 97'}),
 Document(page_content='Yankees', metadata={' "Payroll (millions)"': '      197.96', ' "Wins"': ' 95'}),
 Document(page_content='Giants', metadata={' "Payroll (millions)"': '       117.62', ' "Wins"': ' 94'}),
 Document(page_content='Braves', metadata={' "Payroll (millions)"': '        83.31', ' "Wins"': ' 94'}),
 Document(page_content='Athletics', metadata={' "Payroll (millions)"': '     55.37', ' "Wins"': ' 94'}),
 Document(page_content='Rangers', metadata={' "Payroll (millions)"': '      120.51', ' "Wins"': ' 93'}),
 Document(page_content='Orioles', metadata={' "Payroll (millions)"': '       81.43', ' "Wins"': ' 93'}),
 Document(page_content='Rays', metadata={' "Payroll (millions)"': '          64.17', ' "Wins"': ' 90'}),
 Document(page_content='Angels', metadata={' "Payroll (millions)"': '       154.49', ' "Wins"': ' 89'}),
 Document(page_content='Tigers', metadata={' "Payroll (millions)"': '       132.30', ' "Wins"': ' 88'}),
 Document(page_content='Cardinals', metadata={' "Payroll (millions)"': '    110.30', ' "Wins"': ' 88'}),
 Document(page_content='Dodgers', metadata={' "Payroll (millions)"': '       95.14', ' "Wins"': ' 86'}),
 Document(page_content='White Sox', metadata={' "Payroll (millions)"': '     96.92', ' "Wins"': ' 85'}),
 Document(page_content='Brewers', metadata={' "Payroll (millions)"': '       97.65', ' "Wins"': ' 83'}),
 Document(page_content='Phillies', metadata={' "Payroll (millions)"': '     174.54', ' "Wins"': ' 81'}),
 Document(page_content='Diamondbacks', metadata={' "Payroll (millions)"': '  74.28', ' "Wins"': ' 81'}),
 Document(page_content='Pirates', metadata={' "Payroll (millions)"': '       63.43', ' "Wins"': ' 79'}),
 Document(page_content='Padres', metadata={' "Payroll (millions)"': '        55.24', ' "Wins"': ' 76'}),
 Document(page_content='Mariners', metadata={' "Payroll (millions)"': '      81.97', ' "Wins"': ' 75'}),
 Document(page_content='Mets', metadata={' "Payroll (millions)"': '          93.35', ' "Wins"': ' 74'}),
 Document(page_content='Blue Jays', metadata={' "Payroll (millions)"': '     75.48', ' "Wins"': ' 73'}),
 Document(page_content='Royals', metadata={' "Payroll (millions)"': '        60.91', ' "Wins"': ' 72'}),
 Document(page_content='Marlins', metadata={' "Payroll (millions)"': '      118.07', ' "Wins"': ' 69'}),
 Document(page_content='Red Sox', metadata={' "Payroll (millions)"': '      173.18', ' "Wins"': ' 69'}),
 Document(page_content='Indians', metadata={' "Payroll (millions)"': '       78.43', ' "Wins"': ' 68'}),
 Document(page_content='Twins', metadata={' "Payroll (millions)"': '         94.08', ' "Wins"': ' 66'}),
 Document(page_content='Rockies', metadata={' "Payroll (millions)"': '       78.06', ' "Wins"': ' 64'}),
 Document(page_content='Cubs', metadata={' "Payroll (millions)"': '          88.19', ' "Wins"': ' 61'}),
 Document(page_content='Astros', metadata={' "Payroll (millions)"': '        60.65', ' "Wins"': ' 55'})]
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [操作指南](/docs/how_to/#document-loaders)
