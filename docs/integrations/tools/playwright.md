---
custom_edit_url: https://github.com/langchain-ai/langchain/edit/master/docs/docs/integrations/tools/playwright.ipynb
---
# PlayWright 浏览器工具包

>[Playwright](https://github.com/microsoft/playwright) 是由 `Microsoft` 开发的开源自动化工具，允许您以编程方式控制和自动化网页浏览器。它旨在进行端到端测试、抓取和自动化任务，支持多种网页浏览器，如 `Chromium`、`Firefox` 和 `WebKit`。

此工具包用于与浏览器交互。虽然其他工具（如 `Requests` 工具）适用于静态网站，但 `PlayWright 浏览器` 工具包允许您的代理浏览网页并与动态渲染的网站进行交互。

一些包含在 `PlayWright 浏览器` 工具包中的工具包括：

- `NavigateTool` (navigate_browser) - 导航到一个 URL
- `NavigateBackTool` (previous_page) - 等待元素出现
- `ClickTool` (click_element) - 点击一个元素（由选择器指定）
- `ExtractTextTool` (extract_text) - 使用 Beautiful Soup 从当前网页提取文本
- `ExtractHyperlinksTool` (extract_hyperlinks) - 使用 Beautiful Soup 从当前网页提取超链接
- `GetElementsTool` (get_elements) - 通过 CSS 选择器选择元素
- `CurrentPageTool` (current_page) - 获取当前页面的 URL



```python
%pip install --upgrade --quiet  playwright > /dev/null
%pip install --upgrade --quiet  lxml

# If this is your first time using playwright, you'll have to install a browser executable.
# Running `playwright install` by default installs a chromium browser executable.
# playwright install
```
```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m24.0[0m[39;49m -> [0m[32;49m24.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m24.0[0m[39;49m -> [0m[32;49m24.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

```python
<!--IMPORTS:[{"imported": "PlayWrightBrowserToolkit", "source": "langchain_community.agent_toolkits", "docs": "https://python.langchain.com/api_reference/community/agent_toolkits/langchain_community.agent_toolkits.playwright.toolkit.PlayWrightBrowserToolkit.html", "title": "PlayWright Browser Toolkit"}]-->
from langchain_community.agent_toolkits import PlayWrightBrowserToolkit
```

异步函数以创建上下文并启动浏览器：


```python
<!--IMPORTS:[{"imported": "create_async_playwright_browser", "source": "langchain_community.tools.playwright.utils", "docs": "https://python.langchain.com/api_reference/community/tools/langchain_community.tools.playwright.utils.create_async_playwright_browser.html", "title": "PlayWright Browser Toolkit"}]-->
from langchain_community.tools.playwright.utils import (
    create_async_playwright_browser,  # A synchronous browser is available, though it isn't compatible with jupyter.\n",	  },
)
```


```python
# This import is required only for jupyter notebooks, since they have their own eventloop
import nest_asyncio

nest_asyncio.apply()
```

## 实例化浏览器工具包

建议始终使用 `from_browser` 方法进行实例化，以便


```python
async_browser = create_async_playwright_browser()
toolkit = PlayWrightBrowserToolkit.from_browser(async_browser=async_browser)
tools = toolkit.get_tools()
tools
```



```output
[ClickTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 NavigateTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 NavigateBackTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 ExtractTextTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 ExtractHyperlinksTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 GetElementsTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>),
 CurrentWebPageTool(async_browser=<Browser type=<BrowserType name=chromium executable_path=/Users/isaachershenson/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium> version=127.0.6533.17>)]
