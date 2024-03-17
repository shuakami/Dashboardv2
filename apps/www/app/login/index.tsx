/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/registry/new-york/ui/card";
import Link from "next/link";
import { Label } from "@/registry/new-york/ui/label";
import { Input } from "@/registry/new-york/ui/input";
import { Button } from "@/registry/new-york/ui/button";

import { CloseIcon, ArrowLeftIcon } from "@nextui-org/shared-icons";
import { JSX, SVGProps } from "react";
import React, { useState, useEffect } from 'react';


import { CSSTransition, SwitchTransition } from 'react-transition-group';

import {Spinner} from "@nextui-org/react";
import { authenticateToken, verifyDynamicCode } from './auth';
import {use51laAndRecaptcha} from '@/app/content/mail/components/use51LaAnalytics';
import { XIcon } from '@heroicons/react/outline';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu";

import { TranslateIcon } from "@heroicons/react/outline";
import Loading from "@/app/content/mail/loading";
// @ts-ignore
import Cookies from "js-cookie";

interface LoginPageProps {
    fromHome?: boolean;
    onClose?: () => void; // onClose 回调函数的 prop
}

export default function LoginPage({ fromHome, onClose }: LoginPageProps) {
    // 追踪步骤
    const [step, setStep] = useState(1);
    // 身份验证token
    const [token, setToken] = useState('');
    // 存储数据
    const [dynamic, setDynamic] = useState('');
    // 验证token
    const [isTokenValid, setIsTokenValid] = useState(false);
    // 验证动态码
    const [showSpinner, setShowSpinner] = useState(false);
    // 登录状态
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 渐变 淡入淡出
    const [showPage, setShowPage] = useState(false);
    // 多语言
    const [language, setLanguage] = useState('en');
    // 语言菜单开关
    const [open, setOpen] = useState(false);
    // 加载状态
    const [showLoading, setShowLoading] = useState(false);
    // 回首页
    const [redirectToHome, setRedirectToHome] = useState(false);
  use51laAndRecaptcha();
    // 多语言内容
    const content = {
        zh: {
            title: "这真的是哥们自己的控制台啊，没有人会不喜欢自己的控制台吧",
            freeForIndividuals: "是个人就免费",
            exclusive: "但是需要是我的人",
            othersNotAllowed: "其他都不允许！",
            loginWithToken: "使用令牌 登录",
            noToken: "继续登录代表您已经同意了我们的政策",
            tokenLabel: "令牌AShaDi",
            tokenPlaceholder: "输入AShaDi令牌",
            dynamicVerification: "动态验证",
            dynamicPlaceholder: "输入动态验证码",
            nextStep: "下一步",
            login: "登录",
            searchingForInfo: "正在找资料...",
            loginSuccess: "登录成功",
            prevStep: "上一步",
        },
        en: {
            title: "This is really my own console, nobody would dislike their own console, right?",
            freeForIndividuals: "Free for individuals",
            exclusive: "But you have to be one of us",
            othersNotAllowed: "Others are not allowed!",
            loginWithToken: "Login with token",
            noToken: "Continuing to log in signifies that you have already agreed to our policies.",
            tokenLabel: "Token",
            tokenPlaceholder: "Enter your token",
            dynamicVerification: "Dynamic Verification",
            dynamicPlaceholder: "Enter dynamic code",
            nextStep: "Next Step",
            login: "Login",
            searchingForInfo: "Searching for information...",
            loginSuccess: "Login Successful",
            prevStep: "Previous Step",
        },
        ru: {
            title: "Это действительно моя собственная консоль, никто не может не любить свою консоль, верно?",
            freeForIndividuals: "Бесплатно для индивидуальных пользователей",
            exclusive: "Но тебе нужно быть одним из нас",
            othersNotAllowed: "Другим вход запрещен!",
            loginWithToken: "Вход с использованием токена",
            noToken: "Продолжение авторизации означает, что вы уже согласились с нашими правилами и условиями.",
            tokenLabel: "Токен",
            tokenPlaceholder: "Введите ваш токен",
            dynamicVerification: "Динамическая проверка",
            dynamicPlaceholder: "Введите динамический код",
            nextStep: "Следующий шаг",
            login: "Вход",
            searchingForInfo: "Поиск информации...",
            loginSuccess: "Вход выполнен успешно",
            prevStep: "Предыдущий шаг",
        },
    };

    const getDefaultLanguage = () => {
        if (typeof window !== 'undefined') {
            const storedLanguage = localStorage.getItem('userLanguage');
            if (storedLanguage) {
                return storedLanguage;
            }
            const browserLanguage = navigator.language;
            if (browserLanguage.includes('zh')) {
                console.log("detection-(zh)");
                return 'zh';
            } else if (browserLanguage.includes('ru')) {
                console.log("detection-ru");
                return 'ru';
            } else {
                console.log("detection-en");
                return 'en';
            }
        }
        return 'en'; // 默认返回英语
    };

    useEffect(() => {
        const detectedLanguage = getDefaultLanguage();
        console.log(`Set language: ${detectedLanguage}`);
        setLanguage(detectedLanguage);

        if (typeof window !== 'undefined') {
            localStorage.setItem('userLanguage', detectedLanguage);
        }
    }, []);

  useEffect(() => {
    setIsTokenValid(token.length > 4);
  }, [token]);

    const handleCloseLoginPage = () => {
        if (onClose) onClose();
    };

    // 渐变 淡入淡出
    useEffect(() => {
        setShowPage(true);
        return () => setShowPage(false); // 当组件卸载时触发淡出
    }, []);

    // 检查登录状态
    useEffect(() => {
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const jwt = Cookies.get('jwt');

    if (isLoggedIn && jwt) {
      setShowLoading(true); // 开始时显示加载组件
      setTimeout(() => {
        // 1秒后跳到首页
        setRedirectToHome(true); // 设置重定向状态
      }, 1000);
    }
  }, []);

     useEffect(() => {
    if (redirectToHome) {
      window.location.href = '/'; // 当redirectToHome为true时进行跳转
    }
  }, [redirectToHome]);

  if (showLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // 使用视口高度可以让容器填满整个屏幕
        position: 'relative' // 相对定位
      }}>
        <Loading />
      </div>
    );
  }



    const transitionStep = (nextStep: React.SetStateAction<number>) => {
        setShowSpinner(true);
        setTimeout(() => {
            setStep(nextStep);
            setShowSpinner(false);
        }, 800);
    };

    const handleNextStep = async () => {
        setShowSpinner(true);
        if (step === 1) {
            const { valid, starkey } = await authenticateToken(token);
            setShowSpinner(false);
            if (valid) {
                console.log(`令牌验证成功, starkey: ${starkey}`);
                transitionStep(2); // 转到动态验证码输入步骤
            }
        } else if (step === 2) {
            // 进行动态验证码的验证
            setTimeout(async () => {
            setShowSpinner(true);
            const isValid = await verifyDynamicCode(token, dynamic);
            if (isValid) {
                setIsLoggedIn(true);
                handleLoginSuccess();
                setShowSpinner(false);
            } else {
                console.error('动态验证码验证失败');
                setShowSpinner(false);
            }
            }, 800);
        }
    };

    // 登录成功处理函数
    const handleLoginSuccess = () => {
        // 设置登录状态 存在localStorage中
      Cookies.set('isLoggedIn', 'true', { expires: 7 });

        // 生成一个安全的随机密钥
        const array = new Uint8Array(123); // 123*2=246位
        window.crypto.getRandomValues(array);
        const secureKey = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        Cookies.set('secureKey', secureKey, { expires: 7 });
        // 更新应用状态为已登录，跳
        // 跳步骤用的
        setIsLoggedIn(true);
        window.location.href = '/';
    };

    // 跳步骤用的
    const handlePreviousStep = () => {
        if (step > 1) {
            transitionStep(step - 1);
        }
    };

    // @ts-ignore
    const currentContent = content[language];

    // 定义共享样式-Dropdown的
    const sharedTransitionClass = "transition duration-200 ease-in-out";
    const sharedBorderNoneClass = "border-none";

    const switchLanguage = (lang: string) => {
        setLanguage(lang);
        if (typeof window !== 'undefined') {
            if (lang === 'auto') {
                // 选了自动选择，清除localStorage-userLanguage
                localStorage.removeItem('userLanguage');
                // 重新检测语言
                const detectedLanguage = getDefaultLanguage();
                setLanguage(detectedLanguage);
                localStorage.setItem('userLanguage', detectedLanguage);
                console.log(`Language automatically detected and switched to: ${detectedLanguage}`);
            } else {
                // 更新localStorage语言偏好
                localStorage.setItem('userLanguage', lang);
                console.log(`Language switched to: ${lang}`);
            }
          setOpen(false); // 关闭下拉菜单
        }
    };

    return (
        <CSSTransition in={showPage} timeout={500} classNames="page" unmountOnExit>
            <div className="flex h-screen w-full items-center justify-center">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute left-0 top-0 h-full w-full object-cover"
                    src="/video/background.mp4"
                />
                <div className="z-[1] mx-auto flex w-[980px] items-center justify-between p-8" style={{gap: '48px'}}>
                    {fromHome && (
                        <div className="absolute right-0 top-0 p-4">
                            <button onClick={handleCloseLoginPage} aria-label="Close login page and return to home">
                                <XIcon className="h-6 w-6 text-white"/>
                            </button>
                        </div>

                    )}
                    <div className="text-container flex flex-col justify-center space-y-6 text-white"
                         style={{maxWidth: '440px'}}>
                        <FlagIcon className="h-8 w-8"/>
                        <h1 className="text-4xl ">{currentContent.title}</h1>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-2">
                                <CheckIcon className="h-5 w-5"/>
                                <span>{currentContent.freeForIndividuals}</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckIcon className="h-5 w-5"/>
                                <span>{currentContent.exclusive}</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CloseIcon className="h-5 w-5"/>
                                <span>{currentContent.othersNotAllowed}</span>
                            </li>
                        </ul>
                    </div>
                    <Card
                        className="relative flex w-[400px] flex-col rounded-lg border-none bg-white/75 backdrop-blur-md dark:bg-black/80">
                        {step > 1 && !isLoggedIn && (
                            <div className="absolute right-4 top-4">
                                <button onClick={handlePreviousStep}
                                        className="flex items-center text-sm font-semibold text-blue-600">
                                    <ArrowLeftIcon fill="currentColor"/>
                                    {currentContent.prevStep}
                                </button>
                            </div>
                        )}
                        {isLoggedIn ? (
                            <div className="min-h-[140px]"></div> // 防止炸机抖动
                        ) : (
                            <>
                                <CardHeader>
                                    <CardTitle>{currentContent.loginWithToken}</CardTitle>
                                    <CardDescription>
                                        {/* 注意此处应该修bug，具体是registerNewToken-Url不对 */}
                                        {currentContent.noToken}{" "}
                                        <Link className="text-blue-600 hover:underline" href="#">
                                            {/*  {currentContent.registerNewToken} 因为我不喜欢看到报错，所以注释 */}
                                        </Link>
                                    </CardDescription>
                                </CardHeader>
                            </>
                        )}
                        <SwitchTransition>
                            <CSSTransition
                                key={step}
                                addEndListener={(node: { addEventListener: (arg0: string, arg1: any, arg2: boolean) => any; }, done: any) => node.addEventListener("transitionend", done, false)}
                                classNames="fade"
                            >
                                <CardContent
                                    className={`relative grow ${isLoggedIn ? "card-content-transition" : ""}`}
                                    style={{minHeight: isLoggedIn ? 'auto' : '145px'}}>
                                    {showSpinner ? (
                                        <div className="flex h-full items-center justify-center">
                                            <Loading/>
                                        </div>
                                    ) : isLoggedIn ? (
                                        // 登录成功显示内容
                                        <>
                                            <Spinner size="lg" color="primary" style={{
                                                width: '352px', height: '0px',
                                            }}/>
                                            <div
                                                className=" h-full dark:text-white">{currentContent.searchingForInfo}</div>
                                            <p style={{
                                                fontSize: '21px',
                                                height: '150px',
                                                width: '352px',
                                                fontWeight: 'bold'
                                            }}>{currentContent.loginSuccess}</p>

                                        </>
                                    ) : step === 1 ? (
                                        // 1-令牌输入
                                        <>
                                            <Label htmlFor="token">{currentContent.tokenLabel}</Label>
                                            <Input
                                                className="input-no-outline"
                                                id="token"
                                                placeholder={currentContent.tokenPlaceholder}
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                //允许回车下一步
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        handleNextStep().catch((error) => {
                                                            console.error('handleNextStep encountered an error:', error);
                                                        });
                                                    }
                                                }}
                                            />
                                            <Button
                                                className="mt-4 w-full"
                                                onClick={handleNextStep}
                                                disabled={!isTokenValid}
                                                style={{backgroundColor: isTokenValid ? '#009dff' : '#7fceff'}}
                                            >
                                                {currentContent.nextStep}
                                            </Button>
                                        </>
                                    ) : (
                                        // 2-动态验证码输入
                                        <>
                                            <Label htmlFor="dynamic">{currentContent.dynamicVerification}</Label>
                                            <Input
                                                id="dynamic"
                                                className="input-no-outline"
                                                placeholder={currentContent.dynamicVerification}
                                                type="password"
                                                value={dynamic}
                                                onChange={(e) => setDynamic(e.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        handleNextStep().catch((error) => {
                                                            console.error('handleNextStep encountered an error:', error);
                                                        });
                                                    }
                                                }}
                                            />
                                            <Button
                                                className="mt-4 w-full"
                                                onClick={handleNextStep}
                                                style={{backgroundColor: dynamic.length > 4 ? '#009dff' : '#7fceff'}}
                                            >
                                                {currentContent.login}
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </CSSTransition>
                        </SwitchTransition>
                    </Card>
                </div>
                <div className="absolute bottom-4 left-4 flex flex-col space-y-4">
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                      <div style={{position: 'relative', zIndex: 999}}>
                        <TranslateIcon
                          className="h-5 w-5 text-white opacity-50 transition-opacity duration-200 hover:opacity-60"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
                    <DropdownMenuContent side="top"  className="ml-4 border-none bg-white/70 p-1 backdrop-blur-md transition duration-200 ease-in-out dark:bg-[#121212]/80 dark:bg-opacity-80">
                    <DropdownMenu aria-label="Language switcher">
                      <DropdownMenuGroup >
                      <DropdownMenuItem key="auto" onClick={() => switchLanguage('auto')}>
                                自动选择-Languageauto
                            </DropdownMenuItem>
                            <DropdownMenuItem key="zh" onClick={() => switchLanguage('zh')} >
                                中文
                            </DropdownMenuItem>
                            <DropdownMenuItem key="en" onClick={() => switchLanguage('en')}>
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem key="ru" onClick={() => switchLanguage('ru')}>
                                русский язык
                            </DropdownMenuItem>
                      </DropdownMenuGroup>
                        </DropdownMenu>
                  </DropdownMenuContent>
                    </DropdownMenu>

                </div>
                {/* 原始人&nbsp;哈哈哈哈哈我也没办法的QAQ */}
                <p className="no-select copyright-text absolute bottom-4 left-4 z-0 text-xs text-white opacity-50">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {new Date().getFullYear()} ByteFreezeLab. All rights
                    reserved.
                    {' '}
                    <Link href="/privacy" target="_blank"
                       className="text-white hover:text-gray-200 dark:hover:text-gray-400">隐私</Link>
                    {' '}
                    <Link href="/policy" target="_blank"
                       className="text-white hover:text-gray-200 dark:hover:text-gray-400">条款协议</Link>
                </p>
            </div>
        </CSSTransition>
    );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    )
}


function FlagIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" x2="4" y1="22" y2="15"/>
            </svg>
        )
    }
