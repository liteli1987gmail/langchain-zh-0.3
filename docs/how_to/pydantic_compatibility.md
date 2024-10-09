# 如何使用 LangChain 与不同的 Pydantic 版本

从 `0.3` 版本开始，LangChain 在内部使用 Pydantic 2。

用户应安装 Pydantic 2，并建议**避免**在 LangChain API 中使用 Pydantic 2 的 `pydantic.v1` 命名空间。
LangChain API。

如果您正在使用早期版本的 LangChain，请参阅以下指南
关于 [Pydantic 兼容性](https://python.langchain.com/v0.2/docs/how_to/pydantic_compatibility)。
