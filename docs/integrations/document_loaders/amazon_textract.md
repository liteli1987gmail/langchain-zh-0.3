---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/amazon_textract.ipynb
---
# 亚马逊 Textract

>[亚马逊 Textract](https://docs.aws.amazon.com/managedservices/latest/userguide/textract.html) 是一项机器学习 (ML) 服务，能够自动从扫描文档中提取文本、手写和数据。
>
>它超越了简单的光学字符识别 (OCR)，能够识别、理解并从表单和表格中提取数据。如今，许多公司手动从扫描文档（如 PDF、图像、表格和表单）中提取数据，或通过需要手动配置的简单 OCR 软件（当表单更改时通常需要更新）。为了克服这些手动和昂贵的过程，`Textract` 使用机器学习来读取和处理任何类型的文档，准确提取文本、手写、表格和其他数据，无需手动操作。

此示例演示了 `亚马逊 Textract` 与 LangChain 结合用作 DocumentLoader 的用法。

`Textract` 支持 `PDF`、`TIFF`、`PNG` 和 `JPEG` 格式。

`Textract` 支持这些 [文档大小、语言和字符](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html)。


```python
%pip install --upgrade --quiet  boto3 langchain-openai tiktoken python-dotenv
```


```python
%pip install --upgrade --quiet  "amazon-textract-caller>=0.2.0"
```

## 示例 1

第一个示例使用本地文件，该文件将内部发送到 Amazon Textract 同步 API [DetectDocumentText](https://docs.aws.amazon.com/textract/latest/dg/API_DetectDocumentText.html)。

本地文件或 URL 端点如 HTTP:// 限制为 Textract 的单页文档。
多页文档必须存储在 S3 上。此示例文件为 jpeg 格式。


```python
<!--IMPORTS:[{"imported": "AmazonTextractPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.AmazonTextractPDFLoader.html", "title": "Amazon Textract "}]-->
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("example_data/alejandro_rosalez_sample-small.jpeg")
documents = loader.load()
```

文件输出


```python
documents
```



```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```


## 示例 2
下一个示例从 HTTPS 端点加载文件。
它必须是单页的，因为 Amazon Textract 要求所有多页文档存储在 S3 上。


```python
<!--IMPORTS:[{"imported": "AmazonTextractPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.AmazonTextractPDFLoader.html", "title": "Amazon Textract "}]-->
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader(
    "https://amazon-textract-public-content.s3.us-east-2.amazonaws.com/langchain/alejandro_rosalez_sample_1.jpg"
)
documents = loader.load()
```


```python
documents
```



```output
[Document(page_content='Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No Patient Information First Name: ALEJANDRO Last Name: ROSALEZ Date of Birth: 10/10/1982 Sex: M Marital Status: MARRIED Email Address: Address: 123 ANY STREET City: ANYTOWN State: CA Zip Code: 12345 Phone: 646-555-0111 Emergency Contact 1: First Name: CARLOS Last Name: SALAZAR Phone: 212-555-0150 Relationship to Patient: BROTHER Emergency Contact 2: First Name: JANE Last Name: DOE Phone: 650-555-0123 Relationship FRIEND to Patient: Did you feel fever or feverish lately? Yes No Are you having shortness of breath? Yes No Do you have a cough? Yes No Did you experience loss of taste or smell? Yes No Where you in contact with any confirmed COVID-19 positive patients? Yes No Did you travel in the past 14 days to any regions affected by COVID-19? Yes No ', metadata={'source': 'example_data/alejandro_rosalez_sample-small.jpeg', 'page': 1})]
```


## 示例 3

处理多页文档要求文档存储在 S3 上。示例文档位于 us-east-2 的一个存储桶中，Textract 需要在同一区域调用才能成功，因此我们在客户端上设置 region_name，并将其传递给加载器，以确保从 us-east-2 调用 Textract。您也可以让您的笔记本在 us-east-2 中运行，将 AWS_DEFAULT_REGION 设置为 us-east-2，或者在不同环境中运行时，传入带有该区域名称的 boto3 Textract 客户端，如下方单元格所示。


```python
import boto3

textract_client = boto3.client("textract", region_name="us-east-2")

file_path = "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf"
loader = AmazonTextractPDFLoader(file_path, client=textract_client)
documents = loader.load()
```

现在获取页面数量以验证响应（打印完整响应会非常长...）。我们预计有16页。


```python
len(documents)
```



```output
16
```


## 示例 4

您可以选择传递一个额外的参数，称为 `linearization_config`，给 AmazonTextractPDFLoader，这将决定 Textract 运行后解析器如何线性化文本输出。


```python
<!--IMPORTS:[{"imported": "AmazonTextractPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.AmazonTextractPDFLoader.html", "title": "Amazon Textract "}]-->
from langchain_community.document_loaders import AmazonTextractPDFLoader
from textractor.data.text_linearization_config import TextLinearizationConfig

loader = AmazonTextractPDFLoader(
    "s3://amazon-textract-public-content/langchain/layout-parser-paper.pdf",
    linearization_config=TextLinearizationConfig(
        hide_header_layout=True,
        hide_footer_layout=True,
        hide_figure_layout=True,
    ),
)
documents = loader.load()
```

## 在 LangChain 链中使用 AmazonTextractPDFLoader（例如 OpenAI）

AmazonTextractPDFLoader 可以以与其他加载器相同的方式在链中使用。
Textract 本身确实有一个 [查询功能](https://docs.aws.amazon.com/textract/latest/dg/API_Query.html)，提供与此示例中的 QA 链类似的功能，值得查看。


```python
# You can store your OPENAI_API_KEY in a .env file as well
# import os
# from dotenv import load_dotenv

# load_dotenv()
```


```python
# Or set the OpenAI key in the environment directly
import os

os.environ["OPENAI_API_KEY"] = "your-OpenAI-API-key"
```


```python
<!--IMPORTS:[{"imported": "load_qa_chain", "source": "langchain.chains.question_answering", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.question_answering.chain.load_qa_chain.html", "title": "Amazon Textract "}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Amazon Textract "}]-->
from langchain.chains.question_answering import load_qa_chain
from langchain_openai import OpenAI

chain = load_qa_chain(llm=OpenAI(), chain_type="map_reduce")
query = ["Who are the autors?"]

chain.run(input_documents=documents, question=query)
```



```output
' The authors are Zejiang Shen, Ruochen Zhang, Melissa Dell, Benjamin Charles Germain Lee, Jacob Carlson, Weining Li, Gardner, M., Grus, J., Neumann, M., Tafjord, O., Dasigi, P., Liu, N., Peters, M., Schmitz, M., Zettlemoyer, L., Lukasz Garncarek, Powalski, R., Stanislawek, T., Topolski, B., Halama, P., Gralinski, F., Graves, A., Fernández, S., Gomez, F., Schmidhuber, J., Harley, A.W., Ufkes, A., Derpanis, K.G., He, K., Gkioxari, G., Dollár, P., Girshick, R., He, K., Zhang, X., Ren, S., Sun, J., Kay, A., Lamiroy, B., Lopresti, D., Mears, J., Jakeway, E., Ferriter, M., Adams, C., Yarasavage, N., Thomas, D., Zwaard, K., Li, M., Cui, L., Huang,'
```



## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
