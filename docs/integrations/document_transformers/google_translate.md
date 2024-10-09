---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/document_transformers/google_translate.ipynb
---
# 谷歌翻译

[谷歌翻译](https://translate.google.com/) 是由谷歌开发的多语言神经机器翻译服务，用于将文本、文档和网站从一种语言翻译成另一种语言。

`GoogleTranslateTransformer` 允许您使用 [Google Cloud Translation API](https://cloud.google.com/translate) 翻译文本和HTML。

要使用它，您需要安装 `google-cloud-translate` python 包，并且需要一个启用了 [翻译API](https://cloud.google.com/translate/docs/setup) 的谷歌云项目。此转换器使用 [高级版 (v3)](https://cloud.google.com/translate/docs/intro-to-v3)。

- [谷歌神经机器翻译](https://en.wikipedia.org/wiki/Google_Neural_Machine_Translation)
- [用于生产规模的机器翻译神经网络](https://blog.research.google/2016/09/a-neural-network-for-machine.html)


```python
%pip install --upgrade --quiet  google-cloud-translate
```


```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://python.langchain.com/api_reference/core/documents/langchain_core.documents.base.Document.html", "title": "Google Translate"}]-->
from langchain_core.documents import Document
from langchain_google_community import GoogleTranslateTransformer
```

## 输入

这是我们要翻译的文档


```python
sample_text = """[Generated with Google Bard]
Subject: Key Business Process Updates

Date: Friday, 27 October 2023

Dear team,

I am writing to provide an update on some of our key business processes.

Sales process

We have recently implemented a new sales process that is designed to help us close more deals and grow our revenue. The new process includes a more rigorous qualification process, a more streamlined proposal process, and a more effective customer relationship management (CRM) system.

Marketing process

We have also revamped our marketing process to focus on creating more targeted and engaging content. We are also using more social media and paid advertising to reach a wider audience.

Customer service process

We have also made some improvements to our customer service process. We have implemented a new customer support system that makes it easier for customers to get help with their problems. We have also hired more customer support representatives to reduce wait times.

Overall, we are very pleased with the progress we have made on improving our key business processes. We believe that these changes will help us to achieve our goals of growing our business and providing our customers with the best possible experience.

If you have any questions or feedback about any of these changes, please feel free to contact me directly.

Thank you,

Lewis Cymbal
CEO, Cymbal Bank
"""
```

在初始化 `GoogleTranslateTransformer` 时，可以包含以下参数来配置请求。

- `project_id`: Google Cloud 项目 ID。
- `location`: （可选）翻译模型位置。
- 默认: `global`
- `model_id`: （可选）要使用的翻译 [模型 ID][models]。
- `glossary_id`: （可选）要使用的翻译 [术语表 ID][glossaries]。
- `api_endpoint`: （可选）要使用的 [区域端点][endpoints]。

[models]: https://cloud.google.com/translate/docs/advanced/translating-text-v3#comparing-models
[术语表]: https://cloud.google.com/translate/docs/advanced/glossary
[端点]: https://cloud.google.com/translate/docs/advanced/endpoints


```python
documents = [Document(page_content=sample_text)]
translator = GoogleTranslateTransformer(project_id="<YOUR_PROJECT_ID>")
```

## 输出

翻译文档后，结果将作为新文档返回，`page_content` 将翻译成目标语言。

您可以向 `transform_documents()` 方法提供以下关键字参数：

- `target_language_code`: [ISO 639][iso-639] 输出文档的语言代码。
- 有关支持的语言，请参阅 [语言支持][supported-languages]。
- `source_language_code`: （可选）[ISO 639][iso-639] 输入文档的语言代码。
- 如果未提供，将自动检测语言。
- `mime_type`: （可选）[媒体类型][media-type] 输入文本的类型。
- 选项: `text/plain` (默认), `text/html`.

[iso-639]: https://en.wikipedia.org/wiki/ISO_639
[supported-languages]: https://cloud.google.com/translate/docs/languages
[media-type]: https://en.wikipedia.org/wiki/Media_type


```python
translated_documents = translator.transform_documents(
    documents, target_language_code="es"
)
```


```python
for doc in translated_documents:
    print(doc.metadata)
    print(doc.page_content)
```
```output
{'model': '', 'detected_language_code': 'en'}
[Generado con Google Bard]
Asunto: Actualizaciones clave de procesos comerciales

Fecha: viernes 27 de octubre de 2023

Estimado equipo,

Le escribo para brindarle una actualización sobre algunos de nuestros procesos comerciales clave.

Proceso de ventas

Recientemente implementamos un nuevo proceso de ventas que está diseñado para ayudarnos a cerrar más acuerdos y aumentar nuestros ingresos. El nuevo proceso incluye un proceso de calificación más riguroso, un proceso de propuesta más simplificado y un sistema de gestión de relaciones con el cliente (CRM) más eficaz.

Proceso de mercadeo

También hemos renovado nuestro proceso de marketing para centrarnos en crear contenido más específico y atractivo. También estamos utilizando más redes sociales y publicidad paga para llegar a una audiencia más amplia.

proceso de atención al cliente

También hemos realizado algunas mejoras en nuestro proceso de atención al cliente. Hemos implementado un nuevo sistema de atención al cliente que facilita que los clientes obtengan ayuda con sus problemas. También hemos contratado más representantes de atención al cliente para reducir los tiempos de espera.

En general, estamos muy satisfechos con el progreso que hemos logrado en la mejora de nuestros procesos comerciales clave. Creemos que estos cambios nos ayudarán a lograr nuestros objetivos de hacer crecer nuestro negocio y brindar a nuestros clientes la mejor experiencia posible.

Si tiene alguna pregunta o comentario sobre cualquiera de estos cambios, no dude en ponerse en contacto conmigo directamente.

Gracias,

Platillo Lewis
Director ejecutivo, banco de platillos
```