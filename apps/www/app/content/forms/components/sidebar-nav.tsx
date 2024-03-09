/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
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
