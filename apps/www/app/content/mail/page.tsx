/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */
"use client"
import { cookies } from "next/headers"
import Image from "next/image"
// @ts-ignore
import Cookies from 'js-cookie';
import axios from 'axios';
import { Mail } from "@/app/content/mail/components/mail"
// @ts-ignore
import { accounts, mails } from "@/app/content/mail/data"
import React, {useEffect, useState} from "react";
import Loading from "@/app/content/mail/loading";

export default function MailPage() {
  const layoutCookie = Cookies.get("react-resizable-panels:layout");
  const collapsedCookie = Cookies.get("react-resizable-panels:collapsed");
  const [theme, setTheme] = useState('light');
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;
  const defaultCollapsed = collapsedCookie ? JSON.parse(collapsedCookie) : undefined;

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


  const [userSettings, setUserSettings] = useState({
    theme: '',
    font: '',
    backgroundtransparency: '',
    background: '',
  });

  useEffect(() => {
    const cookieUserSettings = Cookies.get('cookie-usersettings');
    if (cookieUserSettings) {
      const settings = JSON.parse(cookieUserSettings);
      setUserSettings(settings);
      adjustPageStyles(settings);
    } else {
      fetchUserSettings();
    }
  }, []);

  const fetchUserSettings = async () => {
    const jwt = Cookies.get('jwt');
    if (jwt) {
      try {
        const { data } = await axios.get('https://xn--7ovw36h.love/api/users/me', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        Cookies.set('cookie-usersettings', JSON.stringify(data), { expires: 7 }); // 保存 7 天
        setUserSettings(data);
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
      }
    }
  };

// 动态加载字体
  const loadFont = async (font: any) => {
    let fontFace;
    switch (font) {
      case "miSans":
        fontFace = new FontFace("MiSans", "url(./font/misans.woff2)");
        break;
      case "oppoSans":
        fontFace = new FontFace("OppoSans", "url(./font/opposans.woff2)");
        break;
      default:
        // Default or no action needed for the 'default' font
        return;
    }

    try {
      document.fonts.add(fontFace);
      await fontFace.load();
      Array.from(document.querySelectorAll("*")).forEach((el) => {
        // @ts-ignore
        el.style.cssText += `font-family: ${font} !important;`;
      });
      console.log(`${font} font loaded successfully`);
    } catch (error) {
      console.error(`Failed to load ${font} font: ${error}`);
    }
  };

// 根据用户设置调整页面样式
  const adjustPageStyles = (settings: { theme: string; font: any; backgroundtransparency: string; }) => {
    document.documentElement.classList.remove('dark'); // 先移除可能的 dark 类
    if (settings.theme === 'dark') {
      changeTheme('dark')
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      changeTheme('system')
    }

    loadFont(settings.font);

    // 调整背景透明度
    const overlayOpacityClass = settings.backgroundtransparency ? `bg-opacity-${settings.backgroundtransparency}` : 'bg-opacity-75';
    document.documentElement.style.setProperty('--overlay-opacity', overlayOpacityClass);
  };


  // 解析背景视频链接
  const getBackgroundVideos = () => {
    if (userSettings && userSettings.background && userSettings.background.includes('|')) {
      const [darkVideo, lightVideo] = userSettings.background.split('|');
      return { darkVideo, lightVideo };
    }
    // 如果是单个链接或默认，则两个背景使用相同的视频
    return {
      darkVideo: userSettings && userSettings.background === 'default' ? '/vid/background.mp4' : userSettings.background,
      lightVideo: userSettings && userSettings.background === 'default' ? '/vid/backgroundwhite.mp4' : userSettings.background,
    };
  };

  const { darkVideo, lightVideo } = getBackgroundVideos();



  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* 白色主题视频 */}
        <video autoPlay loop muted
               className="absolute left-0 top-0 z-[-1] min-h-full w-auto min-w-full max-w-none dark:hidden"
               style={{filter: 'blur(70px)', objectFit: 'cover'}}>
          <source src={lightVideo} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
        {/* 黑色主题视频 */}
        <video autoPlay loop muted
               className="absolute left-0 top-0 z-[-1] hidden min-h-full w-auto min-w-full max-w-none dark:block"
               style={{filter: 'blur(70px)', objectFit: 'cover'}}>
          <source src={darkVideo} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>

        {/* 覆盖层 */}
        <div
          className={`absolute left-0 top-0 z-0 min-h-full min-w-full bg-white dark:bg-black`}
          style={{
            opacity: userSettings.backgroundtransparency ? parseInt(userSettings.backgroundtransparency) / 100 : 0.75,
          }}
        ></div>

        <div className="relative z-10 items-center p-2">
          <Mail
            accounts={accounts}
            mails={mails}
            defaultLayout={defaultLayout}
            defaultCollapsed={defaultCollapsed}
            navCollapsedSize={4}
          />
        </div>
      </div>
    </>
  )
}
