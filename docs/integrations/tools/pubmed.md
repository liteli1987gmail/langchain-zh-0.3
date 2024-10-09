---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/pubmed.ipynb
---
# PubMed

>[PubMed®](https://pubmed.ncbi.nlm.nih.gov/) 包含超过 3500 万条来自 `MEDLINE`、生命科学期刊和在线书籍的生物医学文献引用。引用可能包括指向 PubMed Central 和出版商网站的全文内容的链接。

本笔记本介绍如何将 `PubMed` 作为工具使用。


```python
%pip install xmltodict
```


```python
<!--IMPORTS:[{"imported": "PubmedQueryRun", "source": "langchain_community.tools.pubmed.tool", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.pubmed.tool.PubmedQueryRun.html", "title": "PubMed"}]-->
from langchain_community.tools.pubmed.tool import PubmedQueryRun
```


```python
tool = PubmedQueryRun()
```


```python
tool.invoke("What causes lung cancer?")
```



```output
'Published: 2024-02-10\nTitle: circEPB41L2 blocks the progression and metastasis in non-small cell lung cancer by promoting TRIP12-triggered PTBP1 ubiquitylation.\nCopyright Information: © 2024. The Author(s).\nSummary::\nThe metastasis of non-small cell lung cancer (NSCLC) is the leading death cause of NSCLC patients, which requires new biomarkers for precise diagnosis and treatment. Circular RNAs (circRNAs), the novel noncoding RNA, participate in the progression of various cancers as microRNA or protein sponges. We revealed the mechanism by which circEPB41L2 (hsa_circ_0077837) blocks the aerobic glycolysis, progression and metastasis of NSCLC through modulating protein metabolism of PTBP1 by the E3 ubiquitin ligase TRIP12. With ribosomal RNA-depleted RNA seq, 57 upregulated and 327 downregulated circRNAs were identified in LUAD tissues. circEPB41L2 was selected due to its dramatically reduced levels in NSCLC tissues and NSCLC cells. Interestingly, circEPB41L2 blocked glucose uptake, lactate production, NSCLC cell proliferation, migration and invasion in vitro and in vivo. Mechanistically, acting as a scaffold, circEPB41L2 bound to the RRM1 domain of the PTBP1 and the E3 ubiquitin ligase TRIP12 to promote TRIP12-mediated PTBP1 polyubiquitylation and degradation, which could be reversed by the HECT domain mutation of TRIP12 and circEPB41L2 depletion. As a result, circEPB41L2-induced PTBP1 inhibition led to PTBP1-induced PKM2 and Vimentin activation but PKM1 and E-cadherin inactivation. These findings highlight the circEPB41L2-dependent mechanism that modulates the "Warburg Effect" and EMT to inhibit NSCLC development and metastasis, offering an inhibitory target for NSCLC treatment.\n\nPublished: 2024-01-17\nTitle: The safety of seasonal influenza vaccination among adults prescribed immune checkpoint inhibitors: A self-controlled case series study using administrative data.\nCopyright Information: Copyright © 2024 The Author(s). Published by Elsevier Ltd.. All rights reserv'
```



## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
