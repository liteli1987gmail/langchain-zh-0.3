---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/csv.ipynb
---
# CSV

>A [逗号分隔值 (CSV)](https://en.wikipedia.org/wiki/Comma-separated_values) 文件是一个使用逗号分隔值的分隔文本文件。文件的每一行都是一个数据记录。每个记录由一个或多个字段组成，字段之间用逗号分隔。

加载 [csv](https://en.wikipedia.org/wiki/Comma-separated_values) 数据，每个文档对应一行。


```python
<!--IMPORTS:[{"imported": "CSVLoader", "source": "langchain_community.document_loaders.csv_loader", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.CSVLoader.html", "title": "CSV"}]-->
from langchain_community.document_loaders.csv_loader import CSVLoader

loader = CSVLoader(file_path="./example_data/mlb_teams_2012.csv")

data = loader.load()

print(data)
```
```output
[Document(page_content='Team: Nationals\n"Payroll (millions)": 81.34\n"Wins": 98', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 0}), Document(page_content='Team: Reds\n"Payroll (millions)": 82.20\n"Wins": 97', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 1}), Document(page_content='Team: Yankees\n"Payroll (millions)": 197.96\n"Wins": 95', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 2}), Document(page_content='Team: Giants\n"Payroll (millions)": 117.62\n"Wins": 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 3}), Document(page_content='Team: Braves\n"Payroll (millions)": 83.31\n"Wins": 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 4}), Document(page_content='Team: Athletics\n"Payroll (millions)": 55.37\n"Wins": 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 5}), Document(page_content='Team: Rangers\n"Payroll (millions)": 120.51\n"Wins": 93', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 6}), Document(page_content='Team: Orioles\n"Payroll (millions)": 81.43\n"Wins": 93', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 7}), Document(page_content='Team: Rays\n"Payroll (millions)": 64.17\n"Wins": 90', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 8}), Document(page_content='Team: Angels\n"Payroll (millions)": 154.49\n"Wins": 89', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 9}), Document(page_content='Team: Tigers\n"Payroll (millions)": 132.30\n"Wins": 88', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 10}), Document(page_content='Team: Cardinals\n"Payroll (millions)": 110.30\n"Wins": 88', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 11}), Document(page_content='Team: Dodgers\n"Payroll (millions)": 95.14\n"Wins": 86', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 12}), Document(page_content='Team: White Sox\n"Payroll (millions)": 96.92\n"Wins": 85', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 13}), Document(page_content='Team: Brewers\n"Payroll (millions)": 97.65\n"Wins": 83', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 14}), Document(page_content='Team: Phillies\n"Payroll (millions)": 174.54\n"Wins": 81', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 15}), Document(page_content='Team: Diamondbacks\n"Payroll (millions)": 74.28\n"Wins": 81', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 16}), Document(page_content='Team: Pirates\n"Payroll (millions)": 63.43\n"Wins": 79', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 17}), Document(page_content='Team: Padres\n"Payroll (millions)": 55.24\n"Wins": 76', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 18}), Document(page_content='Team: Mariners\n"Payroll (millions)": 81.97\n"Wins": 75', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 19}), Document(page_content='Team: Mets\n"Payroll (millions)": 93.35\n"Wins": 74', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 20}), Document(page_content='Team: Blue Jays\n"Payroll (millions)": 75.48\n"Wins": 73', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 21}), Document(page_content='Team: Royals\n"Payroll (millions)": 60.91\n"Wins": 72', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 22}), Document(page_content='Team: Marlins\n"Payroll (millions)": 118.07\n"Wins": 69', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 23}), Document(page_content='Team: Red Sox\n"Payroll (millions)": 173.18\n"Wins": 69', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 24}), Document(page_content='Team: Indians\n"Payroll (millions)": 78.43\n"Wins": 68', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 25}), Document(page_content='Team: Twins\n"Payroll (millions)": 94.08\n"Wins": 66', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 26}), Document(page_content='Team: Rockies\n"Payroll (millions)": 78.06\n"Wins": 64', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 27}), Document(page_content='Team: Cubs\n"Payroll (millions)": 88.19\n"Wins": 61', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 28}), Document(page_content='Team: Astros\n"Payroll (millions)": 60.65\n"Wins": 55', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 29})]
```
## 自定义 CSV 解析和加载

有关支持的 CSV 参数的更多信息，请参见 [csv 模块](https://docs.python.org/3/library/csv.html) 文档。


```python
loader = CSVLoader(
    file_path="./example_data/mlb_teams_2012.csv",
    csv_args={
        "delimiter": ",",
        "quotechar": '"',
        "fieldnames": ["MLB Team", "Payroll in millions", "Wins"],
    },
)

data = loader.load()

print(data)
```
```output
[Document(page_content='MLB Team: Team\nPayroll in millions: "Payroll (millions)"\nWins: "Wins"', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 0}), Document(page_content='MLB Team: Nationals\nPayroll in millions: 81.34\nWins: 98', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 1}), Document(page_content='MLB Team: Reds\nPayroll in millions: 82.20\nWins: 97', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 2}), Document(page_content='MLB Team: Yankees\nPayroll in millions: 197.96\nWins: 95', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 3}), Document(page_content='MLB Team: Giants\nPayroll in millions: 117.62\nWins: 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 4}), Document(page_content='MLB Team: Braves\nPayroll in millions: 83.31\nWins: 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 5}), Document(page_content='MLB Team: Athletics\nPayroll in millions: 55.37\nWins: 94', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 6}), Document(page_content='MLB Team: Rangers\nPayroll in millions: 120.51\nWins: 93', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 7}), Document(page_content='MLB Team: Orioles\nPayroll in millions: 81.43\nWins: 93', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 8}), Document(page_content='MLB Team: Rays\nPayroll in millions: 64.17\nWins: 90', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 9}), Document(page_content='MLB Team: Angels\nPayroll in millions: 154.49\nWins: 89', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 10}), Document(page_content='MLB Team: Tigers\nPayroll in millions: 132.30\nWins: 88', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 11}), Document(page_content='MLB Team: Cardinals\nPayroll in millions: 110.30\nWins: 88', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 12}), Document(page_content='MLB Team: Dodgers\nPayroll in millions: 95.14\nWins: 86', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 13}), Document(page_content='MLB Team: White Sox\nPayroll in millions: 96.92\nWins: 85', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 14}), Document(page_content='MLB Team: Brewers\nPayroll in millions: 97.65\nWins: 83', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 15}), Document(page_content='MLB Team: Phillies\nPayroll in millions: 174.54\nWins: 81', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 16}), Document(page_content='MLB Team: Diamondbacks\nPayroll in millions: 74.28\nWins: 81', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 17}), Document(page_content='MLB Team: Pirates\nPayroll in millions: 63.43\nWins: 79', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 18}), Document(page_content='MLB Team: Padres\nPayroll in millions: 55.24\nWins: 76', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 19}), Document(page_content='MLB Team: Mariners\nPayroll in millions: 81.97\nWins: 75', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 20}), Document(page_content='MLB Team: Mets\nPayroll in millions: 93.35\nWins: 74', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 21}), Document(page_content='MLB Team: Blue Jays\nPayroll in millions: 75.48\nWins: 73', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 22}), Document(page_content='MLB Team: Royals\nPayroll in millions: 60.91\nWins: 72', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 23}), Document(page_content='MLB Team: Marlins\nPayroll in millions: 118.07\nWins: 69', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 24}), Document(page_content='MLB Team: Red Sox\nPayroll in millions: 173.18\nWins: 69', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 25}), Document(page_content='MLB Team: Indians\nPayroll in millions: 78.43\nWins: 68', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 26}), Document(page_content='MLB Team: Twins\nPayroll in millions: 94.08\nWins: 66', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 27}), Document(page_content='MLB Team: Rockies\nPayroll in millions: 78.06\nWins: 64', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 28}), Document(page_content='MLB Team: Cubs\nPayroll in millions: 88.19\nWins: 61', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 29}), Document(page_content='MLB Team: Astros\nPayroll in millions: 60.65\nWins: 55', metadata={'source': './example_data/mlb_teams_2012.csv', 'row': 30})]
```
## 指定一个列以识别文档来源

使用 `source_column` 参数指定从每一行创建的文档的来源。否则，`file_path` 将作为从 CSV 文件创建的所有文档的来源。

当使用从 CSV 文件加载的文档进行回答问题的链时，这非常有用。


```python
loader = CSVLoader(file_path="./example_data/mlb_teams_2012.csv", source_column="Team")

data = loader.load()

print(data)
```
```output
[Document(page_content='Team: Nationals\n"Payroll (millions)": 81.34\n"Wins": 98', metadata={'source': 'Nationals', 'row': 0}), Document(page_content='Team: Reds\n"Payroll (millions)": 82.20\n"Wins": 97', metadata={'source': 'Reds', 'row': 1}), Document(page_content='Team: Yankees\n"Payroll (millions)": 197.96\n"Wins": 95', metadata={'source': 'Yankees', 'row': 2}), Document(page_content='Team: Giants\n"Payroll (millions)": 117.62\n"Wins": 94', metadata={'source': 'Giants', 'row': 3}), Document(page_content='Team: Braves\n"Payroll (millions)": 83.31\n"Wins": 94', metadata={'source': 'Braves', 'row': 4}), Document(page_content='Team: Athletics\n"Payroll (millions)": 55.37\n"Wins": 94', metadata={'source': 'Athletics', 'row': 5}), Document(page_content='Team: Rangers\n"Payroll (millions)": 120.51\n"Wins": 93', metadata={'source': 'Rangers', 'row': 6}), Document(page_content='Team: Orioles\n"Payroll (millions)": 81.43\n"Wins": 93', metadata={'source': 'Orioles', 'row': 7}), Document(page_content='Team: Rays\n"Payroll (millions)": 64.17\n"Wins": 90', metadata={'source': 'Rays', 'row': 8}), Document(page_content='Team: Angels\n"Payroll (millions)": 154.49\n"Wins": 89', metadata={'source': 'Angels', 'row': 9}), Document(page_content='Team: Tigers\n"Payroll (millions)": 132.30\n"Wins": 88', metadata={'source': 'Tigers', 'row': 10}), Document(page_content='Team: Cardinals\n"Payroll (millions)": 110.30\n"Wins": 88', metadata={'source': 'Cardinals', 'row': 11}), Document(page_content='Team: Dodgers\n"Payroll (millions)": 95.14\n"Wins": 86', metadata={'source': 'Dodgers', 'row': 12}), Document(page_content='Team: White Sox\n"Payroll (millions)": 96.92\n"Wins": 85', metadata={'source': 'White Sox', 'row': 13}), Document(page_content='Team: Brewers\n"Payroll (millions)": 97.65\n"Wins": 83', metadata={'source': 'Brewers', 'row': 14}), Document(page_content='Team: Phillies\n"Payroll (millions)": 174.54\n"Wins": 81', metadata={'source': 'Phillies', 'row': 15}), Document(page_content='Team: Diamondbacks\n"Payroll (millions)": 74.28\n"Wins": 81', metadata={'source': 'Diamondbacks', 'row': 16}), Document(page_content='Team: Pirates\n"Payroll (millions)": 63.43\n"Wins": 79', metadata={'source': 'Pirates', 'row': 17}), Document(page_content='Team: Padres\n"Payroll (millions)": 55.24\n"Wins": 76', metadata={'source': 'Padres', 'row': 18}), Document(page_content='Team: Mariners\n"Payroll (millions)": 81.97\n"Wins": 75', metadata={'source': 'Mariners', 'row': 19}), Document(page_content='Team: Mets\n"Payroll (millions)": 93.35\n"Wins": 74', metadata={'source': 'Mets', 'row': 20}), Document(page_content='Team: Blue Jays\n"Payroll (millions)": 75.48\n"Wins": 73', metadata={'source': 'Blue Jays', 'row': 21}), Document(page_content='Team: Royals\n"Payroll (millions)": 60.91\n"Wins": 72', metadata={'source': 'Royals', 'row': 22}), Document(page_content='Team: Marlins\n"Payroll (millions)": 118.07\n"Wins": 69', metadata={'source': 'Marlins', 'row': 23}), Document(page_content='Team: Red Sox\n"Payroll (millions)": 173.18\n"Wins": 69', metadata={'source': 'Red Sox', 'row': 24}), Document(page_content='Team: Indians\n"Payroll (millions)": 78.43\n"Wins": 68', metadata={'source': 'Indians', 'row': 25}), Document(page_content='Team: Twins\n"Payroll (millions)": 94.08\n"Wins": 66', metadata={'source': 'Twins', 'row': 26}), Document(page_content='Team: Rockies\n"Payroll (millions)": 78.06\n"Wins": 64', metadata={'source': 'Rockies', 'row': 27}), Document(page_content='Team: Cubs\n"Payroll (millions)": 88.19\n"Wins": 61', metadata={'source': 'Cubs', 'row': 28}), Document(page_content='Team: Astros\n"Payroll (millions)": 60.65\n"Wins": 55', metadata={'source': 'Astros', 'row': 29})]
```
## `UnstructuredCSVLoader`

您还可以使用 `UnstructuredCSVLoader` 加载表格。使用 `UnstructuredCSVLoader` 的一个优点是，如果您以 "elements" 模式使用它，表格的 HTML 表示将可在元数据中获得。


```python
<!--IMPORTS:[{"imported": "UnstructuredCSVLoader", "source": "langchain_community.document_loaders.csv_loader", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.csv_loader.UnstructuredCSVLoader.html", "title": "CSV"}]-->
from langchain_community.document_loaders.csv_loader import UnstructuredCSVLoader

loader = UnstructuredCSVLoader(
    file_path="example_data/mlb_teams_2012.csv", mode="elements"
)
docs = loader.load()

print(docs[0].metadata["text_as_html"])
```
```output
<table border="1" class="dataframe">
  <tbody>
    <tr>
      <td>Team</td>
      <td>"Payroll (millions)"</td>
      <td>"Wins"</td>
    </tr>
    <tr>
      <td>Nationals</td>
      <td>81.34</td>
      <td>98</td>
    </tr>
    <tr>
      <td>Reds</td>
      <td>82.20</td>
      <td>97</td>
    </tr>
    <tr>
      <td>Yankees</td>
      <td>197.96</td>
      <td>95</td>
    </tr>
    <tr>
      <td>Giants</td>
      <td>117.62</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Braves</td>
      <td>83.31</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Athletics</td>
      <td>55.37</td>
      <td>94</td>
    </tr>
    <tr>
      <td>Rangers</td>
      <td>120.51</td>
      <td>93</td>
    </tr>
    <tr>
      <td>Orioles</td>
      <td>81.43</td>
      <td>93</td>
    </tr>
    <tr>
      <td>Rays</td>
      <td>64.17</td>
      <td>90</td>
    </tr>
    <tr>
      <td>Angels</td>
      <td>154.49</td>
      <td>89</td>
    </tr>
    <tr>
      <td>Tigers</td>
      <td>132.30</td>
      <td>88</td>
    </tr>
    <tr>
      <td>Cardinals</td>
      <td>110.30</td>
      <td>88</td>
    </tr>
    <tr>
      <td>Dodgers</td>
      <td>95.14</td>
      <td>86</td>
    </tr>
    <tr>
      <td>White Sox</td>
      <td>96.92</td>
      <td>85</td>
    </tr>
    <tr>
      <td>Brewers</td>
      <td>97.65</td>
      <td>83</td>
    </tr>
    <tr>
      <td>Phillies</td>
      <td>174.54</td>
      <td>81</td>
    </tr>
    <tr>
      <td>Diamondbacks</td>
      <td>74.28</td>
      <td>81</td>
    </tr>
    <tr>
      <td>Pirates</td>
      <td>63.43</td>
      <td>79</td>
    </tr>
    <tr>
      <td>Padres</td>
      <td>55.24</td>
      <td>76</td>
    </tr>
    <tr>
      <td>Mariners</td>
      <td>81.97</td>
      <td>75</td>
    </tr>
    <tr>
      <td>Mets</td>
      <td>93.35</td>
      <td>74</td>
    </tr>
    <tr>
      <td>Blue Jays</td>
      <td>75.48</td>
      <td>73</td>
    </tr>
    <tr>
      <td>Royals</td>
      <td>60.91</td>
      <td>72</td>
    </tr>
    <tr>
      <td>Marlins</td>
      <td>118.07</td>
      <td>69</td>
    </tr>
    <tr>
      <td>Red Sox</td>
      <td>173.18</td>
      <td>69</td>
    </tr>
    <tr>
      <td>Indians</td>
      <td>78.43</td>
      <td>68</td>
    </tr>
    <tr>
      <td>Twins</td>
      <td>94.08</td>
      <td>66</td>
    </tr>
    <tr>
      <td>Rockies</td>
      <td>78.06</td>
      <td>64</td>
    </tr>
    <tr>
      <td>Cubs</td>
      <td>88.19</td>
      <td>61</td>
    </tr>
    <tr>
      <td>Astros</td>
      <td>60.65</td>
      <td>55</td>
    </tr>
  </tbody>
</table>
```

## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
