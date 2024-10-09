/* eslint-disable global-require,import/no-extraneous-dependencies */

// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
// eslint-disable-next-line import/no-extraneous-dependencies
const { ProvidePlugin } = require("webpack");
// require("dotenv").config();

const prism = require("prism-react-renderer");

const baseLightCodeBlockTheme = prism.themes.vsLight;
const baseDarkCodeBlockTheme = prism.themes.vsDark;

const baseUrl = "/";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "LangChain中文网",
  tagline: "LangChain中文网 Python Docs",
  favicon: "img/brand/favicon.png",
  // Set the production url of your site here
  url: "https://langchain.com.cn",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: baseUrl,
  trailingSlash: true,
  onBrokenMarkdownLinks: "warn",
  onBrokenLinks: 'warn',
  themes: ["@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  plugins: [
    () => ({
      name: "custom-webpack-config",
      configureWebpack: () => ({
        plugins: [
          new ProvidePlugin({
            process: require.resolve("process/browser"),
          }),
        ],
        resolve: {
          fallback: {
            path: false,
            url: false,
          },
        },
        module: {
          rules: [
            {
              test: /\.m?js/,
              resolve: {
                fullySpecified: false,
              },
            },
            {
              test: /\.py$/,
              loader: "raw-loader",
              resolve: {
                fullySpecified: false,
              },
            },
            {
              test: /\.ya?ml$/,
              use: 'yaml-loader'
            },
            {
              test: /\.ipynb$/,
              loader: "raw-loader",
              resolve: {
                fullySpecified: false,
              },
            },
          ],
        },
      }),
    }),
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          editUrl: "https://github.com/langchain-ai/langchain/edit/master/docs/",
          // path: 'docs', // 确保这指向正确的文档目录
          // routeBasePath: '/', // 这将使文档成为网站的根
          sidebarPath: require.resolve("./sidebars.js"),
          remarkPlugins: [
            [require("@docusaurus/remark-plugin-npm2yarn"), { sync: true }],
          ],
          async sidebarItemsGenerator({
            defaultSidebarItemsGenerator,
            ...args
          }) {
            const sidebarItems = await defaultSidebarItemsGenerator(args);
            sidebarItems.forEach((subItem) => {
              // This allows breaking long sidebar labels into multiple lines
              // by inserting a zero-width space after each slash.
              if (
                "label" in subItem &&
                subItem.label &&
                subItem.label.includes("/")
              ) {
                // eslint-disable-next-line no-param-reassign
                subItem.label = subItem.label.replace(/\//g, "/\u200B");
              }
              if (args.item.className) {
                subItem.className = args.item.className;
              }
            });
            return sidebarItems;
          },
        },
        pages: {
          remarkPlugins: [require("@docusaurus/remark-plugin-npm2yarn")],
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      metadata: [
        {name: 'baidu-site-verification', content: 'codeva-vVWLPfYJJm'},
      ],
      headTags: [
        {
          tagName: 'script',
          attributes: {
            async: true,
            src: 'https://hm.baidu.com/hm.js?e60fb290e204e04c5cb6f79b0ac1e697',
          },
        },
        {
          tagName: 'script',
          innerHTML: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?e60fb290e204e04c5cb6f79b0ac1e697";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
          `,
        },
      ],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      colorMode: {
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      prism: {
        theme: {
          ...baseLightCodeBlockTheme,
          plain: {
            ...baseLightCodeBlockTheme.plain,
            backgroundColor: "#F5F5F5",
          },
        },
        darkTheme: {
          ...baseDarkCodeBlockTheme,
          plain: {
            ...baseDarkCodeBlockTheme.plain,
            backgroundColor: "#222222",
          },
        },
      },
      image: "img/brand/theme-image.png",
      navbar: {
        logo: {src: "img/brand/wordmark.png", srcDark: "img/brand/wordmark-dark.png"},
        items: [
          {
            type: "docSidebar",
            position: "left",
            sidebarId: "integrations",
            label: "与大模型供应商的集成",
          },
          {
            label: "API 接口文档",
            to: "https://python.langchain.com/api_reference/",
          },
          {
            type: "dropdown",
            label: "More",
            position: "left",
            items: [
              {
                type: "doc",
                docId: "contributing/index",
                label: "Contributing",
              },
              {
                type: 'html',
                value: '<hr class="dropdown-separator" style="margin-top: 0.5rem; margin-bottom: 0.5rem">',
              },
              {
                href: "https://docs.smith.langchain.com",
                label: "LangSmith",
              },
              {
                href: "https://langchain-ai.github.io/langgraph/",
                label: "LangGraph",
              },
              {
                href: "https://smith.langchain.com/hub",
                label: "LangChain Hub",
              },
              {
                href: "https://js.langchain.com",
                label: "LangChain JS/TS",
              },
            ]
          },
          {
            type: "dropdown",
            label: "v0.3",
            position: "right",
            items: [
              {
                label: "v0.3",
                href: "/docs/introduction"
              },
              {
                label: "v0.2",
                href: "https://python.langchain.com/v0.2/docs/introduction"
              },
              {
                label: "v0.1",
                href: "https://python.langchain.com/v0.1/docs/get_started/introduction"
              }
            ]
          },
          {
            to: "https://chat.langchain.com",
            label: "💬",
            position: "right",
          },
          // Please keep GitHub link to the right for consistency.
          {
            href: "https://github.com/langchain-ai/langchain",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        style: "light",
        links: [
          {
            title: "中文社区",
            items: [
              {
                label: "学习社群",
                href: "https://www.aiqbh.com/qun.png",
              },
              {
                label: "GitHub",
                href: "https://github.com/liteli1987gmail/langchainzh",
              },
            ],
          },
          {
            title: "资源",
            items: [
              {
                label: "LangChain英文站",
                href: "https://www.Langchain.com",
              },
              {
                label: "Langchain JS/TS 文档",
                href: "https://js.langchain.com.cn/docs/",
              },
              {
                label: "大模型API聚合",
                href: "https://DMXAPI.com",
              },
            ],
          },
          {
            title: "文档",
            items: [
              {
                label: "OpenAI 文档",
                href: "https://www.openaidoc.com.cn",
              },
              {
                label: "Milvus 文档",
                href: "https://www.milvus-io.com",
              },
              {
                label: "Pinecone 文档",
                href: "https://www.pinecone-io.com/",
              },
              {
                label: "LLM/GPT应用外包开发",
                href: "https://www.r-p-a.com/llm-gpt-kaifa/",
              },
            ],
          },
        ],
        copyright: `
          <div>
            <p> ${new Date().getFullYear()} © <a href="https://www.langchain.com.cn/" target="_blank">Langchain中文网</a>. 跟着langchain学AI应用开发</p>
            <p>
              <a href="https://beian.miit.gov.cn/">
                <img style="display: inline-block; height: 19px;" src="https://mbdp01.bdstatic.com/static/landing-pc/img/icon_police.7296bdfd.png" alt="" />
                沪ICP备2023014280号-3
              </a>
            </p>
          </div>
        `,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: "VAU016LAWS",

        // Public API key: it is safe to commit it
        // this is linked to erick@langchain.dev currently
        apiKey: "6c01842d6a88772ed2236b9c85806441",

        indexName: "python-langchain-latest",

        contextualSearch: false,
      },
    }),

  scripts: [
    {
      src: "https://hm.baidu.com/hm.js?e60fb290e204e04c5cb6f79b0ac1e697",
      async: true,
    },
    {
      src: "js/baidu-analytics.js",
      async: true,
    },
  ],

  customFields: {
    supabasePublicKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
};

module.exports = config;
