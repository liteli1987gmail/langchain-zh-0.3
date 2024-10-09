---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/ipex_llm.ipynb
---
# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm) 是一个用于在 Intel CPU 和 GPU（例如，带有 iGPU 的本地 PC、离散 GPU，如 Arc、Flex 和 Max）上运行大型语言模型的 PyTorch 库，具有非常低的延迟。

- [在 Intel GPU 上使用 IPEX-LLM](#ipex-llm-on-intel-gpu)
- [在 Intel CPU 上使用 IPEX-LLM](#ipex-llm-on-intel-cpu)

## 在 Intel GPU 上使用 IPEX-LLM

本示例介绍如何使用 LangChain 与 `ipex-llm` 进行文本生成，适用于 Intel GPU。

> **注意**
>
> 建议仅 Windows 用户使用 Intel Arc A 系列 GPU（不包括 Intel Arc A300 系列或 Pro A60）直接运行 Jupyter notebook 以获取“在 Intel GPU 上使用 IPEX-LLM”部分的最佳体验。对于其他情况（例如 Linux 用户、Intel iGPU 等），建议在终端中使用 Python 脚本运行代码以获得最佳体验。

### 安装先决条件
要在英特尔GPU上使用IPEX-LLM，您需要进行几个工具安装和环境准备的先决步骤。

如果您是Windows用户，请访问[在Windows上安装带英特尔GPU的IPEX-LLM指南](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_windows_gpu.md)，并按照[安装先决条件](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_windows_gpu.md#install-prerequisites)更新GPU驱动程序（可选）并安装Conda。

如果您是Linux用户，请访问[在Linux上安装带英特尔GPU的IPEX-LLM](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_linux_gpu.md)，并按照[**安装先决条件**](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Quickstart/install_linux_gpu.md#install-prerequisites)安装GPU驱动程序、英特尔® oneAPI基础工具包2024.0和Conda。

### 设置

在安装先决条件后，您应该已经创建了一个包含所有先决条件的conda环境。**在此conda环境中启动jupyter服务**：


```python
%pip install -qU langchain langchain-community
```

安装IEPX-LLM以在Intel GPU上本地运行大型语言模型。


```python
%pip install --pre --upgrade ipex-llm[xpu] --extra-index-url https://pytorch-extension.intel.com/release-whl/stable/xpu/us/
```

> **注意**
>
> 您还可以使用 `https://pytorch-extension.intel.com/release-whl/stable/xpu/cn/` 作为额外的indel-url。

### 运行时配置

为了获得最佳性能，建议根据您的设备设置几个环境变量：

#### 对于使用Intel Core Ultra集成GPU的Windows用户


```python
import os

os.environ["SYCL_CACHE_PERSISTENT"] = "1"
os.environ["BIGDL_LLM_XMX_DISABLED"] = "1"
```

#### 对于使用Intel Arc A系列GPU的Windows用户


```python
import os

os.environ["SYCL_CACHE_PERSISTENT"] = "1"
```

> **注意**
>
> 第一次在 Intel iGPU/Intel Arc A300 系列或 Pro A60 上运行每个模型时，可能需要几分钟来编译。
>
> 对于其他 GPU 类型，请参考 [这里](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Overview/install_gpu.md#runtime-configuration) 的 Windows 用户说明，以及 [这里](https://github.com/intel-analytics/ipex-llm/blob/main/docs/mddocs/Overview/install_gpu.md#runtime-configuration-1) 的 Linux 用户说明。


### 基本用法



```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "IPEX-LLM"}, {"imported": "IpexLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ipex_llm.IpexLLM.html", "title": "IPEX-LLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "IPEX-LLM"}]-->
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

为您的模型指定提示词模板。在这个例子中，我们使用 [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5) 模型。如果您使用的是不同的模型，请相应选择合适的模板。


```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

使用 `IpexLLM.from_model_id` 在本地加载模型。它将直接以 Huggingface 格式加载模型，并自动转换为低位格式以进行推理。在初始化 IpexLLM 时，将 `device` 设置为 "xpu" 以将 LLM 模型加载到 Intel GPU。


```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={
        "temperature": 0,
        "max_length": 64,
        "trust_remote_code": True,
        "device": "xpu",
    },
)
```

在链中使用它


```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

### 保存/加载低位模型
另外，您可以将低位模型保存到磁盘一次，然后使用 `from_model_id_low_bit` 而不是 `from_model_id` 来重新加载以供后续使用 - 即使在不同的机器之间也是如此。它是节省空间的，因为低位模型所需的磁盘空间显著少于原始模型。而且在速度和内存使用方面，`from_model_id_low_bit` 也比 `from_model_id` 更高效，因为它跳过了模型转换步骤。您可以同样在 `model_kwargs` 中将 `device` 设置为 "xpu" 以将 LLM 模型加载到 Intel GPU。

要保存低位模型，请使用 `save_low_bit`，如下所示。


```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

从保存的低位模型路径加载模型，如下所示。
> 请注意，低位模型的保存路径仅包括模型本身，而不包括分词器。如果您希望将所有内容放在一个地方，您需要手动从原始模型的目录下载或复制分词器文件到低位模型保存的位置。


```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={
        "temperature": 0,
        "max_length": 64,
        "trust_remote_code": True,
        "device": "xpu",
    },
)
```

在链中使用加载的模型：


```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```

## Intel CPU上的IPEX-LLM

本示例介绍如何使用LangChain与`ipex-llm`进行文本生成，适用于Intel CPU。

### 设置


```python
# Update Langchain

%pip install -qU langchain langchain-community
```

安装IEPX-LLM以在Intel CPU上本地运行LLM：

#### 对于Windows用户：


```python
%pip install --pre --upgrade ipex-llm[all]
```

#### 对于Linux用户：


```python
%pip install --pre --upgrade ipex-llm[all] --extra-index-url https://download.pytorch.org/whl/cpu
```

### 基本用法


```python
<!--IMPORTS:[{"imported": "LLMChain", "source": "langchain.chains", "docs": "https://python.langchain.com/api_reference/langchain/chains/langchain.chains.llm.LLMChain.html", "title": "IPEX-LLM"}, {"imported": "IpexLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.ipex_llm.IpexLLM.html", "title": "IPEX-LLM"}, {"imported": "PromptTemplate", "source": "langchain_core.prompts", "docs": "https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.prompt.PromptTemplate.html", "title": "IPEX-LLM"}]-->
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

为您的模型指定提示词模板。在此示例中，我们使用 [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5) 模型。如果您使用的是不同的模型，请相应选择合适的模板。


```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

使用 IpexLLM 通过 `IpexLLM.from_model_id` 在本地加载模型。它将直接以 Huggingface 格式加载模型，并自动转换为低位格式以进行推理。


```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

在链中使用它：


```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

### 保存/加载低位模型

或者，您可以将低位模型保存到磁盘一次，然后使用 `from_model_id_low_bit` 而不是 `from_model_id` 来重新加载以备后用 - 即使在不同的机器上也是如此。它节省空间，因为低位模型所需的磁盘空间显著少于原始模型。而且在速度和内存使用方面，`from_model_id_low_bit` 也比 `from_model_id` 更高效，因为它跳过了模型转换步骤。

要保存低位模型，请使用 `save_low_bit`，如下所示：


```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

从保存的低位模型路径加载模型，如下所示。

> 请注意，低位模型的保存路径仅包括模型本身，而不包括分词器。如果您希望将所有内容放在一个地方，您需要手动从原始模型的目录下载或复制分词器文件到低位模型保存的位置。


```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

在链中使用加载的模型：


```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```


## 相关

- 大型语言模型 [概念指南](/docs/concepts/#llms)
- 大型语言模型 [使用指南](/docs/how_to/#llms)
