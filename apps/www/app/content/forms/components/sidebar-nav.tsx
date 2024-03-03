/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { AlignLeft } from "lucide-react";
import {Button} from "@/registry/new-york/ui/button";

// @ts-ignore
interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    title: string;
    onClick: () => void;
  }[];
  onSelect: (title: string) => void;
}

export function SidebarNav({ className, items, onSelect, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <AlignLeft className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-gray-200 " size={30} /> {/* Adjusted styling for direct icon trigger */}
        </DropdownMenuTrigger>
        <DropdownMenuContent  side="left" align="start" className="w-44">
        {items.map((item, index) => (
            <DropdownMenuGroup key={index}>
              <DropdownMenuItem onSelect={() => onSelect(item.title)}>
                {item.title}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
