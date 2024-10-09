---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/wikidata.ipynb
---
# Wikidata

>[Wikidata](https://wikidata.org/) 是一个免费的开放知识库，可以被人类和机器读取和编辑。Wikidata 是世界上最大的开放知识库之一。

首先，您需要安装 `wikibase-rest-api-client` 和 `mediawikiapi` Python 包。


```python
%pip install --upgrade --quiet "wikibase-rest-api-client<0.2" mediawikiapi
```


```python
<!--IMPORTS:[{"imported": "WikidataAPIWrapper", "source": "langchain_community.tools.wikidata.tool", "docs": "https://python.langchain.com/api_reference/community/utilities/langchain_community.utilities.wikidata.WikidataAPIWrapper.html", "title": "Wikidata"}, {"imported": "WikidataQueryRun", "source": "langchain_community.tools.wikidata.tool", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.wikidata.tool.WikidataQueryRun.html", "title": "Wikidata"}]-->
from langchain_community.tools.wikidata.tool import WikidataAPIWrapper, WikidataQueryRun

wikidata = WikidataQueryRun(api_wrapper=WikidataAPIWrapper())

print(wikidata.run("Alan Turing"))
```
```output
Result Q7251:
Label: Alan Turing
Description: English computer scientist (1912–1954)
Aliases: Alan M. Turing, Alan Mathieson Turing, Turing, Alan Mathison Turing
instance of: human
country of citizenship: United Kingdom
occupation: computer scientist, mathematician, university teacher, cryptographer, logician, statistician, marathon runner, artificial intelligence researcher
sex or gender: male
date of birth: 1912-06-23
date of death: 1954-06-07
sport: athletics
place of birth: Maida Vale, Warrington Lodge
educated at: King's College, Princeton University, Sherborne School, Hazlehurst Community Primary School
employer: Victoria University of Manchester, Government Communications Headquarters, University of Cambridge, National Physical Laboratory (United Kingdom)
place of death: Wilmslow
field of work: cryptanalysis, computer science, mathematics, logic, cryptography
cause of death: cyanide poisoning
notable work: On Computable Numbers, with an Application to the Entscheidungsproblem, Computing Machinery and Intelligence, Intelligent Machinery, halting problem, Turing machine, Turing test, Turing completeness, Church-Turing thesis, universal Turing machine, Symmetric Turing machine, non-deterministic Turing machine, Bombe, probabilistic Turing machine, Turing degree
religion or worldview: atheism
mother: Ethel Sara Stoney
father: Julius Mathison Turing
doctoral student: Robin Gandy, Beatrice Helen Worsley
student: Robin Gandy

Result Q28846012:
Label: Alan Turing
Description: fictional analogon of Alan Turing (1912-1954)
Aliases: Alan Mathison Turing
instance of: fictional human
sex or gender: male
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
