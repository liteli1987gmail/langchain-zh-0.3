---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_loaders/google_cloud_storage_file.ipynb
---
# Google Cloud Storage 文件

>[Google Cloud Storage](https://en.wikipedia.org/wiki/Google_Cloud_Storage) 是一个用于存储非结构化数据的托管服务。

这部分介绍如何从 `Google Cloud Storage (GCS) 文件对象 (blob)` 加载文档对象。


```python
%pip install --upgrade --quiet  langchain-google-community[gcs]
```


```python
from langchain_google_community import GCSFileLoader
```


```python
loader = GCSFileLoader(project_name="aist", bucket="testing-hwc", blob="fake.docx")
```


```python
loader.load()
```
```output
/Users/harrisonchase/workplace/langchain/.venv/lib/python3.10/site-packages/google/auth/_default.py:83: UserWarning: Your application has authenticated using end user credentials from Google Cloud SDK without a quota project. You might receive a "quota exceeded" or "API not enabled" error. We recommend you rerun `gcloud auth application-default login` and make sure a quota project is added. Or you can use service accounts instead. For more information about service accounts, see https://cloud.google.com/docs/authentication/
  warnings.warn(_CLOUD_SDK_CREDENTIALS_WARNING)
```


```output
[Document(page_content='Lorem ipsum dolor sit amet.', lookup_str='', metadata={'source': '/var/folders/y6/8_bzdg295ld6s1_97_12m4lr0000gn/T/tmp3srlf8n8/fake.docx'}, lookup_index=0)]
```


如果您想使用替代加载器，可以提供一个自定义函数，例如：


```python
<!--IMPORTS:[{"imported": "PyPDFLoader", "source": "langchain_community.document_loaders", "docs": "https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html", "title": "Google Cloud Storage File"}]-->
from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path):
    return PyPDFLoader(file_path)


loader = GCSFileLoader(
    project_name="aist", bucket="testing-hwc", blob="fake.pdf", loader_func=load_pdf
)
```


## 相关

- 文档加载器 [概念指南](/docs/concepts/#document-loaders)
- 文档加载器 [使用指南](/docs/how_to/#document-loaders)
