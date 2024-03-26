/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

"use client"
/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */


// @ts-ignore
import Cookies from 'js-cookie';
import axios from 'axios';
import { Mail } from "@/app/content/mail/components/mail"
// @ts-ignore
import { accounts, mails } from "@/app/content/mail/data"
import React, {useEffect, useState} from "react";
import Loading from "@/app/content/mail/loading";
import { SwitchTransition, CSSTransition } from 'react-transition-group';
export default function MailPage() {


    const [theme, setTheme] = useState('light');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false); // 用于追踪视频是否可见
  const [data, setData] = useState(null);
  const [updateFlag, setUpdateFlag] = useState(false);
  const [cookies, setCookies] = useState(null);

  useEffect(() => {
    const cookieUserSettings = Cookies.get('cookie-usersettings');
    if (cookieUserSettings) {
      const settings = JSON.parse(cookieUserSettings);
      setUserSettings(settings);

      if (settings.themecolor && settings.themecolor !== 'default') {
        // 创建脚本元素
        const scriptElement = document.createElement('script');
        scriptElement.src = `/color/${settings.themecolor}.js`;
        scriptElement.async = true; // 确保脚本异步加载

        // 加载成功或失败的日志
        scriptElement.onload = () => {
          console.log(`${settings.themecolor} color scheme applied successfully.`);
        };
        scriptElement.onerror = () => {
          console.error(`Failed to load color scheme: ${settings.themecolor}`);
        };

        // 将脚本元素添加到文档中
        document.head.appendChild(scriptElement); // 或者document.body.appendChild(scriptElement);
      }

      adjustPageStyles(settings);
    } else {
      fetchUserSettings();
    }
  }, []);



// 视频加载成功
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoVisible(true); // 视频加载后设置视频为可见
  };
// 视频加载失败
  const handleVideoError = () => {
    setVideoLoaded(false);
  };



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
  }, [updateFlag]);

  const fetchUserSettings = async () => {
    if (typeof window !== "undefined") {
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

// 解析背景透明度和模糊度
    let blurValue = '70px'; // 默认模糊值
    if (settings.backgroundtransparency) {
      const [transparency, blur] = settings.backgroundtransparency.split('|');
      if (blur && blur !== 'default') {
        const blurPercent = parseInt(blur);
        blurValue = `${Math.min(blurPercent, 300)}px`; // 将百分比转换为px值，并确保不超过300px
      }
      // 设置透明度的样式，透明度处理逻辑保持不变，因为你提到不需要调整
      const overlayOpacity = transparency === 'default' ? 0.75 : parseInt(transparency) / 100;
      document.documentElement.style.setProperty('--overlay-opacity', overlayOpacity.toString());
    }

    // 应用模糊度到视频
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.style.filter = `blur(${blurValue})`;
    });
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
        <CSSTransition
          in={videoVisible} // 根据视频是否可见来触发动画
          timeout={270}
          classNames="fade"
          appear // 使用 appear prop 来确保动画在初次渲染时触发
        >
          <div>
        {/* 白色主题视频 */}
        {!videoLoaded && <div
          className="absolute left-0 top-0 z-[-1] min-h-full w-auto min-w-full max-w-none bg-white dark:bg-black"></div>}

        <video autoPlay loop muted
               className={`absolute left-0 top-0 z-[-1] min-h-full w-auto min-w-full max-w-none dark:hidden ${videoLoaded ? '' : 'hidden'}`}
               style={{filter: 'blur(70px)', objectFit: 'cover'}}
               onLoadedMetadata={handleVideoLoad}
               onError={handleVideoError}>
          <source src={lightVideo} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
        {/* 黑色主题视频 */}
        <video autoPlay loop muted
               className={`absolute left-0 top-0 z-[-1] hidden min-h-full w-auto min-w-full max-w-none dark:block ${videoLoaded ? '' : 'hidden'}`}
               style={{filter: 'blur(70px)', objectFit: 'cover'}}
               onLoadedMetadata={handleVideoLoad}
               onError={handleVideoError}>
          <source src={darkVideo} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>

          </div>
        </CSSTransition>

        {/* 覆盖层 */}
        <div
          className={`absolute left-0 top-0 z-0 min-h-full min-w-full ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
          style={{
            opacity: userSettings.backgroundtransparency ? parseInt(userSettings.backgroundtransparency) / 100 : 0.75,
          }}
        ></div>

        <div className="relative z-10 items-center p-2">
          <Mail
            accounts={accounts}
            mails={mails}
            defaultCollapsed={true}
            navCollapsedSize={4}
          />
        </div>
      </div>
    </>
  )
}
