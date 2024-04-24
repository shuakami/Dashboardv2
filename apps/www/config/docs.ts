/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
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
