---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/caches/redis_llm_caching.ipynb
---
# LangChain 的 Redis 缓存

本笔记本演示了如何使用 langchain-redis 包中的 `RedisCache` 和 `RedisSemanticCache` 类来实现 LLM 响应的缓存。

## 设置

首先，让我们安装所需的依赖项，并确保我们有一个正在运行的 Redis 实例。


```python
%pip install -U langchain-core langchain-redis langchain-openai redis
```

确保您有一个正在运行的Redis服务器。您可以使用Docker启动一个：

```
docker run -d -p 6379:6379 redis:latest
```

或者根据您的操作系统的说明安装并运行Redis。


```python
import os

# Use the environment variable if set, otherwise default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
print(f"Connecting to Redis at: {REDIS_URL}")
```
```output
Connecting to Redis at: redis://redis:6379
```
## 导入所需的库


```python
<!--IMPORTS:[{"imported": "set_llm_cache", "source": "langchain.globals", "docs": "https://python.langchain.com/api_reference/langchain/globals/langchain.globals.set_llm_cache.html", "title": "Redis Cache for LangChain"}, {"imported": "Generation", "source": "langchain.schema", "docs": "https://python.langchain.com/api_reference/core/outputs/langchain_core.outputs.generation.Generation.html", "title": "Redis Cache for LangChain"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/llms/langchain_openai.llms.base.OpenAI.html", "title": "Redis Cache for LangChain"}, {"imported": "OpenAIEmbeddings", "source": "langchain_openai", "docs": "https://python.langchain.com/api_reference/openai/embeddings/langchain_openai.embeddings.base.OpenAIEmbeddings.html", "title": "Redis Cache for LangChain"}]-->
import time

from langchain.globals import set_llm_cache
from langchain.schema import Generation
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_redis import RedisCache, RedisSemanticCache
```


```python
import langchain_core
import langchain_openai
import openai
import redis
```

### 设置OpenAI API密钥


```python
from getpass import getpass

# Check if OPENAI_API_KEY is already set in the environment
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    print("OpenAI API key not found in environment variables.")
    openai_api_key = getpass("Please enter your OpenAI API key: ")

    # Set the API key for the current session
    os.environ["OPENAI_API_KEY"] = openai_api_key
    print("OpenAI API key has been set for this session.")
else:
    print("OpenAI API key found in environment variables.")
```
```output
OpenAI API key not found in environment variables.
``````output
Please enter your OpenAI API key:  ········
``````output
OpenAI API key has been set for this session.
```
## 使用RedisCache


```python
# Initialize RedisCache
redis_cache = RedisCache(redis_url=REDIS_URL)

# Set the cache for LangChain to use
set_llm_cache(redis_cache)

# Initialize the language model
llm = OpenAI(temperature=0)


# Function to measure execution time
def timed_completion(prompt):
    start_time = time.time()
    result = llm.invoke(prompt)
    end_time = time.time()
    return result, end_time - start_time


# First call (not cached)
prompt = "Explain the concept of caching in three sentences."
result1, time1 = timed_completion(prompt)
print(f"First call (not cached):\nResult: {result1}\nTime: {time1:.2f} seconds\n")

# Second call (should be cached)
result2, time2 = timed_completion(prompt)
print(f"Second call (cached):\nResult: {result2}\nTime: {time2:.2f} seconds\n")

print(f"Speed improvement: {time1 / time2:.2f}x faster")

# Clear the cache
redis_cache.clear()
print("Cache cleared")
```
```output
First call (not cached):
Result: 

Caching is the process of storing frequently accessed data in a temporary storage location for faster retrieval. This helps to reduce the time and resources needed to access the data from its original source. Caching is commonly used in computer systems, web browsers, and databases to improve performance and efficiency.
Time: 1.16 seconds

Second call (cached):
Result: 

Caching is the process of storing frequently accessed data in a temporary storage location for faster retrieval. This helps to reduce the time and resources needed to access the data from its original source. Caching is commonly used in computer systems, web browsers, and databases to improve performance and efficiency.
Time: 0.05 seconds

Speed improvement: 25.40x faster
Cache cleared
```
## 使用RedisSemanticCache


