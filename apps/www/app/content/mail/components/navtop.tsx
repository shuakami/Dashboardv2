/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/new-york/ui/menubar"
import {Badge} from "@/registry/new-york/ui/badge";
import {useEffect, useState} from "react";
import {AccountSwitcher} from "@/app/content/mail/components/account-switcher";
import * as React from "react";
import {cn} from "@/lib/utils";

// @ts-ignore
export function Navtop({ unreadMailsCount, setSelectedLink, setShowSettings }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <Menubar className="rounded-none border-t-0 shadow-none">
      <div className="flex h-[52px] items-center justify-center">
        <AccountSwitcher/>
      </div>
        <MenubarMenu>
          <MenubarTrigger>消息</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => {
              setSelectedLink('消息');
              setShowSettings(false);
              document.dispatchEvent(new CustomEvent('showAllMails'));
            }}>
              📥 所有消息 {unreadMailsCount > 0 && `(${unreadMailsCount})`}
            </MenubarItem>
            <MenubarItem>
              📣 公告通知 <MenubarShortcut>⌘A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              📅 日程提醒 <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator/>
            <MenubarItem>
              🗑️ 回收站
            </MenubarItem>
            <MenubarItem onClick={() => {
              setSelectedLink('归档');
              document.dispatchEvent(new CustomEvent('archiveClicked'));
            }}>
              🗄️ 归档
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>运维</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              📈 实时监控 <MenubarShortcut>⌘M</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              🔧 配置管理 <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              📊 性能优化 <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>工具</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              🆕 更新通知
              <Badge variant="outline" className="ml-2">342</Badge>
            </MenubarItem>
            <MenubarItem>
              📊 数据分析
              <Badge variant="outline" className="ml-2">8</Badge>
            </MenubarItem>
            <MenubarSeparator/>
            <MenubarSub>
              <MenubarSubTrigger>👨‍💻 开发者工具</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>
                  🐙 Github 消息 <Badge variant="outline" className="ml-2">128</Badge>
                </MenubarItem>
                <MenubarItem>🖥️ 控制台</MenubarItem>
                <MenubarItem>🐞 Bug 追踪</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator/>
            <MenubarItem>
              🛡️ 安全中心
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>设置</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>🎨 主题</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => changeTheme('light')}>
                  🌞 明亮模式
                </MenubarItem>
                <MenubarItem onClick={() => changeTheme('dark')}>
                  🌙 暗黑模式
                </MenubarItem>
                <MenubarItem onClick={() => changeTheme('system')}>
                  🖥️ 跟随系统
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator/>
            <MenubarItem onClick={() => setShowSettings(true)}>常规设置</MenubarItem>
            <MenubarItem>通知设置</MenubarItem>
            <MenubarItem>个性化</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
    </Menubar>
)
}