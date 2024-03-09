/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
import ProfilePage from './page'; // 假设这是 Profile 对应的组件
import AccountPage from '@/app/content/forms/account/page';
import AppearancePage from '@/app/content/forms/appearance/page';
import NotificationsPage from '@/app/content/forms/notifications/page';
import DisplayPage from '@/app/content/forms/display/page';

import React, { useState } from 'react';
import {Separator} from "@/registry/new-york/ui/separator";
import {SidebarNav} from "@/app/content/forms/components/sidebar-nav";

export default function SettingsLayout() {
  console.log("渲染 SettingsLayout 组件");
  const [selectedPage, setSelectedPage] = useState('');

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
      <div className="md:hidden">
        {/* Mobile view can be handled here */}
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav
              items={[
                { title: "Profile", onClick: () => setSelectedPage('Profile') },
                { title: "Account", onClick: () => setSelectedPage('Account') },
                { title: "Appearance", onClick: () => setSelectedPage('Appearance') },
                { title: "Notifications", onClick: () => setSelectedPage('Notifications') },
                { title: "Display", onClick: () => setSelectedPage('Display') },
              ]}
              onSelect={setSelectedPage} // 传递 setSelectedPage 作为 onSelect 回调
            />
          </aside>
          <div className="full mx-auto flex-1 lg:max-w-2xl">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
