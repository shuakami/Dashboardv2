/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { docsConfig } from "@/config/docs"
import { DocsSidebarNav } from "@/components/sidebar-nav"
import { ScrollArea } from "@/registry/new-york/ui/scroll-area"
import {MainNav} from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <>
      <SiteHeader/>
      <div className="border-b">
        <div
          className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <ScrollArea className="h-full py-6 pr-6 lg:py-8">
              <DocsSidebarNav items={docsConfig.sidebarNav}/>
            </ScrollArea>
          </aside>
          {children}
        </div>
      </div>

    </>
  )
}
