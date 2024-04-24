/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/new-york/ui/button";

// @ts-ignore
interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    title: string;
    onClick: () => void; // 使用 onClick 替代 href
  }[];
  onSelect: (title: string) => void; // 新增 onSelect 回调函数
}

export function SidebarNav({ className, items, onSelect, ...props }: SidebarNavProps) {

  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <button
          key={item.title}
          onClick={() => onSelect(item.title)}
          className={cn(
            buttonVariants({variant: "ghost"}),
            "w-full justify-start text-left",
            "align-items-center"
          )}
        >
          {item.title}
        </button>
      ))}
    </nav>
  );
}
