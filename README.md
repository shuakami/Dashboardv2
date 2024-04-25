Dashboardv2 是最开始我纯粹拿来练手的控制台项目。目前已经从基本的功能开始，逐步引入更多复杂的功能。该控制台包含了邮件管理、站点监控、用户界面自定义和AI增强功能等多种工具，是一个全面且灵活的管理工具。

---
DEMO：[https://dashboardtk.vercel.app](https://dashboardtk.vercel.app)
令牌AShaDi：test （点不了按钮，但是你可以回车）
动态验证：123456
---
### 主要功能概览

- **自定义控制台样式**
- **主题颜色更换、字体更换、背景更换**
- **背景模糊度透明度自定义**
- **云同步用户样式**

- **登录、登录验证**
- **ai_ip登录判定验证2FA**
- **ip记录、登录策略调整**
- **全线jwt逻辑**
- **axois错误全线捕获**

- **AI监控自站点log**
- **支持用户上传日志错误数据**
- **生日祝福逻辑、UI**
- **封号逻辑、用户封号UI**
- **隐私政策签名性确认[弹窗&版本性确认控制]**

- **支持邮件交流**
- **邮件Markdown**
- **邮件图片上传**
- **邮件归档**

- **全站功能性智能周报**

- **人工智能邮件举报判罚**
- **邮件编辑部分工具栏**
- **邮件已读未读**
- **人工智能邮件翻译[流式]**
- **KAMI智能归档总结发送邮件**
- **静默邮件发送**

- **监控站点**
- **显示站点数据**
- **显示站点浏览统计数据**

## 安装指南

 见 [https://blog.sdjz.wiki/dashboard_install.html](https://blog.sdjz.wiki/dashboard_install.html)

## 文件性概览

比较长，推荐 `Ctrl+鼠标滚轮滑动`放大查看

[![File_architecture.jpg](https://blog.sdjz.wiki/usr/uploads/2024/04/525286883.jpg)](https://blog.sdjz.wiki/usr/uploads/2024/04/525286883.jpg)

## 技术栈

 [`Shadcn/UI`](https://github.com/shadcn/ui)
 [`autoprefixer`](https://github.com/postcss/autoprefixer)
 [`postcss`](https://github.com/postcss/postcss)
 [`@heroicons/react`](https://github.com/tailwindlabs/heroicons)
 [`lucide-react`](https://github.com/lucide-icons/lucide)
 [`framer-motion`](https://github.com/framer/motion)
 [`@ant-design/nextjs-registry`](https://github.com/ant-design/ant-design)
 [`@nextui-org/react`](https://github.com/nextui-org/nextui)
 [`antd`](https://github.com/ant-design/ant-design)
 [`react-confetti`](https://github.com/daniel-lundin/react-confetti)
 [`react-markdown`](https://github.com/remarkjs/react-markdown)
 [`react-chartjs-2`](https://github.com/reactchartjs/react-chartjs-2)
 [`react-player`](https://github.com/CookPete/react-player)
 [`react-spring`](https://github.com/pmndrs/react-spring)
 [`react-transition-group`](https://github.com/reactjs/react-transition-group)
 [`styled-components`](https://github.com/styled-components/styled-components)
 [`tailwindcss`](https://github.com/tailwindlabs/tailwindcss)
 [`tailwindcss-animate`](https://github.com/mahdikhashan/tailwindcss-animate)
 [`tailwind-scrollbar`](https://github.com/akameco/tailwind-scrollbar-hide)
 [`@mdx-js/loader`](https://github.com/mdx-js/mdx)
 [`@mdx-js/react`](https://github.com/mdx-js/mdx)
 [`@mdx-js/runtime`](https://github.com/mdx-js/mdx)
 [`@next/mdx`](https://github.com/vercel/next.js/tree/canary/packages/next-mdx-remote)
 [`next-mdx-remote`](https://github.com/hashicorp/next-mdx-remote)
 [`rehype-raw`](https://github.com/rehypejs/rehype-raw)
 [`axios`](https://github.com/axios/axios)
 [`lodash`](https://github.com/lodash/lodash)
 [`lodash.debounce`](https://github.com/lodash/lodash)
 [`lodash.isequal`](https://github.com/lodash/lodash)
 [`isEqual`](https://github.com/lodash/lodash)
 [`uuid`](https://github.com/uuidjs/uuid)
 [`md5`](https://github.com/pvorb/node-md5)
 [`date-fns`](https://github.com/date-fns/date-fns)
 [`date-fns-tz`](https://github.com/marnusw/date-fns-tz)
 [`nodemailer`](https://github.com/nodemailer/nodemailer)
 [`plyr`](https://github.com/sampotts/plyr)
 [`input-otp`](https://github.com/suryaevan/input-otp)
 [`franc`](https://github.com/wooorm/franc)
 [`whatlang`](https://github.com/greyblake/whatlang-rs)
 [`detect-language`](https://github.com/dachev/node-detect-language)
 [`vitest`](https://github.com/vitest-dev/vitest)
 [`husky`](https://github.com/typicode/husky)
 [`next-i18next`](https://github.com/isaachinman/next-i18next)
 [`d3`](https://github.com/d3/d3)
 [`d3-array`](https://github.com/d3/d3-array)
 [`d3-axis`](https://github.com/d3/d3-axis)
 [`d3-scale`](https://github.com/d3/d3-scale)
 [`d3-selection`](https://github.com/d3/d3-selection)
 [`d3-shape`](https://github.com/d3/d3-shape)
 [`d3-time-format`](https://github.com/d3/d3-time-format)
 [`chart.js`](https://github.com/chartjs/Chart.js)
 [`@nivo/line`](https://github.com/plouc/nivo)
 [`crypto-js`](https://github.com/brix/crypto-js)
 [`jwt-decode`](https://github.com/auth0/jwt-decode)
 [`js-cookie`](https://github.com/js-cookie/js-cookie)
 [`@babel/core`](https://github.com/babel/babel)
 [`@typescript-eslint/parser`](https://github.com/typescript-eslint/typescript-eslint)
 [`eslint`](https://github.com/eslint/eslint)
 [`eslint-config-next`](https://github.com/vercel/next.js/tree/canary/packages/eslint-config-next)
 [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)
 [`eslint-config-turbo`](https://github.com/vercel/turbo)
 [`eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react)
 [`eslint-plugin-tailwindcss`](https://github.com/tailwindlabs/eslint-plugin-tailwindcss)
 [`prettier`](https://github.com/prettier/prettier)
 [`pretty-quick`](https://github.com/azz/pretty-quick)
 [`vite-tsconfig-paths`](https://github.com/aleclarson/vite-tsconfig-paths)
 [`turbo`](https://github.com/vercel/turbo)
 [`typescript`](https://github.com/microsoft/TypeScript)
 [`node-cron`](https://github.com/kelektiv/node-cron)



## 贡献

为Dashboardv2贡献代码和想法非常欢迎。如果您对改进或新增功能有好的想法，可以通过以下步骤参与：

- **Fork项目**：首先[fork仓库](https://github.com/shuakami/Dashboardv2/fork)到您的GitHub账号下。
- **创建新分支**：基于最新的 `main` 分支，创建一个新分支进行您的修改。
- **提交变更**：确保您的代码清晰并遵循现有的代码风格。请确保您的代码通过了所有测试。
- **提交Pull Request**：完成修改后，[提交一个Pull Request](https://github.com/shuakami/Dashboardv2/compare)到主仓库。请在PR中清楚地描述您的变更哦。

## 报告问题

在报告问题时，请提供尽可能详细的信息以帮助我们快速定位并解决问题。这包括但不限于：

- **操作系统和版本**
- **浏览器类型和版本**
- **具体的错误信息和错误代码（如果有）**
- **问题发生的上下文和重现步骤**
- **相关的日志文件或屏幕截图**

根据问题的性质，请选择以下方式进行报告：

- **功能请求和非紧急问题**：请在我们的 [GitHub Issues](https://github.com/shuakami/Dashboardv2/issues) 页面提交详细信息。我们欢迎各种功能建议或改进意见。
- **紧急问题**：对于需要快速响应的紧急问题，特别是那些影响到使用的问题，请直接通过电子邮件 [shuakami@sdjz.wiki](mailto:shuakami@sdjz.wiki) 联系我们。

我们承诺在收到您的问题后，尽快给予响应。响应时间视情况而定：

- **最快响应**：如果我在线且能立即处理，您可以期望在30秒内收到回复。
- **正常响应时间**：在大多数情况下，问题将在6小时内得到响应。

请理解响应时间可能会因为我不在电脑前或正在休息而有所延迟。目前，我们没有提供FAQ或社区支持渠道，因此上述提到的GitHub和直接电子邮件将是解决问题的主要方式。

## 联系方式

- **GitHub**: [shuakami](https://github.com/shuakami)
- **邮箱**: [shuakami@sdjz.wiki](mailto:shuakami@sdjz.wiki)

## 版权与许可证

Dashboardv2 是根据 Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) 许可证发布的。这意味着您可以在遵守许可证条款的前提下，自由地分享、使用和构建基于此项目的工作。

#### 许可证主要条款包括：

- **署名**：您必须给出适当的署名，提供指向许可证的链接，同时指明是否（如果有的话）对原作进行了修改。您必须以合适的方式进行这些操作，但不得以任何方式暗示许可人为您或您的使用背书。
- **非商业性使用**：您不得将本作品用于商业目的。
- **没有附加限制**：您不应使用法律条款或技术措施，使得他人合法基于许可证获得的权利受到限制。

这个许可证是自由的，允许任何人在任何目的下使用、分享或修改作品，只要他们遵守许可证的条款。更多关于CC BY-NC 4.0许可证的信息，您可以访问 [Creative Commons官方网站](https://creativecommons.org/licenses/by-nc/4.0/)。

#### 版权声明

所有的原始代码、文档和相关材料都归 Dashboardv2 的创建者和贡献者所有。版权信息应清晰地标示在项目的所有派生作品中，以确保知识产权的正确归属和保护。

#### 关于使用和分发

我们鼓励开发社区和用户在上述许可证的范围内自由使用和分发Dashboardv2。这包括用于教育、研究和其他非商业用途。对于希望进行商业化利用的实体，我们建议与我们联系以探讨可能的许可安排。

## 致谢

我要感谢所有支持和帮助过Dashboardv2开发的人和技术。我本来应该感谢我自己的，但是真的写不出来(ㅇㅅㅇ❀)。感谢[ChatGPT-4](https://openai.com/products/chat-gpt/)和[Claude-3 Opus](https://www.anthropic.com/index/claude-3-opus)。这些工具在我思考和解决开发过程中遇到的复杂问题时提供了极大的帮助。

此外，我要感谢[Shadcn/UI](https://github.com/shadcn/ui)和[Vercel](https://vercel.com/)。
他们的开源项目和服务启发了我，为我的开发工作提供了实用的工具和解决方案，使我能够更专注于创新而不是基础建设。
虽然目前Dashboardv2没有外部资金支持， **但我仍然希望未来能找到愿意投资于这一创新项目的合作伙伴。** 这不仅能帮助我覆盖服务器成本，还能支持项目的持续发展。

**最后，感谢所有使用和测试Dashboardv2的用户。**

**在这个项目的每一个阶段，每一行代码背后，都是热爱啊。**

**感谢所有看到这里的每一位。**
