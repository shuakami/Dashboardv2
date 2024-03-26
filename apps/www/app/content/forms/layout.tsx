/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import ProfilePage from './page';
import AccountPage from '@/app/content/forms/account/page';
import AppearancePage from '@/app/content/forms/appearance/page';
import NotificationsPage from '@/app/content/forms/notifications/page';
import DisplayPage from '@/app/content/forms/display/page';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import React, {useEffect, useState} from 'react';
import {Separator} from "@/registry/new-york/ui/separator";
import {SidebarNav} from "@/app/content/forms/components/sidebar-nav";
// @ts-ignore
import Cookies from 'js-cookie';

export default function SettingsLayout() {
  console.log("渲染 SettingsLayout 组件");
  const initialPage = Cookies.get('selectedPage') || '';
  const [selectedPage, setSelectedPage] = useState(initialPage);
  const [selectedPageDescription, setSelectedPageDescription] = useState({
    title: "Settings",
    description: "Manage your account settings and set e-mail preferences."
  });
  const pageDescriptions = {
    'Profile': {
      title: "Profile",
      description: "Manage your user profile and personal settings."
    },
    'Account': {
      title: "Account",
      description: "Configure your account details and preferences."
    },
    'Appearance': {
      title: "Appearance",
      description: "Customize the look and feel of your account."
    },
    'Notifications': {
      title: "Notifications",
      description: "Adjust your notification settings and preferences."
    },
    'Display': {
      title: "Display",
      description: "Control display settings for your account."
    },
  };

  const handlePageSelection = (page: string) => {
    setSelectedPage(page);
    Cookies.set('selectedPage', page, { expires: 7 }); // 保存用户选择到cookie，有效期为7天
    // @ts-ignore
    setSelectedPageDescription(pageDescriptions[page] || {
      title: "Settings",
      description: "Manage your account settings and set e-mail preferences."
    });
  };

  useEffect(() => {
    // 如果有从cookie中读取到的初始页面，则设置页面描述
    if (initialPage) {
      // @ts-ignore
      setSelectedPageDescription(pageDescriptions[initialPage] || {
        title: "Settings",
        description: "Manage your account settings and set e-mail preferences."
      });
    }
  }, [initialPage]);


  const renderPage = () => {
    switch (selectedPage) {
      case 'Profile':
        return <ProfilePage />;
      case 'Account':
        return <AccountPage />;
      case 'Appearance':
        return <AppearancePage />;
      case 'Notifications':
        return <NotificationsPage />;
      case 'Display':
        return <DisplayPage />;
      default:
        return <div>Select a page from the sidebar</div>;
    }
  };

  return (
    <>
      <div className="flex space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">{selectedPageDescription.title}</h2>
          <p className="text-muted-foreground">
            {selectedPageDescription.description}
          </p>
        </div>
        <Separator className="my-6 w-screen" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav
              items={[
                { title: "Profile", onClick: () => handlePageSelection('Profile') },
                { title: "Account", onClick: () => handlePageSelection('Account') },
                { title: "Appearance", onClick: () => handlePageSelection('Appearance') },
                { title: "Notifications", onClick: () => handlePageSelection('Notifications') },
                { title: "Display", onClick: () => handlePageSelection('Display') },
              ]}
              onSelect={handlePageSelection} // 更新 onSelect 回调以使用 handlePageSelection
            />
          </aside>
          <div className="full flex h-screen max-h-full ">
            <SwitchTransition>
              <CSSTransition
                key={selectedPage} // 使用选中的页面作为key，确保每次切换都触发动画
                timeout={270} // 动画时长，单位毫秒
                classNames="setting" // 动画名称，你需要定义对应的CSS
              >
                <div>
                  {renderPage()}
                </div>
              </CSSTransition>
            </SwitchTransition>
          </div>
        </div>
      </div>
    </>
  );
}
