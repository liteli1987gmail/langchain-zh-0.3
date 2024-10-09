---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/callbacks/labelstudio.ipynb
---
# Label Studio


>[Label Studio](https://labelstud.io/guide/get_started) 是一个开源数据标注平台，为 LangChain 提供了在标注数据以微调大型语言模型 (LLMs) 时的灵活性。它还支持准备自定义训练数据以及通过人类反馈收集和评估响应。

在本指南中，您将学习如何将 LangChain 管道连接到 `Label Studio` 以：

- 在单个 `Label Studio` 项目中聚合所有输入提示、对话和响应。这将所有数据集中在一个地方，便于标注和分析。
- 精炼提示和响应，以创建用于监督微调 (SFT) 和人类反馈强化学习 (RLHF) 场景的数据集。标注的数据可以用于进一步训练 LLM，以提高其性能。
- 通过人类反馈评估模型响应。`Label Studio` 提供了一个界面，供人类审查和反馈模型响应，从而实现评估和迭代。

## 安装和设置

首先安装最新版本的 Label Studio 和 Label Studio API 客户端：


```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai langchain-community
```

接下来，在命令行中运行 `label-studio` 以在 `http://localhost:8080` 启动本地 LabelStudio 实例。有关更多选项，请参阅 [Label Studio 安装指南](https://labelstud.io/guide/install)。

您需要一个令牌来进行 API 调用。

在浏览器中打开您的 LabelStudio 实例，转到 `账户与设置 > 访问令牌` 并复制密钥。

设置环境变量，包含您的 LabelStudio URL、API 密钥和 OpenAI API 密钥：


```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # e.g. http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## 收集 LLMs 提示和响应

用于标记的数据存储在 Label Studio 的项目中。每个项目由一个 XML 配置文件标识，该文件详细说明了输入和输出数据的规格。

创建一个项目，该项目接受文本格式的人类输入，并在文本区域输出可编辑的 LLM 响应：

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. 要在 Label Studio 中创建项目，请单击“创建”按钮。
2. 在“项目名称”字段中输入项目名称，例如 `我的项目`。
3. 导航到 `标记设置 > 自定义模板` 并粘贴上述提供的 XML 配置。

您可以在LabelStudio项目中收集输入的LLM提示和输出响应，通过`LabelStudioCallbackHandler`连接它：


```python
<!--IMPORTS:[{"imported": "LabelStudioCallbackHandler", "source": "langchain_community.callbacks.labelstudio_callback", "docs": "https://python.langchain.com/api_reference/community/callbacks/langchain_community.callbacks.labelstudio_callback.LabelStudioCallbackHandler.html", "title": "Label Studio"}]-->
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```


```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Label Studio"}]-->
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

在Label Studio中，打开`我的项目`。您将看到提示、响应和模型名称等元数据。

## 收集聊天模型对话

您还可以在LabelStudio中跟踪和显示完整的聊天对话，并能够对最后的响应进行评分和修改：

1. 打开Label Studio并点击“创建”按钮。
2. 在“项目名称”字段中输入您的项目名称，例如`与聊天的新项目`。
3. 导航到标注设置 > 自定义模板，并粘贴以下XML配置：

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```


```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.human.HumanMessage.html", "title": "Label Studio"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://python.langchain.com/api_reference/core/messages/langchain_core.messages.system.SystemMessage.html", "title": "Label Studio"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Label Studio"}]-->
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

在Label Studio中，打开“与聊天的新项目”。点击创建的任务以查看对话历史并编辑/注释响应。

## 自定义标注配置

您可以在LabelStudio中修改默认的标注配置，以添加更多目标标签，如响应情感、相关性和许多[其他类型的标注者反馈](https://labelstud.io/tags/)。

可以从用户界面添加新的标记配置：前往 `设置 > 标记界面` 并设置一个自定义配置，添加如 `Choices` 的情感标签或 `Rating` 的相关性标签。请记住，任何配置中都应包含 [`TextArea` 标签](https://labelstud.io/tags/textarea) 以显示大型语言模型的响应。

或者，您可以在项目创建之前的初始调用中指定标记配置：


```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

请注意，如果项目不存在，将使用指定的标记配置创建该项目。

## 其他参数

`LabelStudioCallbackHandler` 接受几个可选参数：

- **api_key** - Label Studio API 密钥。覆盖环境变量 `LABEL_STUDIO_API_KEY`。
- **url** - Label Studio URL。覆盖 `LABEL_STUDIO_URL`，默认值为 `http://localhost:8080`。
- **project_id** - 已存在的 Label Studio 项目 ID。覆盖 `LABEL_STUDIO_PROJECT_ID`。在此项目中存储数据。
- **project_name** - 如果未指定项目 ID，则为项目名称。创建一个新项目。默认值为 `"LangChain-%Y-%m-%d"`，格式为当前日期。
- **project_config** - [自定义标记配置](#custom-labeling-configuration)
- **模式**: 使用此快捷方式从头创建目标配置：
- `"提示词"` - 单个提示词，单个响应。默认。
- `"聊天"` - 多轮聊天模式。


