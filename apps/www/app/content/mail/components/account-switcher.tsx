/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import * as React from "react"
import { fetchAccounts } from '@/app/content/mail/data';

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select"

import { setupAxiosInterceptors } from '@/app/setupAxiosInterceptors';

setupAxiosInterceptors();

interface AccountSwitcherProps {
  isCollapsed: boolean
}

interface Account {
  email: string;
  label: string;
  icon: string | React.ReactNode; // 支持图片链接或 SVG 节点
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true); // 添加加载状态

  React.useEffect(() => {
    async function loadAccounts() {
      try {
        const accountData = await fetchAccounts();
        // @ts-ignore
        setAccounts(accountData);
        if (accountData.length > 0) {
          setSelectedAccount(accountData[0].email);
        }
        setLoading(false); // 加载完成
      } catch (error) {
        console.error("Failed to fetch accounts", error);
        setLoading(false); // 加载完成，即使发生错误
      }
    }

    loadAccounts();
  }, []); // 空数组意味着这个effect只在组件挂载时运行一次

  if (loading) {
    return <div>Loading...</div>; // 或者任何其他加载指示器
  }

  return (
    <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
          "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          {renderAccountIcon(accounts.find((account) => account.email === selectedAccount)?.icon)}
          <span className={cn("ml-2", isCollapsed && "hidden")}>
            {
              accounts.find((account) => account.email === selectedAccount)
                ?.label
            }
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.email} value={account.email}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {renderAccountIcon(account.icon)}
              {account.email}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function renderAccountIcon(icon: string | React.ReactNode) {
  if (typeof icon === 'string') {
    // 判断字符串是否包含 SVG 标签，如果是则认为它是内联 SVG
    if (icon.includes('<svg')) {
      return (
        <div
          className="svg-icon"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    } else if (icon.startsWith('data:image/svg+xml')) {
      // 如果字符串以 "data:image/svg+xml" 开头，也渲染 SVG 图标
      return (
        <svg
          className="h-4 w-4 rounded-full object-cover"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    } else {
      // 否则渲染图片
      return (
        <img
          className="full h-5 w-5 rounded-full object-cover"
          src={icon}
          alt="Account avatar"
          crossOrigin="anonymous" // CORS 跨域
        />
      );
    }
  } else {
    // 如果 icon 不是字符串，则直接渲染
    return icon;
  }
}


