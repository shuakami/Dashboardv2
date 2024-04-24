/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * 严禁任何形式的未经许可的商业使用和倒卖行为。
 * This project is open-sourced under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License and is available on Github: https://github.com/shuakami/Dashboardv2. Unauthorized commercial use and reselling are strictly prohibited.
 * As the copyright notice is applied globally, it might be included in some files that are not owned by me. In such cases, the copyright belongs to the original author.
 */

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/registry/new-york/ui/card";
import Link from "next/link";
import { Label } from "@/registry/new-york/ui/label";
import { Input } from "@/registry/new-york/ui/input";
import { Button } from "@/registry/new-york/ui/button";
import axios from 'axios';
import { CloseIcon, ArrowLeftIcon } from "@nextui-org/shared-icons";
import {JSX, SVGProps, useRef} from "react";
import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/new-york/ui/alert-dialog"

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
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@/registry/new-york/ui/input-otp";
import {toast} from "@/registry/new-york/ui/use-toast";
import { message } from "antd";

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
    // 邮箱验证模态框
    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    // 是显示验证说明还是验证码输入UI
    const [verificationStep, setVerificationStep] = useState('initial');
    // 验证验证码
    const [verificationCode, setVerificationCode] = useState('');
    // JWT
    const [jwt, setJwt] = useState(null); // 使用null作为初始值
    // 第二个模态框，控制
    const [showCodeInputDialog, setShowCodeInputDialog] = useState(false);
    // 冷却时间
    const [cooldown, setCooldown] = useState(0);
    // 在CD
    const [isResending, setIsResending] = useState(false);
    // 2输入框聚焦用的
    const [focusInput, setFocusInput] = useState(false);


    // 统计、验证JS
    use51laAndRecaptcha();


    // 多语言内容
    const content = {
        zh: {
            title: "值得拥有的永远来之不易，热爱是所有的理由和答案。",
            freeForIndividuals: "危险！全部隐身",
            exclusive: "需要登录令牌",
            othersNotAllowed: "暂未开通注册",
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
           //   console.log(`令牌验证成功, starkey: ${starkey}`);
                transitionStep(2); // 转到动态验证码输入步骤
                setFocusInput(true); // 设置 focusInput 为 true
            }
        } else if (step === 2) {
          setFocusInput(true); // 设置 focusInput 为 true

          setTimeout(async () => {
            message.warning('开始验证，不要着急，大概需要15秒');
            setShowSpinner(true);
            const verificationResult = await verifyDynamicCode(token, dynamic); // 使用 verificationResult 接收结果

            // 验证成功的情况
            if (verificationResult === true) {
              setIsLoggedIn(true);
              handleLoginSuccess();
              setShowSpinner(false);
            } else if (verificationResult && typeof verificationResult === 'object' && 'error' in verificationResult) {
              console.error('验证失败');
              if ('jwt' in verificationResult) {
                setJwt(verificationResult.jwt); // 更新状态中的JWT
              }
              setShowSpinner(false);
              if (verificationResult.error === 'Verification required') {
                setShowVerificationDialog(true); // 显示模态框
                setVerificationStep('initial');
              }
            } else {
              // 处理其他可能的错误情况
              console.error('发生了未知错误。');
              setShowSpinner(false);
            }
          }, 800);
        }
    };

    const sendVerificationCodeToEmail = async () => {
    // 使用存储在状态或上下文中的JWT
    if (!jwt) {
      console.error('JWT not found');
      return;
    }

    try {
      const response = await axios.post('/api/verifyv3', { jwt });
      console.log(response.data.message);
      setShowCodeInputDialog(true);
      setVerificationStep('inputCode');
      message.success('验证码发送成功，看你的邮箱。');
    } catch (error) {
      console.error('Error sending verification code:', error);
      setShowVerificationDialog(true); // 显示模态框
      setVerificationStep('initial');
      message.error('邮箱发送失败，换个网试一下。');
    }
  };


  const verifyCode = async () => {

    if (!jwt) {
      console.error('JWT not found');
      return;
    }
    message.warning('别急，需要等一会');

    try {
      const response = await axios.post('/api/verifyCode', {
        jwt,
        code: verificationCode,
      });


      if (response.data.message === '验证码验证成功') {
        Cookies.set('jwt', jwt);
        console.log('验证码验证成功');
        setIsLoggedIn(true);
        handleLoginSuccess();
        setShowCodeInputDialog(false); // 验证成功才关闭对话框
        message.success('您的验证已通过，ByteFreeze守护您的账户安全。');
        setVerificationCode('');
      } else {
        console.error('验证码验证失败:', response.data.message);
        // 验证码错误，保持对话框打开并可能提供反馈给用户
        setShowCodeInputDialog(true);
        setVerificationStep('inputCode'); // 保持在输入验证码的界面
        message.error('验证码不对，过期了或者是错了');
      }
    } catch (error) {
      console.error('验证过程中发生错误:', error);
      setShowCodeInputDialog(true); // 出错时也保持对话框打开
      setVerificationStep('inputCode');
      message.error('验证码不对，过期了或者是错了');
    }
  };

  const resendVerificationCode = () => {
    if (cooldown > 0 || isResending) {
      // 如果正在冷却或正在重新发送，则不执行操作
      return;
    }

    setIsResending(true);
    sendVerificationCodeToEmail(); // 触发重新发送验证码到邮箱的函数
    setCooldown(30); // 设置30秒冷却时间

    const intervalId = setInterval(() => {
      setCooldown((prevCooldown) => {
        if (prevCooldown <= 1) {
          clearInterval(intervalId); // 清除计时器
          setIsResending(false); // 重置重发状态
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000); // 每秒更新一次
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

      <>

        <AlertDialog open={showVerificationDialog} onOpenChange={(isOpen) => setShowVerificationDialog(isOpen)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>额外验证要求</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              出于安全考虑，我们需要进一步验证您的身份。
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowVerificationDialog(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                console.log('开始额外验证流程');
                sendVerificationCodeToEmail(); // 调用此函数发送验证码
                setShowVerificationDialog(false); // 关闭当前模态框
                setShowCodeInputDialog(true); // 打开验证码输入模态框
              }}>继续验证</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showCodeInputDialog} onOpenChange={(isOpen) => setShowCodeInputDialog(isOpen)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>验证码验证</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              验证码已发送到您的邮箱，请在下面填写验证码进行验证。
              {/* 重发验证码选项 */}
              <div
                onClick={!isResending && cooldown === 0 ? resendVerificationCode : undefined} // 使用undefined替换null
                style={{
                  color: cooldown > 0 || isResending ? 'grey' : '#1895F8',
                  cursor: cooldown > 0 || isResending ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {cooldown > 0 ? `重发验证码 (${cooldown}秒)` : '重发验证码'}
              </div>
            </AlertDialogDescription>

            <InputOTP maxLength={6} value={verificationCode} onChange={(value) => setVerificationCode(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSeparator />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCodeInputDialog(false)}>取消</AlertDialogCancel>
              <AlertDialogAction onClick={verifyCode}>提交验证码</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>




        <CSSTransition in={showPage} timeout={500} classNames="page" unmountOnExit>
        <div className="flex h-screen w-full items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute left-0 top-0 h-full w-full object-cover"
            src="/video/background.mp4"/>
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
                  addEndListener={(node: {
                    addEventListener: (arg0: string, arg1: any, arg2: boolean) => any;
                  }, done: any) => node.addEventListener("transitionend", done, false)}
                  classNames="fade"
                >
                  <CardContent
                    className={`relative grow ${isLoggedIn ? "card-content-transition" : ""}`}
                    style={{minHeight: isLoggedIn ? 'auto' : '142px'}}>
                    {showSpinner ? (
                      <div className="flex h-full items-center justify-center">
                        <Loading/>
                      </div>
                    ) : isLoggedIn ? (
                      // 登录成功显示内容
                      <>
                        <div
                          className="h-full dark:text-white"></div>
                        <p style={{
                          textAlign: 'center',
                          fontSize: '21px',
                          fontWeight: 'bold'
                        }}></p>
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
                          }}/>
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
                          autoFocus={focusInput}
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
                          }}/>
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
                    className="h-5 w-5 text-white opacity-50 transition-opacity duration-200 hover:opacity-60"/>
                </div>
              </DropdownMenuTrigger>
              {/* eslint-disable-next-line tailwindcss/migration-from-tailwind-2 */}
              <DropdownMenuContent side="top"
                                   className="ml-4 border-none bg-white/70 p-1 backdrop-blur-md transition duration-200 ease-in-out dark:bg-[#121212]/80 dark:bg-opacity-80">
                <DropdownMenu aria-label="Language switcher">
                  <DropdownMenuGroup>
                    <DropdownMenuItem key="auto" onClick={() => switchLanguage('auto')}>
                      自动选择-Languageauto
                    </DropdownMenuItem>
                    <DropdownMenuItem key="zh" onClick={() => switchLanguage('zh')}>
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
            <Link href="/docs/privacy" target="_blank"
                  className="text-white hover:text-gray-200 dark:hover:text-gray-400">隐私政策</Link>
            {' '}
            <Link href="/docs/terms" target="_blank"
                  className="text-white hover:text-gray-200 dark:hover:text-gray-400">用户协议</Link>
          </p>
        </div>
      </CSSTransition></>
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
