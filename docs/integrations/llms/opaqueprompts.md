---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/opaqueprompts.ipynb
---
# OpaquePrompts

[OpaquePrompts](https://opaqueprompts.readthedocs.io/en/latest/) 是一个服务，使应用程序能够利用语言模型的强大功能而不妥协用户隐私。OpaquePrompts 旨在可组合性和易于集成到现有应用程序和服务中，可以通过简单的 Python 库以及通过 LangChain 进行使用。也许更重要的是，OpaquePrompts 利用 [机密计算](https://en.wikipedia.org/wiki/Confidential_computing) 的力量，以确保即使是 OpaquePrompts 服务本身也无法访问其保护的数据。
 

本笔记本介绍了如何使用 LangChain 与 `OpaquePrompts` 进行交互。


```python
# install the opaqueprompts and langchain packages
%pip install --upgrade --quiet  opaqueprompts langchain
```

访问 OpaquePrompts API 需要一个 API 密钥，您可以通过在 [OpaquePrompts 网站](https://opaqueprompts.opaque.co/) 上创建一个帐户来获取。创建帐户后，您可以在 [API 密钥页面](https://opaqueprompts.opaque.co/api-keys) 找到您的 API 密钥。


```python
import os

# Set API keys

os.environ["OPAQUEPROMPTS_API_KEY"] = "<OPAQUEPROMPTS_API_KEY>"
os.environ["OPENAI_API_KEY"] = "<OPENAI_API_KEY>"
```

# 使用 OpaquePrompts LLM 包装器

将 OpaquePrompts 应用到您的应用程序中可能只需使用 OpaquePrompts 类包装您的 LLM，将 `llm=OpenAI()` 替换为 `llm=OpaquePrompts(base_llm=OpenAI())`。


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "OpaquePrompts"}, {"imported": "set_debug", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_debug.html", "title": "OpaquePrompts"}, {"imported": "set_verbose", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_verbose.html", "title": "OpaquePrompts"}, {"imported": "ConversationBufferWindowMemory", "source": "langchain.memory", "docs": "https://python.langchain.com/api_reference/langchain/memory/langchain.memory.buffer_window.ConversationBufferWindowMemory.html", "title": "OpaquePrompts"}, {"imported": "OpaquePrompts", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.opaqueprompts.OpaquePrompts.html", "title": "OpaquePrompts"}, {"imported": "StdOutCallbackHandler", "source": "langchain_core.callbacks", "docs": "https://python.langchain.com/api_reference/core/callbacks/langchain_core.callbacks.stdout.StdOutCallbackHandler.html", "title": "OpaquePrompts"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "OpaquePrompts"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "OpaquePrompts"}]-->
from langchain.chains import LLMChain
from langchain.globals import set_debug, set_verbose
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.llms import OpaquePrompts
from langchain_core.callbacks import StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI

set_debug(True)
set_verbose(True)

prompt_template = """
As an AI assistant, you will answer questions according to given context.

Sensitive personal information in the question is masked for privacy.
For instance, if the original text says "Giana is good," it will be changed
to "PERSON_998 is good." 

Here's how to handle these changes:
* Consider these masked phrases just as placeholders, but still refer to
them in a relevant way when answering.
* It's possible that different masked terms might mean the same thing.
Stick with the given term and don't modify it.
* All masked terms follow the "TYPE_ID" pattern.
* Please don't invent new masked terms. For instance, if you see "PERSON_998,"
don't come up with "PERSON_997" or "PERSON_999" unless they're already in the question.

Conversation History: \`\`\`{history}\`\`\`
Context : \`\`\`During our recent meeting on February 23, 2023, at 10:30 AM,
John Doe provided me with his personal details. His email is johndoe@example.com
and his contact number is 650-456-7890. He lives in New York City, USA, and
belongs to the American nationality with Christian beliefs and a leaning towards
the Democratic party. He mentioned that he recently made a transaction using his
credit card 4111 1111 1111 1111 and transferred bitcoins to the wallet address
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. While discussing his European travels, he noted
down his IBAN as GB29 NWBK 6016 1331 9268 19. Additionally, he provided his website
as https://johndoeportfolio.com. John also discussed some of his US-specific details.
He said his bank account number is 1234567890123456 and his drivers license is Y12345678.
His ITIN is 987-65-4321, and he recently renewed his passport, the number for which is
123456789. He emphasized not to share his SSN, which is 123-45-6789. Furthermore, he
mentioned that he accesses his work files remotely through the IP 192.168.1.1 and has
a medical license number MED-123456. \`\`\`
Question: \`\`\`{question}\`\`\`

"""

chain = LLMChain(
    prompt=PromptTemplate.from_template(prompt_template),
    llm=OpaquePrompts(base_llm=OpenAI()),
    memory=ConversationBufferWindowMemory(k=2),
    verbose=True,
)


print(
    chain.run(
        {
            "question": """Write a message to remind John to do password reset for his website to stay secure."""
        },
        callbacks=[StdOutCallbackHandler()],
    )
)
```

从输出中，您可以看到用户输入的以下上下文包含敏感数据。

``` 
# Context from user input

During our recent meeting on February 23, 2023, at 10:30 AM, John Doe provided me with his personal details. His email is johndoe@example.com and his contact number is 650-456-7890. He lives in New York City, USA, and belongs to the American nationality with Christian beliefs and a leaning towards the Democratic party. He mentioned that he recently made a transaction using his credit card 4111 1111 1111 1111 and transferred bitcoins to the wallet address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. While discussing his European travels, he noted down his IBAN as GB29 NWBK 6016 1331 9268 19. Additionally, he provided his website as https://johndoeportfolio.com. John also discussed some of his US-specific details. He said his bank account number is 1234567890123456 and his drivers license is Y12345678. His ITIN is 987-65-4321, and he recently renewed his passport, the number for which is 123456789. He emphasized not to share his SSN, which is 669-45-6789. Furthermore, he mentioned that he accesses his work files remotely through the IP 192.168.1.1 and has a medical license number MED-123456.
```

OpaquePrompts 将自动检测敏感数据并用占位符替换。

```
# Context after OpaquePrompts

During our recent meeting on DATE_TIME_3, at DATE_TIME_2, PERSON_3 provided me with his personal details. His email is EMAIL_ADDRESS_1 and his contact number is PHONE_NUMBER_1. He lives in LOCATION_3, LOCATION_2, and belongs to the NRP_3 nationality with NRP_2 beliefs and a leaning towards the Democratic party. He mentioned that he recently made a transaction using his credit card CREDIT_CARD_1 and transferred bitcoins to the wallet address CRYPTO_1. While discussing his NRP_1 travels, he noted down his IBAN as IBAN_CODE_1. Additionally, he provided his website as URL_1. PERSON_2 also discussed some of his LOCATION_1-specific details. He said his bank account number is US_BANK_NUMBER_1 and his drivers license is US_DRIVER_LICENSE_2. His ITIN is US_ITIN_1, and he recently renewed his passport, the number for which is DATE_TIME_1. He emphasized not to share his SSN, which is US_SSN_1. Furthermore, he mentioned that he accesses his work files remotely through the IP IP_ADDRESS_1 and has a medical license number MED-US_DRIVER_LICENSE_1.
```

占位符在 LLM 响应中使用。

```
# response returned by LLM

Hey PERSON_1, just wanted to remind you to do a password reset for your website URL_1 through your email EMAIL_ADDRESS_1. It's important to stay secure online, so don't forget to do it!
```

通过用原始敏感数据替换占位符，响应被去敏感化。

```
# desanitized LLM response from OpaquePrompts

Hey John, just wanted to remind you to do a password reset for your website https://johndoeportfolio.com through your email johndoe@example.com. It's important to stay secure online, so don't forget to do it!
```

# 在 LangChain 表达式中使用 OpaquePrompts

如果即插即用的替代方案无法提供您所需的灵活性，还有可以与 LangChain 表达式一起使用的函数。


```python
<!--IMPORTS:[{"imported": "StrOutputParser", "source": "langchain_core.output_parsers", "docs": "https://python.langchain.com/api_reference/core/output_parsers/langchain_core.output_parsers.string.StrOutputParser.html", "title": "OpaquePrompts"}, {"imported": "RunnablePassthrough", "source": "langchain_core.runnables", "docs": "https://python.langchain.com/api_reference/core/runnables/langchain_core.runnables.passthrough.RunnablePassthrough.html", "title": "OpaquePrompts"}]-->
import langchain_community.utilities.opaqueprompts as op
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

prompt = (PromptTemplate.from_template(prompt_template),)
llm = OpenAI()
pg_chain = (
    op.sanitize
    | RunnablePassthrough.assign(
        response=(lambda x: x["sanitized_input"]) | prompt | llm | StrOutputParser(),
    )
    | (lambda x: op.desanitize(x["response"], x["secure_context"]))
)

pg_chain.invoke(
    {
        "question": "Write a text message to remind John to do password reset for his website through his email to stay secure.",
        "history": "",
    }
)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
