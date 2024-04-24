/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */
"use client"
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
// @ts-ignore
import Cookies from 'js-cookie';
import axios from 'axios';
import { Mail } from "@/app/content/mail/components/mail"
// @ts-ignore
import { accounts, mails } from "@/app/content/mail/data"
import React, {useEffect, useRef, useState} from "react";
import Loading from "@/app/content/mail/loading";
import { useTheme } from 'next-themes';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/registry/new-york/ui/alert-dialog';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { toast } from '@/registry/new-york/ui/use-toast';
import Birthday from "@/app/Birthday";

export default function MailPage() {
  const layoutCookie = Cookies.get("react-resizable-panels:layout");
  const collapsedCookie = Cookies.get("react-resizable-panels:collapsed");
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;
  const defaultCollapsed = collapsedCookie ? JSON.parse(collapsedCookie) : undefined;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoVisible, setVideoVisible] = useState(false); // 用于追踪视频是否可见
  const [data, setData] = useState(null);
  const [updateFlag, setUpdateFlag] = useState(false);
  const videoRef = useRef(null); // 创建引用以便于 Plyr 访问

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [privacyContent, setPrivacyContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [userId, setUserId] = useState('');
  const [privacyversion, setPrivacyversion] = useState('');
  const [termsversion, setTermsversion] = useState('');
  const { theme, setTheme } = useTheme();



  useEffect(() => {
    if (Cookies.get('agreedToPolicies')) {
      console.log('No JWT found or policies already agreed to, skipping policy check.');
      return; // 如果没有 JWT 或者用户已同意政策，就不执行后续操作
    }
    const jwt = Cookies.get('jwt'); // jwt存储在cookie中
    if (!jwt) {
      console.log('No JWT found, skipping policy check.');
      return; // 如果没有 JWT，就不执行后续操作
    }



    const fetchUserDataAndPolicies = async () => {
      try {
        // 获取用户信息
        const userInfoResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const { id: userId, AgreedPrivacy, AgreedTerms } = userInfoResponse.data;

        // 更新状态以保存userId
        setUserId(userId);


        // 获取最新的政策版本信息
        const resContentsResponse = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/rescontents`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const [resContent] = resContentsResponse.data.data;
        const { privacyversion: newPrivacyVersion, termsversion: newTermsVersion, termscontent, privacycontent } = resContent.attributes;

        // 更新状态变量
        setPrivacyversion(newPrivacyVersion);
        setTermsversion(newTermsVersion);


        // 检查用户是否已同意最新版本的政策
        if (AgreedPrivacy !== newPrivacyVersion) {
          setPrivacyContent(privacycontent);
          setIsPrivacyModalOpen(true);
        }
        if (AgreedTerms !== newTermsVersion) {
          setTermsContent(termscontent);
          setIsTermsModalOpen(true);
        }
      } catch (error) {
        console.error('Error fetching user data and policies', error);
      }
    };

    fetchUserDataAndPolicies();
  }, []);


  const handleCancel = () => {
    window.location.href = '/login'; // 强制跳转到登录页面
  };

  const handlePrivacyAgreement = async () => {
    const jwt = Cookies.get('jwt');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`, {

        AgreedPrivacy: privacyversion

      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setIsPrivacyModalOpen(false);
      Cookies.set('agreedToPrivacy', 'true', { expires: 7 }); // 为隐私政策设置cookie，有效期7天
      toast({ title: 'Privacy policy updated successfully.' });
    } catch (error) {
      console.error('Failed to update privacy agreement', error);
    }
  };

  const handleTermsAgreement = async () => {
    const jwt = Cookies.get('jwt');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}`, {
        AgreedTerms: termsversion
      }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setIsTermsModalOpen(false);
      Cookies.set('agreedToTerms', 'true', { expires: 7 }); // 为服务条款设置cookie，有效期7天
      toast({ title: 'Terms of service updated successfully.' });

      // 检查两个协议都已同意
      if(Cookies.get('agreedToPrivacy')) {
        // 如果隐私政策也已同意，则设置总同意cookie
        Cookies.set('agreedToPolicies', 'true', { expires: 7 });
      }
    } catch (error) {
      console.error('Failed to update terms agreement', error);
    }
  };







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
    setVideoVisible(true);
  };

  // 视频加载失败
  const handleVideoError = () => {
    setVideoLoaded(false);
  };






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
    const jwt = Cookies.get('jwt');
    if (jwt) {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
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

    if (settings.theme === 'dark') {
      setTheme('dark');
    } else if (settings.theme === 'light') {
      setTheme('light');
    } else {
      setTheme('system'); // 使用 'system' 来自动匹配用户系统的主题偏好
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
        <Birthday/>
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
                   style={{filter: 'blur(170px)', objectFit: 'cover'}}
                   onLoadedMetadata={handleVideoLoad}
                   onError={handleVideoError}>
              <source src={lightVideo} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
            {/* 黑色主题视频 */}
            <video autoPlay loop muted
                   className={`absolute left-0 top-0 z-[-1] hidden min-h-full w-auto min-w-full max-w-none dark:block ${videoLoaded ? '' : 'hidden'}`}
                   style={{filter: 'blur(170px)', objectFit: 'cover'}}
                   onLoadedMetadata={handleVideoLoad}
                   onError={handleVideoError}>
              <source src={darkVideo} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>

          </div>
        </CSSTransition>

        {/* 覆盖层 */}
        <div
          className={`absolute left-0 top-0 z-0 min-h-full min-w-full  bg-white/75 dark:bg-black/75`}
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
      <AlertDialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>

        <AlertDialogContent>
          <AlertDialogTitle>服务条款 Res_{termsversion}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mx-auto max-h-40 max-w-2xl overflow-auto ">
              <ReactMarkdown className="prose max-w-none text-sm" rehypePlugins={[rehypeRaw]}>
                {termsContent}
              </ReactMarkdown>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleTermsAgreement}>同意</AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPrivacyModalOpen} onOpenChange={setIsPrivacyModalOpen}>

        <AlertDialogContent>
          <AlertDialogTitle>隐私政策 Res_{privacyversion}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mx-auto max-h-40 max-w-2xl overflow-auto ">
              <ReactMarkdown className="prose max-w-none text-sm" rehypePlugins={[rehypeRaw]}>
                {privacyContent}
              </ReactMarkdown>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handlePrivacyAgreement}>同意</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