```



```python
tools_by_name = {tool.name: tool for tool in tools}
navigate_tool = tools_by_name["navigate_browser"]
get_elements_tool = tools_by_name["get_elements"]
```


```python
await navigate_tool.arun(
    {"url": "https://web.archive.org/web/20230428133211/https://cnn.com/world"}
)
```



```output
'Navigating to https://web.archive.org/web/20230428133211/https://cnn.com/world returned status code 200'
```



```python
# The browser is shared across tools, so the agent can interact in a stateful manner
await get_elements_tool.arun(
    {"selector": ".container__headline", "attributes": ["innerText"]}
)
```



```output
'[{"innerText": "These Ukrainian veterinarians are risking their lives to care for dogs and cats in the war zone"}, {"innerText": "Life in the ocean’s ‘twilight zone’ could disappear due to the climate crisis"}, {"innerText": "Clashes renew in West Darfur as food and water shortages worsen in Sudan violence"}, {"innerText": "Thai policeman’s wife investigated over alleged murder and a dozen other poison cases"}, {"innerText": "American teacher escaped Sudan on French evacuation plane, with no help offered back home"}, {"innerText": "Dubai’s emerging hip-hop scene is finding its voice"}, {"innerText": "How an underwater film inspired a marine protected area off Kenya’s coast"}, {"innerText": "The Iranian drones deployed by Russia in Ukraine are powered by stolen Western technology, research reveals"}, {"innerText": "India says border violations erode ‘entire basis’ of ties with China"}, {"innerText": "Australian police sift through 3,000 tons of trash for missing woman’s remains"}, {"innerText": "As US and Philippine defense ties grow, China warns over Taiwan tensions"}, {"innerText": "Don McLean offers duet with South Korean president who sang ‘American Pie’ to Biden"}, {"innerText": "Almost two-thirds of elephant habitat lost across Asia, study finds"}, {"innerText": "‘We don’t sleep … I would call it fainting’: Working as a doctor in Sudan’s crisis"}, {"innerText": "Kenya arrests second pastor to face criminal charges ‘related to mass killing of his followers’"}, {"innerText": "Russia launches deadly wave of strikes across Ukraine"}, {"innerText": "Woman forced to leave her forever home or ‘walk to your death’ she says"}, {"innerText": "U.S. House Speaker Kevin McCarthy weighs in on Disney-DeSantis feud"}, {"innerText": "Two sides agree to extend Sudan ceasefire"}, {"innerText": "Spanish Leopard 2 tanks are on their way to Ukraine, defense minister confirms"}, {"innerText": "Flambéed pizza thought to have sparked deadly Madrid restaurant fire"}, {"innerText": "Another bomb found in Belgorod just days after Russia accidentally struck the city"}, {"innerText": "A Black teen’s murder sparked a crisis over racism in British policing. Thirty years on, little has changed"}, {"innerText": "Belgium destroys shipment of American beer after taking issue with ‘Champagne of Beer’ slogan"}, {"innerText": "UK Prime Minister Rishi Sunak rocked by resignation of top ally Raab over bullying allegations"}, {"innerText": "Iran’s Navy seizes Marshall Islands-flagged ship"}, {"innerText": "A divided Israel stands at a perilous crossroads on its 75th birthday"}, {"innerText": "Palestinian reporter breaks barriers by reporting in Hebrew on Israeli TV"}, {"innerText": "One-fifth of water pollution comes from textile dyes. But a shellfish-inspired solution could clean it up"}, {"innerText": "‘People sacrificed their lives for just\xa010 dollars’: At least 78 killed in Yemen crowd surge"}, {"innerText": "Israeli police say two men shot near Jewish tomb in Jerusalem in suspected ‘terror attack’"}, {"innerText": "King Charles III’s coronation: Who’s performing at the ceremony"}, {"innerText": "The week in 33 photos"}, {"innerText": "Hong Kong’s endangered turtles"}, {"innerText": "In pictures: Britain’s Queen Camilla"}, {"innerText": "Catastrophic drought that’s pushed millions into crisis made 100 times more likely by climate change, analysis finds"}, {"innerText": "For years, a UK mining giant was untouchable in Zambia for pollution until a former miner’s son took them on"}, {"innerText": "Former Sudanese minister Ahmed Haroun wanted on war crimes charges freed from Khartoum prison"}, {"innerText": "WHO warns of ‘biological risk’ after Sudan fighters seize lab, as violence mars US-brokered ceasefire"}, {"innerText": "How Colombia’s Petro, a former leftwing guerrilla, found his opening in Washington"}, {"innerText": "Bolsonaro accidentally created Facebook post questioning Brazil election results, say his attorneys"}, {"innerText": "Crowd kills over a dozen suspected gang members in Haiti"}, {"innerText": "Thousands of tequila bottles containing liquid meth seized"}, {"innerText": "Why send a US stealth submarine to South Korea – and tell the world about it?"}, {"innerText": "Fukushima’s fishing industry survived a nuclear disaster. 12 years on, it fears Tokyo’s next move may finish it off"}, {"innerText": "Singapore executes man for trafficking two pounds of cannabis"}, {"innerText": "Conservative Thai party looks to woo voters with promise to legalize sex toys"}, {"innerText": "Inside the Italian village being repopulated by Americans"}, {"innerText": "Strikes, soaring airfares and yo-yoing hotel fees: A traveler’s guide to the coronation"}, {"innerText": "A year in Azerbaijan: From spring’s Grand Prix to winter ski adventures"}, {"innerText": "The bicycle mayor peddling a two-wheeled revolution in Cape Town"}, {"innerText": "Tokyo ramen shop bans customers from using their phones while eating"}, {"innerText": "South African opera star will perform at coronation of King Charles III"}, {"innerText": "Luxury loot under the hammer: France auctions goods seized from drug dealers"}, {"innerText": "Judy Blume’s books were formative for generations of readers. Here’s why they endure"}, {"innerText": "Craft, salvage and sustainability take center stage at Milan Design Week"}, {"innerText": "Life-sized chocolate King Charles III sculpture unveiled to celebrate coronation"}, {"innerText": "Severe storms to strike the South again as millions in Texas could see damaging winds and hail"}, {"innerText": "The South is in the crosshairs of severe weather again, as the multi-day threat of large hail and tornadoes continues"}, {"innerText": "Spring snowmelt has cities along the Mississippi bracing for flooding in homes and businesses"}, {"innerText": "Know the difference between a tornado watch, a tornado warning and a tornado emergency"}, {"innerText": "Reporter spotted familiar face covering Sudan evacuation. See what happened next"}, {"innerText": "This country will soon become the world’s most populated"}, {"innerText": "April 27, 2023 - Russia-Ukraine news"}, {"innerText": "‘Often they shoot at each other’: Ukrainian drone operator details chaos in Russian ranks"}, {"innerText": "Hear from family members of Americans stuck in Sudan frustrated with US response"}, {"innerText": "U.S. talk show host Jerry Springer dies at 79"}, {"innerText": "Bureaucracy stalling at least one family’s evacuation from Sudan"}, {"innerText": "Girl to get life-saving treatment for rare immune disease"}, {"innerText": "Haiti’s crime rate more than doubles in a year"}, {"innerText": "Ocean census aims to discover 100,000 previously unknown marine species"}, {"innerText": "Wall Street Journal editor discusses reporter’s arrest in Moscow"}, {"innerText": "Can Tunisia’s democracy be saved?"}, {"innerText": "Yasmeen Lari, ‘starchitect’ turned social engineer, wins one of architecture’s most coveted prizes"}, {"innerText": "A massive, newly restored Frank Lloyd Wright mansion is up for sale"}, {"innerText": "Are these the most sustainable architectural projects in the world?"}, {"innerText": "Step inside a $72 million London townhouse in a converted army barracks"}, {"innerText": "A 3D-printing company is preparing to build on the lunar surface. But first, a moonshot at home"}, {"innerText": "Simona Halep says ‘the stress is huge’ as she battles to return to tennis following positive drug test"}, {"innerText": "Barcelona reaches third straight Women’s Champions League final with draw against Chelsea"}, {"innerText": "Wrexham: An intoxicating tale of Hollywood glamor and sporting romance"}, {"innerText": "Shohei Ohtani comes within inches of making yet more MLB history in Angels win"}, {"innerText": "This CNN Hero is recruiting recreational divers to help rebuild reefs in Florida one coral at a time"}, {"innerText": "This CNN Hero offers judgment-free veterinary care for the pets of those experiencing homelessness"}, {"innerText": "Don’t give up on milestones: A CNN Hero’s message for Autism Awareness Month"}, {"innerText": "CNN Hero of the Year Nelly Cheboi returned to Kenya with plans to lift more students out of poverty"}]'
```



```python
# If the agent wants to remember the current webpage, it can use the `current_webpage` tool
await tools_by_name["current_webpage"].arun({})
```



```output
'https://web.archive.org/web/20230428133211/https://cnn.com/world'
```


## 在代理中使用

多个浏览器工具是 `StructuredTool`，这意味着它们期望多个参数。这些与早于 `STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION` 的代理不兼容（开箱即用）


```python
<!--IMPORTS:[{"imported": "AgentType", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.agent_types.AgentType.html", "title": "PlayWright Browser Toolkit"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://python.langchain.com/api_reference/langchain/agents/langchain.agents.initialize.initialize_agent.html", "title": "PlayWright Browser Toolkit"}, {"imported": "ChatAnthropic", "source": "langchain_anthropic", "docs": "https://python.langchain.com/api_reference/anthropic/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html", "title": "PlayWright Browser Toolkit"}]-->
from langchain.agents import AgentType, initialize_agent
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(
    model_name="claude-3-haiku-20240307", temperature=0
)  # or any other LLM, e.g., ChatOpenAI(), OpenAI()

agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)
```
```output
/Users/isaachershenson/.pyenv/versions/3.11.9/lib/python3.11/site-packages/langchain_core/_api/deprecation.py:139: LangChainDeprecationWarning: The function `initialize_agent` was deprecated in LangChain 0.1.0 and will be removed in 0.3.0. Use Use new agent constructor methods like create_react_agent, create_json_agent, create_structured_chat_agent, etc. instead.
  warn_deprecated(
```

```python
result = await agent_chain.arun("What are the headers on langchain.com?")
print(result)
```
```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mThought: To find the headers on langchain.com, I will navigate to the website and extract the text.

Action:
\`\`\`
{
  "action": "navigate_browser",
  "action_input": "https://langchain.com"
}
\`\`\`

[0m
Observation: [33;1m[1;3mNavigating to https://langchain.com returned status code 200[0m
Thought:[32;1m[1;3mOkay, let's find the headers on the langchain.com website.

Action:
\`\`\`
{
  "action": "extract_text",
  "action_input": {}
}
\`\`\`

[0m
Observation: [31;1m[1;3mLangChain We value your privacy We use cookies to analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Privacy Policy Customize Reject All Accept All Customize Consent Preferences We may use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below. The cookies that are categorized as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site.... Show more Necessary Always Active Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data. Functional Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features. Analytics Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc. Performance Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors. Advertisement Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns. Uncategorized Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet. Reject All Save My Preferences Accept All Products LangChain LangSmith LangGraph Methods Retrieval Agents Evaluation Resources Blog Case Studies Use Case Inspiration Experts Changelog Docs LangChain Docs LangSmith Docs Company About Careers Pricing Get a demo Sign up LangChain’s suite of products supports developers along each step of the LLM application lifecycle. Applications that can reason. Powered by LangChain. Get a demo Sign up for free From startups to global enterprises, ambitious builders choose LangChain products. Build LangChain is a framework to build with LLMs by chaining interoperable components. LangGraph is the framework for building controllable agentic workflows. Run Deploy your LLM applications at scale with LangGraph Cloud, our infrastructure purpose-built for agents. Manage Debug, collaborate, test, and monitor your LLM app in LangSmith - whether it's built with a LangChain framework or not. Build your app with LangChain Build context-aware, reasoning applications with LangChain’s flexible framework that leverages your company’s data and APIs. Future-proof your application by making vendor optionality part of your LLM infrastructure design. Learn more about LangChain Run at scale with LangGraph Cloud Deploy your LangGraph app with LangGraph Cloud for fault-tolerant scalability - including support for async background jobs, built-in persistence, and distributed task queues. Learn more about LangGraph Manage LLM performance with LangSmith Ship faster with LangSmith’s debug, test, deploy, and monitoring workflows. Don’t rely on “vibes” – add engineering rigor to your LLM-development workflow, whether you’re building with LangChain or not. Learn more about LangSmith Hear from our happy customers LangChain, LangGraph, and LangSmith help teams of all sizes, across all industries - from ambitious startups to established enterprises. “LangSmith helped us improve the accuracy and performance of Retool’s fine-tuned models. Not only did we deliver a better product by iterating with LangSmith, but we’re shipping new AI features to our users in a fraction of the time it would have taken without it.” Jamie Cuffe Head of Self-Serve and New Products “By combining the benefits of LangSmith and standing on the shoulders of a gigantic open-source community, we’re able to identify the right approaches of using LLMs in an enterprise-setting faster.” Yusuke Kaji General Manager of AI “Working with LangChain and LangSmith on the Elastic AI Assistant had a significant positive impact on the overall pace and quality of the development and shipping experience. We couldn’t have achieved  the product experience delivered to our customers without LangChain, and we couldn’t have done it at the same pace without LangSmith.” James Spiteri Director of Security Products “As soon as we heard about LangSmith, we moved our entire development stack onto it. We could have built evaluation, testing and monitoring tools in house, but with LangSmith it took us 10x less time to get a 1000x better tool.” Jose Peña Senior Manager The reference architecture enterprises adopt for success. LangChain’s suite of products can be used independently or stacked together for multiplicative impact – guiding you through building, running, and managing your LLM apps. 15M+ Monthly Downloads 100K+ Apps Powered 75K+ GitHub Stars 3K+ Contributors The biggest developer community in GenAI Learn alongside the 1M+ developers who are pushing the industry forward. Explore LangChain Get started with the LangSmith platform today Get a demo Sign up for free Teams building with LangChain are driving operational efficiency, increasing discovery & personalization, and delivering premium products that generate revenue. Discover Use Cases Get inspired by companies who have done it. Financial Services FinTech Technology LangSmith is the enterprise DevOps platform built for LLMs. Explore LangSmith Gain visibility to make trade offs between cost, latency, and quality. Increase developer productivity. Eliminate manual, error-prone testing. Reduce hallucinations and improve reliability. Enterprise deployment options to keep data secure. Ready to start shipping  reliable GenAI apps faster? Get started with LangChain, LangGraph, and LangSmith to enhance your LLM app development, from prototype to production. Get a demo Sign up for free Products LangChain LangSmith LangGraph Agents Evaluation Retrieval Resources Python Docs JS/TS Docs GitHub Integrations Templates Changelog LangSmith Trust Portal Company About Blog Twitter LinkedIn YouTube Community Marketing Assets Sign up for our newsletter to stay up to date Thank you! Your submission has been received! Oops! Something went wrong while submitting the form. All systems operational Privacy Policy Terms of Service[0m
Thought:[32;1m[1;3mBased on the text extracted from the langchain.com website, the main headers I can see are:

- LangChain
- Products
  - LangChain
  - LangSmith 
  - LangGraph
- Methods
  - Retrieval
  - Agents
  - Evaluation
- Resources
  - Blog
  - Case Studies
  - Use Case Inspiration
  - Experts
  - Changelog
- Docs
  - LangChain Docs
  - LangSmith Docs
- Company
  - About
  - Careers
  - Pricing
- Get a demo
- Sign up

The website appears to be organized around their main product offerings (LangChain, LangSmith, LangGraph) as well as resources and documentation.

Action:
\`\`\`
{
  "action": "Final Answer",
  "action_input": "The main headers on the langchain.com website are:\n\n- LangChain\n- Products\n  - LangChain\n  - LangSmith\n  - LangGraph\n- Methods\n  - Retrieval\n  - Agents\n  - Evaluation\n- Resources\n  - Blog\n  - Case Studies\n  - Use Case Inspiration\n  - Experts\n  - Changelog\n- Docs\n  - LangChain Docs\n  - LangSmith Docs\n- Company\n  - About\n  - Careers\n  - Pricing\n- Get a demo\n- Sign up"
}
\`\`\`[0m

[1m> Finished chain.[0m
The main headers on the langchain.com website are:

- LangChain
- Products
  - LangChain
  - LangSmith
  - LangGraph
- Methods
  - Retrieval
  - Agents
  - Evaluation
- Resources
  - Blog
  - Case Studies
  - Use Case Inspiration
  - Experts
  - Changelog
- Docs
  - LangChain Docs
  - LangSmith Docs
- Company
  - About
  - Careers
  - Pricing
- Get a demo
- Sign up
```

## 相关

- 工具 [概念指南](/docs/concepts/#tools)
- 工具 [使用指南](/docs/how_to/#tools)
