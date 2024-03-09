/*
 * Copyright (C) 2023-2024 ByteFreezeLab×Sdjz.Wiki. All rights reserved.
 * This project is strictly confidential and proprietary to the owner. It is not open-sourced and is not available for public use, distribution, or modification in any form. Unauthorized use, distribution, reproduction, or any other form of exploitation is strictly prohibited.
 */

import React, {useEffect, useState} from 'react';
import "@/styles/globals.css";
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

// @ts-ignore
import {TranslateIcon,LockClosedIcon} from "@heroicons/react/outline";
import { Badge } from '@/registry/new-york/ui/badge';



export default function PolicyComponent() {
    const [language, setLanguage] = useState('en');
    const [open, setOpen] = useState(false);

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


    const content = {
        zh: {
            title: "使用政策",
            introduction: "欢迎使用由shuakami（以下简称“我们”）管理的sdjz.wiki和ByteFreezeLab控制台（以下简称“控制台”）。通过访问或使用我们的控制台，您同意遵守以下条款和条件（以下简称“使用政策”）。如果您不同意本使用政策的任何部分，请不要使用控制台。",
            userQualification: "控制台面向遵守中华人民共和国法律，且根据中国法律被视为具有完全民事行为能力的个人和组织。根据中国法律，未满18岁的儿童不得使用本控制台。通过使用控制台，您声明并保证您已达到合法使用的最低年龄。",
            usageStandards: "我们授予您有限的、非独占的、不可转让的许可，以便于个人和非商业目的使用控制台。您同意不会：使用控制台进行任何违法活动；侵犯控制台或其它用户的知识产权；干扰或尝试干扰控制台的正常运行；未经授权访问控制台的后端系统或其他用户的账户。您负责维护您账户的安全性和保密性，并对所有在您账户下发生的活动负责。如果发现任何未授权使用您的账户或其他安全漏洞，请立即通知我们。",
            intellectualProperty: "控制台及其整体内容，包括但不限于文本、图像、软件、代码和材料，是我们的财产，受到版权、商标和其他知识产权法律的保护。未经我们明确的书面同意，您不得复制、修改、传播、展示或以任何其他方式使用控制台的任何部分。",
            serviceChangesAndTermination: "我们保留随时修改或终止控制台服务（或其任何部分）的权利，恕不另行通知。我们对您或任何第三方对任何修改、暂停或终止控制台服务不承担责任。",
            disclaimerAndLimitationOfLiability: "控制台按“现状”和“可用”基础提供。我们不保证控制台的操作不会中断或无错误。在适用法律允许的最大范围内，我们不承担因使用或无法使用控制台而直接或间接产生的任何种类的损害责任。本使用政策的解释、适用及与本使用政策相关的争议解决均适用中华人民共和国法律。任何因使用控制台而引起或相关的争议应首先尝试通过友好协商解决；如果协商未能解决争议，则争议应提交至我们注册地的人民法院诉讼解决。",
            contact: "如果您对本使用政策有任何问题，请通过以下方式联系我们：",
            github: "GitHub：github/shuakami",
            tg:"Telegram：@shuakami",
            icon1:"生效于：2024/2/6",
            icon2: "更新于：2024/2/6",
            icon3: "审查通过"
        },
        en: {
            title: "Usage Policy",
            introduction: "Welcome to the console managed by shuakami (\"we\") of sdjz.wiki and ByteFreezeLab. By accessing or using our console, you agree to comply with the following terms and conditions (\"Usage Policy\"). If you do not agree with any part of this Usage Policy, please do not use the console.",
            userQualification: "The console is aimed at individuals and organizations that comply with the laws of the People's Republic of China and are considered to have full civil capacity under Chinese law. According to Chinese law, children under the age of 18 are not allowed to use this console. By using the console, you declare and warrant that you have reached the legal minimum age for use.",
            usageStandards: "We grant you a limited, non-exclusive, non-transferable license to use the console for personal and non-commercial purposes. You agree not to: use the console for any illegal activities; infringe on the intellectual property rights of the console or other users; interfere with or attempt to interfere with the proper working of the console; access the console's backend systems or other user's accounts without authorization.You are responsible for maintaining the security and confidentiality of your account and for all activities that occur under your account. If you discover any unauthorized use of your account or other security vulnerabilities, please notify us immediately.",
            intellectualProperty: "The console and its entire contents, including but not limited to text, images, software, code, and materials, are our property and are protected by copyright, trademark, and other intellectual property laws. Without our express written consent, you may not copy, modify, distribute, display, or use any part of the console in any other way.",
            serviceChangesAndTermination: "We reserve the right to modify or terminate the console services (or any part thereof) at any time without notice. We are not liable to you or any third party for any modifications, suspensions, or termination of the console services.",
            disclaimerAndLimitationOfLiability: "The console is provided on an \"as is\" and \"as available\" basis. We do not warrant that the operation of the console will be uninterrupted or error-free. To the fullest extent permitted by applicable law, we shall not be liable for any direct or indirect damages arising from your use or inability to use the console.The interpretation, applicability, and the resolution of disputes related to this Usage Policy shall be governed by the laws of the People's Republic of China. Any dispute arising from or related to the use of the console shall first attempt to be resolved through friendly negotiation; if negotiation fails to resolve the dispute, it shall be submitted to the People's Court of our registered domicile for litigation.",
            contact: "If you have any questions about this Usage Policy, please contact us via: GitHub: github/shuakami Telegram: @shuakami",
            icon1: "Effective:2024/2/6",
            icon2: "Update:2024/2/6",
            icon3: "Approved",
            github: "GitHub：github/shuakami",
            tg:"Telegram：@shuakami"
        },
        ru: {
            title: "Политика использования",
            introduction: "Добро пожаловать в консоль управления sdjz.wiki и ByteFreezeLab, которая находится под управлением shuakami (далее «мы»). Посещая или используя нашу консоль, вы соглашаетесь соблюдать следующие условия и положения (далее «Политика использования»). Если вы не согласны с любой частью данной Политики использования, пожалуйста, не используйте консоль.",
            userQualification: "Консоль предназначена для лиц и организаций, соблюдающих законы Китайской Народной Республики и имеющих полную гражданскую дееспособность согласно законодательству Китая. В соответствии с законодательством Китая, дети младше 18 лет не могут использовать эту консоль. Используя консоль, вы заявляете и гарантируете, что достигли минимального законного возраста для использования.",
            usageStandards: "Мы предоставляем вам ограниченную, неэксклюзивную, непередаваемую лицензию для использования консоли в личных и некоммерческих целях. Вы соглашаетесь не использовать консоль для любых незаконных действий; не нарушать интеллектуальные права консоли или других пользователей; не мешать или пытаться помешать нормальной работе консоли; не получать несанкционированный доступ к системам управления консоли или аккаунтам других пользователей. Вы несете ответственность за безопасность и конфиденциальность вашего аккаунта, а также за все действия, происходящие под вашим аккаунтом. В случае обнаружения любого неавторизованного использования вашего аккаунта или других проблем безопасности, немедленно уведомите нас.",
            intellectualProperty: "Консоль и все ее содержимое, включая, но не ограничиваясь текстом, изображениями, программным обеспечением, кодом и материалами, являются нашей собственностью и защищены законами об авторских правах, товарных знаках и других формах интеллектуальной собственности. Без нашего ясного письменного согласия вы не имеете права копировать, изменять, распространять, отображать или использовать какую-либо часть консоли любым другим способом.",
            serviceChangesAndTermination: "Мы оставляем за собой право в любое время изменять или прекращать услуги консоли (или любую их часть) без предварительного уведомления. Мы не несем ответственности перед вами или любыми третьими лицами за любые изменения, приостановку или прекращение услуг консоли.",
            disclaimerAndLimitationOfLiability: "Консоль предоставляется на условиях «как есть» и «как доступно». Мы не гарантируем, что работа консоли будет не прерывной или безошибочной. В максимальной степени, разрешенной применимым законодательством, мы не несем ответственности за любые прямые или косвенные убытки, возникшие в результате использования или невозможности использования консоли. Толкование, применимость и разрешение споров, связанных с данной Политикой использования, подлежат законодательству Китайской Народной Республики. Любые споры, возникающие в связи с использованием консоли, должны быть попытки урегулировать путем дружественных переговоров; если переговоры не приводят к разрешению спора, то спор должен быть предан на рассмотрение в суд по месту регистрации нас.",
            contact: "Если у вас есть вопросы относительно данной Политики использования, пожалуйста, свяжитесь с нами через:",
            github: "GitHub: github/shuakami",
            tg: "Telegram: @shuakami",
            icon1: "Вступает в силу: 2024/2/6",
            icon2: "Обновлено: 2024/2/6",
            icon3: "Проверено и одобрено"
        }
    };

    const renderParagraphs = (text: string) => {
        return text.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                <br /><br />
            </React.Fragment>
        ));
    };

    const switchLanguage = (lang: string) => {
        setLanguage(lang);
        if (typeof window !== 'undefined') {
            if (lang === 'auto') {
                // 用户选择了“自动选择”，清除localStorage中的userLanguage键
                localStorage.removeItem('userLanguage');
                // 重新检测语言
                const detectedLanguage = getDefaultLanguage();
                setLanguage(detectedLanguage);
                localStorage.setItem('userLanguage', detectedLanguage);
                console.log(`Language automatically detected and switched to: ${detectedLanguage}`);
            } else {
                // 更新localStorage中的语言偏好
                localStorage.setItem('userLanguage', lang);
                console.log(`Language switched to: ${lang}`);
            }
          setOpen(false); // 关闭下拉菜单
        }
    };

    // 定义共享样式
    const sharedTransitionClass = "transition duration-200 ease-in-out";
    const sharedBorderNoneClass = "border-none";

    // @ts-ignore
    const currentContent = content[language];

    // @ts-ignore
    return (
      <div className="policy-container relative min-h-screen p-10 text-white"
           style={{fontFamily: 'Arial, sans-serif', maxWidth: 'max-w-3xl'}}>
        {/* 视频背景 */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-0 top-0 h-full w-full object-cover"
          src="/video/background.mp4"
        />
        <div className="relative z-[1] mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold">{currentContent.title}</h1>
              <div className="mt-4 flex">
                <Badge variant="secondary">{currentContent.icon1}</Badge>
                <Badge className="ml-4">{currentContent.icon2}</Badge>
                <Badge variant="destructive" className="ml-4">{currentContent.icon3}</Badge>
              </div>
            </div>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <div style={{position: 'relative', zIndex: 999}}>
                  <TranslateIcon
                    className="h-5 w-5 text-white opacity-50 transition-opacity duration-200 hover:opacity-60"
                  />
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
          <div>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.introduction)}</p>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.userQualification)}</p>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.usageStandards)}</p>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.intellectualProperty)}</p>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.serviceChangesAndTermination)}</p>
            <p className="mb-4 text-lg">{renderParagraphs(currentContent.disclaimerAndLimitationOfLiability)}</p>
            <p className="text-lg">{renderParagraphs(currentContent.contact)}</p>
            <p className="text-lg hover:text-gray-200"><a href="https://github.com/shuakami" target="_blank"
                                                          rel="noopener noreferrer">{currentContent.github}</a></p>
            <p className="text-lg hover:text-gray-200"><a href="https://t.me/shuakami" target="_blank"
                                                          rel="noopener noreferrer">{currentContent.tg}</a></p>
          </div>
        </div>
      </div>
    );
}
