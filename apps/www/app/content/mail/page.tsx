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

          Your browser does not support the video tag.
        </video>
        {/* 黑色主题视频 */}
        <video autoPlay loop muted
               className={`absolute left-0 top-0 z-[-1] hidden min-h-full w-auto min-w-full max-w-none dark:block ${videoLoaded ? '' : 'hidden'}`}
               style={{filter: 'blur(70px)', objectFit: 'cover'}}
               onLoadedMetadata={handleVideoLoad}
               onError={handleVideoError}>

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
            defaultLayout={undefined}
            defaultCollapsed={true}
            navCollapsedSize={4}
          />
        </div>
      </div>
    </>
  )
}
