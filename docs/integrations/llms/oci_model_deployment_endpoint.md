---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/llms/oci_model_deployment_endpoint.ipynb
---
# OCI 数据科学模型部署端点

[OCI 数据科学](https://docs.oracle.com/en-us/iaas/data-science/using/home.htm) 是一个完全托管且无服务器的平台，供数据科学团队在 Oracle 云基础设施中构建、训练和管理机器学习模型。

本笔记本介绍了如何使用托管在 [OCI 数据科学模型部署](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-about.htm) 上的 LLM。

为了进行身份验证，使用了 [oracle-ads](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) 自动加载凭据以调用端点。


```python
!pip3 install oracle-ads
```

## 前提条件

### 部署模型
查看 [Oracle GitHub 示例库](https://github.com/oracle-samples/oci-data-science-ai-samples/tree/main/model-deployment/containers/llama2) 了解如何在 OCI 数据科学模型部署上部署您的大型语言模型。

### 策略
确保拥有所需的 [策略](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-policies-auth.htm#model_dep_policies_auth__predict-endpoint) 以访问 OCI 数据科学模型部署端点。

## 设置

### vLLM
在部署模型后，您必须设置 `OCIModelDeploymentVLLM` 调用的以下必需参数：

- **`endpoint`**: 从已部署模型获取的模型 HTTP 端点，例如 `https://<MD_OCID>/predict`。
- **`model`**: 模型的位置。

### 文本生成推理 (TGI)
您必须设置 `OCIModelDeploymentTGI` 调用的以下必需参数：

- **`endpoint`**: 从部署模型获取的模型 HTTP 端点，例如 `https://<MD_OCID>/predict`。

### 认证

您可以通过广告或环境变量设置认证。当您在 OCI 数据科学笔记本会话中工作时，可以利用资源主体访问其他 OCI 资源。请查看 [这里](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html) 以了解更多选项。

## 示例


```python
<!--IMPORTS:[{"imported": "OCIModelDeploymentVLLM", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.oci_data_science_model_deployment_endpoint.OCIModelDeploymentVLLM.html", "title": "OCI Data Science Model Deployment Endpoint"}]-->
import ads
from langchain_community.llms import OCIModelDeploymentVLLM

# Set authentication through ads
# Use resource principal are operating within a
# OCI service that has resource principal based
# authentication configured
ads.set_auth("resource_principal")

# Create an instance of OCI Model Deployment Endpoint
# Replace the endpoint uri and model name with your own
llm = OCIModelDeploymentVLLM(endpoint="https://<MD_OCID>/predict", model="model_name")

# Run the LLM
llm.invoke("Who is the first president of United States?")
```


```python
<!--IMPORTS:[{"imported": "OCIModelDeploymentTGI", "source": "langchain_community.llms", "docs": "https://python.langchain.com/api_reference/community/llms/langchain_community.llms.oci_data_science_model_deployment_endpoint.OCIModelDeploymentTGI.html", "title": "OCI Data Science Model Deployment Endpoint"}]-->
import os

from langchain_community.llms import OCIModelDeploymentTGI

# Set authentication through environment variables
# Use API Key setup when you are working from a local
# workstation or on platform which does not support
# resource principals.
os.environ["OCI_IAM_TYPE"] = "api_key"
os.environ["OCI_CONFIG_PROFILE"] = "default"
os.environ["OCI_CONFIG_LOCATION"] = "~/.oci"

# Set endpoint through environment variables
# Replace the endpoint uri with your own
os.environ["OCI_LLM_ENDPOINT"] = "https://<MD_OCID>/predict"

# Create an instance of OCI Model Deployment Endpoint
llm = OCIModelDeploymentTGI()

# Run the LLM
llm.invoke("Who is the first president of United States?")
```


## 相关

- LLM [概念指南](/docs/concepts/#llms)
- LLM [操作指南](/docs/how_to/#llms)
