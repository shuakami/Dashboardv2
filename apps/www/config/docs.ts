/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { MainNavItem, SidebarNavItem } from "types/nav"

interface DocsConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [

  ],
  sidebarNav: [
    {
      title: "网站重要政策协议",
      items: [
        {
          title: "隐私政策",
          href: "/docs/privacy",
          items: [],
        },
        {
          title: "用户协议",
          href: "/docs/terms",
          items: [],
        },
        {
          title: "社区准则与举报管理细则",
          href: "/docs/report",
          items: [],
        },
      ],
    },
    {
      title: "更新日志",
      items: [
        {
          title: "测试版本",
          href: "/docs/update_beta",
          items: [],
          label: "Res.1.0.2"
        },
      ],
    },
  ],
}