```python
# Initialize RedisSemanticCache
embeddings = OpenAIEmbeddings()
semantic_cache = RedisSemanticCache(
    redis_url=REDIS_URL, embeddings=embeddings, distance_threshold=0.2
)

# Set the cache for LangChain to use
set_llm_cache(semantic_cache)


# Function to test semantic cache
def test_semantic_cache(prompt):
    start_time = time.time()
    result = llm.invoke(prompt)
    end_time = time.time()
    return result, end_time - start_time


# Original query
original_prompt = "What is the capital of France?"
result1, time1 = test_semantic_cache(original_prompt)
print(
    f"Original query:\nPrompt: {original_prompt}\nResult: {result1}\nTime: {time1:.2f} seconds\n"
)

# Semantically similar query
similar_prompt = "Can you tell me the capital city of France?"
result2, time2 = test_semantic_cache(similar_prompt)
print(
    f"Similar query:\nPrompt: {similar_prompt}\nResult: {result2}\nTime: {time2:.2f} seconds\n"
)

print(f"Speed improvement: {time1 / time2:.2f}x faster")

# Clear the semantic cache
semantic_cache.clear()
print("Semantic cache cleared")
```
```output
Original query:
Prompt: What is the capital of France?
Result: 

The capital of France is Paris.
Time: 1.52 seconds

Similar query:
Prompt: Can you tell me the capital city of France?
Result: 

The capital of France is Paris.
Time: 0.29 seconds

Speed improvement: 5.22x faster
Semantic cache cleared
```
## 高级用法

### 自定义TTL（生存时间）


```python
# Initialize RedisCache with custom TTL
ttl_cache = RedisCache(redis_url=REDIS_URL, ttl=5)  # 60 seconds TTL

# Update a cache entry
ttl_cache.update("test_prompt", "test_llm", [Generation(text="Cached response")])

# Retrieve the cached entry
cached_result = ttl_cache.lookup("test_prompt", "test_llm")
print(f"Cached result: {cached_result[0].text if cached_result else 'Not found'}")

# Wait for TTL to expire
print("Waiting for TTL to expire...")
time.sleep(6)

# Try to retrieve the expired entry
expired_result = ttl_cache.lookup("test_prompt", "test_llm")
print(
    f"Result after TTL: {expired_result[0].text if expired_result else 'Not found (expired)'}"
)
```
```output
Cached result: Cached response
Waiting for TTL to expire...
Result after TTL: Not found (expired)
```
### 自定义RedisSemanticCache


```python
# Initialize RedisSemanticCache with custom settings
custom_semantic_cache = RedisSemanticCache(
    redis_url=REDIS_URL,
    embeddings=embeddings,
    distance_threshold=0.1,  # Stricter similarity threshold
    ttl=3600,  # 1 hour TTL
    name="custom_cache",  # Custom cache name
)

# Test the custom semantic cache
set_llm_cache(custom_semantic_cache)

test_prompt = "What's the largest planet in our solar system?"
result, _ = test_semantic_cache(test_prompt)
print(f"Original result: {result}")

# Try a slightly different query
similar_test_prompt = "Which planet is the biggest in the solar system?"
similar_result, _ = test_semantic_cache(similar_test_prompt)
print(f"Similar query result: {similar_result}")

# Clean up
custom_semantic_cache.clear()
```
```output
Original result: 

The largest planet in our solar system is Jupiter.
Similar query result: 

The largest planet in our solar system is Jupiter.
```
## 结论

本笔记演示了如何使用来自langchain-redis包的`RedisCache`和`RedisSemanticCache`。这些缓存机制可以通过减少冗余的API调用和利用语义相似性进行智能缓存，显著提高基于大型语言模型的应用性能。基于Redis的实现为分布式系统中的缓存提供了快速、可扩展和灵活的解决方案。
