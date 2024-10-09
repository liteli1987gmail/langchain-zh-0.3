---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/doctran_interrogate_document.ipynb
---
# Doctran: 询问文档

在向量存储知识库中使用的文档通常以叙述或对话格式存储。然而，大多数用户查询是以问题格式进行的。如果我们在向量化文档之前**将文档转换为问答格式**，我们可以增加检索相关文档的可能性，并减少检索不相关文档的可能性。

我们可以使用[Doctran](https://github.com/psychic-api/doctran)库来实现这一点，该库利用OpenAI的函数调用功能来“询问”文档。

请参见[这个笔记本](https://github.com/psychic-api/doctran/blob/main/benchmark.ipynb)，了解基于原始文档与询问文档的各种查询的向量相似性评分基准。


```python
%pip install --upgrade --quiet  doctran
```


```python
<!--IMPORTS:[{"imported": "DoctranQATransformer", "source": "langchain_community.document_transformers", "docs": "https://python.langchain.com/api_reference/community/document_transformers/langchain_community.document_transformers.doctran_text_qa.DoctranQATransformer.html", "title": "Doctran: interrogate documents"}, {"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Doctran: interrogate documents"}]-->
import json

from langchain_community.document_transformers import DoctranQATransformer
from langchain_core.documents import Document
```


```python
from dotenv import load_dotenv

load_dotenv()
```



```output
True
```


## 输入
这是我们将要查询的文档


```python
sample_text = """[Generated with ChatGPT]

Confidential Document - For Internal Use Only

Date: July 1, 2023

Subject: Updates and Discussions on Various Topics

Dear Team,

I hope this email finds you well. In this document, I would like to provide you with some important updates and discuss various topics that require our attention. Please treat the information contained herein as highly confidential.

Security and Privacy Measures
As part of our ongoing commitment to ensure the security and privacy of our customers' data, we have implemented robust measures across all our systems. We would like to commend John Doe (email: john.doe@example.com) from the IT department for his diligent work in enhancing our network security. Moving forward, we kindly remind everyone to strictly adhere to our data protection policies and guidelines. Additionally, if you come across any potential security risks or incidents, please report them immediately to our dedicated team at security@example.com.

HR Updates and Employee Benefits
Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith (SSN: 049-45-5928) for her outstanding performance in customer service. Jane has consistently received positive feedback from our clients. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching. Should you have any questions or require assistance, please contact our HR representative, Michael Johnson (phone: 418-492-3850, email: michael.johnson@example.com).

Marketing Initiatives and Campaigns
Our marketing team has been actively working on developing new strategies to increase brand awareness and drive customer engagement. We would like to thank Sarah Thompson (phone: 415-555-1234) for her exceptional efforts in managing our social media platforms. Sarah has successfully increased our follower base by 20% in the past month alone. Moreover, please mark your calendars for the upcoming product launch event on July 15th. We encourage all team members to attend and support this exciting milestone for our company.

Research and Development Projects
In our pursuit of innovation, our research and development department has been working tirelessly on various projects. I would like to acknowledge the exceptional work of David Rodriguez (email: david.rodriguez@example.com) in his role as project lead. David's contributions to the development of our cutting-edge technology have been instrumental. Furthermore, we would like to remind everyone to share their ideas and suggestions for potential new projects during our monthly R&D brainstorming session, scheduled for July 10th.

Please treat the information in this document with utmost confidentiality and ensure that it is not shared with unauthorized individuals. If you have any questions or concerns regarding the topics discussed, please do not hesitate to reach out to me directly.

Thank you for your attention, and let's continue to work together to achieve our goals.

Best regards,

Jason Fan
Cofounder & CEO
Psychic
jason@psychic.dev
"""
print(sample_text)
```
```output
[Generated with ChatGPT]

Confidential Document - For Internal Use Only

Date: July 1, 2023

Subject: Updates and Discussions on Various Topics

Dear Team,

I hope this email finds you well. In this document, I would like to provide you with some important updates and discuss various topics that require our attention. Please treat the information contained herein as highly confidential.

Security and Privacy Measures
As part of our ongoing commitment to ensure the security and privacy of our customers' data, we have implemented robust measures across all our systems. We would like to commend John Doe (email: john.doe@example.com) from the IT department for his diligent work in enhancing our network security. Moving forward, we kindly remind everyone to strictly adhere to our data protection policies and guidelines. Additionally, if you come across any potential security risks or incidents, please report them immediately to our dedicated team at security@example.com.

HR Updates and Employee Benefits
Recently, we welcomed several new team members who have made significant contributions to their respective departments. I would like to recognize Jane Smith (SSN: 049-45-5928) for her outstanding performance in customer service. Jane has consistently received positive feedback from our clients. Furthermore, please remember that the open enrollment period for our employee benefits program is fast approaching. Should you have any questions or require assistance, please contact our HR representative, Michael Johnson (phone: 418-492-3850, email: michael.johnson@example.com).

Marketing Initiatives and Campaigns
Our marketing team has been actively working on developing new strategies to increase brand awareness and drive customer engagement. We would like to thank Sarah Thompson (phone: 415-555-1234) for her exceptional efforts in managing our social media platforms. Sarah has successfully increased our follower base by 20% in the past month alone. Moreover, please mark your calendars for the upcoming product launch event on July 15th. We encourage all team members to attend and support this exciting milestone for our company.

Research and Development Projects
In our pursuit of innovation, our research and development department has been working tirelessly on various projects. I would like to acknowledge the exceptional work of David Rodriguez (email: david.rodriguez@example.com) in his role as project lead. David's contributions to the development of our cutting-edge technology have been instrumental. Furthermore, we would like to remind everyone to share their ideas and suggestions for potential new projects during our monthly R&D brainstorming session, scheduled for July 10th.

Please treat the information in this document with utmost confidentiality and ensure that it is not shared with unauthorized individuals. If you have any questions or concerns regarding the topics discussed, please do not hesitate to reach out to me directly.

Thank you for your attention, and let's continue to work together to achieve our goals.

Best regards,

Jason Fan
Cofounder & CEO
Psychic
jason@psychic.dev
```

```python
documents = [Document(page_content=sample_text)]
qa_transformer = DoctranQATransformer()
transformed_document = qa_transformer.transform_documents(documents)
```

## 输出
在查询文档后，结果将作为一个新文档返回，元数据中提供了问题和答案。


```python
transformed_document = qa_transformer.transform_documents(documents)
print(json.dumps(transformed_document[0].metadata, indent=2))
```
```output
{
  "questions_and_answers": [
    {
      "question": "What is the purpose of this document?",
      "answer": "The purpose of this document is to provide important updates and discuss various topics that require the team's attention."
    },
    {
      "question": "What should be done if someone comes across potential security risks or incidents?",
      "answer": "If someone comes across potential security risks or incidents, they should report them immediately to the dedicated team at security@example.com."
    },
    {
      "question": "Who is commended for enhancing network security?",
      "answer": "John Doe from the IT department is commended for enhancing network security."
    },
    {
      "question": "Who should be contacted for assistance with employee benefits?",
      "answer": "For assistance with employee benefits, HR representative Michael Johnson should be contacted. His phone number is 418-492-3850, and his email is michael.johnson@example.com."
    },
    {
      "question": "Who has made significant contributions to their respective departments?",
      "answer": "Several new team members have made significant contributions to their respective departments."
    },
    {
      "question": "Who is recognized for outstanding performance in customer service?",
      "answer": "Jane Smith is recognized for outstanding performance in customer service."
    },
    {
      "question": "Who has successfully increased the follower base on social media?",
      "answer": "Sarah Thompson has successfully increased the follower base on social media."
    },
    {
      "question": "When is the upcoming product launch event?",
      "answer": "The upcoming product launch event is on July 15th."
    },
    {
      "question": "Who is acknowledged for their exceptional work as project lead?",
      "answer": "David Rodriguez is acknowledged for his exceptional work as project lead."
    },
    {
      "question": "When is the monthly R&D brainstorming session scheduled?",
      "answer": "The monthly R&D brainstorming session is scheduled for July 10th."
    }
  ]
}
```