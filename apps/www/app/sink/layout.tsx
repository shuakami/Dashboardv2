/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import Link from "next/link"

import { ThemeWrapper } from "@/components/theme-wrapper"
import { styles } from "@/registry/styles"

interface SinkLayoutProps {
  children: React.ReactNode
}

export default function SinkLayout({ children }: SinkLayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="container">
        <div className="flex space-x-2 px-2 py-4">
          {styles.map((style) => (
            <Link href={`/sink/${style.name}`} key={style.name}>
              {style.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <ThemeWrapper>{children}</ThemeWrapper>
      </div>
    </div>
  )
}
